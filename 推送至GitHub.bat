@echo off
cd /d "%~dp0"
cls
echo ==============================================
echo Pushing code to GitHub:
echo https://github.com/appletw-hub/Taiwan-Invoice-Web
echo ==============================================
echo.
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo [SUCCESS] Push completed successfully!
) else (
    echo [ERROR] Push failed.
    echo Please make sure the repo exists: https://github.com/appletw-hub/Taiwan-Invoice-Web
)
echo.
pause
