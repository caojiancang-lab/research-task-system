# 科研任务管理系统

<div align="center">

![Version](https://img.shields.io/badge/version-3.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Web-orange.svg)

**一个现代化的科研任务管理系统，支持多用户协作、任务分配、进度跟踪和周计划管理**

[在线演示](#) | [快速开始](#快速开始) | [文档](#文档)

</div>

---

## ✨ 功能特性

### 🎯 核心功能

- **用户管理**
  - 用户注册和登录
  - 角色权限控制（管理员/普通用户）
  - 个人信息管理

- **任务管理**
  - 创建、编辑、删除任务
  - 任务分配和接收
  - 多维度排序（编号、时间、人员、优先级等）
  - 任务状态跟踪（规划中、进行中、待审核、已完成）

- **科研进展**
  - 专门的科研进展任务类型
  - 自动填充功能
  - 进度百分比跟踪
  - 一键完成功能

- **周计划系统**
  - 三周联动（上周、本周、下周）
  - 自动日期计算
  - 提交锁定机制
  - 管理员审核功能

- **权限控制**
  - 普通用户：查看任务、创建科研进展、提交周计划
  - 管理员：完整权限、审核功能、用户管理

### 🎨 界面特点

- 现代化设计，美观易用
- 响应式布局，支持移动端
- 流畅的动画效果
- 直观的操作流程

---

## 🚀 快速开始

### 在线访问

访问部署好的系统：

```
https://YOUR_USERNAME.github.io/research-task-system/
```

### 本地运行

```bash
# 1. 克隆仓库
git clone https://github.com/YOUR_USERNAME/research-task-system.git

# 2. 进入目录
cd research-task-system

# 3. 打开系统
# 直接用浏览器打开 web/neuro-simple.html
# 或使用本地服务器
cd web
npx http-server -p 8080
```

访问 `http://localhost:8080/neuro-simple.html`

---

## 📖 使用说明

### 用户注册

1. 点击"注册"按钮
2. 填写以下信息：
   - 学号（必填）
   - 姓名（必填）
   - 密码（必填）
   - 年级、学历层次、学院等
3. 点击"注册"完成

### 用户登录

1. 输入学号和密码
2. 点击"登录"
3. 进入系统主界面

### 创建任务

1. 点击"创建任务"
2. 选择任务类型（科研进展等）
3. 填写任务信息
4. 分配给接收人
5. 保存任务

### 提交周计划

1. 进入任务详情
2. 填写三周计划：
   - 上周完成内容
   - 本周计划内容
   - 下周计划内容
3. 点击"保存计划"提交
4. 等待管理员审核

### 管理员功能

1. 查看所有用户和任务
2. 审核周计划
3. 管理用户权限
4. 查看科研进展统计

---

## 📁 项目结构

```
research-task-system/
├── web/                          # 前端文件
│   ├── neuro-simple.html        # 用户端主页面
│   ├── admin.html               # 管理员页面
│   ├── neuro-app.js             # 用户端逻辑
│   ├── admin-app.js             # 管理员逻辑
│   ├── neuro-auth.js            # 认证逻辑
│   ├── neuro-style.css          # 样式文件
│   ├── task-improvements.js     # 任务改进模块
│   ├── v2.7-improvements.js     # 周计划系统
│   ├── v2.7.1-fixes.js          # 权限控制
│   ├── v2.7.2-updates.js        # 权限优化
│   └── admin-progress.js        # 管理员进展管理
├── server/                       # 后端文件（可选）
│   ├── app.js                   # API 服务器
│   ├── database.sql             # 数据库结构
│   └── package.json             # 依赖配置
├── index.html                    # 入口页面
├── .gitignore                    # Git 忽略文件
├── GITHUB_DEPLOY.md             # GitHub 部署指南
├── QUICK_DEPLOY.md              # 快速部署指南
├── DEPLOYMENT_GUIDE.md          # 完整部署指南
└── README.md                     # 本文件
```

---

## 🌐 部署方式

### 方式1：GitHub Pages（推荐）

**优势**：免费、简单、快速

1. 上传代码到 GitHub
2. 启用 GitHub Pages
3. 访问 `https://YOUR_USERNAME.github.io/YOUR_REPO/`

详细步骤：查看 [GITHUB_DEPLOY.md](GITHUB_DEPLOY.md)

### 方式2：Vercel

**优势**：自动部署、HTTPS、CDN

1. 连接 GitHub 仓库
2. 一键部署
3. 获得访问地址

详细步骤：查看 [QUICK_DEPLOY.md](QUICK_DEPLOY.md)

### 方式3：云服务器

**优势**：完全控制、高性能

1. 购买服务器
2. 部署代码和数据库
3. 配置域名

详细步骤：查看 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 📚 文档

- [GitHub 部署指南](GITHUB_DEPLOY.md) - 使用 GitHub Pages 部署
- [快速部署指南](QUICK_DEPLOY.md) - 5分钟快速部署
- [完整部署指南](DEPLOYMENT_GUIDE.md) - 详细的部署方案
- [V3.0 更新说明](UPDATE_V3.0.md) - 最新版本更新内容
- [快速上手指南](V3.0_快速指南.md) - 新手入门教程

---

## 🔧 技术栈

### 前端

- HTML5 / CSS3 / JavaScript
- 响应式设计
- LocalStorage 数据存储
- 现代化 UI/UX

### 后端（可选）

- Node.js + Express
- MySQL 数据库
- JWT 认证
- RESTful API

---

## 📊 版本历史

### V3.0 (2026-01-21)
- ✅ 添加网络部署支持
- ✅ 创建后端 API 服务器
- ✅ 完善部署文档
- ✅ 优化用户体验

### V2.8 (2026-01-21)
- ✅ 管理员科研进展管理
- ✅ 提交锁定机制

### V2.7 (2026-01-21)
- ✅ 周计划系统
- ✅ 三周联动功能

### V2.6 (2026-01-20)
- ✅ 任务编号优化
- ✅ 科研进展类型
- ✅ 多维度排序

---

## 👥 默认账号

### 管理员账号

```
学号：20251100029
密码：（请在首次登录后修改）

学号：18109316679
密码：（请在首次登录后修改）
```

### 普通用户

需要自行注册

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

---

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues
- Email: your-email@example.com

---

## 🙏 致谢

感谢所有使用和支持本系统的用户！

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个 Star！**

Made with ❤️ by Research Team

</div>
