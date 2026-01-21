# 使用 GitHub 部署科研任务管理系统

## 🎯 目标

使用 GitHub Pages 部署前端，让所有人通过网址访问系统。

---

## 📋 准备工作

### 1. 注册 GitHub 账号

访问 https://github.com 注册账号（如果还没有）

### 2. 安装 Git

**Windows**：
- 下载：https://git-scm.com/download/win
- 安装后打开 Git Bash

**验证安装**：
```bash
git --version
```

---

## 🚀 部署步骤

### 第1步：初始化 Git 仓库

在项目目录打开 Git Bash 或命令行：

```bash
# 进入项目目录
cd "C:/Users/fsk/Desktop/科研任务分配"

# 初始化 Git 仓库
git init

# 配置用户信息（首次使用）
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

### 第2步：添加文件到 Git

```bash
# 添加所有文件
git add .

# 查看状态
git status

# 提交
git commit -m "Initial commit - 科研任务管理系统"
```

### 第3步：创建 GitHub 仓库

1. 访问 https://github.com/new
2. 填写信息：
   - Repository name: `research-task-system`（或其他名称）
   - Description: `科研任务管理系统`
   - 选择 `Public`（公开）或 `Private`（私有）
3. **不要**勾选 "Initialize this repository with a README"
4. 点击 "Create repository"

### 第4步：推送代码到 GitHub

复制 GitHub 显示的命令，或执行：

```bash
# 添加远程仓库（替换为你的用户名和仓库名）
git remote add origin https://github.com/YOUR_USERNAME/research-task-system.git

# 推送代码
git branch -M main
git push -u origin main
```

**如果需要登录**：
- 输入 GitHub 用户名
- 输入密码（或 Personal Access Token）

### 第5步：启用 GitHub Pages

1. 进入仓库页面
2. 点击 `Settings`（设置）
3. 左侧菜单找到 `Pages`
4. 在 `Source` 下：
   - Branch: 选择 `main`
   - Folder: 选择 `/ (root)`
5. 点击 `Save`

**等待1-2分钟，GitHub 会自动部署**

### 第6步：获取访问地址

部署完成后，页面会显示：

```
Your site is published at https://YOUR_USERNAME.github.io/research-task-system/
```

**访问系统**：
```
https://YOUR_USERNAME.github.io/research-task-system/web/neuro-simple.html
```

---

## 🎨 优化访问地址

### 方法1：设置默认页面

创建 `index.html` 在根目录：

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="refresh" content="0;url=web/neuro-simple.html">
    <title>科研任务管理系统</title>
</head>
<body>
    <p>正在跳转到系统...</p>
    <p>如果没有自动跳转，请点击：<a href="web/neuro-simple.html">进入系统</a></p>
</body>
</html>
```

**提交更新**：
```bash
git add index.html
git commit -m "Add index page"
git push
```

**新的访问地址**：
```
https://YOUR_USERNAME.github.io/research-task-system/
```

### 方法2：使用自定义域名（可选）

如果有自己的域名：

1. 在 GitHub Pages 设置中，`Custom domain` 填入域名
2. 在域名服务商添加 DNS 记录：
   ```
   类型: CNAME
   主机记录: www
   记录值: YOUR_USERNAME.github.io
   ```

---

## 📝 更新代码

每次修改代码后：

```bash
# 查看修改
git status

# 添加修改的文件
git add .

# 提交
git commit -m "描述你的修改"

# 推送到 GitHub
git push

# 等待1-2分钟，GitHub Pages 自动更新
```

---

## 🔧 配置文件

### 创建 .gitignore

在项目根目录创建 `.gitignore` 文件：

```
# Node modules
node_modules/
server/node_modules/

# 环境变量
.env
server/.env

# 日志
*.log

# 系统文件
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
```

**提交**：
```bash
git add .gitignore
git commit -m "Add gitignore"
git push
```

---

## 🌐 分享给团队

### 访问地址

```
https://YOUR_USERNAME.github.io/research-task-system/web/neuro-simple.html
```

