-- =====================================================
-- 博客系统数据库初始化脚本 - MySQL 版本
-- 数据库: blog
-- 版本: 1.0
-- 日期: 2024
-- =====================================================

CREATE DATABASE IF NOT EXISTS blog DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE blog;

-- =====================================================
-- 1. 用户表
-- =====================================================
DROP TABLE IF EXISTS `blog_user`;
CREATE TABLE `blog_user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码（加密存储）',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    `bio` VARCHAR(500) DEFAULT NULL COMMENT '个人简介',
    `role` VARCHAR(20) NOT NULL DEFAULT 'USER' COMMENT '角色：USER用户，ADMIN管理员',
    `follower_count` INT NOT NULL DEFAULT 0 COMMENT '粉丝数',
    `following_count` INT NOT NULL DEFAULT 0 COMMENT '关注数',
    `article_count` INT NOT NULL DEFAULT 0 COMMENT '文章数',
    `coins` INT DEFAULT 0 COMMENT '金币余额',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0未删除，1已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =====================================================
-- 2. 分类表
-- =====================================================
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
    `slug` VARCHAR(50) DEFAULT NULL COMMENT '分类别名（URL友好）',
    `description` VARCHAR(255) DEFAULT NULL COMMENT '分类描述',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- =====================================================
-- 3. 标签表
-- =====================================================
DROP TABLE IF EXISTS `tag`;
CREATE TABLE `tag` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name` VARCHAR(50) NOT NULL COMMENT '标签名称',
    `slug` VARCHAR(50) DEFAULT NULL COMMENT '标签别名',
    `color` VARCHAR(20) DEFAULT '#1890ff' COMMENT '标签颜色',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签表';

