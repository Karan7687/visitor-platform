@echo off
title Visitor App Launcher
echo ====================================
echo     Visitor App Mobile Launcher
echo ====================================
echo.
echo 1. Starting Backend Server...
echo.

REM Start backend server in new window
start "Backend Server" cmd /k "cd /d d:\PROJECT\Internship\backend && node index.js"

echo 2. Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo 3. Starting Metro Bundler...
echo.

REM Start Metro bundler in new window
start "Metro Bundler" cmd /k "cd /d d:\PROJECT\Internship\VisitorApp && npx react-native start"

echo 4. Waiting for Metro to start...
timeout /t 8 /nobreak > nul

echo 5. Running App on Android Device...
echo.

REM Run app on Android device
cd /d d:\PROJECT\Internship\VisitorApp
npx react-native run-android

echo.
echo ====================================
echo App should now be running on your device!
echo Backend: http://localhost:3000
echo Metro: http://localhost:8081
echo ====================================
pause
