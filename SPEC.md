# 个人博客系统 - 技术规格说明书

## 1. 项目概述

### 1.1 项目名称
个人博客系统 (Personal Blog System)

### 1.2 项目类型
全栈 Web 应用 - 前后端分离架构

### 1.3 核心功能
一个完整的个人博客平台，支持文章发布、分类管理、评论互动、用户认证等功能。

### 1.4 目标用户
- 博主（内容创作者）
- 访客（读者）

---

## 2. 技术栈

### 2.1 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | UI 框架 |
| TypeScript | 5.x | 类型系统 |
| React Router | 6.x | 路由管理 |
| Axios | 1.x | HTTP 客户端 |
| Ant Design | 5.x | UI 组件库 |
| Zustand | 4.x | 状态管理 |
| react-markdown | 9.x | Markdown 渲染 |

### 2.2 后端
| 技术 | 版本 | 用途 |
|------|------|------|
| Java | 17 | 开发语言 |
| Spring Boot | 3.x | Web 框架 |
| Spring Security | 6.x | 安全认证 |
| MyBatis-Plus | 3.x | ORM 框架 |
| MySQL | 8.x | 关系型数据库 |
| Redis | 7.x | 缓存中间件 |
| JWT | 0.11.x | Token 认证 |

---

## 3. 数据库设计

### 3.1 ER 图概述
```
用户 (User) 1 ←→ * 文章 (Article)
文章 (Article) 1 ←→ * 评论 (Comment)
分类 (Category) 1 ←→ * 文章 (Article)
标签 (Tag) * ←→ * 文章 (Article)
```

### 3.2 数据表结构

#### 用户表 (user)
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 主键 |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| password | VARCHAR(100) | NOT NULL | 密码(加密) |
| email | VARCHAR(100) | UNIQUE | 邮箱 |
| avatar | VARCHAR(255) | | 头像URL |
| role | VARCHAR(20) | NOT NULL | 角色(ADMIN/USER) |
| create_time | DATETIME | NOT NULL | 创建时间 |
| update_time | DATETIME | NOT NULL | 更新时间 |

#### 文章表 (article)
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 主键 |
| title | VARCHAR(200) | NOT NULL | 标题 |
| content | TEXT | NOT NULL | 内容(Markdown) |
| summary | VARCHAR(500) | | 摘要 |
| cover_image | VARCHAR(255) | | 封面图 |
| views | INT | DEFAULT 0 | 浏览量 |
| likes | INT | DEFAULT 0 | 点赞数 |
| status | VARCHAR(20) | NOT NULL | 状态(DRAFT/PUBLISHED) |
| user_id | BIGINT | FK | 作者ID |
| category_id | BIGINT | FK | 分类ID |
| create_time | DATETIME | NOT NULL | 创建时间 |
| update_time | DATETIME | NOT NULL | 更新时间 |

#### 分类表 (category)
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 主键 |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 名称 |
| slug | VARCHAR(50) | UNIQUE | 别名 |
| description | VARCHAR(255) | | 描述 |
| create_time | DATETIME | NOT NULL | 创建时间 |

#### 标签表 (tag)
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 主键 |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 名称 |
| create_time | DATETIME | NOT NULL | 创建时间 |

#### 文章标签关联表 (article_tag)
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| article_id | BIGINT | PK, FK | 文章ID |
| tag_id | BIGINT | PK, FK | 标签ID |

#### 评论表 (comment)
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 主键 |
| content | TEXT | NOT NULL | 内容 |
| article_id | BIGINT | FK | 文章ID |
| user_id | BIGINT | FK | 评论者ID |
| parent_id | BIGINT | FK, NULL | 父评论ID |
| create_time | DATETIME | NOT NULL | 创建时间 |

---

## 4. API 设计

### 4.1 认证接口
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | 否 |
| POST | /api/auth/login | 用户登录 | 否 |
| POST | /api/auth/logout | 用户登出 | 是 |

### 4.2 用户接口
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/users/{id} | 获取用户信息 | 否 |
| PUT | /api/users/{id} | 更新用户信息 | 是 |

### 4.3 文章接口
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/articles | 获取文章列表 | 否 |
| GET | /api/articles/{id} | 获取文章详情 | 否 |
| POST | /api/articles | 创建文章 | 是 |
| PUT | /api/articles/{id} | 更新文章 | 是 |
| DELETE | /api/articles/{id} | 删除文章 | 是 |
| GET | /api/articles/{id}/like | 点赞文章 | 否 |
| GET | /api/articles/published/{id} | 获取已发布文章 | 否 |

