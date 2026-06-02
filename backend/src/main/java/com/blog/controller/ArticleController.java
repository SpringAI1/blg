package com.blog.controller;

import com.blog.common.Result;
import com.blog.entity.Article;
import com.blog.entity.ArticleLike;
import com.blog.service.ArticleService;
import com.blog.dto.ArticleDTO;
import com.blog.util.SecurityUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.repository.ArticleLikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    @Autowired
    private ArticleService articleService;

    @Autowired
    private ArticleLikeRepository articleLikeRepository;

    @GetMapping
    public Result<Page<ArticleDTO>> getArticles(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long tagId,
            @RequestParam(required = false) String keyword) {
        return Result.success(articleService.getPublishedArticles(pageNum, pageSize, categoryId, tagId, keyword));
    }

    @GetMapping("/published/{id}")
    public Result<ArticleDTO> getPublishedArticle(@PathVariable Long id) {
        ArticleDTO article = articleService.getPublishedArticle(id);
        if (article != null) {
            articleService.increaseViews(id);
        }
        return Result.success(article);
    }

    @GetMapping("/user/articles")
    public Result<Page<ArticleDTO>> getUserArticles(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error(401, "请先登录");
        }
        return Result.success(articleService.getArticlesByUser(userId, pageNum, pageSize));
    }

    @GetMapping("/{id}")
    public Result<ArticleDTO> getArticle(@PathVariable Long id) {
        return Result.success(articleService.getArticle(id));
    }

    @PostMapping
    public Result<ArticleDTO> createArticle(@RequestBody Map<String, Object> requestBody) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error(401, "请先登录");
        }

        try {
            Article article = new Article();
            article.setTitle((String) requestBody.get("title"));
            article.setContent((String) requestBody.get("content"));
            article.setSummary((String) requestBody.get("summary"));
            article.setCoverImage((String) requestBody.get("coverImage"));
            
            Object categoryIdObj = requestBody.get("categoryId");
            if (categoryIdObj != null) {
                article.setCategoryId(Long.valueOf(categoryIdObj.toString()));
            }
            
            article.setStatus(requestBody.get("status") != null ? (String) requestBody.get("status") : "PUBLISHED");
            article.setUserId(userId);

            @SuppressWarnings("unchecked")
            List<Long> tagIds = requestBody.get("tagIds") != null ? 
                ((List<?>) requestBody.get("tagIds")).stream()
                    .map(obj -> Long.valueOf(obj.toString()))
                    .collect(java.util.stream.Collectors.toList()) : null;

            return Result.success(articleService.createArticle(article, tagIds));
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error(500, "创建文章失败: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public Result<ArticleDTO> updateArticle(@PathVariable Long id, @RequestBody Map<String, Object> requestBody) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error(401, "请先登录");
        }

        // 检查所有权
        Article existing = articleService.getById(id);
        if (existing == null) {
            return Result.error(404, "文章不存在");
        }
        if (!existing.getUserId().equals(userId)) {
            String role = SecurityUtil.getCurrentUser() != null ? SecurityUtil.getCurrentUser().getRole() : "";
            if (!"ADMIN".equals(role)) {
                return Result.error(403, "只能编辑自己的文章");
            }
        }

        Article article = new Article();
        article.setTitle((String) requestBody.get("title"));
        article.setContent((String) requestBody.get("content"));
        article.setSummary((String) requestBody.get("summary"));
        article.setCoverImage((String) requestBody.get("coverImage"));
        article.setCategoryId(requestBody.get("categoryId") != null ? Long.valueOf(requestBody.get("categoryId").toString()) : null);
        article.setStatus(requestBody.get("status") != null ? (String) requestBody.get("status") : "PUBLISHED");

        @SuppressWarnings("unchecked")
        List<Long> tagIds = requestBody.get("tagIds") != null ? 
            ((List<?>) requestBody.get("tagIds")).stream()
                .map(obj -> Long.valueOf(obj.toString()))
                .collect(java.util.stream.Collectors.toList()) : null;

        return Result.success(articleService.updateArticle(id, article, tagIds));
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteArticle(@PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error(401, "请先登录");
        }

        // 检查所有权
        Article existing = articleService.getById(id);
        if (existing == null) {
            return Result.error(404, "文章不存在");
        }
        if (!existing.getUserId().equals(userId)) {
            String role = SecurityUtil.getCurrentUser() != null ? SecurityUtil.getCurrentUser().getRole() : "";
            if (!"ADMIN".equals(role)) {
                return Result.error(403, "只能删除自己的文章");
            }
        }

        articleService.deleteArticle(id);
        return Result.success();
    }

    @PostMapping("/{id}/like")
    public Result<Void> likeArticle(@PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.error(401, "请先登录");
        }
        articleService.toggleLike(id);
        return Result.success();
    }

    @GetMapping("/{id}/check-like")
    public Result<Boolean> checkLike(@PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (userId == null) {
            return Result.success(false);
        }
        LambdaQueryWrapper<ArticleLike> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ArticleLike::getArticleId, id);
        wrapper.eq(ArticleLike::getUserId, userId);
        return Result.success(articleLikeRepository.selectCount(wrapper) > 0);
    }
}
