package com.blog.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.Result;
import com.blog.entity.Article;
import com.blog.entity.Category;
import com.blog.entity.DownloadResource;
import com.blog.entity.Tag;
import com.blog.entity.User;
import com.blog.repository.ArticleRepository;
import com.blog.repository.CategoryRepository;
import com.blog.repository.DownloadResourceRepository;
import com.blog.repository.TagRepository;
import com.blog.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private DownloadResourceRepository downloadResourceRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * 综合搜索 — 查找文章、资源、用户、标签
     * 使用模糊匹配 + 字段加权排序
     */
    @GetMapping
    public Result<Map<String, Object>> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize) {

        Map<String, Object> result = new HashMap<>();
        String kw = "%" + keyword + "%";

        // ========== 1. 文章搜索（加权排序，大小写不敏感） ==========
        String upperKw = "%" + keyword.toUpperCase() + "%";
        List<Article> allArticles = articleRepository.selectList(
                new LambdaQueryWrapper<Article>()
                        .eq(Article::getStatus, "PUBLISHED")
                        .and(w -> w.apply("UPPER(title) LIKE {0}", upperKw)
                                .or()
                                .apply("UPPER(content) LIKE {0}", upperKw)
                                .or()
                                .apply("UPPER(summary) LIKE {0}", upperKw))
        );

        // 加权排序：标题匹配 > 摘要匹配 > 内容匹配 > 浏览量
        allArticles.sort((a, b) -> {
            int scoreA = scoreArticle(a, keyword);
            int scoreB = scoreArticle(b, keyword);
            if (scoreA != scoreB) return scoreB - scoreA;
            return Long.compare(b.getViews(), a.getViews());
        });

        // 分页
        int totalArticles = allArticles.size();
        int fromIndex = (pageNum - 1) * pageSize;
        int toIndex = Math.min(fromIndex + pageSize, totalArticles);
        List<Article> pagedArticles = fromIndex < totalArticles
                ? allArticles.subList(fromIndex, toIndex)
                : new ArrayList<>();

        List<Map<String, Object>> articles = pagedArticles.stream().map(article -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", article.getId());
            item.put("title", highlight(article.getTitle(), keyword));
            item.put("summary", article.getSummary());
            item.put("coverImage", article.getCoverImage());
            item.put("views", article.getViews());
            item.put("likes", article.getLikes());
            item.put("type", "article");
            item.put("createTime", article.getCreateTime());
            return item;
        }).collect(Collectors.toList());

        result.put("articles", articles);
        result.put("articleTotal", totalArticles);

        // ========== 2. 下载资源搜索（大小写不敏感） ==========
        List<DownloadResource> allResources = downloadResourceRepository.selectList(
                new LambdaQueryWrapper<DownloadResource>()
                        .eq(DownloadResource::getStatus, "PUBLISHED")
                        .and(w -> w.apply("UPPER(title) LIKE {0}", upperKw)
                                .or()
                                .apply("UPPER(description) LIKE {0}", upperKw))
        );

        allResources.sort((a, b) -> {
            boolean aTitle = a.getTitle() != null && a.getTitle().toLowerCase().contains(keyword.toLowerCase());
            boolean bTitle = b.getTitle() != null && b.getTitle().toLowerCase().contains(keyword.toLowerCase());
            if (aTitle != bTitle) return aTitle ? -1 : 1;
            return Long.compare(b.getDownloadCount(), a.getDownloadCount());
        });

        int totalResources = allResources.size();
        fromIndex = (pageNum - 1) * pageSize;
        toIndex = Math.min(fromIndex + pageSize, totalResources);
        List<DownloadResource> pagedResources = fromIndex < totalResources
                ? allResources.subList(fromIndex, toIndex)
                : new ArrayList<>();

        List<Map<String, Object>> resources = pagedResources.stream().map(r -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", r.getId());
            item.put("title", highlight(r.getTitle(), keyword));
            item.put("description", r.getDescription());
            item.put("icon", r.getIcon());
            item.put("downloadCount", r.getDownloadCount());
            item.put("type", "resource");
            item.put("createTime", r.getCreateTime());
            return item;
        }).collect(Collectors.toList());

        result.put("resources", resources);
        result.put("resourceTotal", totalResources);

        // ========== 3. 用户搜索 ==========
        List<User> matchedUsers = userRepository.selectList(
                new LambdaQueryWrapper<User>()
                        .like(User::getUsername, keyword)
                        .or()
                        .like(User::getNickname, keyword)
                        .or()
                        .like(User::getBio, keyword)
                        .last("LIMIT 5")
        );

        List<Map<String, Object>> users = matchedUsers.stream().map(u -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", u.getId());
            item.put("username", u.getUsername());
            item.put("nickname", u.getNickname());
            item.put("avatar", u.getAvatar());
            item.put("bio", u.getBio());
            item.put("type", "user");
            return item;
        }).collect(Collectors.toList());

        result.put("users", users);
        result.put("userTotal", matchedUsers.size());

        // ========== 4. 标签/分类匹配 ==========
        List<Map<String, Object>> tags = tagRepository.selectList(
                new LambdaQueryWrapper<Tag>().like(Tag::getName, keyword).last("LIMIT 5")
        ).stream().map(t -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", t.getId());
            item.put("name", t.getName());
            item.put("type", "tag");
            return item;
        }).collect(Collectors.toList());
        result.put("tags", tags);

        return Result.success(result);
    }

    /** 计算文章匹配度分值（大小写不敏感） */
    private int scoreArticle(Article article, String keyword) {
        int score = 0;
        String lowerKw = keyword.toLowerCase();
        String title = article.getTitle();
        String summary = article.getSummary();
        String content = article.getContent();
        
        if (title != null) {
            String lowerTitle = title.toLowerCase();
            if (lowerTitle.contains(lowerKw)) {
                score += 10;  // 标题匹配权重最高
                if (title.equalsIgnoreCase(keyword)) score += 20;
            }
        }
        if (summary != null && summary.toLowerCase().contains(lowerKw)) {
            score += 5;
        }
        if (content != null && content.toLowerCase().contains(lowerKw)) {
            score += 2;
        }
        return score;
    }

    /** 对关键词做高亮标记（简单返回原文，前端可自行高亮） */
    private String highlight(String text, String keyword) {
        return text; // 前端通过搜索结果中的 keyword 自行高亮
    }

    @GetMapping("/articles")
    public Result<Page<Article>> searchArticles(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize) {

        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Article::getStatus, "PUBLISHED")
                .and(w -> w.apply("UPPER(title) LIKE {0}", "%" + keyword.toUpperCase() + "%")
                        .or()
                        .apply("UPPER(content) LIKE {0}", "%" + keyword.toUpperCase() + "%")
                        .or()
                        .apply("UPPER(summary) LIKE {0}", "%" + keyword.toUpperCase() + "%"));
        wrapper.orderByDesc(Article::getViews);

        Page<Article> page = new Page<>(pageNum, pageSize);
        Page<Article> result = articleRepository.selectPage(page, wrapper);

        return Result.success(result);
    }
}
