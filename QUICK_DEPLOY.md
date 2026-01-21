# 🚀 快速部署指南

## 最简单的部署方式（推荐）

### 方案：使用 Vercel + PlanetScale（完全免费）

**优势**：
- ✅ 完全免费
- ✅ 5分钟部署完成
- ✅ 自动HTTPS
- ✅ 全球CDN加速
- ✅ 无需服务器维护

---

## 📋 部署步骤

### 第1步：准备账号（2分钟）

1. **注册 Vercel 账号**
   - 访问：https://vercel.com
   - 使用GitHub账号登录（推荐）

2. **注册 PlanetScale 账号**
   - 访问：https://planetscale.com
   - 使用GitHub账号登录（推荐）

### 第2步：创建数据库（3分钟）

1. **在 PlanetScale 创建数据库**
   ```
   - 点击 "Create database"
   - 名称：research-tasks
   - 区域：选择 AWS ap-northeast-1 (Tokyo) - 最接近中国
   - 点击 "Create database"
   ```

2. **获取数据库连接信息**
   ```
   - 点击 "Connect"
   - 选择 "Node.js"
   - 复制连接信息
   ```

3. **导入数据库结构**
   ```
   - 点击 "Console"
   - 复制 server/database.sql 的内容
   - 粘贴并执行
   ```

### 第3步：部署前端（5分钟）

1. **上传代码到 GitHub**
   ```bash
   # 如果还没有Git仓库
   git init
   git add .
   git commit -m "Initial commit"
   
   # 创建GitHub仓库后
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **在 Vercel 部署**
   ```
   - 访问 https://vercel.com/new
   - 选择你的GitHub仓库
   - Root Directory: web
   - 点击 "Deploy"
   ```

3. **配置环境变量**
   ```
   在 Vercel 项目设置中添加：
   - API_URL: https://your-api.vercel.app
   ```

### 第4步：部署后端（5分钟）

1. **创建新的 Vercel 项目**
   ```
   - 再次点击 "New Project"
   - 选择同一个仓库
   - Root Directory: server
   - 点击 "Deploy"
   ```

2. **配置环境变量**
   ```
   在 Vercel 项目设置中添加：
   - DB_HOST: (从PlanetScale复制)
   - DB_USER: (从PlanetScale复制)
   - DB_PASSWORD: (从PlanetScale复制)
   - DB_NAME: research_tasks
   - JWT_SECRET: (随机字符串，如：abc123xyz789)
   ```

### 第5步：完成！

**访问你的系统**：
```
https://your-project.vercel.app
```

---

## 🎯 更简单的方式：一键部署

### 使用 Railway（推荐新手）

**Railway 提供一键部署，包含数据库**

1. **点击部署按钮**
   [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

2. **连接 GitHub 仓库**

3. **自动部署完成**
   - Railway 会自动创建数据库
   - 自动配置环境变量
   - 自动部署前后端

4. **获取访问地址**
   ```
   https://your-project.up.railway.app
   ```

**费用**：每月5美元免费额度（足够小团队使用）

---

## 💻 本地测试（开发环境）

### 快速启动

```bash
# 1. 安装依赖
cd server
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入数据库信息

# 3. 启动后端
npm start

# 4. 启动前端（新终端）
cd ../web
npx http-server -p 8080

# 5. 访问
# 前端：http://localhost:8080/neuro-simple.html
# 后端：http://localhost:3000
```

---

## 🔧 配置前端连接后端

### 修改 API 地址

在 `web/neuro-simple.html` 中添加：

```javascript
// API配置
const API_BASE_URL = 'https://your-api.vercel.app'; // 替换为你的后端地址

// 修改所有 localStorage 调用为 API 调用
async function login(studentId, password) {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, password })
    });
    const data = await response.json();
    if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
    }
    return data;
}
```

---

## 📱 分享给团队

### 获取访问链接

**Vercel 部署后**：
```
https://research-tasks.vercel.app
```

**Railway 部署后**：
```
https://research-tasks.up.railway.app
```

**自定义域名**（可选）：
```
https://tasks.yourdomain.com
```

### 告诉团队成员

```
🎉 科研任务管理系统已上线！

📱 访问地址：https://your-project.vercel.app

👤 注册账号：
1. 点击"注册"
2. 填写学号、姓名、密码
3. 完成注册后登录

📋 开始使用：
- 查看任务
- 创建科研进展
- 提交周计划

有问题请联系管理员！
```

---

## 🔒 安全建议

### 1. 修改默认管理员密码

```sql
-- 在数据库中执行
UPDATE users 
SET password = '$2b$10$NewHashedPassword' 
WHERE student_id = '20251100029';
```

### 2. 启用 HTTPS

Vercel 和 Railway 自动提供 HTTPS，无需配置。

### 3. 配置 CORS

在 `server/app.js` 中：

```javascript
app.use(cors({
    origin: 'https://your-frontend.vercel.app',
    credentials: true
}));
```

---

## 📊 监控和维护

### Vercel 仪表板

- 访问：https://vercel.com/dashboard
- 查看：部署状态、访问日志、性能指标

### PlanetScale 仪表板

- 访问：https://app.planetscale.com
- 查看：数据库连接、查询性能、存储使用

---

## 🆘 常见问题

### Q1: 部署后无法访问？

**检查**：
1. Vercel 部署是否成功
2. 环境变量是否配置正确
3. 数据库连接是否正常

### Q2: 登录失败？

**检查**：
1. 后端 API 是否运行
2. 数据库中是否有用户数据
3. JWT_SECRET 是否配置

### Q3: 数据不同步？

**检查**：
1. 前端 API_BASE_URL 是否正确
2. CORS 配置是否正确
3. 网络请求是否成功

---

## 💰 费用对比

| 方案 | 月费用 | 适合人数 | 难度 |
|------|--------|----------|------|
| Vercel + PlanetScale | 免费 | <50人 | ⭐ |
| Railway | $5 | <100人 | ⭐ |
| 阿里云服务器 | ¥10 | 不限 | ⭐⭐⭐ |

---

## 🎓 推荐方案

**学生/小团队（<20人）**：
→ Vercel + PlanetScale（免费）

**中型团队（20-50人）**：
→ Railway（$5/月）

**大型团队（>50人）**：
→ 阿里云服务器（¥10/月起）

---

## 📞 需要帮助？

**部署遇到问题？**

1. 查看 Vercel 部署日志
2. 检查环境变量配置
3. 测试数据库连接
4. 查看浏览器控制台错误

**联系方式**：
- GitHub Issues
- 邮箱支持

---

**准备好了吗？选择一个方案，5分钟完成部署！** 🚀


