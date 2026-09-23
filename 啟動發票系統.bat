@echo off
chcp 65001 >nul
echo 正在啟動台灣發票智慧解析系統...
start "" "http://localhost:5173"
node server.js
pause
