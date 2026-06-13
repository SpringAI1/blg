# 个人博客系统 (Personal Blog System)

一个功能完整的个人博客平台，采用前后端分离架构，支持文章发布、分类管理、评论互动等功能。

## 项目简介

这是一个全栈个人博客系统，为内容创作者和读者提供完整的博客体验。博主可以发布文章、管理内容，读者可以浏览、评论和互动。

## 技术栈

### 前端
- **语言**: TypeScript 5.x
- **框架**: React 18.x
- **UI 库**: Ant Design 5.x
- **路由**: React Router 6.x
- **HTTP 客户端**: Axios 1.x
- **状态管理**: Zustand 4.x
- **Markdown 渲染**: react-markdown 9.x
- **构建工具**: Vite 5.x
- **代码规范**: ESLint + Prettier

### 后端
- **语言**: Java 17
- **框架**: Spring Boot 3.x
- **安全**: Spring Security 6.x + JWT
- **ORM**: MyBatis-Plus 3.x
- **数据库**: MySQL 8.x / H2（内嵌）
- **缓存**: Redis 7.x
- **实时通信**: WebSocket

## 核心功能

### 用户功能
- 用户注册/登录（JWT 认证）
- 个人资料管理
- 头像上传
- 用户关注系统
- 会员中心

### 文章管理
- Markdown 文章编辑器
- 文章发布/编辑/删除
- 文章分类和标签
- 文章点赞和浏览统计
- 草稿/发布状态管理
- 文章置顶功能

### 社区互动
- 评论和回复功能
- 用户关注功能
- 收藏夹功能
- 文章搜索
- 浏览历史记录

### 下载资源
- 资源分类管理
- 资源下载
- 下载记录统计

### 其他功能
- AI 搜索
- 学习路线
- 订阅推送
- 技术交流会议
- 实时聊天
- 数据统计

## 项目结构

```
blog-system/
├── backend/                 # 后端项目
│   ├── src/main/java/com/blog/
│   │   ├── common/         # 公共类
│   │   ├── config/         # 配置类
│   │   ├── controller/     # 控制器
│   │   ├── dto/            # 数据传输对象
│   │   ├── entity/         # 实体类
│   │   ├── repository/     # 数据访问层
│   │   ├── service/        # 业务逻辑层
│   │   └── util/           # 工具类
│   ├── src/main/resources/
│   │   ├── application.yml # 应用配置
│   │   └── schema.sql      # 数据库初始化
│   ├── .env.example        # 环境变量示例
│   └── pom.xml
├── frontend/               # 前端项目
│   ├── src/
│   │   ├── api/            # API 请求
│   │   ├── components/     # 公共组件
│   │   ├── pages/          # 页面组件
│   │   │   ├── admin/     # 管理后台页面
│   │   ├── store/          # 状态管理
│   │   ├── types/          # 类型定义
│   │   └── utils/          # 工具函数
│   ├── .env.example        # 环境变量示例
│   ├── .eslintrc.cjs       # ESLint 配置
│   ├── .prettierrc         # Prettier 配置
│   ├── tsconfig.json       # TypeScript 配置
│   ├── vite.config.ts      # Vite 配置
│   └── package.json
├── .gitignore              # Git 忽略文件
├── README.md               # 项目说明
└── SPEC.md                 # 项目规格说明
```

## 快速开始

### 环境要求
- Node.js 18.x+
- JDK 17+
- Maven 3.x+
- MySQL 8.x（可选，内置 H2 数据库）
- Redis 7.x（可选）

### 环境配置

#### 后端配置

1. 复制环境变量示例文件：
```bash
cd backend
cp .env.example .env
```

2. 编辑 `.env` 文件，配置必要的环境变量：
```properties
# JWT 配置（生产环境必须修改）
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRATION=86400000

# 数据库配置（可选，默认使用 H2）
DB_URL=jdbc:mysql://localhost:3306/blog
DB_USERNAME=root
DB_PASSWORD=your-password

# Redis 配置（可选）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

#### 前端配置

1. 复制环境变量示例文件：
```bash
cd frontend
cp .env.example .env.local
```

2. 编辑 `.env.local` 文件：
```properties
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=个人博客系统
VITE_UPLOAD_URL=http://localhost:8080/uploads
```

### 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端服务将在 `http://localhost:8080` 启动

### 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端服务将在 `http://localhost:3000` 启动

### 访问应用

打开浏览器访问 `http://localhost:3000`

## 开发指南

### 前端开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 代码检查
npm run lint

# 代码格式化
npm run format

# 构建生产版本
npm run build
```

### 后端开发

```bash
# 编译项目
mvn clean compile

# 运行测试
mvn test

# 打包项目
mvn clean package

# 运行项目
mvn spring-boot:run
```

## 页面路由

### 公开页面
- `/` - 首页
- `/article/:id` - 文章详情
- `/blog` - 博客列表
- `/community` - 社区
- `/study` - 学习路线
- `/download` - 资源下载
- `/search` - 搜索页面
- `/ai-search` - AI 搜索
- `/history` - 浏览历史
- `/login` - 登录
- `/register` - 注册
- `/user/:id` - 用户主页

### 用户页面（需要登录）
- `/favorites` - 我的收藏
- `/follow` - 我的关注
- `/member-center` - 会员中心
- `/meeting-room` - 会议房间

### 管理后台（需要管理员权限）
- `/admin/dashboard` - 管理仪表盘
- `/admin/articles` - 文章管理
- `/admin/articles/new` - 新建文章
- `/admin/articles/:id/edit` - 编辑文章
- `/admin/categories` - 分类管理
- `/admin/tags` - 标签管理
- `/admin/comments` - 评论管理
- `/admin/profile` - 个人资料

## 数据库

### H2 数据库（开发环境）

项目默认使用 H2 内存数据库，数据持久化到磁盘文件 `./data/blog.mv.db`。

访问 H2 控制台：`http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:file:./data/blog`
- 用户名: `sa`
- 密码: 空

### MySQL 数据库（生产环境）

推荐在生产环境使用 MySQL：

1. 创建数据库：
```sql
CREATE DATABASE blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 配置环境变量：
```properties
DB_URL=jdbc:mysql://localhost:3306/blog?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
DB_USERNAME=root
DB_PASSWORD=your-password
```

## API 文档

主要的 API 端点：

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出

### 文章
- `GET /api/articles` - 获取文章列表
- `GET /api/articles/:id` - 获取文章详情
- `POST /api/articles` - 创建文章
- `PUT /api/articles/:id` - 更新文章
- `DELETE /api/articles/:id` - 删除文章

### 分类和标签
- `GET /api/categories` - 获取分类列表
- `GET /api/tags` - 获取标签列表

### 用户
- `GET /api/users/:id` - 获取用户信息
- `PUT /api/users/:id` - 更新用户信息

### 评论
- `GET /api/comments/article/:id` - 获取文章评论
- `POST /api/comments` - 创建评论

## 安全特性

- JWT 认证机制
- Spring Security 权限控制
- CORS 跨域配置
- 密码 BCrypt 加密
- SQL 注入防护（MyBatis-Plus）
- XSS 攻击防护

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 配置
- 组件使用 PascalCase 命名
- 函数使用 camelCase 命名
- 提交前删除所有 console 语句
- 提交信息遵循 Git 规范

## 许可证

MIT License

## 作者

SpringAI1

## GitHub 仓库

https://github.com/SpringAI1/blg