-- =====================================================
-- 4. 文章表
-- =====================================================
DROP TABLE IF EXISTS `article`;
CREATE TABLE `article` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `title` VARCHAR(200) NOT NULL COMMENT '文章标题',
    `content` TEXT NOT NULL COMMENT '文章内容（Markdown格式）',
    `summary` VARCHAR(500) DEFAULT NULL COMMENT '文章摘要',
    `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片URL',
    `views` INT NOT NULL DEFAULT 0 COMMENT '浏览量',
    `likes` INT NOT NULL DEFAULT 0 COMMENT '点赞数',
    `status` VARCHAR(20) NOT NULL DEFAULT 'DRAFT' COMMENT '状态：DRAFT草稿，PUBLISHED已发布',
    `user_id` BIGINT NOT NULL COMMENT '作者ID',
    `category_id` BIGINT DEFAULT NULL COMMENT '分类ID',
    `comment_count` INT NOT NULL DEFAULT 0 COMMENT '评论数',
    `favorite_count` INT NOT NULL DEFAULT 0 COMMENT '收藏数',
    `is_top` TINYINT NOT NULL DEFAULT 0 COMMENT '是否置顶：0否，1是',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_category_id` (`category_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- =====================================================
-- 5. 文章点赞表
-- =====================================================
DROP TABLE IF EXISTS `article_like`;
CREATE TABLE `article_like` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `article_id` BIGINT NOT NULL COMMENT '文章ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY `uk_user_article` (`user_id`, `article_id`),
    INDEX `idx_article_id` (`article_id`),
    INDEX `idx_user_id` (`user_id`),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章点赞表';

-- =====================================================
-- 6. 文章标签关联表
-- =====================================================
DROP TABLE IF EXISTS `article_tag`;
CREATE TABLE `article_tag` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `article_id` BIGINT NOT NULL COMMENT '文章ID',
    `tag_id` BIGINT NOT NULL COMMENT '标签ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY `uk_article_tag` (`article_id`, `tag_id`),
    INDEX `idx_article_id` (`article_id`),
    INDEX `idx_tag_id` (`tag_id`),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章标签关联表';

-- =====================================================
-- 7. 评论表
-- =====================================================
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `content` TEXT NOT NULL COMMENT '评论内容',
    `article_id` BIGINT NOT NULL COMMENT '文章ID',
    `user_id` BIGINT NOT NULL COMMENT '评论者ID',
    `parent_id` BIGINT DEFAULT NULL COMMENT '父评论ID（用于回复）',
    `likes` INT NOT NULL DEFAULT 0 COMMENT '点赞数',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    INDEX `idx_article_id` (`article_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- 评论点赞表
DROP TABLE IF EXISTS `comment_like`;
CREATE TABLE `comment_like` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `comment_id` BIGINT NOT NULL COMMENT '评论ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_comment_user` (`comment_id`, `user_id`),
    INDEX `idx_comment_id` (`comment_id`),
    INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论点赞表';

-- =====================================================
-- 8. 收藏表
-- =====================================================
DROP TABLE IF EXISTS `favorite`;
CREATE TABLE `favorite` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `article_id` BIGINT NOT NULL COMMENT '文章ID',
    `collection_name` VARCHAR(100) DEFAULT NULL COMMENT '收藏分类',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_article` (`user_id`, `article_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_article_id` (`article_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- =====================================================
-- 9. 关注表
-- =====================================================
DROP TABLE IF EXISTS `follow`;
CREATE TABLE `follow` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `follower_id` BIGINT NOT NULL COMMENT '关注者ID',
    `following_id` BIGINT NOT NULL COMMENT '被关注者ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_follower_following` (`follower_id`, `following_id`),
    INDEX `idx_follower_id` (`follower_id`),
    INDEX `idx_following_id` (`following_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关注表';

-- =====================================================
-- 10. 下载分类表
-- =====================================================
DROP TABLE IF EXISTS `download_category`;
CREATE TABLE `download_category` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
    `icon` VARCHAR(100) DEFAULT NULL COMMENT '图标',
    `description` VARCHAR(255) DEFAULT NULL COMMENT '分类描述',
    `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='下载分类表';

-- =====================================================
-- 11. 下载资源表
-- =====================================================
DROP TABLE IF EXISTS `download_resource`;
CREATE TABLE `download_resource` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `title` VARCHAR(200) NOT NULL COMMENT '资源标题',
    `description` TEXT DEFAULT NULL COMMENT '资源描述',
    `icon` VARCHAR(100) DEFAULT NULL COMMENT '图标',
    `file_url` VARCHAR(500) DEFAULT NULL COMMENT '文件URL',
    `file_size` VARCHAR(50) DEFAULT NULL COMMENT '文件大小',
    `file_type` VARCHAR(50) DEFAULT NULL COMMENT '文件类型',
    `category_id` BIGINT DEFAULT NULL COMMENT '分类ID',
    `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片',
    `download_count` INT NOT NULL DEFAULT 0 COMMENT '下载次数',
    `views` INT NOT NULL DEFAULT 0 COMMENT '浏览次数',
    `rating` DECIMAL(3,2) DEFAULT 0.00 COMMENT '评分',
    `rating_count` INT NOT NULL DEFAULT 0 COMMENT '评分人数',
    `user_id` BIGINT DEFAULT NULL COMMENT '上传者ID',
    `is_free` TINYINT DEFAULT 1 COMMENT '是否免费',
    `price` DECIMAL(10,2) DEFAULT 0.00 COMMENT '价格',
    `tags` VARCHAR(500) DEFAULT NULL COMMENT '标签（逗号分隔）',
    `status` VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED' COMMENT '状态',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    INDEX `idx_category_id` (`category_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='下载资源表';

-- =====================================================
-- 12. 下载记录表
-- =====================================================
DROP TABLE IF EXISTS `download_record`;
CREATE TABLE `download_record` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `user_id` BIGINT DEFAULT NULL COMMENT '用户ID',
    `resource_id` BIGINT NOT NULL COMMENT '资源ID',
    `ip_address` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
    `user_agent` VARCHAR(500) DEFAULT NULL COMMENT '用户代理',
    `download_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '下载时间',
    PRIMARY KEY (`id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_resource_id` (`resource_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='下载记录表';

-- =====================================================
-- 13. 会议表
-- =====================================================
DROP TABLE IF EXISTS `meeting`;
CREATE TABLE `meeting` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `title` VARCHAR(200) NOT NULL COMMENT '会议标题',
    `description` TEXT DEFAULT NULL COMMENT '会议描述',
    `start_time` DATETIME NOT NULL COMMENT '开始时间',
    `end_time` DATETIME DEFAULT NULL COMMENT '结束时间',
    `location` VARCHAR(200) DEFAULT NULL COMMENT '地点',
    `max_participants` INT DEFAULT 50 COMMENT '最大参与人数',
    `status` VARCHAR(20) DEFAULT 'UPCOMING' COMMENT '状态：UPCOMING/ONGOING/ENDED',
    `host_id` BIGINT NOT NULL COMMENT '主持人ID',
    `category_id` BIGINT DEFAULT NULL COMMENT '分类ID',
    `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片',
    `tags` VARCHAR(500) DEFAULT NULL COMMENT '标签',
    `participant_count` INT DEFAULT 0 COMMENT '参与者数量',
    `join_code` VARCHAR(10) DEFAULT NULL COMMENT '加入码',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    INDEX `idx_host_id` (`host_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_start_time` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会议表';

-- =====================================================
-- 14. 会议参与表
-- =====================================================
DROP TABLE IF EXISTS `meeting_participant`;
CREATE TABLE `meeting_participant` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `meeting_id` BIGINT NOT NULL COMMENT '会议ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `role` VARCHAR(20) DEFAULT 'PARTICIPANT' COMMENT '角色：HOST/PARTICIPANT',
    `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
    `deleted` TINYINT DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_meeting_user` (`meeting_id`, `user_id`),
    INDEX `idx_meeting_id` (`meeting_id`),
    INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会议参与表';

-- =====================================================
-- 初始化数据
-- =====================================================

INSERT INTO `blog_user` (`username`, `password`, `email`, `avatar`, `nickname`, `role`, `coins`) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'admin@blog.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', '管理员', 'ADMIN', 9999),
('zhangwei', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'zhangwei@blog.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangwei', '张伟', 'USER', 100),
('lina', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'lina@blog.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lina', '李娜', 'USER', 100),
('wanghao', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'wanghao@blog.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=wanghao', '王浩', 'USER', 100),
('chenli', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'chenli@blog.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=chenli', '陈丽', 'USER', 100);

INSERT INTO `category` (`name`, `slug`, `description`, `sort_order`) VALUES
('Java', 'java', 'Java开发相关技术文章', 1),
('前端', 'frontend', '前端开发相关技术文章', 2),
('Python', 'python', 'Python开发相关技术文章', 3),
('数据库', 'database', '数据库相关技术文章', 4),
('DevOps', 'devops', 'DevOps相关技术文章', 5),
('人工智能', 'ai', '人工智能相关技术文章', 6);

INSERT INTO `tag` (`name`, `slug`, `color`) VALUES
('Spring Boot', 'spring-boot', '#6DB33F'),
('React', 'react', '#61DAFB'),
('Python', 'python', '#3776AB'),
('MySQL', 'mysql', '#4479A1'),
('Redis', 'redis', '#DC382D'),
('Docker', 'docker', '#2496ED'),
('Vue', 'vue', '#4FC08D'),
('TypeScript', 'typescript', '#3178C6'),
('微服务', 'microservice', '#E34F26');

INSERT INTO `download_category` (`name`, `icon`, `description`, `sort_order`) VALUES
('开发工具', 'tool', '开发相关的开发工具', 1),
('代码模板', 'code', '常用的代码模板', 2),
('学习资料', 'book', '学习相关的学习资料', 3),
('电子书', 'ebook', '技术电子书', 4);

INSERT INTO `download_resource` (`title`, `description`, `file_url`, `file_size`, `file_type`, `category_id`, `user_id`, `cover_image`, `rating`, `rating_count`, `is_free`) VALUES
('Java开发工具包', 'Java开发必备工具包', 'https://example.com/java-tools.zip', '25.5MB', 'ZIP', 1, 1, 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop', 4.5, 100, 1),
('React项目模板', 'React项目快速启动模板', 'https://example.com/react-template.zip', '8.2MB', 'ZIP', 2, 2, 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop', 4.8, 200, 1),
('Python数据分析入门', 'Python数据分析入门教程', 'https://example.com/python-data.zip', '32.1MB', 'PDF', 3, 3, 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop', 4.3, 150, 1),
('MySQL性能优化指南', 'MySQL数据库性能优化指南', 'https://example.com/mysql-optimization.pdf', '15.6MB', 'PDF', 4, 4, 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=300&fit=crop', 4.7, 180, 1),
('Docker快速部署教程', 'Docker容器化部署完整教程', 'https://example.com/docker-guide.pdf', '45.3MB', 'PDF', 3, 5, 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=300&fit=crop', 4.6, 160, 1),
('算法与数据结构', '算法与数据结构学习资料', 'https://example.com/algorithms.zip', '67.8MB', 'ZIP', 3, 1, 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop', 4.9, 300, 1);

INSERT INTO `article` (`title`, `content`, `summary`, `cover_image`, `user_id`, `category_id`, `status`, `views`, `likes`, `comment_count`, `favorite_count`, `is_top`) VALUES
('Spring Boot 3.0 新特性完全解析', '# Spring Boot 3.0 新特性完全解析\n\n## 前言\n\nSpring Boot 3.0 是 Spring 生态系统的重大升级版本。\n\n## 主要特性\n\n- Java 17+ 支持\n- Jakarta EE 迁移\n- GraalVM 原生镜像\n- 响应式编程增强\n', '深入了解Spring Boot 3.0的新特性和改进', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop', 1, 1, 'PUBLISHED', 12580, 342, 15, 89, 1),
('React 18 完全指南：Hooks 高级用法与最佳实践', '# React 18 完全指南：Hooks 高级用法与最佳实践\n\n## 前言\n\nReact 18 是 React 历史上最重要的版本之一。\n\n## 主要特性\n\n- 并发渲染\n- 自动批处理\n- 新的 Hooks：useTransition、useDeferredValue、useId\n', '全面解析React 18的新特性和Hooks的高级用法', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop', 2, 2, 'PUBLISHED', 8920, 256, 10, 67, 1),
('Python 数据分析实战：从入门到精通', '# Python 数据分析实战：从入门到精通\n\n## 前言\n\n数据分析是当今最热门的技术领域之一。\n\n## 内容\n\n- Pandas 数据处理\n- NumPy 数值计算\n- Matplotlib 数据可视化\n', '从零开始学习Python数据分析', 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=400&fit=crop', 3, 3, 'PUBLISHED', 6540, 189, 8, 45, 0),
('MySQL 性能优化详解：索引、查询与架构', '# MySQL 性能优化详解：索引、查询与架构\n\n## 前言\n\nMySQL 是最流行的开源关系型数据库之一。\n\n## 内容\n\n- 索引优化\n- 查询优化\n- 架构优化\n', '深入理解MySQL索引原理、查询优化技巧和架构优化', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=400&fit=crop', 4, 4, 'PUBLISHED', 7890, 221, 12, 56, 0);

INSERT INTO `article_tag` (`article_id`, `tag_id`) VALUES
(1, 1), (1, 8),
(2, 2), (2, 8),
(3, 3),
(4, 4);

INSERT INTO `comment` (`content`, `article_id`, `user_id`, `parent_id`) VALUES
('写得很棒，非常详细！', 1, 2, NULL),
('收藏了，学习中...', 1, 3, NULL),
('支持！', 2, 1, NULL),
('感谢分享！', 2, 3, NULL),
('期待更新！', 3, 4, NULL),
('实用！', 3, 5, NULL);

INSERT INTO `favorite` (`user_id`, `article_id`) VALUES
(2, 1), (2, 2),
(3, 1), (3, 3),
(4, 2), (4, 4),
(5, 1), (5, 3);

INSERT INTO `follow` (`follower_id`, `following_id`) VALUES
(2, 1), (2, 3),
(3, 1), (3, 2),
(4, 1), (4, 2), (4, 3),
(5, 1), (5, 2), (5, 3), (5, 4);

INSERT INTO `download_record` (`user_id`, `resource_id`) VALUES
(1, 1), (1, 2),
(2, 1), (2, 3),
(3, 2), (3, 4), (3, 6),
(4, 1), (4, 5),
(5, 3), (5, 4), (5, 6);

-- 阅读历史表
DROP TABLE IF EXISTS `read_history`;
CREATE TABLE `read_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `article_id` BIGINT NOT NULL COMMENT '文章ID',
    `read_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '阅读时间',
    PRIMARY KEY (`id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_article_id` (`article_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='阅读历史表';

-- =====================================================
-- 15. 通知表
-- =====================================================
DROP TABLE IF EXISTS `notification`;
CREATE TABLE `notification` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `user_id` BIGINT NOT NULL COMMENT '接收通知的用户ID',
    `type` VARCHAR(30) NOT NULL COMMENT '通知类型(COMMENT/REPLY/LIKE/FOLLOW)',
    `content` TEXT NOT NULL COMMENT '通知内容',
    `related_user_id` BIGINT DEFAULT NULL COMMENT '触发者用户ID',
    `related_article_id` BIGINT DEFAULT NULL COMMENT '相关文章ID',
    `related_comment_id` BIGINT DEFAULT NULL COMMENT '相关评论ID',
    `is_read` TINYINT DEFAULT 0 COMMENT '是否已读',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';
