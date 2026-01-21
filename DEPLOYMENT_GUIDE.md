# 科研任务管理系统 - 网络部署指南

## 📋 部署概述

将系统从本地部署到网络，让所有用户通过网址访问。

**目标**：
- ✅ 用户通过网址访问系统
- ✅ 支持在线注册和登录
- ✅ 数据存储在服务器
- ✅ 多用户同时使用

---

## 🎯 部署方案选择

### 方案1：简单部署（推荐新手）

**使用 GitHub Pages + Firebase**
- ✅ 免费
- ✅ 简单易用
- ✅ 无需服务器
- ✅ 自动HTTPS

**适合**：小型团队（<50人）

### 方案2：专业部署（推荐生产环境）

**使用 云服务器 + 数据库**
- ✅ 完全控制
- ✅ 高性能
- ✅ 可扩展
- ✅ 数据安全

**适合**：大型团队、长期使用

---

## 🚀 方案1：GitHub Pages + Firebase（免费方案）

### 步骤1：准备工作

**需要的账号**：
1. GitHub账号（免费）
2. Firebase账号（免费）

### 步骤2：修改系统使用Firebase

**安装Firebase**：
在 `web/advanced-system.html` 的 `<head>` 中添加：

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
```

**配置Firebase**：
创建 `web/firebase-config.js`：

```javascript
// Firebase配置
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT.firebaseio.com",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// 初始化Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();
```

### 步骤3：上传到GitHub

```bash
# 1. 创建GitHub仓库
# 访问 github.com，创建新仓库

# 2. 上传代码
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main

# 3. 启用GitHub Pages
# 仓库设置 → Pages → Source: main branch → Save
```

**访问地址**：
```
https://YOUR_USERNAME.github.io/YOUR_REPO/web/neuro-simple.html
```

---

## 🏢 方案2：云服务器部署（专业方案）

### 选择云服务商

**推荐服务商**：
1. **阿里云**（国内）
   - 学生优惠：9.5元/月
   - 稳定可靠
   
2. **腾讯云**（国内）
   - 学生优惠：10元/月
   - 速度快

3. **AWS**（国际）
   - 免费套餐1年
   - 功能强大

### 步骤1：购买服务器

**配置建议**：
- CPU：1核
- 内存：2GB
- 硬盘：40GB
- 带宽：1Mbps
- 系统：Ubuntu 20.04

**费用**：约100-200元/年（学生价）

### 步骤2：安装环境

**连接服务器**：
```bash
ssh root@YOUR_SERVER_IP
```

**安装Node.js和Nginx**：
```bash
# 更新系统
apt update && apt upgrade -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 安装Nginx
apt install -y nginx

# 安装MySQL
apt install -y mysql-server
```

### 步骤3：部署后端

**创建后端API**：
创建 `server/app.js`：

```javascript
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 数据库连接
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'YOUR_PASSWORD',
    database: 'research_tasks'
});

// 用户注册
app.post('/api/register', (req, res) => {
    const { studentId, name, password } = req.body;
    // 注册逻辑
});

// 用户登录
app.post('/api/login', (req, res) => {
    const { studentId, password } = req.body;
    // 登录逻辑
});

// 获取任务列表
app.get('/api/tasks', (req, res) => {
    // 获取任务
});

