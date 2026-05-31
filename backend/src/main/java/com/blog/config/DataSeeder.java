package com.blog.config;

import com.blog.entity.*;
import com.blog.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Java 数据播种器 — 在表结构创建后插入初始数据
 * 使用 JPA/MyBatis API 避免 SQL 转义问题
 */
@Component
@Order(2)
public class DataSeeder implements CommandLineRunner {

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
        // 检查是否已有数据
        try {
            Long count = userRepository.selectCount(null);
            if (count != null && count > 0) {
                System.out.println("已有数据，跳过数据播种");
                return;
            }
        } catch (Exception e) {
            // 表可能不存在
        }

        System.out.println("开始播种数据...");
        seedData();
        System.out.println("数据播种完成！");
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
            user.setFollowerCount(5 + i * 2);
            user.setFollowingCount(10 - i);
            user.setArticleCount(5 + i * 3);
            userRepository.insert(user);
        }
        System.out.println("  用户: " + usernames.length + " 个");
    }

    private void seedCategories() {
        String[][] cats = {
            {"Java", "java", "Java/Spring相关技术", "1"},
            {"前端", "frontend", "Vue/React/TypeScript", "2"},
            {"Python", "python", "数据分析/机器学习", "3"},
            {"数据库", "database", "MySQL/Redis/MongoDB", "4"},
            {"DevOps", "devops", "Docker/K8s/运维", "5"},
            {"人工智能", "ai", "AI/深度学习/大模型", "6"}
        };

        for (String[] cat : cats) {
            Category c = new Category();
            c.setName(cat[0]);
            c.setSlug(cat[1]);
            c.setDescription(cat[2]);
            jdbcTemplate.update("INSERT INTO category(name, slug, description, sort_order) VALUES (?, ?, ?, ?)",
                cat[0], cat[1], cat[2], Integer.parseInt(cat[3]));
        }
        System.out.println("  分类: " + cats.length + " 个");
    }

    private void seedTags() {
        String[][] tags = {
            {"Spring Boot", "#1890ff"}, {"Vue", "#52c41a"}, {"React", "#722ed1"},
            {"MySQL", "#faad14"}, {"Redis", "#f5222d"}, {"Python", "#fa541c"},
            {"Docker", "#13c2c2"}, {"微服务", "#2f54eb"}, {"性能优化", "#fa8c16"}
        };

        for (String[] tag : tags) {
            jdbcTemplate.update("INSERT INTO tag(name, color) VALUES (?, ?)", tag[0], tag[1]);
        }
        System.out.println("  标签: " + tags.length + " 个");
    }

    private void seedArticles() {
        // 文章1: Spring Boot 3.0
        Article a1 = new Article();
        a1.setTitle("Spring Boot 3.0 新特性完全解析");
        a1.setContent("Spring Boot 3.0 是基于 Spring Framework 6.0 的重大升级版本。\n\n" +
            "## 核心变化\n\n### 1. 最低要求 Java 17\nSpring Boot 3.0 最低要求 Java 17。\n" +
            "这意味着你可以使用 Java 17 的新特性如 Records、Sealed Classes 和 Pattern Matching。\n\n" +
            "### 2. Jakarta EE 9+ 迁移\n" +
            "从 Java EE 迁移到 Jakarta EE，包名从 javax.* 变为 jakarta.*。\n\n" +
            "### 3. GraalVM 原生镜像\n" +
            "Spring Boot 3.0 官方支持 GraalVM 原生镜像，启动时间降低到 100ms 以内。\n\n" +
            "### 4. 可观测性增强\n" +
            "基于 Micrometer 的全新可观测性 API，支持 OpenTelemetry。\n\n" +
            "### 5. 安全性改进\n" +
            "Resource Server 配置更简化，支持更细粒度的授权控制。\n\n" +
            "## 迁移指南\n\n" +
            "1. 升级所有依赖到 Jakarta EE 版本\n" +
            "2. 更新配置文件中的 javax 引用\n" +
            "3. 检查自定义 Starter 的兼容性\n" +
            "4. 测试现有功能\n\n" +
            "## 总结\n\nSpring Boot 3.0 是里程碑式的版本，建议尽早规划升级。");
        a1.setSummary("Spring Boot 3.0 带来了 GraalVM 原生镜像支持、Jakarta EE 迁移、Java 17 最低要求等重大更新。");
        a1.setUserId(1L);
        a1.setCategoryId(1L);
        a1.setStatus("PUBLISHED");
        a1.setViews(12580);
        a1.setLikes(342);
        a1.setCommentCount(15);
        a1.setFavoriteCount(89);
        a1.setIsTop(true);
        articleRepository.insert(a1);

        // 文章2: React 18
        Article a2 = new Article();
        a2.setTitle("React 18 并发模式深度解析与实战");
        a2.setContent("React 18 引入了革命性的并发渲染机制，这是 React 架构的重大进步。\n\n" +
            "## 并发模式是什么？\n\n" +
            "传统 React 渲染是同步的，一旦开始渲染就不能中断。" +
            "并发模式允许 React 在渲染过程中暂停和恢复，优先处理更重要的更新。\n\n" +
            "## 自动批处理\n\n" +
            "React 18 将多个状态更新自动合并为一次重渲染，显著提升性能。\n\n" +
            "## useTransition\n\n" +
            "用于标记非紧急更新，React 会优先处理紧急更新。\n\n" +
            "## useDeferredValue\n\n" +
            "允许你延迟某个值的更新，让 UI 保持响应。\n\n" +
            "## Suspense 改进\n\n" +
            "React 18 的 Suspense 支持流式服务端渲染和选择性水合。\n\n" +
            "## 升级建议\n\n" +
            "将 ReactDOM.render 替换为 createRoot 即可完成升级。");
        a2.setSummary("React 18 并发机制、自动批处理、useTransition 和 Suspense 改进的实战指南。");
        a2.setUserId(2L);
        a2.setCategoryId(2L);
        a2.setStatus("PUBLISHED");
        a2.setViews(9520);
        a2.setLikes(281);
        a2.setCommentCount(22);
        a2.setFavoriteCount(67);
        articleRepository.insert(a2);

        // 文章3: MySQL
        Article a3 = new Article();
        a3.setTitle("MySQL 性能优化实战指南");
        a3.setContent("MySQL 是最流行的开源关系型数据库之一，性能优化是每个后端工程师的必备技能。\n\n" +
            "## 索引优化\n\n" +
            "索引是数据库性能优化的第一手段。\n" +
            "联合索引遵循最左前缀原则，合理设计可以大幅提升查询性能。\n\n" +
            "### 索引选择建议\n" +
            "- 查询频繁的字段建立索引\n" +
            "- 区分度高的列优先级更高\n" +
            "- 避免在索引列上使用函数\n" +
            "- 覆盖索引可以避免回表查询\n\n" +
            "## 查询优化\n\n" +
            "慢查询日志是查找性能瓶颈的主要工具。\n" +
            "使用 EXPLAIN 分析执行计划，检查是否使用了正确的索引。\n\n" +
            "## 分页优化\n\n" +
            "传统 LIMIT OFFSET 分页在偏移量大时性能差，推荐使用游标分页。\n\n" +
            "## 表结构优化\n\n" +
            "选择合适的数据类型可以节省存储空间并提升查询速度。\n" +
            "适度反范式的冗余设计可以减少 JOIN 次数。\n\n" +
            "## 配置优化\n\n" +
            "innodb_buffer_pool_size 设置为内存的 70% 左右是最佳实践。");
        a3.setSummary("从索引设计、SQL 优化到配置调优的 MySQL 性能优化完整指南。");
        a3.setUserId(3L);
        a3.setCategoryId(4L);
        a3.setStatus("PUBLISHED");
        a3.setViews(18900);
        a3.setLikes(456);
        a3.setCommentCount(35);
        a3.setFavoriteCount(120);
        articleRepository.insert(a3);

        // 文章4: Docker
        Article a4 = new Article();
        a4.setTitle("Docker 从入门到实战：容器化部署完整指南");
        a4.setContent("Docker 已成为现代应用开发和部署的标配技术。\n\n" +
            "## 核心概念\n\n" +
            "镜像：只读模板，包含应用运行所需的全部文件。\n" +
            "容器：镜像的运行实例。\n" +
            "仓库：存储和分发镜像的地方。\n\n" +
            "## Dockerfile 最佳实践\n\n" +
            "使用多阶段构建减小镜像体积，合并 RUN 命令减少层数。\n" +
            "选择 Alpine 基础镜像是最常见的优化手段。\n\n" +
            "## Docker Compose\n\n" +
            "使用 Compose 编排多容器应用，一条命令即可启动整个服务栈。\n\n" +
            "## 网络配置\n\n" +
            "Docker 支持 bridge、host 和 overlay 等多种网络模式。\n" +
            "自定义网络允许容器通过容器名直接通信。\n\n" +
            "## 生产实践\n\n" +
            "资源限制：限制容器的 CPU 和内存使用。\n" +
            "健康检查：确保容器服务正常。\n" +
            "日志管理：合理配置日志驱动避免磁盘写满。");
        a4.setSummary("从 Docker 基础到生产实践的完整指南，涵盖镜像优化、Compose 编排和监控排障。");
        a4.setUserId(4L);
        a4.setCategoryId(5L);
        a4.setStatus("PUBLISHED");
        a4.setViews(21300);
        a4.setLikes(523);
        a4.setCommentCount(42);
        a4.setFavoriteCount(156);
        articleRepository.insert(a4);

        // 文章5: Python AI
        Article a5 = new Article();
        a5.setTitle("Python 数据分析：从基础到机器学习实战");
        a5.setContent("Python 凭借其丰富的生态成为数据分析和机器学习的首选语言。\n\n" +
            "## Pandas 基础\n\n" +
            "Pandas 是 Python 数据分析的核心库。DataFrame 和 Series 是两种基本数据结构。\n\n" +
            "### 数据读取\n" +
            "支持 CSV、Excel、JSON、SQL 等多种数据源。\n\n" +
            "### 数据清洗\n" +
            "处理缺失值、重复值、异常值是数据清洗的主要任务。\n\n" +
            "### 数据转换\n" +
            "groupby、merge、pivot_table 是最常用的数据聚合操作。\n\n" +
            "## 数据可视化\n\n" +
            "Matplotlib 和 Seaborn 提供了丰富的图表类型。\n" +
            "一个好的可视化图表胜过千言万语。\n\n" +
            "## 机器学习入门\n\n" +
            "Scikit-learn 提供了统一的机器学习 API。\n" +
            "分类、回归、聚类是三大经典问题。\n\n" +
            "## 实战建议\n\n" +
            "从实际项目出发，带着问题学习效果最好。\n" +
            "Kaggle 竞赛是练习数据分析技能的好平台。");
        a5.setSummary("从 Pandas 数据清洗到 Scikit-learn 机器学习的完整 Python 数据分析教程。");
        a5.setUserId(5L);
        a5.setCategoryId(3L);
        a5.setStatus("PUBLISHED");
        a5.setViews(15680);
        a5.setLikes(389);
        a5.setCommentCount(28);
        a5.setFavoriteCount(98);
        articleRepository.insert(a5);

        // 文章6: Redis
        Article a6 = new Article();
        a6.setTitle("Redis 缓存实战：从数据结构到集群部署");
        a6.setContent("Redis 是目前最流行的内存缓存数据库，以高性能和丰富的数据结构著称。\n\n" +
            "## 数据结构精讲\n\n" +
            "String：最基础的类型，用于缓存简单值。\n" +
            "List：双向链表，适合消息队列。\n" +
            "Set：无序集合，适合标签系统。\n" +
            "Sorted Set：有序集合，适合排行榜。\n" +
            "Hash：键值对集合，适合对象缓存。\n\n" +
            "## 缓存策略\n\n" +
            "### 缓存穿透\n" +
            "查询不存在的数据，建议使用布隆过滤器。\n\n" +
            "### 缓存击穿\n" +
            "热点 Key 过期，建议使用互斥锁或永不过期策略。\n\n" +
            "### 缓存雪崩\n" +
            "大量 Key 同时过期，建议设置随机过期时间。\n\n" +
            "## Redis 集群\n\n" +
            "Redis Cluster 提供了自动分片和高可用性。\n" +
            "哨兵模式实现主从自动切换。\n\n" +
            "## 内存优化\n\n" +
            "合理设置 maxmemory，选择合适的淘汰策略。\n" +
            "避免大 Key，定期清理过期 Key。");
        a6.setSummary("Redis 数据结构详解、缓存穿透/击穿/雪崩解决方案、集群部署和内存优化实践。");
        a6.setUserId(1L);
        a6.setCategoryId(4L);
        a6.setStatus("PUBLISHED");
        a6.setViews(18200);
        a6.setLikes(412);
        a6.setCommentCount(31);
        a6.setFavoriteCount(110);
        articleRepository.insert(a6);

        // 文章7: 微服务
        Article a7 = new Article();
        a7.setTitle("微服务架构从零到一：设计原则与落地实践");
        a7.setContent("微服务架构已成为大型系统的首选架构风格。\n\n" +
            "## 设计原则\n\n" +
            "单一职责：每个服务只负责一个业务领域。\n" +
            "自治性：每个服务可以独立开发、部署和扩展。\n" +
            "去中心化：避免单点瓶颈和集中式控制。\n\n" +
            "## 服务拆分策略\n\n" +
            "按业务领域拆分是最自然的拆分方式。\n" +
            "DDD 限界上下文是识别服务边界的有效方法。\n\n" +
            "## 通信方式\n\n" +
            "同步：REST/gRPC，适合实时查询。\n" +
            "异步：消息队列，适合最终一致性场景。\n\n" +
            "## 分布式事务\n\n" +
            "Saga 模式是微服务事务的主流解决方案。\n" +
            "TCC 模式适合强一致性要求的场景。\n\n" +
            "## 可观测性\n\n" +
            "日志、指标和链路追踪是可观测性的三大支柱。\n" +
            "ELK + Prometheus + Jaeger 是常见的技术栈。\n\n" +
            "## Kubernetes 部署\n\n" +
            "K8s 是微服务部署的事实标准。\n" +
            "Service Mesh 进一步简化了服务间通信。");
        a7.setSummary("微服务设计原则、服务拆分、分布式事务、可观测性和 K8s 部署的完整实践指南。");
        a7.setUserId(2L);
        a7.setCategoryId(1L);
        a7.setStatus("PUBLISHED");
        a7.setViews(14200);
        a7.setLikes(334);
        a7.setCommentCount(25);
        a7.setFavoriteCount(87);
        articleRepository.insert(a7);

        // 文章8: Vue 3
        Article a8 = new Article();
        a8.setTitle("Vue 3 Composition API 深入实践");
        a8.setContent("Vue 3 的 Composition API 是 Vue 框架历史上最大的 API 变革。\n\n" +
            "## 为什么需要 Composition API？\n\n" +
            "Options API 在大型组件中容易导致逻辑分散，相同功能的代码被分散在不同的选项中。\n" +
            "Composition API 允许按逻辑组织代码，提高可维护性。\n\n" +
            "## setup 函数\n\n" +
            "setup 是 Composition API 的入口，在组件创建前执行。\n" +
            "ref 和 reactive 是两种响应式数据声明方式。\n\n" +
            "## 组合式函数\n\n" +
            "将通用逻辑封装为 useXxx 函数，实现真正的逻辑复用。\n" +
            "这是 Composition API 相比 Mixin 最大的优势。\n\n" +
            "## Pinia 状态管理\n\n" +
            "Pinia 是 Vue 3 官方推荐的状态管理库。\n" +
            "相比 Vuex 更简洁，更好的 TypeScript 支持。\n\n" +
            "## 性能优化\n\n" +
            "v-memo 指令可以记忆模板片段。\n" +
            "shallowRef 和 shallowReactive 减少深层响应式的开销。");
        a8.setSummary("Vue 3 Composition API 从 Options API 到组合式函数的完整转型指南。");
        a8.setUserId(3L);
        a8.setCategoryId(2L);
        a8.setStatus("PUBLISHED");
        a8.setViews(11080);
        a8.setLikes(267);
        a8.setCommentCount(19);
        a8.setFavoriteCount(76);
        articleRepository.insert(a8);

        System.out.println("  文章: 8 篇");
    }

    private void seedArticleTags() {
        Long[][] relations = {
            {1L, 1L}, {1L, 8L},  // Spring Boot + 微服务
            {2L, 3L},             // React
            {3L, 4L},             // MySQL
            {4L, 7L},             // Docker
            {5L, 6L},             // Python
            {6L, 5L},             // Redis
            {7L, 8L},             // 微服务
            {8L, 2L},             // Vue
        };
        for (Long[] r : relations) {
            jdbcTemplate.update("INSERT INTO article_tag(article_id, tag_id) VALUES (?, ?)", r[0], r[1]);
        }
        System.out.println("  文章标签关联: " + relations.length + " 条");
    }

    private void seedDownloadCategories() {
        String[][] cats = {
            {"开发工具", "🛠", "1"}, {"编程语言", "💻", "2"},
            {"框架库", "📚", "3"}, {"数据库", "🗄", "4"},
            {"设计资源", "🎨", "5"}, {"其他", "📁", "6"}
        };
        for (String[] cat : cats) {
            jdbcTemplate.update("INSERT INTO download_category(name, icon, sort_order) VALUES (?, ?, ?)",
                cat[0], cat[1], Integer.parseInt(cat[2]));
        }
        System.out.println("  下载分类: " + cats.length + " 个");
    }

    private void seedDownloadResources() {
        insertResource("Spring Boot 3.0 官方文档中文版", "Spring Boot 3.0 完整官方文档中文翻译版", "📖",
            "https://spring.io/projects/spring-boot", "4.2MB", "PDF", 1L, 1280, 2560, 4.8, 1L);
        insertResource("React 18 官方教程", "React 18 官方教程电子书", "⚛",
            "https://react.dev/", "3.8MB", "PDF", 1L, 980, 1890, 4.7, 3L);
        insertResource("Python 机器学习实战", "基于 Scikit-learn 的机器学习教程", "🐍",
            "https://example.com/python-ml.pdf", "5.6MB", "PDF", 1L, 1560, 3200, 4.9, 6L);
        insertResource("MySQL 面试题精选", "大厂 MySQL 面试题汇总与解析", "🗄",
            "https://example.com/mysql-interview.pdf", "2.1MB", "PDF", 1L, 2100, 4500, 4.5, 4L);
        insertResource("Docker 实战手册", "Docker 从入门到生产环境部署", "🐳",
            "https://example.com/docker-handbook.pdf", "4.5MB", "PDF", 1L, 880, 1670, 4.6, 7L);
        System.out.println("  下载资源: 5 个");
    }

    private void insertResource(String title, String desc, String icon, String fileUrl,
                                String fileSize, String fileType, Long categoryId,
                                int views, int downloadCount, double rating, Long tagId) {
        jdbcTemplate.update(
            "INSERT INTO download_resource(title, description, icon, file_url, file_size, file_type," +
            " category_id, views, download_count, rating, rating_count, is_free, status) VALUES" +
            " (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 10, 1, 'PUBLISHED')",
            title, desc, icon, fileUrl, fileSize, fileType, categoryId, views, downloadCount, rating);
    }
}
