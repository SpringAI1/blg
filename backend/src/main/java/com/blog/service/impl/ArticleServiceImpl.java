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

import java.util.Collections;
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
        return getPublishedArticles(pageNum, pageSize, categoryId, tagId, keyword, null);
    }

    @Override
    public Page<ArticleDTO> getPublishedArticles(int pageNum, int pageSize, Long categoryId, Long tagId, String keyword, String sortBy) {
        String cacheKey = ARTICLE_LIST_KEY + pageNum + ":" + pageSize + ":" +
                         (categoryId != null ? categoryId : "all") + ":" +
                         (tagId != null ? tagId : "all") + ":" +
                         (keyword != null ? keyword : "none") + ":" +
                         (sortBy != null ? sortBy : "none");

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

        if (tagId != null) {
            List<ArticleTag> articleTags = articleTagRepository.selectList(new LambdaQueryWrapper<ArticleTag>()
                .eq(ArticleTag::getTagId, tagId));
            List<Long> articleIds = articleTags.stream()
                .map(ArticleTag::getArticleId)
                .collect(Collectors.toList());
            if (articleIds.isEmpty()) {
                Page<ArticleDTO> emptyPage = new Page<>(pageNum, pageSize, 0);
                emptyPage.setRecords(Collections.emptyList());
                cacheService.set(cacheKey, emptyPage, ARTICLE_CACHE_MINUTES, TimeUnit.MINUTES);
                return emptyPage;
            }
            wrapper.in(Article::getId, articleIds);
        }

        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Article::getTitle, keyword)
                .or()
                .like(Article::getContent, keyword)
                .or()
                .like(Article::getSummary, keyword));
        }

        // 根据 sortBy 参数排序
        if ("views".equals(sortBy)) {
            wrapper.last("ORDER BY views DESC, create_time DESC");
        } else if ("likes".equals(sortBy)) {
            wrapper.last("ORDER BY likes DESC, create_time DESC");
        } else {
            wrapper.orderByDesc(Article::getCreateTime);
        }

        Page<Article> articlePage = baseMapper.selectPage(page, wrapper);

        Page<ArticleDTO> dtoPage = new Page<>(articlePage.getCurrent(), articlePage.getSize(), articlePage.getTotal());
        dtoPage.setRecords(articlePage.getRecords().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList()));

        cacheService.set(cacheKey, dtoPage, ARTICLE_CACHE_MINUTES, TimeUnit.MINUTES);

        return dtoPage;
    }

    @Override
    public Page<ArticleDTO> getAllArticles(int pageNum, int pageSize) {
        Page<Article> articlePage = baseMapper.selectPage(
            new Page<>(pageNum, pageSize),
            new LambdaQueryWrapper<Article>().orderByDesc(Article::getCreateTime)
        );
        Page<ArticleDTO> dtoPage = new Page<>(articlePage.getCurrent(), articlePage.getSize(), articlePage.getTotal());
        dtoPage.setRecords(articlePage.getRecords().stream().map(this::convertToDTO).collect(Collectors.toList()));
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
    public Page<ArticleDTO> getPublishedArticles(int pageNum, int pageSize, Long userId) {
        Page<Article> page = new Page<>(pageNum, pageSize);

        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Article::getUserId, userId);
        wrapper.eq(Article::getStatus, "PUBLISHED");
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

        // 原子更新用户的文章计数
        if (article.getUserId() != null) {
            userRepository.incrementArticleCount(article.getUserId());
        }

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
        Article article = baseMapper.selectById(id);
        articleTagRepository.delete(new LambdaQueryWrapper<ArticleTag>()
            .eq(ArticleTag::getArticleId, id));
        baseMapper.deleteById(id);

        if (article != null) {
            userRepository.decrementArticleCount(article.getUserId());
        }

        cacheService.delete(ARTICLE_KEY + id);
        cacheService.deleteByPattern(ARTICLE_LIST_KEY + "*");
    }

    @Override
    public void increaseViews(Long id) {
        baseMapper.incrementViews(id);
        cacheService.delete(ARTICLE_KEY + id);
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
            baseMapper.decrementLikes(id);
        } else {
            // 未点赞 → 点赞
            ArticleLike like = new ArticleLike();
            like.setArticleId(id);
            like.setUserId(userId);
            articleLikeRepository.insert(like);
            baseMapper.incrementLikes(id);
        }

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

    @Override
    public List<ArticleDTO> getRelatedArticles(Long articleId, int limit) {
        Article article = baseMapper.selectById(articleId);
        if (article == null) return Collections.emptyList();

        // 按同分类或同标签查询已发布文章（排除自己）
        LambdaQueryWrapper<Article> wrapper = new LambdaQueryWrapper<Article>()
            .eq(Article::getStatus, "PUBLISHED")
            .ne(Article::getId, articleId)
            .and(w -> {
                boolean hasCategory = article.getCategoryId() != null;
                if (hasCategory) {
                    w.eq(Article::getCategoryId, article.getCategoryId());
                }
                // 如果有标签关联，也按标签匹配
                List<ArticleTag> articleTags = articleTagRepository.selectList(
                    new LambdaQueryWrapper<ArticleTag>().eq(ArticleTag::getArticleId, articleId)
                );
                if (!articleTags.isEmpty()) {
                    List<Long> tagIds = articleTags.stream().map(ArticleTag::getTagId).collect(Collectors.toList());
                    List<Long> relatedIds = articleTagRepository.selectList(
                        new LambdaQueryWrapper<ArticleTag>().in(ArticleTag::getTagId, tagIds)
                    ).stream().map(ArticleTag::getArticleId).filter(aid -> !aid.equals(articleId)).collect(Collectors.toList());
                    if (!relatedIds.isEmpty()) {
                        if (hasCategory) {
                            w.in(Article::getId, relatedIds);
                        } else {
                            w.in(Article::getId, relatedIds);
                        }
                    }
                }
            })
            .orderByDesc(Article::getViews)
            .last("LIMIT " + limit);

        List<Article> related = baseMapper.selectList(wrapper);
        return related.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
}
