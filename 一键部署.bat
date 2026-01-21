@echo off
chcp 65001 >nul
color 0A
title 科研任务管理系统 - 一键自动部署

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║        科研任务管理系统 - 超快速自动部署工具               ║
echo ║                    V3.0 Enhanced                           ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 🚀 准备开始自动部署...
timeout /t 2 >nul

REM ============================================
REM 步骤 1: 检查 Git
REM ============================================
echo.
echo [1/7] 🔍 检查 Git 安装状态...
git --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ 未检测到 Git！
    echo.
    echo 📥 正在为你打开 Git 下载页面...
    start https://git-scm.com/download/win
    echo.
    echo 💡 请按照以下步骤操作：
    echo    1. 下载并安装 Git（一路点击 Next）
    echo    2. 安装完成后，重新运行此脚本
    echo.
    pause
    exit /b 1
)
echo ✅ Git 已安装
git --version

REM ============================================
REM 步骤 2: 检查 GitHub 账号
REM ============================================
echo.
echo [2/7] 👤 配置 GitHub 账号信息...
echo.

REM 检查是否已配置
for /f "tokens=*" %%i in ('git config --global user.name 2^>nul') do set existing_name=%%i
for /f "tokens=*" %%i in ('git config --global user.email 2^>nul') do set existing_email=%%i

if defined existing_name (
    echo ℹ️  检测到已配置的用户信息：
    echo    用户名: %existing_name%
    echo    邮箱: %existing_email%
    echo.
    set /p use_existing="是否使用此信息？(Y/n): "
    if /i "!use_existing!"=="n" (
        goto input_user_info
    )
    set username=%existing_name%
    set email=%existing_email%
    goto user_info_done
)

:input_user_info
echo.
echo 💡 如果还没有 GitHub 账号，我可以帮你打开注册页面
set /p has_account="你有 GitHub 账号吗？(Y/n): "
if /i "%has_account%"=="n" (
    echo.
    echo 📝 正在打开 GitHub 注册页面...
    start https://github.com/signup
    echo.
    echo 请完成注册后，回来继续...
    pause
)

echo.
set /p username="请输入你的 GitHub 用户名: "
set /p email="请输入你的邮箱: "

git config --global user.name "%username%"
git config --global user.email "%email%"

:user_info_done
echo ✅ 用户信息配置完成

REM ============================================
REM 步骤 3: 初始化 Git 仓库
REM ============================================
echo.
echo [3/7] 📦 初始化 Git 仓库...

if exist .git (
    echo ℹ️  检测到已存在的 Git 仓库
    set /p reset_repo="是否重新初始化？(y/N): "
    if /i "!reset_repo!"=="y" (
        rd /s /q .git
        git init
        echo ✅ Git 仓库已重新初始化
    ) else (
        echo ℹ️  使用现有仓库
    )
) else (
    git init
    echo ✅ Git 仓库初始化完成
)

REM ============================================
REM 步骤 4: 添加并提交文件
REM ============================================
echo.
echo [4/7] 📝 准备项目文件...

git add .
git commit -m "🚀 科研任务管理系统 V3.0 - 自动部署" >nul 2>&1
if errorlevel 1 (
    echo ℹ️  没有新的更改需要提交
) else (
    echo ✅ 文件已提交到本地仓库
)

REM ============================================
REM 步骤 5: 创建 GitHub 仓库
REM ============================================
echo.
echo [5/7] 🌐 创建 GitHub 仓库...
echo.
echo 💡 我将为你打开 GitHub 仓库创建页面
echo.
echo 📋 请按照以下步骤操作：
echo    1. 仓库名称输入: research-task-system
echo    2. 选择 Public（公开）
echo    3. ⚠️  不要勾选任何初始化选项
echo    4. 点击 "Create repository"
echo    5. 创建完成后，复制仓库地址
echo.

start https://github.com/new

