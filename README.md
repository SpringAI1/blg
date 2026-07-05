## 二灵湃湃树博客系统（全栈技术博客平台）

### 技术栈
**前端**：React 18 + TypeScript 5 + Vite 5 + Ant Design 5（Open Design 主题系统）+ Zustand 4 + React Router 6  
**后端**：Spring Boot 3.2 + Spring Security 6（JWT 认证）+ MyBatis-Plus 3.5 + MySQL 8 / H2  
**实时通信**：WebSocket + STOMP + WebRTC  
**AI 集成**：通义千问 qwen-turbo API  
**部署**：前后端分离，Maven + npm

### 功能模块
- **内容创作**：文章 CRUD + Markdown 实时预览编辑器 + 草稿自动保存 + 阅读进度条 + 相关文章推荐 + 社交分享
- **社区互动**：评论系统（回复树 + 点赞）+ 收藏夹（分类管理）+ 关注系统 + 全局搜索（关键词高亮）
- **技术会议**：WebRTC 视频 + 屏幕共享 + WebSocket 聊天 + 文件分享 + 加入码机制
- **AI 搜索**：通义千问集成，实时技术问答
- **通知系统**：评论/回复/点赞/关注自动推送 + 顶部铃铛组件 + 30 秒轮询
- **用户体验**：暗色/亮色模式 + 响应式布局 + 移动端适配
- **安全体系**：JWT 认证 + Token 黑名单 + RBAC 权限控制 + XSS 防护 + 文件上传白名单 + WebSocket 握手验证
- **管理后台**：仪表盘统计 + 文章/分类/标签/评论/用户管理

### 项目亮点
- 从 0 到 1 独立完成前后端架构设计，20+ 功能模块
- 基于 Ant Design 5 Design Tokens 实现可切换的主题系统（40+ CSS 变量）
- 评论/收藏/关注等并发场景使用数据库原子更新，避免数据不一致
- AI 搜索零成本集成，通义千问免费额度（100 万 tokens/月）

### GitHub
https://github.com/SpringAI1/blg