### 4.4 分类接口
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/categories | 获取分类列表 | 否 |
| POST | /api/categories | 创建分类 | 是 |
| PUT | /api/categories/{id} | 更新分类 | 是 |
| DELETE | /api/categories/{id} | 删除分类 | 是 |

### 4.5 标签接口
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/tags | 获取标签列表 | 否 |
| POST | /api/tags | 创建标签 | 是 |
| DELETE | /api/tags/{id} | 删除标签 | 是 |

### 4.6 评论接口
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/articles/{id}/comments | 获取文章评论 | 否 |
| POST | /api/articles/{id}/comments | 添加评论 | 是 |
| DELETE | /api/comments/{id} | 删除评论 | 是 |

---

## 5. 前端页面结构

### 5.1 路由结构
```
/                   - 首页（文章列表）
/article/:id        - 文章详情
/category/:slug     - 分类文章列表
/tag/:name          - 标签文章列表
/login              - 登录页
/register           - 注册页
/admin              - 管理后台（需认证）
  /admin/dashboard  - 管理仪表盘
  /admin/articles   - 文章管理
  /admin/comments   - 评论管理
  /admin/categories - 分类管理
  /admin/tags       - 标签管理
  /admin/profile    - 个人设置
```

### 5.2 页面组件
- **Layout**: 布局组件（Header, Footer, Sidebar）
- **ArticleCard**: 文章卡片组件
- **ArticleEditor**: 文章编辑器（Markdown）
- **CommentList**: 评论列表组件
- **CategoryNav**: 分类导航组件
- **TagCloud**: 标签云组件
- **UserAvatar**: 用户头像组件

---

## 6. 安全设计

### 6.1 JWT 认证流程
1. 用户登录 → 后端验证 → 生成 JWT Token
2. 前端存储 Token（localStorage）
3. 请求携带 Token（Authorization Header）
4. 后端验证 Token → 解析用户信息

### 6.2 权限控制
- ROLE_ADMIN: 管理员（所有权限）
- ROLE_USER: 普通用户（文章、评论管理）

### 6.3 密码加密
使用 BCrypt 加密算法

---

## 7. 缓存设计

### 7.1 Redis 缓存策略
| 缓存Key | 缓存内容 | 过期时间 |
|---------|----------|----------|
| article:list:{page} | 文章列表 | 5分钟 |
| article:{id} | 文章详情 | 10分钟 |
| category:list | 分类列表 | 30分钟 |
| tag:list | 标签列表 | 30分钟 |
| article:views:{id} | 文章浏览量 | 1小时 |

### 7.2 缓存更新策略
- 文章更新/删除 → 删除相关缓存
- 浏览量实时更新 → 使用 Redis INCR

---

## 8. 项目结构

### 8.1 后端结构
```
backend/
├── src/main/java/com/blog/
│   ├── BlogApplication.java
│   ├── config/           # 配置类
│   ├── controller/       # 控制器
│   ├── dto/              # 数据传输对象
│   ├── entity/           # 实体类
│   ├── repository/       # 数据访问层
│   ├── service/          # 业务逻辑层
│   ├── security/         # 安全相关
│   └── util/             # 工具类
├── src/main/resources/
│   ├── application.yml
│   └── mapper/           # MyBatis 映射文件
└── pom.xml
```

### 8.2 前端结构
```
frontend/
├── src/
│   ├── api/              # API 请求
│   ├── components/       # 公共组件
│   ├── hooks/            # 自定义 Hooks
│   ├── pages/            # 页面组件
│   ├── store/            # 状态管理
│   ├── styles/           # 全局样式
│   ├── types/            # TypeScript 类型
│   ├── utils/            # 工具函数
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
└── vite.config.ts
```

---

## 9. 验收标准

### 9.1 功能验收
- [ ] 用户可以注册和登录
- [ ] 用户可以发布、编辑、删除文章
- [ ] 文章支持 Markdown 渲染
- [ ] 用户可以发表评论和回复
- [ ] 分类和标签管理正常
- [ ] 文章浏览量统计正常
- [ ] 响应式布局适配多端

### 9.2 技术验收
- [ ] 前后端分离，API 通信正常
- [ ] JWT 认证流程正常
- [ ] Redis 缓存生效
- [ ] 代码类型安全（TypeScript）
- [ ] 单元测试通过

---

## 10. 环境要求

### 10.1 开发环境
- Node.js: 18.x+
- JDK: 17+
- MySQL: 8.x
- Redis: 7.x

### 10.2 端口规划
| 服务 | 端口 |
|------|------|
| MySQL | 3306 |
| Redis | 6379 |
| Backend | 8080 |
| Frontend | 3000 |
