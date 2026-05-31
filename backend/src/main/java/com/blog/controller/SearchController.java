package com.blog.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.common.Result;
import com.blog.entity.Article;
import com.blog.entity.DownloadResource;
import com.blog.repository.ArticleRepository;
import com.blog.repository.DownloadResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private DownloadResourceRepository downloadResourceRepository;

    @GetMapping
    public Result<Map<String, Object>> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize) {
        
        Map<String, Object> result = new HashMap<>();
        
        // 搜索文章
        LambdaQueryWrapper<Article> articleWrapper = new LambdaQueryWrapper<>();
        articleWrapper.like(Article::getTitle, keyword)
                .or()
                .like(Article::getContent, keyword)
                .or()
                .like(Article::getSummary, keyword);
        articleWrapper.eq(Article::getStatus, "PUBLISHED");
        articleWrapper.orderByDesc(Article::getViews);
        
        Page<Article> articlePage = new Page<>(pageNum, pageSize);
        Page<Article> articleResult = articleRepository.selectPage(articlePage, articleWrapper);
        
        List<Map<String, Object>> articles = new ArrayList<>();
        for (Article article : articleResult.getRecords()) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", article.getId());
            item.put("title", article.getTitle());
            item.put("summary", article.getSummary());
            item.put("coverImage", article.getCoverImage());
            item.put("views", article.getViews());
            item.put("likes", article.getLikes());
            item.put("type", "article");
            item.put("createTime", article.getCreateTime());
            articles.add(item);
        }
        
        // 搜索下载资源
        LambdaQueryWrapper<DownloadResource> resourceWrapper = new LambdaQueryWrapper<>();
        resourceWrapper.like(DownloadResource::getTitle, keyword)
                .or()
                .like(DownloadResource::getDescription, keyword);
        resourceWrapper.eq(DownloadResource::getStatus, "PUBLISHED");
        resourceWrapper.orderByDesc(DownloadResource::getDownloadCount);
        
        Page<DownloadResource> resourcePage = new Page<>(pageNum, pageSize);
        Page<DownloadResource> resourceResult = downloadResourceRepository.selectPage(resourcePage, resourceWrapper);
        
        List<Map<String, Object>> resources = new ArrayList<>();
        for (DownloadResource resource : resourceResult.getRecords()) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", resource.getId());
            item.put("title", resource.getTitle());
            item.put("description", resource.getDescription());
            item.put("icon", resource.getIcon());
            item.put("downloadCount", resource.getDownloadCount());
            item.put("type", "resource");
            item.put("createTime", resource.getCreateTime());
            resources.add(item);
        }
        
        result.put("articles", articles);
        result.put("resources", resources);
        result.put("articleTotal", articleResult.getTotal());
        result.put("resourceTotal", resourceResult.getTotal());
        
        return Result.success(result);
    }

    @GetMapping("/articles")
    public Result<Page<Article>> searchArticles(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize) {
        
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(Article::getTitle, keyword)
                .or()
                .like(Article::getContent, keyword)
                .or()
                .like(Article::getSummary, keyword);
        wrapper.eq(Article::getStatus, "PUBLISHED");
        wrapper.orderByDesc(Article::getViews);
        
        Page<Article> page = new Page<>(pageNum, pageSize);
        Page<Article> result = articleRepository.selectPage(page, wrapper);
        
        return Result.success(result);
    }
}
