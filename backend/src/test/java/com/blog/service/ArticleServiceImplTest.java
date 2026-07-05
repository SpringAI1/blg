package com.blog.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.config.JwtUserDetails;
import com.blog.dto.ArticleDTO;
import com.blog.entity.*;
import com.blog.repository.*;
import com.blog.service.impl.ArticleServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Comprehensive unit tests for {@link ArticleServiceImpl}.
 *
 * Uses JUnit 5 + Mockito (no Spring context).
 * All repositories are mocked.
 * CacheService is a real instance (mock-maker-inline incompatible with Java 23).
 * Cache interactions are verified indirectly: when redisTemplate is null,
 * CacheService silently no-ops, so tests focus on repository behaviour.
 *
 * toggleLike tests use SecurityContextHolder directly (no MockedStatic).
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ArticleServiceImpl")
class ArticleServiceImplTest {

    @Mock
    private ArticleRepository baseMapper;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private TagRepository tagRepository;

    @Mock
    private ArticleTagRepository articleTagRepository;

    @Mock
    private ArticleLikeRepository articleLikeRepository;

    // Real instance — RedisTemplate is null so all cache ops are no-ops.
    private final CacheService cacheService = new CacheService();

    private ArticleServiceImpl articleService;

    @BeforeEach
    void setUp() {
        articleService = new ArticleServiceImpl(
                userRepository, categoryRepository, tagRepository,
                articleTagRepository, articleLikeRepository, cacheService);
        ReflectionTestUtils.setField(articleService, "baseMapper", baseMapper);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void clearSecurity() {
        SecurityContextHolder.clearContext();
    }

    // ── test data factories ────────────────────────────────────

    private static Article article(long id, String title, String status,
                                   long userId, long categoryId) {
        Article a = new Article();
        a.setId(id);
        a.setTitle(title);
        a.setContent("Content of " + title);
        a.setSummary("Summary of " + title);
        a.setCoverImage("cover-" + id + ".jpg");
        a.setViews(100);
        a.setLikes(10);
        a.setStatus(status);
        a.setUserId(userId);
        a.setCategoryId(categoryId);
        a.setCommentCount(3);
        a.setFavoriteCount(1);
        a.setIsTop(false);
        a.setCreateTime(LocalDateTime.of(2025, 1, 1, 10, 0));
        a.setUpdateTime(LocalDateTime.of(2025, 6, 1, 10, 0));
        return a;
    }

    private static User user(long id, String username, String avatar) {
        User u = new User();
        u.setId(id);
        u.setUsername(username);
        u.setAvatar(avatar);
        u.setNickname(username);
        u.setArticleCount(5);
        return u;
    }

    private static Category category(long id, String name, String slug) {
        Category c = new Category();
        c.setId(id);
        c.setName(name);
        c.setSlug(slug);
        return c;
    }

    private static Tag tag(long id, String name) {
        Tag t = new Tag();
        t.setId(id);
        t.setName(name);
        t.setColor("#000000");
        return t;
    }

    /**
     * Stubs repository lookups used by convertToDTO.
     */
    @SuppressWarnings("unchecked")
    private void stubConversion(User u, Category c, List<Tag> tags) {
        lenient().when(userRepository.selectById(anyLong())).thenReturn(u);
        lenient().when(categoryRepository.selectById(anyLong())).thenReturn(c);
        lenient().when(tagRepository.selectList(any(LambdaQueryWrapper.class)))
                .thenReturn(tags != null ? tags : Collections.emptyList());
    }

    private static Page<Article> entityPage(int num, int size, long total,
                                            Article... articles) {
        @SuppressWarnings("unchecked")
        Page<Article> p = new Page<>(num, size, total);
        p.setRecords(Arrays.asList(articles));
        return p;
    }

    /**
     * Sets a mock authentication so SecurityUtil.getCurrentUserId() returns
     * the given id.
     */
    private void loginAs(Long userId) {
        JwtUserDetails details = new JwtUserDetails(userId, "testuser", "ROLE_USER");
        var auth = new UsernamePasswordAuthenticationToken(
                details, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    // ════════════════════════════════════════════════════════════
    // getPublishedArticles (7-arg)
    // ════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getPublishedArticles(pageNum,pageSize,categoryId,tagId,keyword,sortBy)")
    class GetPublishedArticles7Arg {

        @Test
        @DisplayName("returns PUBLISHED articles with DTO conversion")
        void returnsPublished() {
            Article a = article(1L, "Pub", "PUBLISHED", 1L, 1L);
            stubConversion(user(1L, "u1", "av.png"), category(1L, "Java", "java"),
                    List.of(tag(1L, "Spring")));
            when(baseMapper.selectPage(any(), any())).thenReturn(entityPage(1, 10, 1, a));

            Page<ArticleDTO> result =
                    articleService.getPublishedArticles(1, 10, null, null, null, null);

            assertEquals(1, result.getTotal());
            assertEquals("Pub", result.getRecords().get(0).getTitle());
            assertEquals("PUBLISHED", result.getRecords().get(0).getStatus());
            assertEquals("u1", result.getRecords().get(0).getUsername());
            assertEquals("Java", result.getRecords().get(0).getCategoryName());
            assertEquals(1, result.getRecords().get(0).getTags().size());
        }

        @Test
        @DisplayName("filters by categoryId")
        void filterByCategory() {
            Article a = article(1L, "DB Post", "PUBLISHED", 1L, 2L);
            stubConversion(user(1L, "u", "a.png"), category(2L, "Databases", "db"), null);
            when(baseMapper.selectPage(any(), any())).thenReturn(entityPage(1, 10, 1, a));

            Page<ArticleDTO> result =
                    articleService.getPublishedArticles(1, 10, 2L, null, null, null);

            assertEquals(1, result.getTotal());
            assertEquals("Databases", result.getRecords().get(0).getCategoryName());
        }

        @Test
        @DisplayName("filters by tagId — empty when no articles with that tag")
        void filterByTagEmpty() {
            when(articleTagRepository.selectList(any())).thenReturn(Collections.emptyList());

            Page<ArticleDTO> result =
                    articleService.getPublishedArticles(1, 10, null, 99L, null, null);

            assertEquals(0, result.getTotal());
            assertTrue(result.getRecords().isEmpty());
            // DB query is skipped entirely
            verify(baseMapper, never()).selectPage(any(), any());
        }

        @Test
        @DisplayName("filters by tagId — returns matching articles")
        void filterByTagMatch() {
            ArticleTag at = new ArticleTag();
            at.setArticleId(1L);
            at.setTagId(2L);
            Article a = article(1L, "Tagged", "PUBLISHED", 1L, 1L);
            stubConversion(user(1L, "u", "a.png"), category(1L, "C", "c"),
                    List.of(tag(2L, "Spring")));
            when(articleTagRepository.selectList(any())).thenReturn(List.of(at));
            when(baseMapper.selectPage(any(), any())).thenReturn(entityPage(1, 10, 1, a));

            Page<ArticleDTO> result =
                    articleService.getPublishedArticles(1, 10, null, 2L, null, null);

            assertEquals(1, result.getTotal());
        }

        @Test
        @DisplayName("filters by keyword (searches title, content, summary)")
        void filterByKeyword() {
            Article a = article(1L, "Spring Deep Dive", "PUBLISHED", 1L, 1L);
            stubConversion(user(1L, "u", "a.png"), category(1L, "C", "c"), null);
            when(baseMapper.selectPage(any(), any())).thenReturn(entityPage(1, 10, 1, a));

            Page<ArticleDTO> result =
                    articleService.getPublishedArticles(1, 10, null, null, "Spring", null);

            assertEquals(1, result.getTotal());
        }

        @Test
        @DisplayName("sorts by views when sortBy='views'")
        void sortByViews() {
            Article a = article(1L, "Popular", "PUBLISHED", 1L, 1L);
            stubConversion(user(1L, "u", "a.png"), category(1L, "C", "c"), null);
            when(baseMapper.selectPage(any(), any())).thenReturn(entityPage(1, 10, 1, a));

            Page<ArticleDTO> result =
                    articleService.getPublishedArticles(1, 10, null, null, null, "views");

            assertEquals(1, result.getTotal());
        }

        @Test
        @DisplayName("sorts by likes when sortBy='likes'")
        void sortByLikes() {
            Article a = article(1L, "Loved", "PUBLISHED", 1L, 1L);
            stubConversion(user(1L, "u", "a.png"), category(1L, "C", "c"), null);
            when(baseMapper.selectPage(any(), any())).thenReturn(entityPage(1, 10, 1, a));

            Page<ArticleDTO> result =
                    articleService.getPublishedArticles(1, 10, null, null, null, "likes");

            assertEquals(1, result.getTotal());
        }

        @Test
        @DisplayName("defaults to createTime desc when sortBy is unrecognized")
        void sortDefault() {
            Article a = article(1L, "Recent", "PUBLISHED", 1L, 1L);
            stubConversion(user(1L, "u", "a.png"), category(1L, "C", "c"), null);
            when(baseMapper.selectPage(any(), any())).thenReturn(entityPage(1, 10, 1, a));

            Page<ArticleDTO> result =
                    articleService.getPublishedArticles(1, 10, null, null, null, "bogus");

            assertEquals(1, result.getTotal());
        }

        @Test
        @DisplayName("returns empty page when no published articles")
        void emptyResult() {
            when(baseMapper.selectPage(any(), any())).thenReturn(entityPage(1, 10, 0));

            Page<ArticleDTO> result =
                    articleService.getPublishedArticles(1, 10, null, null, null, null);

            assertEquals(0, result.getTotal());
            assertTrue(result.getRecords().isEmpty());
        }

        @Test
        @DisplayName("combines filters: category + tag + keyword + sortBy")
        void combinedFilters() {
            ArticleTag at = new ArticleTag();
            at.setArticleId(1L);
            at.setTagId(3L);
            Article a = article(1L, "Advanced Java Concurrency", "PUBLISHED", 1L, 5L);
            stubConversion(user(1L, "u", "a.png"), category(5L, "Advanced Java", "advanced-java"),
                    List.of(tag(3L, "Concurrency")));
            when(articleTagRepository.selectList(any())).thenReturn(List.of(at));
            when(baseMapper.selectPage(any(), any())).thenReturn(entityPage(1, 10, 1, a));

            Page<ArticleDTO> result =
                    articleService.getPublishedArticles(1, 10, 5L, 3L, "Concurrency", "views");

            assertEquals(1, result.getTotal());
        }
    }

    // ════════════════════════════════════════════════════════════
    // getPublishedArticles (6-arg delegate)
    // ════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getPublishedArticles(…) 6-arg delegate")
    class GetPublishedArticles6Arg {

        @Test
        @DisplayName("delegates to the 7-arg version with sortBy=null")
        void delegates() {
            Article a = article(1L, "D", "PUBLISHED", 1L, 1L);
            stubConversion(user(1L, "u", "a.png"), category(1L, "C", "c"), null);
            when(baseMapper.selectPage(any(), any())).thenReturn(entityPage(1, 5, 1, a));

            Page<ArticleDTO> result =
                    articleService.getPublishedArticles(1, 5, null, null, null);

            assertEquals(1, result.getTotal());
        }
    }

    // ════════════════════════════════════════════════════════════
    // getPublishedArticles (by userId)
    // ════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getPublishedArticles(pageNum, pageSize, userId)")
    class GetPublishedArticlesByUserId {

        @Test
        @DisplayName("returns only that user's PUBLISHED articles")
        void returnsUsersPublished() {
            Article a = article(1L, "User Pub", "PUBLISHED", 5L, 1L);
            stubConversion(user(5L, "author5", "a5.png"), category(1L, "C", "c"), null);
            when(baseMapper.selectPage(any(), any())).thenReturn(entityPage(1, 10, 1, a));

            Page<ArticleDTO> result = articleService.getPublishedArticles(1, 10, 5L);

            assertEquals(1, result.getTotal());
            assertEquals(5L, result.getRecords().get(0).getUserId());
            assertEquals("PUBLISHED", result.getRecords().get(0).getStatus());
            assertEquals("author5", result.getRecords().get(0).getUsername());
        }

        @Test
        @DisplayName("returns empty page when user has no published articles")
        void emptyWhenNone() {
            when(baseMapper.selectPage(any(), any())).thenReturn(entityPage(1, 10, 0));

            Page<ArticleDTO> result = articleService.getPublishedArticles(1, 10, 999L);

            assertEquals(0, result.getTotal());
            assertTrue(result.getRecords().isEmpty());
        }

        @Test
        @DisplayName("excludes articles that are not PUBLISHED for the user")
        void excludesNonPublished() {
            // DB only returns PUBLISHED (the wrapper enforces status filter)
            Article pub = article(1L, "Pub", "PUBLISHED", 5L, 1L);
            stubConversion(user(5L, "u", "a.png"), category(1L, "C", "c"), null);
            when(baseMapper.selectPage(any(), any())).thenReturn(entityPage(1, 10, 1, pub));

            Page<ArticleDTO> result = articleService.getPublishedArticles(1, 10, 5L);

            assertEquals(1, result.getTotal());
            assertEquals("PUBLISHED", result.getRecords().get(0).getStatus());
        }
    }

    // ════════════════════════════════════════════════════════════
    // getAllArticles
    // ════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getAllArticles(pageNum, pageSize)")
    class GetAllArticles {

        @Test
        @DisplayName("returns all articles regardless of status")
        void returnsAll() {
            Article pub = article(1L, "Pub", "PUBLISHED", 1L, 1L);
            Article draft = article(2L, "Draft", "DRAFT", 1L, 1L);
            Article review = article(3L, "Review", "REVIEW", 1L, 1L);
            stubConversion(user(1L, "u", "a.png"), category(1L, "C", "c"), null);
            when(baseMapper.selectPage(any(), any()))
                    .thenReturn(entityPage(1, 10, 3, pub, draft, review));

            Page<ArticleDTO> result = articleService.getAllArticles(1, 10);

            assertEquals(3, result.getTotal());
            assertEquals("Pub", result.getRecords().get(0).getTitle());
            assertEquals("Draft", result.getRecords().get(1).getTitle());
            assertEquals("Review", result.getRecords().get(2).getTitle());
        }

        @Test
        @DisplayName("returns empty page when no articles")
        void emptyWhenNone() {
            when(baseMapper.selectPage(any(), any())).thenReturn(entityPage(1, 10, 0));

            Page<ArticleDTO> result = articleService.getAllArticles(1, 10);

            assertEquals(0, result.getTotal());
            assertTrue(result.getRecords().isEmpty());
        }
    }

    // ════════════════════════════════════════════════════════════
    // getPublishedArticle
    // ════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getPublishedArticle(id)")
    class GetPublishedArticle {

        @Test
        @DisplayName("returns PUBLISHED article DTO")
        void returnsPublished() {
            Article a = article(1L, "Pub", "PUBLISHED", 1L, 1L);
            stubConversion(user(1L, "u", "av.png"), category(1L, "Java", "java"),
                    List.of(tag(1L, "T1"), tag(2L, "T2")));
            when(baseMapper.selectById(1L)).thenReturn(a);

            ArticleDTO result = articleService.getPublishedArticle(1L);

            assertNotNull(result);
            assertEquals("Pub", result.getTitle());
            assertEquals("u", result.getUsername());
            assertEquals("Java", result.getCategoryName());
            assertEquals(2, result.getTags().size());
        }

        @Test
        @DisplayName("returns null when article not found")
        void notFound() {
            when(baseMapper.selectById(99L)).thenReturn(null);
            assertNull(articleService.getPublishedArticle(99L));
        }

        @Test
        @DisplayName("returns null when article is DRAFT")
        void draftReturnsNull() {
            Article draft = article(1L, "Draft", "DRAFT", 1L, 1L);
            when(baseMapper.selectById(1L)).thenReturn(draft);

            assertNull(articleService.getPublishedArticle(1L));
        }

        @Test
        @DisplayName("returns null when article is PRIVATE")
        void privateReturnsNull() {
            Article priv = article(1L, "Private", "PRIVATE", 1L, 1L);
            when(baseMapper.selectById(1L)).thenReturn(priv);

            assertNull(articleService.getPublishedArticle(1L));
        }
    }

    // ════════════════════════════════════════════════════════════
    // getArticlesByUser
    // ════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getArticlesByUser(userId, pageNum, pageSize)")
    class GetArticlesByUser {

        @Test
        @DisplayName("returns all articles for the user (any status)")
        void returnsAllUserArticles() {
            Article pub = article(1L, "Pub", "PUBLISHED", 3L, 1L);
            Article draft = article(2L, "Draft", "DRAFT", 3L, 1L);
            stubConversion(user(3L, "author3", "av3.png"), category(1L, "C", "c"), null);
            when(baseMapper.selectPage(any(), any()))
                    .thenReturn(entityPage(1, 10, 2, pub, draft));

            Page<ArticleDTO> result = articleService.getArticlesByUser(3L, 1, 10);

            assertEquals(2, result.getTotal());
            assertEquals(3L, result.getRecords().get(0).getUserId());
            assertEquals(3L, result.getRecords().get(1).getUserId());
            assertTrue(result.getRecords().stream()
                    .anyMatch(d -> "PUBLISHED".equals(d.getStatus())));
            assertTrue(result.getRecords().stream()
                    .anyMatch(d -> "DRAFT".equals(d.getStatus())));
        }

        @Test
        @DisplayName("returns empty page when user has no articles")
        void emptyWhenNone() {
            when(baseMapper.selectPage(any(), any())).thenReturn(entityPage(1, 10, 0));

            Page<ArticleDTO> result = articleService.getArticlesByUser(999L, 1, 10);

            assertEquals(0, result.getTotal());
            assertTrue(result.getRecords().isEmpty());
        }
    }

    // ════════════════════════════════════════════════════════════
    // getArticle
    // ════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getArticle(id)")
    class GetArticle {

        @Test
        @DisplayName("returns full DTO with all associations populated")
        void returnsFullDto() {
            Article a = article(1L, "Full Article", "DRAFT", 10L, 20L);
            User u = user(10L, "writer", "writer-avatar.jpg");
            Category c = category(20L, "Science", "science");
            Tag t1 = tag(1L, "Physics");
            Tag t2 = tag(2L, "Math");

            when(baseMapper.selectById(1L)).thenReturn(a);
            stubConversion(u, c, List.of(t1, t2));

            ArticleDTO result = articleService.getArticle(1L);

            assertNotNull(result);
            assertEquals("Full Article", result.getTitle());
            assertEquals("DRAFT", result.getStatus());
            assertEquals("writer", result.getUsername());
            assertEquals("writer-avatar.jpg", result.getUserAvatar());
            assertEquals("Science", result.getCategoryName());
            assertEquals("science", result.getCategorySlug());
            assertEquals(2, result.getTags().size());
            assertEquals("Physics", result.getTags().get(0).getName());
            assertEquals("Math", result.getTags().get(1).getName());
        }

        @Test
        @DisplayName("returns null when not found")
        void notFound() {
            when(baseMapper.selectById(99L)).thenReturn(null);
            assertNull(articleService.getArticle(99L));
        }

        @Test
        @DisplayName("copies all entity fields to DTO")
        void copiesAllFields() {
            Article a = article(1L, "Exact Copy", "PUBLISHED", 10L, 20L);
            a.setCreateTime(LocalDateTime.of(2025, 3, 15, 9, 30));
            a.setUpdateTime(LocalDateTime.of(2025, 3, 16, 14, 45));
            when(baseMapper.selectById(1L)).thenReturn(a);
            stubConversion(user(10L, "w", "w.png"), category(20L, "Sci", "sci"),
                    Collections.emptyList());

            ArticleDTO result = articleService.getArticle(1L);

            assertEquals(1L, result.getId());
            assertEquals("Exact Copy", result.getTitle());
            assertEquals("Content of Exact Copy", result.getContent());
            assertEquals("Summary of Exact Copy", result.getSummary());
            assertEquals("cover-1.jpg", result.getCoverImage());
            assertEquals(100, result.getViews());
            assertEquals(10, result.getLikes());
            assertEquals("PUBLISHED", result.getStatus());
            assertEquals(10L, result.getUserId());
            assertEquals(20L, result.getCategoryId());
            assertEquals(3, result.getCommentCount());
            assertEquals(1, result.getFavoriteCount());
            assertFalse(result.getIsTop());
            assertEquals(LocalDateTime.of(2025, 3, 15, 9, 30), result.getCreateTime());
            assertEquals(LocalDateTime.of(2025, 3, 16, 14, 45), result.getUpdateTime());
        }
    }

    // ════════════════════════════════════════════════════════════
    // createArticle
    // ════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("createArticle(article, tagIds)")
    class CreateArticle {

        @Test
        @DisplayName("inserts article, creates tag relations, increments user count, returns DTO")
        void withTags() {
            Article input = new Article();
            input.setTitle("New Post");
            input.setContent("Content");
            input.setUserId(1L);
            input.setCategoryId(1L);
            input.setStatus("DRAFT");

            doAnswer(inv -> { input.setId(10L); return 1; })
                    .when(baseMapper).insert(any(Article.class));
            stubConversion(user(1L, "u1", "av.png"), category(1L, "Java", "java"),
                    List.of(tag(1L, "T1"), tag(2L, "T2")));

            ArticleDTO result = articleService.createArticle(input, List.of(1L, 2L));

            assertNotNull(result);
            assertEquals(10L, result.getId());
            assertEquals("New Post", result.getTitle());
            assertEquals("u1", result.getUsername());
            assertEquals("Java", result.getCategoryName());

            verify(baseMapper).insert(input);
            verify(userRepository).incrementArticleCount(1L);

            ArgumentCaptor<ArticleTag> captor = ArgumentCaptor.forClass(ArticleTag.class);
            verify(articleTagRepository, times(2)).insert(captor.capture());
            List<ArticleTag> inserted = captor.getAllValues();
            assertEquals(10L, inserted.get(0).getArticleId());
            assertEquals(1L, inserted.get(0).getTagId());
            assertEquals(10L, inserted.get(1).getArticleId());
            assertEquals(2L, inserted.get(1).getTagId());
        }

        @Test
        @DisplayName("skips tag relations when tagIds is null")
        void nullTagIds() {
            Article input = new Article();
            input.setTitle("No Tags");
            input.setUserId(1L);
            input.setCategoryId(1L);
            input.setStatus("DRAFT");

            doAnswer(inv -> { input.setId(1L); return 1; })
                    .when(baseMapper).insert(any(Article.class));
            stubConversion(user(1L, "u", "a.png"), category(1L, "C", "c"), null);

            ArticleDTO result = articleService.createArticle(input, null);

            assertNotNull(result);
            verify(articleTagRepository, never()).insert(any());
        }

        @Test
        @DisplayName("skips tag relations when tagIds is empty")
        void emptyTagIds() {
            Article input = new Article();
            input.setTitle("Empty Tags");
            input.setUserId(1L);
            input.setCategoryId(1L);
            input.setStatus("DRAFT");

            doAnswer(inv -> { input.setId(1L); return 1; })
                    .when(baseMapper).insert(any(Article.class));
            stubConversion(user(1L, "u", "a.png"), category(1L, "C", "c"),
                    Collections.emptyList());

            ArticleDTO result = articleService.createArticle(input, Collections.emptyList());

            assertNotNull(result);
            verify(articleTagRepository, never()).insert(any());
        }

        @Test
        @DisplayName("does not increment user article count when userId is null")
        void nullUserId() {
            Article input = new Article();
            input.setTitle("Anonymous");
            input.setUserId(null);
            input.setCategoryId(1L);
            input.setStatus("DRAFT");

            doAnswer(inv -> { input.setId(1L); return 1; })
                    .when(baseMapper).insert(any(Article.class));
            stubConversion(null, category(1L, "C", "c"), null);

            ArticleDTO result = articleService.createArticle(input, null);

            assertNotNull(result);
            verify(userRepository, never()).incrementArticleCount(anyLong());
        }

        @Test
        @DisplayName("resets counters to zero regardless of input values")
        void resetsCounters() {
            Article input = new Article();
            input.setTitle("Counters");
            input.setUserId(1L);
            input.setCategoryId(1L);
            input.setViews(9999);
            input.setLikes(9999);
            input.setCommentCount(9999);
            input.setFavoriteCount(9999);
            input.setIsTop(true);

            doAnswer(inv -> { input.setId(1L); return 1; })
                    .when(baseMapper).insert(any(Article.class));
            stubConversion(user(1L, "u", "a.png"), category(1L, "C", "c"), null);

            ArticleDTO result = articleService.createArticle(input, null);

            assertEquals(0, result.getViews());
            assertEquals(0, result.getLikes());
            assertEquals(0, result.getCommentCount());
            assertEquals(0, result.getFavoriteCount());
            assertFalse(result.getIsTop());
        }

        @Test
        @DisplayName("DTO includes tag information from newly created article")
        void dtoIncludesTags() {
            Article input = new Article();
            input.setTitle("Tagged Post");
            input.setUserId(1L);
            input.setCategoryId(1L);
            input.setStatus("DRAFT");

            doAnswer(inv -> { input.setId(5L); return 1; })
                    .when(baseMapper).insert(any(Article.class));
            stubConversion(user(1L, "u1", "av.png"), category(1L, "Java", "java"),
                    List.of(tag(10L, "Spring"), tag(20L, "Boot")));

            ArticleDTO result = articleService.createArticle(input, List.of(10L, 20L));

            assertEquals(2, result.getTags().size());
            assertEquals("Spring", result.getTags().get(0).getName());
            assertEquals("Boot", result.getTags().get(1).getName());
        }
    }

    // ════════════════════════════════════════════════════════════
    // updateArticle
    // ════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("updateArticle(id, article, tagIds)")
    class UpdateArticle {

        @Test
        @DisplayName("updates all mutable fields, replaces tags, returns DTO")
        void fullUpdate() {
            Article existing = article(1L, "Old", "DRAFT", 1L, 1L);
            Article update = new Article();
            update.setTitle("New Title");
            update.setContent("New Content");
            update.setSummary("New Summary");
            update.setCoverImage("new-cover.jpg");
            update.setCategoryId(2L);
            update.setStatus("PUBLISHED");

            when(baseMapper.selectById(1L)).thenReturn(existing);
            stubConversion(user(1L, "u", "av.png"), category(2L, "DB", "db"),
                    List.of(tag(3L, "NewTag")));

            ArticleDTO result = articleService.updateArticle(1L, update, List.of(3L));

            assertNotNull(result);
            assertEquals("New Title", existing.getTitle());
            assertEquals("New Content", existing.getContent());
            assertEquals("New Summary", existing.getSummary());
            assertEquals("new-cover.jpg", existing.getCoverImage());
            assertEquals(2L, existing.getCategoryId());
            assertEquals("PUBLISHED", existing.getStatus());

            verify(baseMapper).updateById(existing);
            verify(articleTagRepository).delete(any(LambdaQueryWrapper.class));
            verify(articleTagRepository).insert(any(ArticleTag.class));
        }

        @Test
        @DisplayName("returns null when article does not exist")
        void notFoundReturnsNull() {
            when(baseMapper.selectById(99L)).thenReturn(null);

            ArticleDTO result = articleService.updateArticle(99L, new Article(), List.of(1L));

            assertNull(result);
            verify(baseMapper, never()).updateById(any());
            verify(articleTagRepository, never()).delete(any());
        }

        @Test
        @DisplayName("clears old tags when new tag list is empty")
        void clearsTagsWhenEmpty() {
            Article existing = article(1L, "Post", "PUBLISHED", 1L, 1L);
            Article update = new Article();
            update.setTitle("Updated");

            when(baseMapper.selectById(1L)).thenReturn(existing);
            stubConversion(user(1L, "u", "a.png"), category(1L, "C", "c"),
                    Collections.emptyList());

            articleService.updateArticle(1L, update, Collections.emptyList());

            verify(articleTagRepository).delete(any(LambdaQueryWrapper.class));
            verify(articleTagRepository, never()).insert(any());
        }

        @Test
        @DisplayName("clears old tags when new tag list is null")
        void clearsTagsWhenNull() {
            Article existing = article(1L, "Post", "PUBLISHED", 1L, 1L);
            Article update = new Article();
            update.setTitle("Updated");

            when(baseMapper.selectById(1L)).thenReturn(existing);
            stubConversion(user(1L, "u", "a.png"), category(1L, "C", "c"),
                    Collections.emptyList());

            articleService.updateArticle(1L, update, null);

            verify(articleTagRepository).delete(any(LambdaQueryWrapper.class));
            verify(articleTagRepository, never()).insert(any());
        }

        @Test
        @DisplayName("DTO reflects updated fields")
        void dtoReflectsUpdate() {
            Article existing = article(1L, "Old", "DRAFT", 1L, 1L);
            Article update = new Article();
            update.setTitle("Updated Title");
            update.setContent("Updated Content");
            update.setStatus("PUBLISHED");
            update.setCategoryId(5L);

            when(baseMapper.selectById(1L)).thenReturn(existing);
            stubConversion(user(1L, "u", "av.png"), category(5L, "NewCat", "newcat"),
                    Collections.emptyList());

            ArticleDTO result = articleService.updateArticle(1L, update, null);

            assertEquals("Updated Title", result.getTitle());
            assertEquals("NewCat", result.getCategoryName());
            assertEquals("PUBLISHED", result.getStatus());
        }
    }

    // ════════════════════════════════════════════════════════════
    // deleteArticle
    // ════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("deleteArticle(id)")
    class DeleteArticle {

        @Test
        @DisplayName("deletes article and tags, decrements user count")
        void fullDelete() {
            Article a = article(1L, "Bye", "PUBLISHED", 1L, 1L);
            when(baseMapper.selectById(1L)).thenReturn(a);

            articleService.deleteArticle(1L);

            verify(articleTagRepository).delete(any(LambdaQueryWrapper.class));
            verify(baseMapper).deleteById(1L);
            verify(userRepository).decrementArticleCount(1L);
        }

        @Test
        @DisplayName("still deletes DB rows when article not found, skips user decrement")
        void notFoundSkipsDecrement() {
            when(baseMapper.selectById(99L)).thenReturn(null);

            articleService.deleteArticle(99L);

            verify(articleTagRepository).delete(any(LambdaQueryWrapper.class));
            verify(baseMapper).deleteById(99L);
            verify(userRepository, never()).decrementArticleCount(anyLong());
        }

        @Test
        @DisplayName("handles article with null userId")
        void nullUserId() {
            Article a = article(1L, "No Owner", "PUBLISHED", 0L, 1L);
            a.setUserId(null);
            when(baseMapper.selectById(1L)).thenReturn(a);

            articleService.deleteArticle(1L);

            verify(userRepository).decrementArticleCount(null);
        }
    }

    // ════════════════════════════════════════════════════════════
    // increaseViews
    // ════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("increaseViews(id)")
    class IncreaseViews {

        @Test
        @DisplayName("calls atomic increment on baseMapper")
        void callsAtomicIncrement() {
            articleService.increaseViews(42L);

            verify(baseMapper).incrementViews(42L);
        }

        @Test
        @DisplayName("works for any valid ID")
        void worksForAnyId() {
            articleService.increaseViews(Long.MAX_VALUE);
            verify(baseMapper).incrementViews(Long.MAX_VALUE);
        }

        @Test
        @DisplayName("multiple calls each invoke atomic increment")
        void multipleCalls() {
            articleService.increaseViews(1L);
            articleService.increaseViews(1L);
            articleService.increaseViews(1L);

            verify(baseMapper, times(3)).incrementViews(1L);
        }
    }

    // ════════════════════════════════════════════════════════════
    // toggleLike
    // ════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("toggleLike(id)")
    class ToggleLike {

        @Test
        @DisplayName("creates like record and increments likes when not already liked")
        void addsLike() {
            loginAs(2L);
            Article a = article(1L, "Like it", "PUBLISHED", 1L, 1L);

            when(baseMapper.selectById(1L)).thenReturn(a);
            when(articleLikeRepository.selectCount(any(LambdaQueryWrapper.class)))
                    .thenReturn(0L);

            articleService.toggleLike(1L);

            verify(articleLikeRepository).insert(any(ArticleLike.class));
            verify(baseMapper).incrementLikes(1L);
            verify(baseMapper, never()).decrementLikes(anyLong());
        }

        @Test
        @DisplayName("removes like record and decrements likes when already liked")
        void removesLike() {
            loginAs(2L);
            Article a = article(1L, "Unlike it", "PUBLISHED", 1L, 1L);

            when(baseMapper.selectById(1L)).thenReturn(a);
            when(articleLikeRepository.selectCount(any(LambdaQueryWrapper.class)))
                    .thenReturn(1L);

            articleService.toggleLike(1L);

            verify(articleLikeRepository).delete(any(LambdaQueryWrapper.class));
            verify(baseMapper).decrementLikes(1L);
            verify(baseMapper, never()).incrementLikes(anyLong());
        }

        @Test
        @DisplayName("does nothing when article does not exist")
        void articleNotFound() {
            loginAs(2L);
            when(baseMapper.selectById(99L)).thenReturn(null);

            articleService.toggleLike(99L);

            verify(articleLikeRepository, never()).selectCount(any());
            verify(articleLikeRepository, never()).insert(any());
            verify(baseMapper, never()).incrementLikes(anyLong());
            verify(baseMapper, never()).decrementLikes(anyLong());
        }

        @Test
        @DisplayName("does nothing when no authenticated user")
        void noAuthUser() {
            // SecurityContext cleared in @BeforeEach
            Article a = article(1L, "No User", "PUBLISHED", 1L, 1L);
            when(baseMapper.selectById(1L)).thenReturn(a);

            articleService.toggleLike(1L);

            verify(articleLikeRepository, never()).selectCount(any());
            verify(baseMapper, never()).incrementLikes(anyLong());
            verify(baseMapper, never()).decrementLikes(anyLong());
        }

        @Test
        @DisplayName("different users can independently like/unlike")
        void differentUsersIndependent() {
            Article a = article(1L, "Shared", "PUBLISHED", 1L, 1L);

            // User 5 likes (first time)
            loginAs(5L);
            when(baseMapper.selectById(1L)).thenReturn(a);
            when(articleLikeRepository.selectCount(any(LambdaQueryWrapper.class)))
                    .thenReturn(0L);
            articleService.toggleLike(1L);
            verify(baseMapper).incrementLikes(1L);

            // User 6 also likes (first time for them)
            reset(baseMapper, articleLikeRepository);
            SecurityContextHolder.clearContext();
            loginAs(6L);
            when(baseMapper.selectById(1L)).thenReturn(a);
            when(articleLikeRepository.selectCount(any(LambdaQueryWrapper.class)))
                    .thenReturn(0L);
            articleService.toggleLike(1L);
            verify(baseMapper).incrementLikes(1L);

            // User 5 unlikes
            reset(baseMapper, articleLikeRepository);
            SecurityContextHolder.clearContext();
            loginAs(5L);
            when(baseMapper.selectById(1L)).thenReturn(a);
            when(articleLikeRepository.selectCount(any(LambdaQueryWrapper.class)))
                    .thenReturn(1L);
            articleService.toggleLike(1L);
            verify(baseMapper).decrementLikes(1L);
        }
    }

    // ════════════════════════════════════════════════════════════
    // DTO conversion edge cases (via getArticle)
    // ════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("DTO conversion edge cases")
    class DtoConversion {

        @Test
        @DisplayName("user not found — DTO has null username and userAvatar")
        void userNotFound() {
            Article a = article(1L, "Ghost Writer", "PUBLISHED", 999L, 1L);
            when(baseMapper.selectById(1L)).thenReturn(a);
            when(userRepository.selectById(999L)).thenReturn(null);
            when(categoryRepository.selectById(1L)).thenReturn(category(1L, "C", "c"));
            when(tagRepository.selectList(any())).thenReturn(Collections.emptyList());

            ArticleDTO result = articleService.getArticle(1L);

            assertNotNull(result);
            assertEquals(999L, result.getUserId());
            assertNull(result.getUsername());
            assertNull(result.getUserAvatar());
        }

        @Test
        @DisplayName("category not found — DTO has null categoryName and categorySlug")
        void categoryNotFound() {
            Article a = article(1L, "No Category", "PUBLISHED", 1L, 999L);
            when(baseMapper.selectById(1L)).thenReturn(a);
            when(userRepository.selectById(1L)).thenReturn(user(1L, "u", "a.png"));
            when(categoryRepository.selectById(999L)).thenReturn(null);
            when(tagRepository.selectList(any())).thenReturn(Collections.emptyList());

            ArticleDTO result = articleService.getArticle(1L);

            assertNotNull(result);
            assertEquals(999L, result.getCategoryId());
            assertNull(result.getCategoryName());
            assertNull(result.getCategorySlug());
        }

        @Test
        @DisplayName("categoryId null — category lookup is skipped")
        void nullCategoryId() {
            Article a = article(1L, "Null Cat", "PUBLISHED", 1L, 0L);
            a.setCategoryId(null);
            when(baseMapper.selectById(1L)).thenReturn(a);
            when(userRepository.selectById(1L)).thenReturn(user(1L, "u", "a.png"));
            when(tagRepository.selectList(any())).thenReturn(Collections.emptyList());

            ArticleDTO result = articleService.getArticle(1L);

            assertNotNull(result);
            assertNull(result.getCategoryId());
            assertNull(result.getCategoryName());
            verify(categoryRepository, never()).selectById(anyLong());
        }

        @Test
        @DisplayName("no tags linked — DTO has empty tags list")
        void noTags() {
            Article a = article(1L, "Tagless", "PUBLISHED", 1L, 1L);
            when(baseMapper.selectById(1L)).thenReturn(a);
            when(userRepository.selectById(1L)).thenReturn(user(1L, "u", "a.png"));
            when(categoryRepository.selectById(1L)).thenReturn(category(1L, "C", "c"));
            when(tagRepository.selectList(any())).thenReturn(Collections.emptyList());

            ArticleDTO result = articleService.getArticle(1L);

            assertNotNull(result.getTags());
            assertTrue(result.getTags().isEmpty());
        }

        @Test
        @DisplayName("multiple tags — all included in order")
        void multipleTags() {
            Article a = article(1L, "Multi", "PUBLISHED", 1L, 1L);
            Tag t1 = tag(1L, "Alpha");
            Tag t2 = tag(2L, "Beta");
            Tag t3 = tag(3L, "Gamma");

            when(baseMapper.selectById(1L)).thenReturn(a);
            when(userRepository.selectById(1L)).thenReturn(user(1L, "u", "a.png"));
            when(categoryRepository.selectById(1L)).thenReturn(category(1L, "C", "c"));
            when(tagRepository.selectList(any())).thenReturn(List.of(t1, t2, t3));

            ArticleDTO result = articleService.getArticle(1L);

            assertEquals(3, result.getTags().size());
            assertEquals("Alpha", result.getTags().get(0).getName());
            assertEquals("Beta", result.getTags().get(1).getName());
            assertEquals("Gamma", result.getTags().get(2).getName());
        }
    }

    // ════════════════════════════════════════════════════════════
    // Combined scenarios
    // ════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Combined scenarios")
    class Combined {

        @Test
        @DisplayName("create then update returns updated DTO")
        void createThenUpdate() {
            // Create
            Article input = new Article();
            input.setTitle("V1");
            input.setUserId(1L);
            input.setCategoryId(1L);
            input.setStatus("DRAFT");

            doAnswer(inv -> { input.setId(1L); return 1; })
                    .when(baseMapper).insert(any(Article.class));
            stubConversion(user(1L, "u", "av.png"), category(1L, "Java", "java"), null);

            ArticleDTO created = articleService.createArticle(input, null);
            assertNotNull(created);
            assertEquals("V1", created.getTitle());

            // Update
            reset(baseMapper);
            Article existing = article(1L, "V1", "DRAFT", 1L, 1L);
            Article update = new Article();
            update.setTitle("V2");
            update.setContent("Updated content");
            update.setStatus("PUBLISHED");

            when(baseMapper.selectById(1L)).thenReturn(existing);
            stubConversion(user(1L, "u", "av.png"), category(2L, "DB", "db"), null);

            ArticleDTO updated = articleService.updateArticle(1L, update, null);

            assertNotNull(updated);
            assertEquals("V2", existing.getTitle());
            assertEquals("PUBLISHED", existing.getStatus());
        }

        @Test
        @DisplayName("create increments user count, delete decrements it")
        void createThenDeleteUserCount() {
            // Create
            Article input = new Article();
            input.setTitle("Temp");
            input.setUserId(1L);
            input.setCategoryId(1L);
            input.setStatus("DRAFT");

            doAnswer(inv -> { input.setId(10L); return 1; })
                    .when(baseMapper).insert(any(Article.class));
            stubConversion(user(1L, "u", "av.png"), category(1L, "C", "c"), null);

            articleService.createArticle(input, null);
            verify(userRepository).incrementArticleCount(1L);

            // Delete
            when(baseMapper.selectById(10L)).thenReturn(input);

            articleService.deleteArticle(10L);

            verify(userRepository).decrementArticleCount(1L);
        }

        @Test
        @DisplayName("view count can be increased before and after status change")
        void viewsAcrossStatusChange() {
            // Increase views on a DRAFT article
            articleService.increaseViews(1L);
            verify(baseMapper).incrementViews(1L);

            // Update status to PUBLISHED
            Article existing = article(1L, "Post", "DRAFT", 1L, 1L);
            Article update = new Article();
            update.setTitle("Post");
            update.setStatus("PUBLISHED");

            reset(baseMapper);
            when(baseMapper.selectById(1L)).thenReturn(existing);
            stubConversion(user(1L, "u", "av.png"), category(1L, "C", "c"), null);

            ArticleDTO updated = articleService.updateArticle(1L, update, null);
            assertEquals("PUBLISHED", updated.getStatus());

            // Increase views again after publish
            reset(baseMapper);
            articleService.increaseViews(1L);
            verify(baseMapper).incrementViews(1L);
        }

        @Test
        @DisplayName("like count changes via toggleLike")
        void likeToggleSequence() {
            Article a = article(1L, "Popular", "PUBLISHED", 1L, 1L);

            // User 5 likes
            loginAs(5L);
            when(baseMapper.selectById(1L)).thenReturn(a);
            when(articleLikeRepository.selectCount(any(LambdaQueryWrapper.class)))
                    .thenReturn(0L);
            articleService.toggleLike(1L);
            verify(baseMapper).incrementLikes(1L);

            // User 5 unlikes
            reset(baseMapper, articleLikeRepository);
            SecurityContextHolder.clearContext();
            loginAs(5L);
            when(baseMapper.selectById(1L)).thenReturn(a);
            when(articleLikeRepository.selectCount(any(LambdaQueryWrapper.class)))
                    .thenReturn(1L);
            articleService.toggleLike(1L);
            verify(baseMapper).decrementLikes(1L);
        }
    }

    // ════════════════════════════════════════════════════════════
    // Pagination metadata
    // ════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Pagination metadata")
    class Pagination {

        @Test
        @DisplayName("preserves page number, size, and total from entity page")
        void preservesMetadata() {
            Article a1 = article(1L, "A", "PUBLISHED", 1L, 1L);
            Article a2 = article(2L, "B", "PUBLISHED", 1L, 1L);
            stubConversion(user(1L, "u", "a.png"), category(1L, "C", "c"), null);
            when(baseMapper.selectPage(any(), any()))
                    .thenReturn(entityPage(3, 15, 99, a1, a2));

            Page<ArticleDTO> result =
                    articleService.getPublishedArticles(3, 15, null, null, null, null);

            assertEquals(3, result.getCurrent());
            assertEquals(15, result.getSize());
            assertEquals(99, result.getTotal());
            assertEquals(2, result.getRecords().size());
        }

        @Test
        @DisplayName("works for getArticlesByUser pagination too")
        void byUserMetadata() {
            Article a = article(1L, "A", "PUBLISHED", 7L, 1L);
            stubConversion(user(7L, "u7", "a.png"), category(1L, "C", "c"), null);
            when(baseMapper.selectPage(any(), any()))
                    .thenReturn(entityPage(2, 20, 50, a));

            Page<ArticleDTO> result = articleService.getArticlesByUser(7L, 2, 20);

            assertEquals(2, result.getCurrent());
            assertEquals(20, result.getSize());
            assertEquals(50, result.getTotal());
        }

        @Test
        @DisplayName("works for getAllArticles pagination too")
        void allArticlesMetadata() {
            Article a1 = article(1L, "A", "PUBLISHED", 1L, 1L);
            Article a2 = article(2L, "B", "DRAFT", 1L, 1L);
            Article a3 = article(3L, "C", "REVIEW", 1L, 1L);
            stubConversion(user(1L, "u", "a.png"), category(1L, "C", "c"), null);
            when(baseMapper.selectPage(any(), any()))
                    .thenReturn(entityPage(1, 30, 100, a1, a2, a3));

            Page<ArticleDTO> result = articleService.getAllArticles(1, 30);

            assertEquals(1, result.getCurrent());
            assertEquals(30, result.getSize());
            assertEquals(100, result.getTotal());
            assertEquals(3, result.getRecords().size());
        }
    }
}
