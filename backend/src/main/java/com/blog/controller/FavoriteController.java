package com.blog.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.Result;
import com.blog.entity.Article;
import com.blog.entity.Favorite;
import com.blog.repository.ArticleRepository;
import com.blog.repository.FavoriteRepository;
import com.blog.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @GetMapping
    public Result<Page<Article>> getMyFavorites(
                                    @RequestParam(defaultValue = "1") Integer pageNum,
                                    @RequestParam(defaultValue = "10") Integer pageSize,
                                    @RequestParam(required = false) String collectionName) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.error(401, "请先登录");

        LambdaQueryWrapper<Favorite> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Favorite::getUserId, userId);
        if (collectionName != null && !collectionName.isEmpty()) {
            wrapper.eq(Favorite::getCollectionName, collectionName);
        }
        wrapper.orderByDesc(Favorite::getCreateTime);
        Page<Favorite> page = new Page<>(pageNum, pageSize);
        Page<Favorite> resultPage = favoriteRepository.selectPage(page, wrapper);

        if (!resultPage.getRecords().isEmpty()) {
            List<Long> articleIds = resultPage.getRecords().stream()
                    .map(Favorite::getArticleId)
                    .collect(Collectors.toList());
            List<Article> articles = articleRepository.selectBatchIds(articleIds);

            Page<Article> articlePage = new Page<>(pageNum, pageSize, resultPage.getTotal());
            articlePage.setRecords(articles);
            return Result.success(articlePage);
        }

        Page<Article> emptyPage = new Page<>(pageNum, pageSize, 0);
        emptyPage.setRecords(List.of());
        return Result.success(emptyPage);
    }

    @PostMapping
    @Transactional(rollbackFor = Exception.class)
    public Result<String> addFavorite(@RequestBody Favorite favorite) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.error(401, "请先登录");

        LambdaQueryWrapper<Favorite> checkWrapper = new LambdaQueryWrapper<>();
        checkWrapper.eq(Favorite::getUserId, userId).eq(Favorite::getArticleId, favorite.getArticleId());
        if (favoriteRepository.selectCount(checkWrapper) > 0) {
            return Result.error(400, "已经收藏过了");
        }

        favorite.setUserId(userId);
        favoriteRepository.insert(favorite);

        // 原子更新
        articleRepository.incrementFavoriteCount(favorite.getArticleId());

        return Result.success("收藏成功");
    }

    @DeleteMapping("/{articleId}")
    @Transactional(rollbackFor = Exception.class)
    public Result<String> removeFavorite(@PathVariable Long articleId) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.error(401, "请先登录");

        // 物理删除（绕过逻辑删除），避免再次收藏时 UNIQUE 约束冲突
        favoriteRepository.deletePhysical(userId, articleId);

        // 原子更新
        articleRepository.decrementFavoriteCount(articleId);

        return Result.success("取消收藏成功");
    }

    @GetMapping("/check/{articleId}")
    public Result<Boolean> checkFavorite(@PathVariable Long articleId) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.success(false);

        LambdaQueryWrapper<Favorite> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Favorite::getUserId, userId).eq(Favorite::getArticleId, articleId);
        boolean exists = favoriteRepository.selectCount(wrapper) > 0;

        return Result.success(exists);
    }

    @PutMapping("/{articleId}/collection")
    public Result<Void> updateCollection(@PathVariable Long articleId,
                                          @RequestBody Map<String, String> body) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.error(401, "请先登录");

        LambdaQueryWrapper<Favorite> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Favorite::getUserId, userId).eq(Favorite::getArticleId, articleId);
        Favorite favorite = favoriteRepository.selectOne(wrapper);
        if (favorite == null) return Result.error(404, "收藏记录不存在");

        favorite.setCollectionName(body.get("collectionName"));
        favoriteRepository.updateById(favorite);
        return Result.success();
    }

    @GetMapping("/collections")
    public Result<List<String>> getCollections() {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) return Result.error(401, "请先登录");

        List<Favorite> favorites = favoriteRepository.selectList(
            new LambdaQueryWrapper<Favorite>()
                .eq(Favorite::getUserId, userId)
                .isNotNull(Favorite::getCollectionName)
                .select(Favorite::getCollectionName)
                .groupBy(Favorite::getCollectionName)
        );
        List<String> collections = favorites.stream()
            .map(Favorite::getCollectionName)
            .filter(java.util.Objects::nonNull)
            .distinct()
            .collect(Collectors.toList());
        return Result.success(collections);
    }
}
