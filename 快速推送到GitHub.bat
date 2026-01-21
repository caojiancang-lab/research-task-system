@echo off
chcp 65001 >nul
color 0A
title 推送代码到 GitHub

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║           推送代码到你的 GitHub 仓库                        ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/5] 检查 Git 状态...
git status >nul 2>&1
if errorlevel 1 (
    echo ℹ️  初始化 Git 仓库...
    git init
)

echo.
echo [2/5] 配置远程仓库...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/caojiancang-lab/research-task-system.git
echo ✅ 远程仓库已配置

echo.
echo [3/5] 添加所有文件...
git add .
echo ✅ 文件已添加

echo.
echo [4/5] 提交更改...
git commit -m "🚀 科研任务管理系统 - 完整部署" >nul 2>&1
if errorlevel 1 (
    echo ℹ️  没有新的更改需要提交
) else (
    echo ✅ 更改已提交
)

echo.
echo [5/5] 推送到 GitHub...
git branch -M main
echo.
echo 正在推送代码...
echo.
git push -u origin main --force

if errorlevel 1 (
    echo.
    echo ⚠️  推送失败，可能需要身份验证
    echo.
    echo 💡 解决方法：
    echo    1. 如果提示输入用户名，输入: caojiancang-lab
    echo    2. 如果提示输入密码，需要使用 Personal Access Token
    echo.
    echo 📝 创建 Token 的步骤：
    echo    1. 访问: https://github.com/settings/tokens/new
    echo    2. Note 填写: research-task-system
    echo    3. 勾选 repo 权限
    echo    4. 点击 Generate token
    echo    5. 复制生成的 token
    echo    6. 回到这里，粘贴 token 作为密码
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ 代码推送成功！
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║                  🎉 推送完成！                             ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📋 下一步：启用 GitHub Pages
echo.
echo    1. 访问: https://github.com/caojiancang-lab/research-task-system/settings/pages
echo    2. 在 "Source" 下选择 "main" 分支
echo    3. 点击 "Save"
echo    4. 等待 1-2 分钟
echo.
echo 🌐 部署完成后的访问地址：
echo    https://caojiancang-lab.github.io/research-task-system/
echo.
echo 💡 是否现在打开 GitHub Pages 设置页面？
set /p open_settings="输入 Y 打开，或按回车跳过: "
if /i "%open_settings%"=="y" (
    start https://github.com/caojiancang-lab/research-task-system/settings/pages
)

echo.
pause

