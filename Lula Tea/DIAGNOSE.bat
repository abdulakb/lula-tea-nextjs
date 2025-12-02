@echo off
title Lula Tea - Diagnostic Check
COLOR 0E
echo ========================================
echo    DIAGNOSTIC CHECK
echo ========================================
echo.
echo This will help us find out what's wrong.
echo The window will stay open.
echo.
echo ========================================
echo Test 1: Checking Node.js Installation
echo ========================================
echo.

where node
if %ERRORLEVEL% NEQ 0 (
    COLOR 0C
    echo.
    echo [FAILED] Node.js is NOT found!
    echo.
    echo Solution:
    echo 1. Make sure you installed Node.js from https://nodejs.org/
    echo 2. Restart your computer (you did this)
    echo 3. Try running: refreshenv
    echo.
    goto end
)

echo.
echo [PASSED] Node.js is found!
echo.
echo Node.js version:
node --version
echo.
echo NPM version:
npm --version
echo.

echo ========================================
echo Test 2: Checking Current Directory
echo ========================================
echo.
echo Current directory:
cd
echo.

if not exist "package.json" (
    COLOR 0C
    echo [WARNING] package.json not found!
    echo Are you in the right folder?
    echo.
    goto end
)

echo [PASSED] package.json found!
echo.

echo ========================================
echo Test 3: Checking Dependencies
echo ========================================
echo.

if not exist "node_modules" (
    echo Dependencies are NOT installed yet.
    echo This is normal for first run.
    echo.
    echo Would you like to install them now? (This takes 2-3 minutes)
    choice /C YN /M "Install dependencies"
    if errorlevel 2 goto end
    if errorlevel 1 goto install
) else (
    echo [PASSED] Dependencies already installed!
    echo.
    goto checkserver
)

:install
echo.
echo Installing dependencies...
echo.
npm install
if %ERRORLEVEL% NEQ 0 (
    COLOR 0C
    echo.
    echo [FAILED] Installation failed!
    echo.
    goto end
)
echo.
echo [SUCCESS] Dependencies installed!
echo.

:checkserver
echo ========================================
echo Test 4: Checking server.js
echo ========================================
echo.

if not exist "server.js" (
    COLOR 0C
    echo [ERROR] server.js not found!
    goto end
)

echo [PASSED] server.js exists!
echo.

echo ========================================
echo ALL TESTS PASSED!
echo ========================================
echo.
echo Your setup looks good!
echo.
echo Would you like to start the website now?
choice /C YN /M "Start server"
if errorlevel 2 goto end
if errorlevel 1 goto start

:start
echo.
echo ========================================
echo Starting Lula Tea Website Server...
echo ========================================
echo.
echo The server will start in 3 seconds...
echo Then open your browser to: http://localhost:3000
echo.
timeout /t 3
echo.
COLOR 0A
npm run dev
goto end

:end
echo.
echo ========================================
echo.
echo Press any key to close this window...
pause >nul
