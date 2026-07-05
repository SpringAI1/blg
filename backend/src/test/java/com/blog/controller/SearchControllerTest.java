package com.blog.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.blog.config.JwtAuthenticationFilter;
import com.blog.config.SecurityConfig;
import com.blog.entity.Article;
import com.blog.entity.DownloadResource;
import com.blog.entity.Tag;
import com.blog.entity.User;
import com.blog.repository.ArticleRepository;
import com.blog.repository.CategoryRepository;
import com.blog.repository.DownloadResourceRepository;
import com.blog.repository.TagRepository;
import com.blog.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SearchController.class)
@Import(SecurityConfig.class)
class SearchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ArticleRepository articleRepository;

    @MockBean
    private DownloadResourceRepository downloadResourceRepository;

    @MockBean
    private CategoryRepository categoryRepository;

    @MockBean
    private TagRepository tagRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    // ── comprehensive search: GET /api/search ──────────────────────

    @Test
    void search_ShouldReturnArticlesResourcesUsersAndTags() throws Exception {
        // --- Prepare mock articles ---
        Article article = new Article();
        article.setId(1L);
        article.setTitle("Spring Boot Tutorial");
        article.setSummary("Learn Spring Boot");
        article.setContent("Spring Boot is amazing for building...");
        article.setCoverImage("/images/spring.png");
        article.setViews(1000);
        article.setLikes(50);
        article.setStatus("PUBLISHED");
        article.setCreateTime(LocalDateTime.of(2024, 1, 15, 10, 0));

        Page<Article> articlePage = new Page<>(1, 10);
        articlePage.setRecords(List.of(article));
        articlePage.setTotal(1);

        when(articleRepository.selectPage(any(), any()))
                .thenReturn(articlePage);

        // --- Prepare mock resources ---
        DownloadResource resource = new DownloadResource();
        resource.setId(10L);
        resource.setTitle("Spring Cheat Sheet");
        resource.setDescription("A handy Spring reference");
        resource.setIcon("pdf");
        resource.setDownloadCount(200);
        resource.setStatus("PUBLISHED");
        resource.setCreateTime(LocalDateTime.of(2024, 2, 1, 8, 0));

        Page<DownloadResource> resourcePage = new Page<>(1, 10);
        resourcePage.setRecords(List.of(resource));
        resourcePage.setTotal(1);

        when(downloadResourceRepository.selectPage(any(), any()))
                .thenReturn(resourcePage);

        // --- Prepare mock users ---
        User user = new User();
        user.setId(100L);
        user.setUsername("spring_fan");
        user.setNickname("Spring Fan");
        user.setAvatar("/avatars/spring.png");
        user.setBio("I love Spring Framework");

        when(userRepository.selectList(any()))
                .thenReturn(List.of(user));

        // --- Prepare mock tags ---
        Tag tag = new Tag();
        tag.setId(5L);
        tag.setName("Spring");
        tag.setSlug("spring");

        when(tagRepository.selectList(any()))
                .thenReturn(List.of(tag));

        // --- Execute ---
        mockMvc.perform(get("/api/search")
                        .param("keyword", "spring"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                // Articles
                .andExpect(jsonPath("$.data.articles").isArray())
                .andExpect(jsonPath("$.data.articles[0].id").value(1))
                .andExpect(jsonPath("$.data.articles[0].title").value("Spring Boot Tutorial"))
                .andExpect(jsonPath("$.data.articles[0].type").value("article"))
                .andExpect(jsonPath("$.data.articleTotal").value(1))
                // Resources
                .andExpect(jsonPath("$.data.resources").isArray())
                .andExpect(jsonPath("$.data.resources[0].id").value(10))
                .andExpect(jsonPath("$.data.resources[0].title").value("Spring Cheat Sheet"))
                .andExpect(jsonPath("$.data.resources[0].type").value("resource"))
                .andExpect(jsonPath("$.data.resourceTotal").value(1))
                // Users
                .andExpect(jsonPath("$.data.users").isArray())
                .andExpect(jsonPath("$.data.users[0].id").value(100))
                .andExpect(jsonPath("$.data.users[0].username").value("spring_fan"))
                .andExpect(jsonPath("$.data.users[0].type").value("user"))
                .andExpect(jsonPath("$.data.userTotal").value(1))
                // Tags
                .andExpect(jsonPath("$.data.tags").isArray())
                .andExpect(jsonPath("$.data.tags[0].id").value(5))
                .andExpect(jsonPath("$.data.tags[0].name").value("Spring"))
                .andExpect(jsonPath("$.data.tags[0].type").value("tag"));
    }

    @Test
    void search_WithPaginationParams_ShouldPassThemCorrectly() throws Exception {
        Page<Article> articlePage = new Page<>(2, 5);
        articlePage.setRecords(List.of());
        articlePage.setTotal(0);
        when(articleRepository.selectPage(any(), any()))
                .thenReturn(articlePage);

        Page<DownloadResource> resourcePage = new Page<>(2, 5);
        resourcePage.setRecords(List.of());
        resourcePage.setTotal(0);
        when(downloadResourceRepository.selectPage(any(), any()))
                .thenReturn(resourcePage);

        when(userRepository.selectList(any())).thenReturn(List.of());
        when(tagRepository.selectList(any())).thenReturn(List.of());

        mockMvc.perform(get("/api/search")
                        .param("keyword", "java")
                        .param("pageNum", "2")
                        .param("pageSize", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.articleTotal").value(0))
                .andExpect(jsonPath("$.data.resourceTotal").value(0));
    }

    @Test
    void search_ShouldReturnEmptyResults_ForNoMatch() throws Exception {
        Page<Article> articlePage = new Page<>(1, 10);
        articlePage.setRecords(List.of());
        articlePage.setTotal(0);
        when(articleRepository.selectPage(any(), any()))
                .thenReturn(articlePage);

        Page<DownloadResource> resourcePage = new Page<>(1, 10);
        resourcePage.setRecords(List.of());
        resourcePage.setTotal(0);
        when(downloadResourceRepository.selectPage(any(), any()))
                .thenReturn(resourcePage);

        when(userRepository.selectList(any())).thenReturn(List.of());
        when(tagRepository.selectList(any())).thenReturn(List.of());

        mockMvc.perform(get("/api/search")
                        .param("keyword", "nonexistent_xyz"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.articles").isArray())
                .andExpect(jsonPath("$.data.articles").isEmpty())
                .andExpect(jsonPath("$.data.resources").isEmpty())
                .andExpect(jsonPath("$.data.users").isEmpty())
                .andExpect(jsonPath("$.data.tags").isEmpty());
    }

    // ── article search: GET /api/search/articles ───────────────────

    @Test
    void searchArticles_ShouldReturnPaginatedArticles() throws Exception {
        Article article1 = new Article();
        article1.setId(1L);
        article1.setTitle("Java Concurrency");
        article1.setSummary("Deep dive into concurrency");
        article1.setContent("Java concurrency is essential...");
        article1.setCoverImage("/images/java.png");
        article1.setViews(500);
        article1.setLikes(30);
        article1.setStatus("PUBLISHED");
        article1.setCreateTime(LocalDateTime.of(2024, 1, 10, 9, 0));

        Article article2 = new Article();
        article2.setId(2L);
        article2.setTitle("Java 21 Features");
        article2.setSummary("What's new in Java 21");
        article2.setContent("Virtual threads, pattern matching...");
        article2.setCoverImage("/images/java21.png");
        article2.setViews(300);
        article2.setLikes(20);
        article2.setStatus("PUBLISHED");
        article2.setCreateTime(LocalDateTime.of(2024, 3, 5, 14, 0));

        Page<Article> expectedPage = new Page<>(1, 10, 2);
        expectedPage.setRecords(List.of(article1, article2));

        when(articleRepository.selectPage(any(), any()))
                .thenReturn(expectedPage);

        mockMvc.perform(get("/api/search/articles")
                        .param("keyword", "java")
                        .param("pageNum", "1")
                        .param("pageSize", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.records").isArray())
                .andExpect(jsonPath("$.data.records.length()").value(2))
                .andExpect(jsonPath("$.data.records[0].id").value(1))
                .andExpect(jsonPath("$.data.records[0].title").value("Java Concurrency"))
                .andExpect(jsonPath("$.data.records[0].status").value("PUBLISHED"))
                .andExpect(jsonPath("$.data.records[1].id").value(2))
                .andExpect(jsonPath("$.data.records[1].title").value("Java 21 Features"))
                .andExpect(jsonPath("$.data.total").value(2))
                .andExpect(jsonPath("$.data.current").value(1))
                .andExpect(jsonPath("$.data.size").value(10));
    }

    @Test
    void searchArticles_WithDefaultPagination_ShouldUseDefaults() throws Exception {
        Page<Article> expectedPage = new Page<>(1, 10, 0);
        expectedPage.setRecords(List.of());

        when(articleRepository.selectPage(any(), any()))
                .thenReturn(expectedPage);

        mockMvc.perform(get("/api/search/articles")
                        .param("keyword", "spring"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.records").isArray())
                .andExpect(jsonPath("$.data.records").isEmpty());
    }

    @Test
    void searchArticles_ShouldReturnOnlyPublished() throws Exception {
        Page<Article> expectedPage = new Page<>(1, 10, 0);
        expectedPage.setRecords(List.of());

        when(articleRepository.selectPage(any(), any()))
                .thenReturn(expectedPage);

        mockMvc.perform(get("/api/search/articles")
                        .param("keyword", "draft"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.records").isEmpty());
    }
}
