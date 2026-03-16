@echo off
title مطعم الأجواء – لوحة التحكم
cd /d "%~dp0"

echo.
echo  ==========================================
echo   مطعم الأجواء – بدء تشغيل لوحة التحكم
echo  ==========================================
echo.

:: Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo  [خطأ] Node.js غير مثبت على هذا الجهاز.
    echo  يرجى تحميله من: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Start browser after short delay (gives server time to start)
start "" /b cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000/admin.html"

:: Start the server (this stays open)
node server.js

echo.
echo  تم إيقاف الخادم.
pause
