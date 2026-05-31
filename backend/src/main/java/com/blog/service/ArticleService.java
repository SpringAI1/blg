package com.blog.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.entity.Article;
import com.blog.dto.ArticleDTO;

import java.util.List;

public interface ArticleService extends IService<Article> {

    Page<ArticleDTO> getPublishedArticles(int pageNum, int pageSize, Long categoryId, Long tagId, String keyword);

    ArticleDTO getPublishedArticle(Long id);

    Page<ArticleDTO> getArticlesByUser(Long userId, int pageNum, int pageSize);

    ArticleDTO getArticle(Long id);

    ArticleDTO createArticle(Article article, List<Long> tagIds);

    ArticleDTO updateArticle(Long id, Article article, List<Long> tagIds);

    void deleteArticle(Long id);

    void increaseViews(Long id);

    void toggleLike(Long id);
}
