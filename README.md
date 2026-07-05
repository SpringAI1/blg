# 技术博客系统 (Tech Blog System)

全栈技术博客平台，支持文章发布、分类管理、评论互动、技术会议（视频）、资源下载、学习追踪等功能。

## 技术栈

### 前端
- **React 18 + TypeScript 5** — UI框架
- **Vite 5** — 构建工具
- **Ant Design 5** — UI 组件库（含 Open Design 主题系统）
- **React Router 6** — 路由管理
- **Zustand 4** — 状态管理
- **@uiw/react-md-editor** — Markdown 实时预览编辑器
- **react-markdown** — Markdown 渲染
- **@stomp/stompjs** — WebSocket 实时通信

### 后端
- **Spring Boot 3.2** + **Spring Security 6** — Web 框架
- **JWT (jjwt 0.11)** — Token 认证
- **MyBatis-Plus 3.5** — ORM 框架
- **MySQL 8 / H2** — 数据库
- **Redis** — 缓存（可选）
- **WebSocket / STOMP** — 会议实时通信

## 快速启动

### 环境要求
- Node.js 18+
- JDK 17+ (推荐 21+)
- Maven 3.6+

### 启动后端
```bash
cd backend
mvn spring-boot:run
```
默认运行在 `http://localhost:8080`

### 启动前端
```bash
cd frontend
npm install
npm run dev
```
默认运行在 `http://localhost:3000`

### 默认账号
- 管理员: `admin` / `123456`
- 普通用户: `zhangwei` / `123456`

## 功能清单

### ✅ 已实现
- 文章 CRUD（支持 Markdown 编辑器 + 实时预览）
- 分类/标签管理（含标签编辑颜色别名）
- 评论系统（支持回复、点赞、XSS 防护）
- 用户认证（JWT + BCrypt + 登出黑名单）
- 收藏/关注系统（原子计数器，并发安全）
- 全局搜索（文章/资源/用户/标签，数据库分页）
- 技术会议（WebRTC 视频 + WebSocket 聊天 + 文件分享）
- 下载资源库
- 学习进度追踪（localStorage）
- 浏览历史（localStorage + 服务端同步）
- 钱包/金币系统
- 暗色/亮色模式切换
- 阅读进度条
- 相关文章推荐（同标签/分类匹配）
- 社交分享（复制链接、微博、微信）
- 搜索关键词高亮
- 草稿自动保存（localStorage，3秒间隔）
- Open Design 主题系统（CSS 变量 + Ant Design Tokens）
- 管理后台（文章/分类/标签/评论/用户管理）
- 阅读历史（服务端持久化）
- 评论点赞（CommentLike 表 + API）

### 🔄 待开发
- 通知系统（铃铛 + WebSocket 推送）
- 文章目录 (TOC) 自动生成
- AI 搜索（LLM 集成）
- 收藏夹分类管理
- 用户等级/徽章系统

## 项目结构

```
blog-system/
├── backend/                          # Spring Boot 后端
│   └── src/main/java/com/blog/
│       ├── config/                   # 配置类（Security、WebSocket、异常处理）
│       ├── controller/               # 16 个 API 控制器
│       ├── dto/                      # 数据传输对象
│       ├── entity/                   # 实体类（15+ 张表）
│       ├── repository/               # MyBatis-Plus Mapper
│       ├── service/                  # 业务逻辑层
│       └── util/                     # 工具类（JWT、XSS、SQL、Security）
├── frontend/                         # React 前端
│   └── src/
│       ├── api/                      # 14 个 API 模块
│       ├── components/               # 布局、权限路由
│       ├── pages/                    # 18 个页面 + 7 个管理页面
│       ├── store/                    # Zustand 状态管理（auth、theme）
│       ├── styles/                   # 设计令牌系统
│       └── types/                    # TypeScript 类型定义
└── README.md
```

## 安全特性

- JWT 认证 + Token 黑名单（登出即失效）
- Spring Security 6 权限控制（RBAC）
- WebSocket JWT 握手拦截
- 文件上传 MIME + 扩展名双白名单
- XSS 输入消毒（HtmlUtils）
- SQL 注入防护（MyBatis-Plus）
- CORS 跨域配置
- BCrypt 密码加密

## 许可证

MIT
