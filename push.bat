@echo off
pushd "%~dp0"
cls
echo ==============================================
echo Pushing code to GitHub:
echo https://github.com/appletw-hub/Taiwan-Invoice-Web
echo ==============================================
echo.
git push -u origin main
echo.
pause
popd
