-- =====================================================
-- 博客系统数据库初始化脚本 - H2 兼容版本
-- =====================================================

-- 1. 用户表 (blog_user)
DROP TABLE IF EXISTS blog_user;
CREATE TABLE blog_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    avatar VARCHAR(255),
    nickname VARCHAR(50),
    bio VARCHAR(500),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    follower_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    article_count INT DEFAULT 0,
    coins INT DEFAULT 0,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
);
CREATE INDEX idx_user_role ON blog_user(role);

-- 2. 分类表
DROP TABLE IF EXISTS category;
CREATE TABLE category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50),
    description VARCHAR(255),
    sort_order INT DEFAULT 0,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
);

-- 3. 标签表
DROP TABLE IF EXISTS tag;
CREATE TABLE tag (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50),
    color VARCHAR(20) DEFAULT '#1890ff',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
);

-- 4. 文章表
DROP TABLE IF EXISTS article;
CREATE TABLE article (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    summary VARCHAR(500),
    cover_image VARCHAR(255),
    views INT DEFAULT 0,
    likes INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'DRAFT',
    user_id BIGINT NOT NULL,
    category_id BIGINT,
    comment_count INT DEFAULT 0,
    favorite_count INT DEFAULT 0,
    is_top TINYINT DEFAULT 0,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
);
CREATE INDEX idx_article_user_id ON article(user_id);
CREATE INDEX idx_article_category_id ON article(category_id);
CREATE INDEX idx_article_status ON article(status);
CREATE INDEX idx_article_create_time ON article(create_time);

-- 4. 文章点赞表
DROP TABLE IF EXISTS article_like;
CREATE TABLE article_like (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    article_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, article_id)
);
CREATE INDEX idx_article_like_article_id ON article_like(article_id);
CREATE INDEX idx_article_like_user_id ON article_like(user_id);

-- 5. 文章标签关联表
DROP TABLE IF EXISTS article_tag;
CREATE TABLE article_tag (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    article_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (article_id, tag_id)
);
CREATE INDEX idx_article_tag_article_id ON article_tag(article_id);
CREATE INDEX idx_article_tag_tag_id ON article_tag(tag_id);

-- 6. 评论表
DROP TABLE IF EXISTS comment;
CREATE TABLE comment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    article_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_id BIGINT,
    likes INT DEFAULT 0,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
);
CREATE INDEX idx_comment_article_id ON comment(article_id);
CREATE INDEX idx_comment_user_id ON comment(user_id);
CREATE INDEX idx_comment_parent_id ON comment(parent_id);

-- 7. 收藏表
DROP TABLE IF EXISTS favorite;
CREATE TABLE favorite (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    article_id BIGINT NOT NULL,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    UNIQUE (user_id, article_id)
);
CREATE INDEX idx_favorite_user_id ON favorite(user_id);
CREATE INDEX idx_favorite_article_id ON favorite(article_id);

-- 8. 关注表
DROP TABLE IF EXISTS follow;
CREATE TABLE follow (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    follower_id BIGINT NOT NULL,
    following_id BIGINT NOT NULL,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    UNIQUE (follower_id, following_id)
);
CREATE INDEX idx_follow_follower_id ON follow(follower_id);
CREATE INDEX idx_follow_following_id ON follow(following_id);

-- 9. 下载分类表
DROP TABLE IF EXISTS download_category;
CREATE TABLE download_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(100),
    description VARCHAR(255),
    sort_order INT DEFAULT 0,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
);

-- 10. 下载资源表
DROP TABLE IF EXISTS download_resource;
CREATE TABLE download_resource (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    file_url VARCHAR(500),
    file_size VARCHAR(50),
    file_type VARCHAR(50),
    category_id BIGINT,
    cover_image VARCHAR(255),
    download_count INT DEFAULT 0,
    views INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    user_id BIGINT,
    is_free TINYINT DEFAULT 1,
    price DECIMAL(10,2) DEFAULT 0.00,
    tags VARCHAR(500),
    status VARCHAR(20) DEFAULT 'PUBLISHED',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
);
CREATE INDEX idx_download_resource_category_id ON download_resource(category_id);
CREATE INDEX idx_download_resource_user_id ON download_resource(user_id);

-- 11. 下载记录表
DROP TABLE IF EXISTS download_record;
CREATE TABLE download_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    resource_id BIGINT NOT NULL,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    download_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_download_record_user_id ON download_record(user_id);
CREATE INDEX idx_download_record_resource_id ON download_record(resource_id);

-- 基础数据（用户、分类、标签）由 DataSeeder.java 插入

-- 12. 会议表
DROP TABLE IF EXISTS meeting;
CREATE TABLE meeting (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    location VARCHAR(200),
    max_participants INT DEFAULT 50,
    status VARCHAR(20) DEFAULT 'UPCOMING',
    host_id BIGINT NOT NULL,
    category_id BIGINT,
    cover_image VARCHAR(255),
    tags VARCHAR(500),
    participant_count INT DEFAULT 0,
    join_code VARCHAR(10),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0
);
CREATE INDEX idx_meeting_host_id ON meeting(host_id);
CREATE INDEX idx_meeting_status ON meeting(status);
CREATE INDEX idx_meeting_start_time ON meeting(start_time);

-- 13. 会议参与表
DROP TABLE IF EXISTS meeting_participant;
CREATE TABLE meeting_participant (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    meeting_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(20) DEFAULT 'PARTICIPANT',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted TINYINT DEFAULT 0,
    UNIQUE (meeting_id, user_id)
);
CREATE INDEX idx_mp_meeting_id ON meeting_participant(meeting_id);
CREATE INDEX idx_mp_user_id ON meeting_participant(user_id);