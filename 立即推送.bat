@echo off
chcp 65001 >nul
color 0A

echo.
echo ════════════════════════════════════════════════════════════
echo           立即推送代码到 GitHub
echo ════════════════════════════════════════════════════════════
echo.

cd /d "%~dp0"

echo [1/4] 添加所有文件...
git add .
if errorlevel 1 (
    echo ❌ 添加文件失败
    pause
    exit /b 1
)
echo ✅ 完成

echo.
echo [2/4] 提交更改...
git commit -m "科研任务管理系统 - 完整部署"
if errorlevel 1 (
    echo ℹ️  没有新更改，尝试强制提交...
    git commit --allow-empty -m "科研任务管理系统 - 完整部署"
)
echo ✅ 完成

echo.
echo [3/4] 确保在 main 分支...
git branch -M main
echo ✅ 完成

echo.
echo [4/4] 推送到 GitHub...
echo.
echo ⚠️  如果提示输入密码，请使用 Personal Access Token
echo    用户名: caojiancang-lab
echo    密码: 你的 Token（不是 GitHub 密码）
echo.
echo 正在推送...
echo.

git push -u origin main --force

if errorlevel 1 (
    echo.
    echo ════════════════════════════════════════════════════════════
    echo ❌ 推送失败！
    echo ════════════════════════════════════════════════════════════
    echo.
    echo 💡 需要创建 Personal Access Token
    echo.
    echo 📝 步骤：
    echo    1. 我会打开 Token 创建页面
    echo    2. 点击页面底部的 "Generate token" 按钮
    echo    3. 复制生成的 token（一串字母数字）
    echo    4. 重新运行此脚本
    echo    5. 推送时粘贴 token 作为密码
    echo.
    set /p open_token="是否打开 Token 创建页面？(Y/n): "
    if /i not "%open_token%"=="n" (
        start https://github.com/settings/tokens/new?description=research-task-system&scopes=repo
    )
    echo.
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════
echo ✅ 推送成功！
echo ════════════════════════════════════════════════════════════
echo.
echo 📋 现在请执行以下步骤：
echo.
echo    1. 打开浏览器，访问：
echo       https://github.com/caojiancang-lab/research-task-system/settings/pages
echo.
echo    2. 刷新页面（按 F5）
echo.
echo    3. 在 "Source" 下拉菜单中选择 "main" 分支
echo.
echo    4. Save 按钮应该可以点击了，点击它
echo.
echo    5. 等待 1-2 分钟，部署完成
echo.
echo 🌐 部署完成后访问：
echo    https://caojiancang-lab.github.io/research-task-system/
echo.

set /p open_settings="是否现在打开 GitHub Pages 设置页面？(Y/n): "
if /i not "%open_settings%"=="n" (
    start https://github.com/caojiancang-lab/research-task-system/settings/pages
)

echo.
echo 按任意键退出...
pause >nul

