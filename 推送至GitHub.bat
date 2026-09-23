@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ==============================================
echo 正在推送到 GitHub (Taiwan-Invoice-Web)...
echo ==============================================
git push -u origin main
if %errorlevel% equ 0 (
    echo.
    echo ----------------------------------------------
    echo 恭喜！程式碼已成功推送到 GitHub！
    echo 倉庫網址: https://github.com/appletw-hub/Taiwan-Invoice-Web
    echo ----------------------------------------------
) else (
    echo.
    echo 推送遇到狀況，若尚未在 GitHub 建立 Repository，
    echo 請先至 https://github.com/new 建立名稱為 Taiwan-Invoice-Web 的倉庫。
)
pause
