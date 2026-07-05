package com.blog.config;

import com.blog.entity.*;
import com.blog.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@Order(2)
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final ArticleRepository articleRepository;
    private final ArticleTagRepository articleTagRepository;
    private final DownloadCategoryRepository downloadCategoryRepository;
    private final DownloadResourceRepository downloadResourceRepository;

    public DataSeeder(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder,
                      UserRepository userRepository, CategoryRepository categoryRepository,
                      TagRepository tagRepository, ArticleRepository articleRepository,
                      ArticleTagRepository articleTagRepository,
                      DownloadCategoryRepository downloadCategoryRepository,
                      DownloadResourceRepository downloadResourceRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.articleRepository = articleRepository;
        this.articleTagRepository = articleTagRepository;
        this.downloadCategoryRepository = downloadCategoryRepository;
        this.downloadResourceRepository = downloadResourceRepository;
    }

    @Override
    public void run(String... args) {
        try {
            Long count = userRepository.selectCount(null);
            if (count != null && count > 0) {
                log.info("已有数据，跳过数据播种");
                return;
            }
        } catch (Exception e) {
            // 表可能不存在
        }

        log.info("开始播种数据...");
        seedData();
        log.info("数据播种完成！");
    }

    private void updateUserPasswords() {
        // 不再需要 — DataSeeder 只在首次运行播种，密码初始已编码
    }

    private void seedData() {
        seedUsers();
        seedCategories();
        seedTags();
        seedArticles();
        seedArticleTags();
        seedDownloadCategories();
        seedDownloadResources();
    }

    private void seedUsers() {
        String encodedPassword = passwordEncoder.encode("123456");
        String[] usernames = {"admin", "zhangwei", "lina", "wanghao", "chenli"};
        String[] nicknames = {"博客管理员", "张伟", "李娜", "王浩", "陈莉"};
        String[] bios = {
            "全栈开发工程师，热爱分享技术知识",
            "Java后端工程师，专注于微服务架构",
            "前端开发，Vue/React双持",
            "全栈开发，云原生爱好者",
            "Python/AI工程师，机器学习专家"
        };
        String[] roles = {"ADMIN", "USER", "USER", "USER", "USER"};

        for (int i = 0; i < usernames.length; i++) {
            User user = new User();
            user.setUsername(usernames[i]);
            user.setPassword(encodedPassword);
            user.setEmail(usernames[i] + "@blog.com");
            user.setNickname(nicknames[i]);
            user.setBio(bios[i]);
            user.setRole(roles[i]);
            user.setCoins(1000);
            user.setFollowerCount(5 + i * 2);
            user.setFollowingCount(10 - i);
            user.setArticleCount(5 + i * 3);
            userRepository.insert(user);
        }
        System.out.println("  用户: " + usernames.length + " 个");
    }

    private void seedCategories() {
        String[] cats = {"Java", "前端", "Python", "数据库", "DevOps", "人工智能"};
        for (String cat : cats) {
            jdbcTemplate.update("INSERT INTO category(name, slug, description) VALUES (?, ?, ?)",
                cat, cat.toLowerCase(), cat + "相关技术");
        }
        System.out.println("  分类: " + cats.length + " 个");
    }

    private void seedTags() {
        String[] tags = {"Spring Boot", "Vue", "React", "MySQL", "Redis", "Python", "Docker", "微服务", "性能优化", "TypeScript", "Kubernetes", "MongoDB", "Elasticsearch", "Kafka", "Node.js"};
        for (String tag : tags) {
            jdbcTemplate.update("INSERT INTO tag(name) VALUES (?)", tag);
        }
        System.out.println("  标签: " + tags.length + " 个");
    }

    private void seedArticles() {
        insertArticle("Spring Boot 3.0 新特性完全解析", "# Spring Boot 3.0 新特性\n\nSpring Boot 3.0 是基于 Spring Framework 6.0 的重大升级版本。\n\n## 核心变化\n\n### 1. 最低要求 Java 17\nSpring Boot 3.0 最低要求 Java 17。\n\n### 2. Jakarta EE 9+ 迁移\n从 Java EE 迁移到 Jakarta EE。\n\n### 3. GraalVM 原生镜像\nSpring Boot 3.0 官方支持 GraalVM 原生镜像。",
            "Spring Boot 3.0 新特性",
            1L, 1L, 12580, 342, 15, 89, true);

        insertArticle("React 18 并发模式深度解析", "# React 18 并发模式\n\nReact 18 引入了革命性的并发渲染机制。",
            "React 18 新特性",
            2L, 2L, 9520, 281, 22, 67, false);

        insertArticle("MySQL 性能优化实战指南", "# MySQL 性能优化\n\nMySQL 是最流行的开源关系型数据库之一。",
            "MySQL 性能优化指南",
            3L, 4L, 18900, 456, 35, 120, false);

        insertArticle("Docker 从入门到实战", "# Docker 容器化\n\nDocker 已成为现代应用开发和部署的标配技术。",
            "Docker 实战指南",
            4L, 5L, 21300, 523, 42, 156, false);

        insertArticle("Python 数据分析实战", "# Python 数据分析\n\nPython 凭借其丰富的生态成为数据分析和机器学习的首选语言。",
            "Python 数据分析",
            5L, 3L, 15680, 389, 28, 98, false);

        insertArticle("Redis 缓存实战", "# Redis 缓存\n\nRedis 是目前最流行的内存缓存数据库。",
            "Redis 缓存实战",
            1L, 4L, 18200, 412, 31, 110, false);

        insertArticle("微服务架构设计", "# 微服务架构\n\n微服务架构已成为大型系统的首选架构风格。",
            "微服务架构指南",
            2L, 1L, 14200, 334, 25, 87, false);

        insertArticle("Vue 3 Composition API 实践", "# Vue 3 Composition API\n\nVue 3 的 Composition API 是 Vue 框架历史上最大的 API 变革。",
            "Vue 3 教程",
            3L, 2L, 11080, 267, 19, 76, false);

        insertArticle("TypeScript 5.0 高级特性", "# TypeScript 5.0\n\nTypeScript 5.0 带来了多项重大改进和新特性。",
            "TypeScript 教程",
            2L, 2L, 8900, 198, 12, 54, false);

        insertArticle("Kubernetes 容器编排指南", "# Kubernetes\n\nKubernetes 是容器编排领域的事实标准。",
            "K8s 指南",
            4L, 5L, 16500, 378, 28, 89, false);

        insertArticle("GraphQL 与 REST 对比", "# GraphQL vs REST\n\nAPI 设计是现代应用开发的核心决策。",
            "GraphQL 教程",
            2L, 2L, 7800, 156, 9, 42, false);

        insertArticle("Elasticsearch 实战", "# Elasticsearch\n\nElasticsearch 是目前最流行的全文搜索引擎。",
            "ES 教程",
            1L, 4L, 11200, 234, 18, 67, false);

        insertArticle("Kafka 消息队列", "# Kafka 消息队列\n\nKafka 是分布式消息队列的首选方案。",
            "Kafka 教程",
            1L, 4L, 9800, 187, 14, 45, false);

        insertArticle("Git 工作流", "# Git 工作流\n\n良好的 Git 工作流能显著提升团队协作效率。",
            "Git 教程",
            3L, 5L, 14500, 312, 24, 78, false);

        insertArticle("前端性能优化", "# 前端性能优化\n\n前端性能直接影响用户体验和 SEO。",
            "前端优化指南",
            3L, 2L, 16800, 456, 38, 123, true);

        insertArticle("NestJS 企业级架构", "# NestJS 框架\n\nNestJS 是 Node.js 企业级后端框架的首选。",
            "NestJS 教程",
            2L, 1L, 8500, 178, 11, 48, false);

        insertArticle("MongoDB 设计与开发", "# MongoDB\n\nMongoDB 是最流行的 NoSQL 文档数据库。",
            "MongoDB 教程",
            5L, 4L, 9200, 198, 15, 52, false);

        insertArticle("CI/CD 流水线设计", "# CI/CD 持续集成/部署\n\nCI/CD 是现代软件工程的标配实践。",
            "CI/CD 教程",
            4L, 5L, 10500, 267, 21, 71, false);

        insertArticle("LangChain 与 AI 应用开发", "# LangChain 与 AI 应用\n\nLangChain 是构建 LLM 应用的主流框架。",
            "AI 开发指南",
            5L, 6L, 22000, 678, 52, 198, true);

        System.out.println("  文章: 20 篇");
    }

    private void insertArticle(String title, String content, String summary, Long userId, Long categoryId,
                               int views, int likes, int commentCount, int favoriteCount, boolean isTop) {
        Article article = new Article();
        article.setTitle(title);
        article.setContent(content);
        article.setSummary(summary);
        article.setUserId(userId);
        article.setCategoryId(categoryId);
        article.setStatus("PUBLISHED");
        article.setViews(views);
        article.setLikes(likes);
        article.setCommentCount(commentCount);
        article.setFavoriteCount(favoriteCount);
        article.setIsTop(isTop);
        articleRepository.insert(article);
    }

    private void seedArticleTags() {
        Long[][] relations = {
            {1L, 1L}, {1L, 8L},
            {2L, 3L}, {2L, 10L},
            {3L, 4L},
            {4L, 7L},
            {5L, 6L},
            {6L, 5L},
            {7L, 8L},
            {8L, 2L}, {8L, 10L},
            {9L, 10L},
            {10L, 7L}, {10L, 11L},
            {11L, 3L}, {11L, 10L},
            {12L, 13L},
            {13L, 5L},
            {14L, 7L},
            {15L, 3L}, {15L, 10L},
            {16L, 2L}, {16L, 10L},
            {17L, 1L}, {17L, 8L},
            {18L, 12L},
            {19L, 7L}, {19L, 11L},
            {20L, 6L}, {20L, 14L},
        };
        for (Long[] r : relations) {
            jdbcTemplate.update("INSERT INTO article_tag(article_id, tag_id) VALUES (?, ?)", r[0], r[1]);
        }
        System.out.println("  文章标签关联: " + relations.length + " 条");
    }

    private void seedDownloadCategories() {
        String[][] cats = {
            {"开发工具", "开发相关工具", "1"},
            {"编程语言", "各种编程语言", "2"},
            {"框架库", "开发框架和库", "3"},
            {"数据库", "数据库相关", "4"},
            {"设计资源", "设计素材", "5"},
            {"其他", "其他资源", "6"}
        };
        for (String[] cat : cats) {
            jdbcTemplate.update("INSERT INTO download_category(name, description, sort_order) VALUES (?, ?, ?)",
                cat[0], cat[1], Integer.parseInt(cat[2]));
        }
        System.out.println("  下载分类: " + cats.length + " 个");
    }

    private void seedDownloadResources() {
        insertResource("Spring Boot 3.0 官方文档", "Spring Boot 3.0 完整官方文档",
            "https://spring.io/projects/spring-boot", "4.2MB", "PDF", 1L, 1280, 2560, 4.8);
        insertResource("React 18 官方教程", "React 18 官方教程电子书",
            "https://react.dev/", "3.8MB", "PDF", 2L, 980, 1890, 4.7);
        insertResource("Python 机器学习实战", "基于 Scikit-learn 的机器学习教程",
            "https://example.com/python-ml.pdf", "5.6MB", "PDF", 3L, 1560, 3200, 4.9);
        insertResource("MySQL 面试题精选", "大厂 MySQL 面试题汇总与解析",
            "https://example.com/mysql-interview.pdf", "2.1MB", "PDF", 4L, 2100, 4500, 4.5);
        insertResource("Docker 实战手册", "Docker 从入门到生产环境部署",
            "https://example.com/docker-handbook.pdf", "4.5MB", "PDF", 5L, 880, 1670, 4.6);
        insertResource("TypeScript 入门到精通", "TypeScript 类型编程指南",
            "https://example.com/typescript-guide.pdf", "6.8MB", "PDF", 2L, 1650, 3200, 4.8);
        insertResource("Kubernetes 权威指南", "K8s 容器编排完整教程",
            "https://example.com/k8s-guide.pdf", "8.5MB", "PDF", 5L, 2100, 4100, 4.9);
        insertResource("Vue3 企业级实战", "Vue3 + Pinia + Vite 实战",
            "https://example.com/vue3实战.pdf", "5.2MB", "PDF", 2L, 1380, 2700, 4.6);
        System.out.println("  下载资源: 8 个");
    }

    private void insertResource(String title, String desc, String fileUrl,
                                String fileSize, String fileType, Long categoryId,
                                int views, int downloadCount, double rating) {
        jdbcTemplate.update(
            "INSERT INTO download_resource(title, description, icon, file_url, file_size, file_type," +
            " category_id, views, download_count, rating, rating_count, user_id, is_free, tags, status) VALUES" +
            " (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 10, 1, 1, 'tutorial', 'PUBLISHED')",
            title, desc, "📁", fileUrl, fileSize, fileType, categoryId, views, downloadCount, rating);
    }
}