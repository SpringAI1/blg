-- =====================================================
-- 博客系统数据库初始化脚本
-- 数据库: blog
-- 版本: 1.0
-- 日期: 2024
-- =====================================================

-- 创建数据库（如果不存在）
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
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0未删除，1已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    UNIQUE KEY `uk_email` (`email`),
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
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_name` (`name`),
    UNIQUE KEY `uk_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- =====================================================
-- 3. 标签表
-- =====================================================
DROP TABLE IF EXISTS `tag`;
CREATE TABLE `tag` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name` VARCHAR(50) NOT NULL COMMENT '标签名称',
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
    INDEX `idx_create_time` (`create_time`),
    INDEX `idx_is_top` (`is_top`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- =====================================================
-- 5. 文章标签关联表
-- =====================================================
DROP TABLE IF EXISTS `article_tag`;
CREATE TABLE `article_tag` (
    `article_id` BIGINT NOT NULL COMMENT '文章ID',
    `tag_id` BIGINT NOT NULL COMMENT '标签ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`article_id`, `tag_id`),
    INDEX `idx_article_id` (`article_id`),
    INDEX `idx_tag_id` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章标签关联表';

-- =====================================================
-- 6. 评论表
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

-- =====================================================
-- 7. 收藏表
-- =====================================================
DROP TABLE IF EXISTS `favorite`;
CREATE TABLE `favorite` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `article_id` BIGINT NOT NULL COMMENT '文章ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_article` (`user_id`, `article_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_article_id` (`article_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- =====================================================
-- 8. 关注表
-- =====================================================
DROP TABLE IF EXISTS `follow`;
CREATE TABLE `follow` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `follower_id` BIGINT NOT NULL COMMENT '关注者ID',
    `following_id` BIGINT NOT NULL COMMENT '被关注者ID',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_follower_following` (`follower_id`, `following_id`),
    INDEX `idx_follower_id` (`follower_id`),
    INDEX `idx_following_id` (`following_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='关注表';

-- =====================================================
-- 9. 下载分类表
-- =====================================================
DROP TABLE IF EXISTS `download_category`;
CREATE TABLE `download_category` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
    `description` VARCHAR(255) DEFAULT NULL COMMENT '分类描述',
    `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='下载分类表';

-- =====================================================
-- 10. 下载资源表
-- =====================================================
DROP TABLE IF EXISTS `download_resource`;
CREATE TABLE `download_resource` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `title` VARCHAR(200) NOT NULL COMMENT '资源标题',
    `description` TEXT DEFAULT NULL COMMENT '资源描述',
    `file_url` VARCHAR(500) DEFAULT NULL COMMENT '文件URL',
    `file_size` VARCHAR(50) DEFAULT NULL COMMENT '文件大小',
    `file_type` VARCHAR(50) DEFAULT NULL COMMENT '文件类型',
    `category_id` BIGINT DEFAULT NULL COMMENT '分类ID',
    `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片',
    `download_count` INT NOT NULL DEFAULT 0 COMMENT '下载次数',
    `views` INT NOT NULL DEFAULT 0 COMMENT '浏览次数',
    `rating` DECIMAL(3,2) DEFAULT 0.00 COMMENT '评分',
    `rating_count` INT NOT NULL DEFAULT 0 COMMENT '评分人数',
    `user_id` BIGINT NOT NULL COMMENT '上传者ID',
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
-- 11. 下载记录表
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
-- 初始化数据
-- =====================================================

-- 插入测试用户（密码都是 123456，使用BCrypt加密）
INSERT INTO `blog_user` (`username`, `password`, `email`, `avatar`, `nickname`, `role`) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'admin@blog.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', '管理员', 'ADMIN'),
('zhangwei', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'zhangwei@blog.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangwei', '张伟', 'USER'),
('lina', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'lina@blog.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lina', '李娜', 'USER'),
('wanghao', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'wanghao@blog.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=wanghao', '王浩', 'USER'),
('chenli', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'chenli@blog.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=chenli', '陈丽', 'USER');

-- 插入分类数据
INSERT INTO `category` (`name`, `slug`, `description`) VALUES
('Java', 'java', 'Java开发相关技术文章'),
('前端', 'frontend', '前端开发相关技术文章'),
('Python', 'python', 'Python开发相关技术文章'),
('数据库', 'database', '数据库相关技术文章'),
('DevOps', 'devops', 'DevOps相关技术文章'),
('人工智能', 'ai', '人工智能相关技术文章');

-- 插入标签数据
INSERT INTO `tag` (`name`) VALUES
('Spring Boot'),
('React'),
('Python'),
('MySQL'),
('Redis'),
('Docker'),
('Vue'),
('TypeScript'),
('微服务');

-- 插入下载分类
INSERT INTO `download_category` (`name`, `description`, `sort_order`) VALUES
('开发工具', '开发相关的开发工具', 1),
('代码模板', '常用的代码模板', 2),
('学习资料', '学习相关的学习资料', 3),
('电子书', '技术电子书', 4);

-- 插入下载资源
INSERT INTO `download_resource` (`title`, `description`, `file_url`, `file_size`, `file_type`, `category_id`, `user_id`, `cover_image`, `rating`, `rating_count`) VALUES
('Java开发工具包', 'Java开发必备工具包', 'https://example.com/java-tools.zip', '25.5MB', 'ZIP', 1, 1, 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop', 4.5, 100),
('React项目模板', 'React项目快速启动模板', 'https://example.com/react-template.zip', '8.2MB', 'ZIP', 2, 2, 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop', 4.8, 200),
('Python数据分析入门', 'Python数据分析入门教程', 'https://example.com/python-data.zip', '32.1MB', 'PDF', 3, 3, 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop', 4.3, 150),
('MySQL性能优化指南', 'MySQL数据库性能优化指南', 'https://example.com/mysql-optimization.pdf', '15.6MB', 'PDF', 4, 4, 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=300&fit=crop', 4.7, 180),
('Docker快速部署教程', 'Docker容器化部署完整教程', 'https://example.com/docker-guide.pdf', '45.3MB', 'PDF', 3, 5, 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=300&fit=crop', 4.6, 160),
('算法与数据结构', '算法与数据结构学习资料', 'https://example.com/algorithms.zip', '67.8MB', 'ZIP', 3, 1, 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop', 4.9, 300);

-- 插入文章数据
INSERT INTO `article` (`title`, `content`, `summary`, `cover_image`, `user_id`, `category_id`, `status`, `views`, `likes`, `comment_count`, `favorite_count`, `is_top`) VALUES
('Spring Boot 3.0 新特性完全解析', '# Spring Boot 3.0 新特性完全解析\n\n## 前言\n\nSpring Boot 3.0 是 Spring 生态系统的重大升级版本，带来了许多令人激动的新特性和改进。本文将深入探讨 Spring Boot 3.0 的主要新特性，帮助开发者更好地理解和应用这些新功能。\n\n## 主要特性\n\n- Java 17+ 支持\n- Jakarta EE 迁移\n- GraalVM 原生镜像\n- 响应式编程增强\n', '深入了解Spring Boot 3.0的新特性和改进', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop', 1, 1, 'PUBLISHED', 12580, 342, 15, 89, 1),
('React 18 完全指南：Hooks 高级用法与最佳实践', '# React 18 完全指南：Hooks 高级用法与最佳实践\n\n## 前言\n\nReact 18 是 React 历史上最重要的版本之一，引入了许多革命性的新特性。\n\n## 主要特性\n\n- 并发渲染\n- 自动批处理\n- 新的 Hooks：useTransition、useDeferredValue、useId\n', '全面解析React 18的新特性和Hooks的高级用法', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop', 2, 2, 'PUBLISHED', 8920, 256, 10, 67, 1),
('Python 数据分析实战：从入门到精通', '# Python 数据分析实战：从入门到精通\n\n## 前言\n\n数据分析是当今最热门的技术领域之一。\n\n## 内容\n\n- Pandas 数据处理\n- NumPy 数值计算\n- Matplotlib 数据可视化\n', '从零开始学习Python数据分析', 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=400&fit=crop', 3, 3, 'PUBLISHED', 6540, 189, 8, 45, 0),
('MySQL 性能优化详解：索引、查询与架构', '# MySQL 性能优化详解：索引、查询与架构\n\n## 前言\n\nMySQL 是最流行的开源关系型数据库之一。\n\n## 内容\n\n- 索引优化\n- 查询优化\n- 架构优化\n', '深入理解MySQL索引原理、查询优化技巧和架构优化', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=400&fit=crop', 4, 4, 'PUBLISHED', 7890, 221, 12, 56, 0);

-- 为文章添加标签
INSERT INTO `article_tag` (`article_id`, `tag_id`) VALUES
(1, 1), (1, 8),
(2, 2), (2, 8),
(3, 3),
(4, 4);

-- 插入测试评论
INSERT INTO `comment` (`content`, `article_id`, `user_id`, `parent_id`) VALUES
('写得很棒，非常详细！', 1, 2, NULL),
('收藏了，学习中...', 1, 3, NULL),
('支持！', 2, 1, NULL),
('感谢分享！', 2, 3, NULL),
('期待更新！', 3, 4, NULL),
('实用！', 3, 5, NULL);

-- 插入收藏数据
INSERT INTO `favorite` (`user_id`, `article_id`) VALUES
(2, 1), (2, 2),
(3, 1), (3, 3),
(4, 2), (4, 4),
(5, 1), (5, 3);

-- 插入关注数据
INSERT INTO `follow` (`follower_id`, `following_id`) VALUES
(2, 1), (2, 3),
(3, 1), (3, 2),
(4, 1), (4, 2), (4, 3),
(5, 1), (5, 2), (5, 3), (5, 4);

-- 插入下载记录
INSERT INTO `download_record` (`user_id`, `resource_id`) VALUES
(1, 1), (1, 2),
(2, 1), (2, 3),
(3, 2), (3, 4), (3, 6),
(4, 1), (4, 5),
(5, 3), (5, 4), (5, 6);

-- =====================================================
-- 数据库初始化完成
-- =====================================================
