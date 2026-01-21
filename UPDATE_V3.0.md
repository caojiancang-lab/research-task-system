# 科研任务管理系统 V3.0 - 网络部署版

## 🌐 更新内容

### 新增功能

1. **后端API服务器**
   - Node.js + Express 框架
   - RESTful API 设计
   - JWT 身份认证
   - MySQL 数据库支持

2. **完整的用户系统**
   - 在线注册
   - 安全登录
   - 密码加密（bcrypt）
   - 权限管理

3. **数据持久化**
   - MySQL 数据库
   - 用户表
   - 任务表
   - 周计划表
   - 操作日志表

4. **多种部署方案**
   - Vercel + PlanetScale（免费）
   - Railway（一键部署）
   - 云服务器（专业部署）

---

## 📁 新增文件

### 后端文件

```
server/
├── app.js              # 后端API服务器（400行）
├── database.sql        # 数据库结构
├── package.json        # 依赖配置
└── .env.example        # 环境变量示例
```

### 文档文件

```
DEPLOYMENT_GUIDE.md     # 完整部署指南
QUICK_DEPLOY.md         # 快速部署指南
```

---

## 🚀 快速开始

### 方式1：最简单（5分钟）

**使用 Vercel + PlanetScale（免费）**

1. 注册 Vercel 和 PlanetScale 账号
2. 创建数据库，导入 `server/database.sql`
3. 上传代码到 GitHub
4. 在 Vercel 一键部署
5. 配置环境变量
6. 完成！

**详细步骤**：查看 `QUICK_DEPLOY.md`

### 方式2：一键部署

**使用 Railway**

1. 访问 https://railway.app
2. 连接 GitHub 仓库
3. 自动部署完成
4. 获取访问地址

### 方式3：本地测试

```bash
# 1. 安装依赖
cd server
npm install

# 2. 配置数据库
# 编辑 .env 文件

# 3. 启动后端
npm start

# 4. 启动前端
cd ../web
npx http-server -p 8080

# 5. 访问
# http://localhost:8080/neuro-simple.html
```

---

## 🔧 配置说明

### 环境变量

在 `server/.env` 中配置：

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=research_tasks
JWT_SECRET=random-secret-key
```

### 数据库

执行 `server/database.sql` 创建表结构：

```bash
mysql -u root -p < server/database.sql
```

---

## 📡 API 接口

### 用户相关

```
POST /api/register      # 用户注册
POST /api/login         # 用户登录
GET  /api/users         # 获取用户列表（管理员）
```

### 任务相关

```
GET    /api/tasks       # 获取任务列表
POST   /api/tasks       # 创建任务
PUT    /api/tasks/:id   # 更新任务
DELETE /api/tasks/:id   # 删除任务
```

### 周计划相关

```
GET  /api/weekly-plans              # 获取周计划列表
POST /api/weekly-plans              # 创建/更新周计划
POST /api/weekly-plans/:id/approve  # 审核周计划（管理员）
```

---

## 🔒 安全特性

1. **密码加密**：使用 bcrypt 加密存储
2. **JWT 认证**：安全的身份验证
3. **CORS 保护**：防止跨域攻击
4. **SQL 注入防护**：参数化查询
5. **权限控制**：基于角色的访问控制

---

## 📊 数据库设计

### 用户表（users）

- id, student_id, name, password
- role, permissions
- grade, level, school, phone, email

### 任务表（tasks）

- id, task_number, name, type, priority
- assigner_id, assignee_id
- start_date, deadline, status, progress
- description, steps

### 周计划表（weekly_plans）

- id, task_id, week_start, week_end
- content, submitted, approved
- created_by, updated_by, approved_by

---

## 🌍 部署方案对比

| 方案 | 费用 | 难度 | 适合人数 |
|------|------|------|----------|
| Vercel + PlanetScale | 免费 | ⭐ | <50人 |
| Railway | $5/月 | ⭐ | <100人 |
| 阿里云服务器 | ¥10/月 | ⭐⭐⭐ | 不限 |

---

## 📱 访问方式

### 部署后的访问地址

**Vercel**：
```
https://your-project.vercel.app
```

**Railway**：
```
https://your-project.up.railway.app
```

**自定义域名**：
```
https://tasks.yourdomain.com
```

---

## 🎯 使用流程

### 用户注册

1. 访问系统网址
2. 点击"注册"
3. 填写学号、姓名、密码等信息
4. 提交注册

### 用户登录

1. 输入学号和密码
2. 点击"登录"
3. 进入系统

### 创建任务

1. 点击"创建任务"
2. 选择"科研进展"类型
3. 填写任务信息
4. 保存

### 提交周计划

1. 进入任务详情
2. 填写本周计划
3. 点击"保存计划"
4. 等待管理员审核

---

## 🔄 从本地版本迁移

### 数据迁移

1. **导出本地数据**
   ```javascript
   // 在浏览器控制台执行
   const data = {
       users: JSON.parse(localStorage.getItem('users')),
       tasks: JSON.parse(localStorage.getItem('tasks'))
   };
   console.log(JSON.stringify(data));
   ```

2. **导入到数据库**
   ```javascript
   // 使用提供的迁移脚本
   node server/migrate.js
   ```

---

## 📞 技术支持

### 常见问题

**Q: 部署后无法访问？**
A: 检查 Vercel 部署状态和环境变量配置

**Q: 登录失败？**
A: 检查数据库连接和 JWT_SECRET 配置

**Q: 数据不同步？**
A: 检查前端 API_BASE_URL 配置

### 获取帮助

1. 查看 `DEPLOYMENT_GUIDE.md` 详细文档
2. 查看 `QUICK_DEPLOY.md` 快速指南
3. 检查部署日志
4. 查看浏览器控制台错误

---

## 🎉 功能特性

### 保留的功能

✅ 任务管理（创建、编辑、删除）
✅ 科研进展任务类型
✅ 周计划系统（三周联动）
✅ 提交锁定机制
✅ 管理员审核
✅ 多维度排序
✅ 权限控制

### 新增的功能

✅ 在线注册和登录
✅ 多用户同时使用
✅ 数据云端存储
✅ 跨设备访问
✅ 实时数据同步
✅ 操作日志记录

---

## 📈 性能优化

1. **数据库索引**：优化查询性能
2. **连接池**：提高并发处理能力
3. **JWT 缓存**：减少数据库查询
4. **CDN 加速**：提升访问速度

---

## 🔮 未来计划

- [ ] 实时通知功能
- [ ] 文件上传功能
- [ ] 数据统计图表
- [ ] 移动端 APP
- [ ] 微信小程序

---

## 📝 更新日志

### V3.0 (2026-01-21)

- ✅ 添加后端 API 服务器
- ✅ 实现用户注册和登录
- ✅ 集成 MySQL 数据库
- ✅ 提供多种部署方案
- ✅ 完善部署文档

### V2.8 (2026-01-21)

- ✅ 管理员科研进展管理模块
- ✅ 提交锁定机制

### V2.7 (2026-01-21)

- ✅ 周计划系统
- ✅ 三周联动

---

## 🎓 推荐部署方案

**学生团队**：
→ 使用 Vercel + PlanetScale（免费）

**研究小组**：
→ 使用 Railway（$5/月）

**研究机构**：
→ 使用阿里云服务器（专业部署）

---

**准备好部署了吗？查看 `QUICK_DEPLOY.md` 开始吧！** 🚀