echo 等待你创建仓库...
echo.
set /p repo_url="请粘贴你的仓库地址 (例如: https://github.com/%username%/research-task-system.git): "

REM 如果用户只输入了仓库名，自动补全
echo %repo_url% | findstr "http" >nul
if errorlevel 1 (
    set repo_url=https://github.com/%username%/%repo_url%.git
    echo ℹ️  自动补全为: !repo_url!
)

REM ============================================
REM 步骤 6: 推送到 GitHub
REM ============================================
echo.
echo [6/7] 📤 推送代码到 GitHub...

git remote remove origin >nul 2>&1
git remote add origin %repo_url%
git branch -M main

echo.
echo 正在推送...（可能需要输入 GitHub 凭据）
echo.

git push -u origin main

if errorlevel 1 (
    echo.
    echo ⚠️  推送遇到问题，可能需要身份验证
    echo.
    echo 💡 GitHub 现在需要使用 Personal Access Token (PAT)
    echo.
    echo 📝 我来帮你创建 Token：
    echo    1. 正在打开 Token 创建页面...
    start https://github.com/settings/tokens/new?description=Research-Task-System&scopes=repo
    echo.
    echo    2. 点击页面底部的 "Generate token"
    echo    3. 复制生成的 token（只显示一次！）
    echo    4. 回到这里，重新推送时用 token 作为密码
    echo.
    echo 🔄 准备重试推送...
    pause
    git push -u origin main
    
    if errorlevel 1 (
        echo.
        echo ❌ 推送失败
        echo.
        echo 💡 手动推送方法：
        echo    git push -u origin main
        echo.
        echo 📚 详细帮助请查看: GITHUB_DEPLOY.md
        pause
        exit /b 1
    )
)

echo ✅ 代码推送成功！

REM ============================================
REM 步骤 7: 配置 GitHub Pages
REM ============================================
echo.
echo [7/7] 🌍 配置 GitHub Pages...
echo.

REM 提取仓库名
for /f "tokens=4,5 delims=/" %%a in ("%repo_url%") do (
    set repo_owner=%%a
    set repo_name=%%b
)
set repo_name=%repo_name:.git=%

echo 📋 最后一步（需要手动操作）：
echo.
echo    1. 正在打开仓库设置页面...
start https://github.com/%repo_owner%/%repo_name%/settings/pages
echo.
echo    2. 在 "Source" 下拉菜单中选择 "main" 分支
echo    3. 点击 "Save" 按钮
echo    4. 等待 1-2 分钟让 GitHub 部署
echo.

timeout /t 3 >nul

REM ============================================
REM 完成
REM ============================================
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║                  🎉 部署完成！                             ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 🌐 你的网站地址：
echo    https://%repo_owner%.github.io/%repo_name%/
echo.
echo 📱 分享给团队成员：
echo    1. 发送上面的网址
echo    2. 他们可以直接访问、注册、登录
echo    3. 第一个注册的用户自动成为管理员
echo.
echo 📊 系统功能：
echo    ✅ 用户注册/登录
echo    ✅ 任务管理
echo    ✅ 周计划
echo    ✅ 数据统计
echo    ✅ 进度跟踪
echo.
echo 🔄 如需更新系统：
echo    1. 修改文件后运行此脚本
echo    2. 或使用命令：
echo       git add .
echo       git commit -m "更新说明"
echo       git push
echo.
echo 📚 详细文档：
echo    - README.md - 使用说明
echo    - GITHUB_DEPLOY.md - 部署指南
echo.
echo 💡 提示：
echo    - 部署需要 1-2 分钟生效
echo    - 如果无法访问，请检查 GitHub Pages 设置
echo    - 数据存储在浏览器本地（LocalStorage）
echo.

REM 询问是否打开网站
set /p open_site="是否现在打开网站？(Y/n): "
if /i not "%open_site%"=="n" (
    timeout /t 5 >nul
    start https://%repo_owner%.github.io/%repo_name%/
)

echo.
echo 按任意键退出...
pause >nul

