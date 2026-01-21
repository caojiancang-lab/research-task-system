@echo off
chcp 65001 >nul
color 0E
title GitHub Pages 问题诊断

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║              GitHub Pages 问题诊断工具                      ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [诊断 1] 检查 Git 仓库状态...
echo.
git status
echo.

echo [诊断 2] 检查远程仓库配置...
echo.
git remote -v
echo.

echo [诊断 3] 检查分支信息...
echo.
git branch -a
echo.

echo [诊断 4] 检查提交历史...
echo.
git log --oneline -5 2>nul
if errorlevel 1 (
    echo ⚠️  没有提交记录
)
echo.

echo ════════════════════════════════════════════════════════════
echo 💡 问题分析：
echo ════════════════════════════════════════════════════════════
echo.
echo Save 按钮是灰色的，可能是以下原因：
echo.
echo 1️⃣  代码还没有推送到 GitHub
echo    - 需要先运行推送脚本
echo.
echo 2️⃣  仓库是空的
echo    - GitHub 检测不到可部署的内容
echo.
echo 3️⃣  没有 index.html 文件
echo    - GitHub Pages 需要入口文件
echo.
echo 4️⃣  分支名称不对
echo    - 可能是 master 而不是 main
echo.

echo ════════════════════════════════════════════════════════════
echo 🔧 解决方案：
echo ════════════════════════════════════════════════════════════
echo.
echo 选择一个操作：
echo.
echo [1] 立即推送代码到 GitHub（推荐）
echo [2] 强制推送（如果之前推送失败）
echo [3] 检查 index.html 是否存在
echo [4] 查看详细帮助
echo [5] 退出
echo.
set /p choice="请输入选项 (1-5): "

if "%choice%"=="1" goto push_code
if "%choice%"=="2" goto force_push
if "%choice%"=="3" goto check_index
if "%choice%"=="4" goto show_help
if "%choice%"=="5" goto end

:push_code
echo.
echo ════════════════════════════════════════════════════════════
echo 📤 开始推送代码...
echo ════════════════════════════════════════════════════════════
echo.

REM 确保有 Git 仓库
if not exist .git (
    echo 初始化 Git 仓库...
    git init
)

REM 配置远程仓库
git remote remove origin >nul 2>&1
git remote add origin https://github.com/caojiancang-lab/research-task-system.git
echo ✅ 远程仓库已配置

REM 添加所有文件
echo.
echo 添加文件...
git add .
echo ✅ 文件已添加

REM 提交
echo.
echo 提交更改...
git commit -m "🚀 初始部署 - 科研任务管理系统" >nul 2>&1
if errorlevel 1 (
    echo ℹ️  尝试修改提交...
    git commit --amend -m "🚀 初始部署 - 科研任务管理系统" >nul 2>&1
)

REM 切换到 main 分支
echo.
echo 切换到 main 分支...
git branch -M main
echo ✅ 分支已切换

REM 推送
echo.
echo 推送到 GitHub...
echo.
echo ⚠️  如果提示输入密码，请使用 Personal Access Token
echo.
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ 推送失败
    echo.
    echo 💡 可能需要创建 Personal Access Token
    echo.
    set /p create_token="是否打开 Token 创建页面？(Y/n): "
    if /i not "!create_token!"=="n" (
        start https://github.com/settings/tokens/new?description=research-task-system&scopes=repo
        echo.
        echo 📝 创建 Token 的步骤：
        echo    1. 页面会自动填好名称和权限
        echo    2. 滚动到底部，点击 "Generate token"
        echo    3. 复制生成的 token（只显示一次！）
        echo    4. 回到这里，重新运行此脚本
        echo    5. 推送时用 token 作为密码
    )
    pause
    goto end
)

echo.
echo ✅ 推送成功！
echo.
echo 📋 现在请：
echo    1. 刷新 GitHub Pages 设置页面
echo    2. 应该可以看到 main 分支了
echo    3. 选择 main 分支，Save 按钮应该可以点击了
echo.
set /p open_pages="是否打开 GitHub Pages 设置页面？(Y/n): "
if /i not "%open_pages%"=="n" (
    start https://github.com/caojiancang-lab/research-task-system/settings/pages
)
pause
goto end

:force_push
echo.
echo ════════════════════════════════════════════════════════════
echo 💪 强制推送...
echo ════════════════════════════════════════════════════════════
echo.
echo ⚠️  这会覆盖远程仓库的内容
set /p confirm="确定要强制推送吗？(y/N): "
if /i not "%confirm%"=="y" goto end

git add .
git commit -m "🚀 强制部署" >nul 2>&1
git branch -M main
git push -u origin main --force

if errorlevel 1 (
    echo ❌ 推送失败，请检查网络和权限
    pause
    goto end
)

echo ✅ 强制推送成功！
echo.
set /p open_pages="是否打开 GitHub Pages 设置页面？(Y/n): "
if /i not "%open_pages%"=="n" (
    start https://github.com/caojiancang-lab/research-task-system/settings/pages
)
pause
goto end

:check_index
echo.
echo ════════════════════════════════════════════════════════════
echo 🔍 检查 index.html...
echo ════════════════════════════════════════════════════════════
echo.
if exist index.html (
    echo ✅ index.html 存在
    echo.
    echo 文件大小：
    dir index.html | find "index.html"
    echo.
    echo 文件内容预览：
    type index.html | more
) else (
    echo ❌ index.html 不存在！
    echo.
    echo 💡 GitHub Pages 需要 index.html 作为入口文件
    echo.
    echo 是否查看当前目录的文件？
    set /p show_files="(Y/n): "
    if /i not "!show_files!"=="n" (
        dir /b
    )
)
echo.
pause
goto end

:show_help
echo.
echo ════════════════════════════════════════════════════════════
echo 📚 详细帮助
echo ════════════════════════════════════════════════════════════
echo.
echo 🔴 问题：Save 按钮是灰色的
echo.
echo 📋 原因分析：
echo    GitHub Pages 的 Save 按钮变灰通常是因为：
echo    - 仓库中没有任何代码
echo    - 没有可部署的分支
echo    - 仓库是私有的（需要升级到 Pro）
echo.
echo ✅ 解决步骤：
echo.
echo    第 1 步：确保代码已推送
echo    ----------------------
echo    运行选项 [1] 推送代码到 GitHub
echo.
echo    第 2 步：刷新 Pages 设置页面
echo    ----------------------
echo    推送成功后，刷新浏览器页面
echo.
echo    第 3 步：选择分支
echo    ----------------------
echo    在 Source 下拉菜单中选择 "main"
echo    此时 Save 按钮应该可以点击了
echo.
echo    第 4 步：保存并等待
echo    ----------------------
echo    点击 Save，等待 1-2 分钟部署完成
echo.
echo 🔗 相关链接：
echo    - 仓库地址：https://github.com/caojiancang-lab/research-task-system
echo    - Pages 设置：https://github.com/caojiancang-lab/research-task-system/settings/pages
echo    - Token 创建：https://github.com/settings/tokens/new
echo.
echo 💡 如果还是不行：
echo    1. 检查仓库是否是 Public（公开）
echo    2. 确认 index.html 文件存在
echo    3. 查看 GitHub 是否有错误提示
echo.
pause
goto end

:end
echo.
echo 按任意键退出...
pause >nul

