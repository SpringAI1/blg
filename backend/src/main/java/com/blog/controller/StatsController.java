package com.blog.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.blog.common.Result;
import com.blog.entity.Article;
import com.blog.entity.Comment;
import com.blog.repository.ArticleRepository;
import com.blog.repository.CommentRepository;
import com.blog.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class StatsController {

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private CommentRepository commentRepository;

    @GetMapping("/stats")
    public Result<Map<String, Object>> getAdminStats() {
        String role = SecurityUtil.getCurrentUser() != null ? SecurityUtil.getCurrentUser().getRole() : "";
        if (!"ADMIN".equals(role)) {
            return Result.error(403, "无权限");
        }

        Map<String, Object> stats = new HashMap<>();

        // 文章总数
        Long articleCount = articleRepository.selectCount(null);
        stats.put("articleCount", articleCount);

        // 发布文章数
        LambdaQueryWrapper<Article> publishedWrapper = new LambdaQueryWrapper<>();
        publishedWrapper.eq(Article::getStatus, "PUBLISHED");
        Long publishedCount = articleRepository.selectCount(publishedWrapper);
        stats.put("publishedCount", publishedCount);

        // 总浏览数（SQL 聚合，不加载全表）
        Long totalViews = articleRepository.sumViews();
        stats.put("totalViews", totalViews);

        // 总点赞数
        Long totalLikes = articleRepository.sumLikes();
        stats.put("totalLikes", totalLikes);

        // 总评论数
        Long totalComments = commentRepository.selectCount(null);
        stats.put("totalComments", totalComments);

        // 总收藏数
        Long totalFavorites = articleRepository.sumFavorites();
        stats.put("totalFavorites", totalFavorites);

        return Result.success(stats);
    }
}
