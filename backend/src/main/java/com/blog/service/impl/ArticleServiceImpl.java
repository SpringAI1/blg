package com.blog.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.blog.entity.Article;
import com.blog.entity.ArticleLike;
import com.blog.entity.ArticleTag;
import com.blog.entity.Category;
import com.blog.entity.Tag;
import com.blog.entity.User;
import com.blog.repository.ArticleLikeRepository;
import com.blog.repository.ArticleRepository;
import com.blog.repository.ArticleTagRepository;
import com.blog.repository.CategoryRepository;
import com.blog.repository.TagRepository;
import com.blog.repository.UserRepository;
import com.blog.service.ArticleService;
import com.blog.service.CacheService;
import com.blog.dto.ArticleDTO;
import com.blog.dto.TagDTO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class ArticleServiceImpl extends ServiceImpl<ArticleRepository, Article> implements ArticleService {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final ArticleTagRepository articleTagRepository;
    private final ArticleLikeRepository articleLikeRepository;
    private final CacheService cacheService;

    private static final String ARTICLE_LIST_KEY = "article:list:";
    private static final String ARTICLE_KEY = "article:";
    private static final long ARTICLE_CACHE_MINUTES = 5;
    private static final long ARTICLE_DETAIL_CACHE_MINUTES = 10;

    public ArticleServiceImpl(UserRepository userRepository,
                            CategoryRepository categoryRepository,
                            TagRepository tagRepository,
                            ArticleTagRepository articleTagRepository,
                            ArticleLikeRepository articleLikeRepository,
                            CacheService cacheService) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.articleTagRepository = articleTagRepository;
        this.articleLikeRepository = articleLikeRepository;
        this.cacheService = cacheService;
    }

    @Override
    public Page<ArticleDTO> getPublishedArticles(int pageNum, int pageSize, Long categoryId, Long tagId, String keyword) {
        String cacheKey = ARTICLE_LIST_KEY + pageNum + ":" + pageSize + ":" +
                         (categoryId != null ? categoryId : "all") + ":" +
                         (tagId != null ? tagId : "all") + ":" +
                         (keyword != null ? keyword : "none");

        Page<ArticleDTO> cached = cacheService.get(cacheKey, Page.class);
        if (cached != null) {
            return cached;
        }

        Page<Article> page = new Page<>(pageNum, pageSize);

        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Article::getStatus, "PUBLISHED");

        if (categoryId != null) {
            wrapper.eq(Article::getCategoryId, categoryId);
        }

        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(Article::getTitle, keyword);
        }

        wrapper.orderByDesc(Article::getCreateTime);

        Page<Article> articlePage = baseMapper.selectPage(page, wrapper);

        Page<ArticleDTO> dtoPage = new Page<>(articlePage.getCurrent(), articlePage.getSize(), articlePage.getTotal());
        dtoPage.setRecords(articlePage.getRecords().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList()));

        cacheService.set(cacheKey, dtoPage, ARTICLE_CACHE_MINUTES, TimeUnit.MINUTES);

        return dtoPage;
    }

    @Override
    public ArticleDTO getPublishedArticle(Long id) {
        String cacheKey = ARTICLE_KEY + id;

        ArticleDTO cached = cacheService.get(cacheKey, ArticleDTO.class);
        if (cached != null) {
            return cached;
        }

        Article article = baseMapper.selectById(id);
        if (article == null || !"PUBLISHED".equals(article.getStatus())) {
            return null;
        }

        ArticleDTO dto = convertToDTO(article);
        cacheService.set(cacheKey, dto, ARTICLE_DETAIL_CACHE_MINUTES, TimeUnit.MINUTES);

        return dto;
    }

    @Override
    public Page<ArticleDTO> getArticlesByUser(Long userId, int pageNum, int pageSize) {
        String cacheKey = "article:user:" + userId + ":" + pageNum + ":" + pageSize;

        Page<Article> page = new Page<>(pageNum, pageSize);

        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Article::getUserId, userId);
        wrapper.orderByDesc(Article::getCreateTime);

        Page<Article> articlePage = baseMapper.selectPage(page, wrapper);

        Page<ArticleDTO> dtoPage = new Page<>(articlePage.getCurrent(), articlePage.getSize(), articlePage.getTotal());
        dtoPage.setRecords(articlePage.getRecords().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList()));

        return dtoPage;
    }

    @Override
    public ArticleDTO getArticle(Long id) {
        Article article = baseMapper.selectById(id);
        if (article == null) {
            return null;
        }
        return convertToDTO(article);
    }

    @Override
    @Transactional
    public ArticleDTO createArticle(Article article, List<Long> tagIds) {
        article.setViews(0);
        article.setLikes(0);
        article.setCommentCount(0);
        article.setFavoriteCount(0);
        article.setIsTop(false);
        baseMapper.insert(article);

        if (tagIds != null && !tagIds.isEmpty()) {
            for (Long tagId : tagIds) {
                ArticleTag articleTag = new ArticleTag();
                articleTag.setArticleId(article.getId());
                articleTag.setTagId(tagId);
                articleTagRepository.insert(articleTag);
            }
        }

        cacheService.deleteByPattern(ARTICLE_LIST_KEY + "*");
        
        return convertToDTO(article);
    }

    @Override
    @Transactional
    public ArticleDTO updateArticle(Long id, Article article, List<Long> tagIds) {
        Article existing = baseMapper.selectById(id);
        if (existing == null) {
            return null;
        }

        existing.setTitle(article.getTitle());
        existing.setContent(article.getContent());
        existing.setSummary(article.getSummary());
        existing.setCoverImage(article.getCoverImage());
        existing.setCategoryId(article.getCategoryId());
        existing.setStatus(article.getStatus());
        baseMapper.updateById(existing);

        articleTagRepository.delete(new LambdaQueryWrapper<ArticleTag>()
            .eq(ArticleTag::getArticleId, id));
        
        if (tagIds != null && !tagIds.isEmpty()) {
            for (Long tagId : tagIds) {
                ArticleTag articleTag = new ArticleTag();
                articleTag.setArticleId(id);
                articleTag.setTagId(tagId);
                articleTagRepository.insert(articleTag);
            }
        }

        cacheService.delete(ARTICLE_KEY + id);
        cacheService.deleteByPattern(ARTICLE_LIST_KEY + "*");
        
        return convertToDTO(existing);
    }

    @Override
    @Transactional
    public void deleteArticle(Long id) {
        articleTagRepository.delete(new LambdaQueryWrapper<ArticleTag>()
            .eq(ArticleTag::getArticleId, id));
        baseMapper.deleteById(id);

        cacheService.delete(ARTICLE_KEY + id);
        cacheService.deleteByPattern(ARTICLE_LIST_KEY + "*");
    }

    @Override
    public void increaseViews(Long id) {
        Article article = baseMapper.selectById(id);
        if (article != null) {
            article.setViews(article.getViews() + 1);
            baseMapper.updateById(article);

            cacheService.delete(ARTICLE_KEY + id);
        }
    }

    @Override
    @Transactional
    public void toggleLike(Long id) {
        Article article = baseMapper.selectById(id);
        if (article == null) return;

        // 从 SecurityContext 获取当前用户（由 controller 调用前设置）
        Long userId = com.blog.util.SecurityUtil.getCurrentUserId();
        if (userId == null) return;

        // 检查是否已经点赞
        LambdaQueryWrapper<ArticleLike> likeCheck = new LambdaQueryWrapper<>();
        likeCheck.eq(ArticleLike::getArticleId, id);
        likeCheck.eq(ArticleLike::getUserId, userId);

        if (articleLikeRepository.selectCount(likeCheck) > 0) {
            // 已点赞 → 取消点赞
            articleLikeRepository.delete(likeCheck);
            article.setLikes(Math.max(0, article.getLikes() - 1));
        } else {
            // 未点赞 → 点赞
            ArticleLike like = new ArticleLike();
            like.setArticleId(id);
            like.setUserId(userId);
            articleLikeRepository.insert(like);
            article.setLikes(article.getLikes() + 1);
        }

        baseMapper.updateById(article);
        cacheService.delete(ARTICLE_KEY + id);
    }

    private ArticleDTO convertToDTO(Article article) {
        ArticleDTO dto = new ArticleDTO();
        BeanUtils.copyProperties(article, dto);

        User user = userRepository.selectById(article.getUserId());
        if (user != null) {
            dto.setUsername(user.getUsername());
            dto.setUserAvatar(user.getAvatar());
        }

        if (article.getCategoryId() != null) {
            Category category = categoryRepository.selectById(article.getCategoryId());
            if (category != null) {
                dto.setCategoryName(category.getName());
                dto.setCategorySlug(category.getSlug());
            }
        }

        List<Tag> tags = tagRepository.selectList(
            new LambdaQueryWrapper<Tag>()
                .inSql(Tag::getId, "SELECT tag_id FROM article_tag WHERE article_id = " + article.getId())
        );
        dto.setTags(tags.stream().map(tag -> {
            TagDTO tagDTO = new TagDTO();
            BeanUtils.copyProperties(tag, tagDTO);
            return tagDTO;
        }).collect(Collectors.toList()));

        return dto;
    }
}
