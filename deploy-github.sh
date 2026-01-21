#!/bin/bash

echo "========================================"
echo "  科研任务管理系统 - GitHub 部署工具"
echo "========================================"
echo ""

echo "[1/5] 检查 Git 安装..."
if ! command -v git &> /dev/null; then
    echo "❌ 未检测到 Git，请先安装 Git"
    echo "安装命令：sudo apt install git"
    exit 1
fi
echo "✅ Git 已安装"

echo ""
echo "[2/5] 初始化 Git 仓库..."
if [ ! -d .git ]; then
    git init
    echo "✅ Git 仓库初始化完成"
else
    echo "ℹ️  Git 仓库已存在"
fi

echo ""
echo "[3/5] 配置 Git 用户信息..."
read -p "请输入你的 GitHub 用户名: " username
read -p "请输入你的邮箱: " email
git config --global user.name "$username"
git config --global user.email "$email"
echo "✅ 用户信息配置完成"

echo ""
echo "[4/5] 添加文件到 Git..."
git add .
git commit -m "Initial commit - 科研任务管理系统 V3.0"
echo "✅ 文件已提交"

echo ""
echo "[5/5] 准备推送到 GitHub..."
echo ""
echo "⚠️  请先在 GitHub 创建仓库："
echo "   1. 访问 https://github.com/new"
echo "   2. 仓库名称：research-task-system"
echo "   3. 选择 Public（公开）"
echo "   4. 不要勾选 'Initialize this repository with a README'"
echo "   5. 点击 'Create repository'"
echo ""
read -p "请输入你的仓库地址 (例如: https://github.com/username/research-task-system.git): " repo

git remote remove origin 2>/dev/null
git remote add origin "$repo"
git branch -M main

echo ""
echo "正在推送代码到 GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "  🎉 部署成功！"
    echo "========================================"
    echo ""
    echo "📋 下一步："
    echo "   1. 访问你的 GitHub 仓库"
    echo "   2. 点击 Settings → Pages"
    echo "   3. Source 选择 main 分支"
    echo "   4. 点击 Save"
    echo "   5. 等待 1-2 分钟"
    echo ""
    echo "🌐 访问地址（部署完成后）："
    echo "   https://$username.github.io/research-task-system/"
    echo ""
    echo "📚 详细文档："
    echo "   - GITHUB_DEPLOY.md - GitHub 部署指南"
    echo "   - README.md - 项目说明"
    echo ""
else
    echo ""
    echo "❌ 推送失败，可能需要输入 GitHub 凭据"
    echo ""
    echo "💡 提示："
    echo "   - 如果提示需要密码，请使用 Personal Access Token"
    echo "   - 获取 Token：GitHub → Settings → Developer settings → Personal access tokens"
    echo "   - 勾选 repo 权限"
    echo ""
    exit 1
fi