### 分享信息模板

```
🎉 科研任务管理系统已上线！

📱 访问地址：
https://YOUR_USERNAME.github.io/research-task-system/web/neuro-simple.html

👤 使用说明：
1. 点击"注册"创建账号
2. 填写学号、姓名、密码等信息
3. 登录后即可使用

📋 功能：
✅ 任务管理
✅ 科研进展跟踪
✅ 周计划提交
✅ 进度管理

💡 提示：
- 首次使用请先注册
- 管理员账号：20251100029 / 18109316679
- 数据保存在浏览器本地

有问题请联系管理员！
```

---

## 🔒 私有仓库设置

如果选择了 Private 仓库：

1. GitHub Pages 仍然可以使用（需要 GitHub Pro）
2. 或者邀请团队成员：
   - Settings → Collaborators
   - 添加成员的 GitHub 用户名

---

## 📊 查看访问统计

### 方法1：GitHub Insights

1. 进入仓库
2. 点击 `Insights`
3. 查看 `Traffic` 统计

### 方法2：添加访问统计（可选）

在 `web/neuro-simple.html` 中添加：

```html
<!-- 在 </body> 前添加 -->
<script>
// 简单的访问统计
if (localStorage.getItem('visitCount')) {
    let count = parseInt(localStorage.getItem('visitCount')) + 1;
    localStorage.setItem('visitCount', count);
} else {
    localStorage.setItem('visitCount', 1);
}
</script>
```

---

## 🐛 常见问题

### Q1: 推送失败，提示认证错误？

**解决方案**：使用 Personal Access Token

1. GitHub 头像 → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token
4. 勾选 `repo` 权限
5. 生成后复制 token
6. 推送时使用 token 作为密码

### Q2: GitHub Pages 显示 404？

**检查**：
1. 确认 Pages 已启用
2. 确认分支选择正确（main）
3. 等待几分钟让部署完成
4. 检查文件路径是否正确

### Q3: 修改后网页没更新？

**解决**：
1. 清除浏览器缓存（Ctrl + F5）
2. 等待几分钟让 GitHub Pages 更新
3. 检查 git push 是否成功

### Q4: 中文文件名显示乱码？

**解决**：
```bash
git config --global core.quotepath false
```

---

## 🎯 完整命令速查

```bash
# 初始化
git init
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"

# 首次提交
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main

# 日常更新
git add .
git commit -m "更新说明"
git push

# 查看状态
git status
git log

# 撤销修改
git checkout -- filename
git reset HEAD filename
```

---

## 📱 移动端访问

GitHub Pages 部署的网站自动支持移动端访问：

```
手机浏览器输入：
https://YOUR_USERNAME.github.io/research-task-system/web/neuro-simple.html
```

系统已经做了响应式设计，自动适配手机屏幕。

---

## 🔄 版本管理

### 创建版本标签

```bash
# 创建标签
git tag -a v3.0 -m "Version 3.0 - 网络部署版"

# 推送标签
git push origin v3.0

# 查看所有标签
git tag
```

### 回退到之前版本

```bash
# 查看历史
git log

# 回退到指定版本
git reset --hard commit_id

# 强制推送
git push -f
```

---

## 🎓 下一步

### 已完成 ✅
- [x] 代码上传到 GitHub
- [x] 启用 GitHub Pages
- [x] 获得访问地址

### 可选优化 📈
- [ ] 添加自定义域名
- [ ] 配置 HTTPS（自动）
- [ ] 添加 README.md
- [ ] 设置访问统计
- [ ] 邀请团队成员

---

## 📞 需要帮助？

**遇到问题？**

1. 检查 Git 是否安装：`git --version`
2. 检查是否登录 GitHub
3. 检查网络连接
4. 查看 GitHub Pages 部署状态

**获取支持**：
- GitHub 文档：https://docs.github.com
- Git 教程：https://git-scm.com/book/zh/v2

---

**准备好了吗？现在就开始部署到 GitHub！** 🚀