// 创建任务
app.post('/api/tasks', (req, res) => {
    // 创建任务
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

**安装依赖**：
```bash
npm init -y
npm install express mysql2 cors bcrypt jsonwebtoken
```

**启动服务**：
```bash
node app.js
```

### 步骤4：配置Nginx

**编辑配置**：
```bash
nano /etc/nginx/sites-available/default
```

**配置内容**：
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN.com;

    # 前端文件
    location / {
        root /var/www/research-tasks/web;
        index neuro-simple.html;
        try_files $uri $uri/ =404;
    }

    # API代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**重启Nginx**：
```bash
nginx -t
systemctl restart nginx
```

### 步骤5：上传代码

**使用SCP上传**：
```bash
scp -r web/* root@YOUR_SERVER_IP:/var/www/research-tasks/web/
```

**或使用Git**：
```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git research-tasks
```

### 步骤6：配置域名

**购买域名**：
- 阿里云：约50元/年
- 腾讯云：约50元/年

**DNS解析**：
```
类型：A
主机记录：@
记录值：YOUR_SERVER_IP
```

**访问地址**：
```
http://YOUR_DOMAIN.com
```

---

## 🔒 配置HTTPS（重要）

### 使用Let's Encrypt（免费）

```bash
# 安装Certbot
apt install -y certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d YOUR_DOMAIN.com

# 自动续期
certbot renew --dry-run
```

**访问地址**：
```
https://YOUR_DOMAIN.com
```

---

## 📊 数据库设计

### MySQL数据库结构

**创建数据库**：
```sql
CREATE DATABASE research_tasks;
USE research_tasks;

-- 用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    grade VARCHAR(20),
    level VARCHAR(50),
    school VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    permissions JSON,
    token VARCHAR(255),
    register_time BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 任务表
CREATE TABLE tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_number VARCHAR(50),
    user_id INT,
    assigner_id INT,
    assignee_id INT,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50),
    priority VARCHAR(20),
    start_date DATE,
    deadline DATE,
    estimated_hours DECIMAL(10,2),
    actual_hours DECIMAL(10,2),
    description TEXT,
    steps JSON,
    status VARCHAR(50),
    progress INT DEFAULT 0,
    create_time BIGINT,
    complete_time BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (assigner_id) REFERENCES users(id),
    FOREIGN KEY (assignee_id) REFERENCES users(id)
);

-- 周计划表
CREATE TABLE weekly_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT,
    week_start BIGINT,
    week_end BIGINT,
    content TEXT,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    approved BOOLEAN DEFAULT FALSE,
    approved_by VARCHAR(100),
    submitted BOOLEAN DEFAULT FALSE,
    create_time BIGINT,
    update_time BIGINT,
    approved_time BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);
```

---

## 🔐 安全配置

### 1. 密码加密

```javascript
const bcrypt = require('bcrypt');

// 注册时加密
const hashedPassword = await bcrypt.hash(password, 10);

// 登录时验证
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 2. JWT认证

```javascript
const jwt = require('jsonwebtoken');

// 生成token
const token = jwt.sign({ userId: user.id }, 'SECRET_KEY', { expiresIn: '7d' });

// 验证token
const decoded = jwt.verify(token, 'SECRET_KEY');
```

### 3. 防火墙配置

```bash
# 安装UFW
apt install -y ufw

# 配置规则
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

---

## 📱 移动端适配

### 响应式设计

已在 `advanced-style.css` 中实现：

```css
@media (max-width: 768px) {
    .nav-menu {
        display: none;
    }
    
    .dashboard-grid {
        grid-template-columns: 1fr;
    }
}
```

### PWA支持

创建 `manifest.json`：

```json
{
    "name": "科研任务管理系统",
    "short_name": "科研任务",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#667eea",
    "icons": [
        {
            "src": "/icon-192.png",
            "sizes": "192x192",
            "type": "image/png"
        }
    ]
}
```

---

## 🧪 测试部署

### 本地测试

```bash
# 安装http-server
npm install -g http-server

# 启动服务
cd web
http-server -p 8080

# 访问
http://localhost:8080/neuro-simple.html
```

### 性能测试

```bash
# 安装Apache Bench
apt install -y apache2-utils

# 测试
ab -n 1000 -c 10 http://YOUR_DOMAIN.com/
```

---

## 📊 监控和维护

### 1. 日志管理

```bash
# 查看Nginx日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# 查看应用日志
pm2 logs
```

### 2. 自动备份

```bash
# 创建备份脚本
nano /root/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
mysqldump -u root -p research_tasks > /backup/db_$DATE.sql
tar -czf /backup/files_$DATE.tar.gz /var/www/research-tasks
```

```bash
# 添加定时任务
crontab -e
0 2 * * * /root/backup.sh
```

---

## 💰 费用估算

### 方案1：GitHub Pages + Firebase
- GitHub Pages：免费
- Firebase：免费（限额内）
- **总计**：0元/年

### 方案2：云服务器
- 服务器：100-200元/年（学生价）
- 域名：50元/年
- SSL证书：免费（Let's Encrypt）
- **总计**：150-250元/年

---

## 🚀 快速开始

### 最简单的方式（5分钟）

1. **注册Vercel账号**（免费）
2. **连接GitHub仓库**
3. **一键部署**
4. **获得网址**：`https://YOUR_PROJECT.vercel.app`

**步骤**：
```bash
# 安装Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
cd web
vercel
```

---

## 📞 技术支持

**遇到问题？**
1. 查看错误日志
2. 检查防火墙设置
3. 验证数据库连接
4. 测试API接口

**常见问题**：
- 无法访问：检查防火墙和Nginx配置
- 数据不同步：检查数据库连接
- 登录失败：检查JWT配置

---

## 🎯 下一步

选择适合您的部署方案：

**小型团队（<20人）**：
→ 使用 GitHub Pages + Firebase

**中型团队（20-100人）**：
→ 使用 云服务器 + MySQL

**大型团队（>100人）**：
→ 使用 专业云服务 + 负载均衡

---

**准备好部署了吗？选择一个方案开始吧！** 🚀


