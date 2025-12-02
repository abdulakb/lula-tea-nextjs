@echo off
COLOR 0A
title Lula Tea Website Server
echo ========================================
echo    Lula Tea Website Startup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    COLOR 0C
    echo [ERROR] Node.js is not found in PATH!
    echo.
    echo Please RESTART YOUR COMPUTER, then try again.
    echo.
    echo This happens because Windows needs to be restarted
    echo after installing Node.js to update the PATH.
    echo.
    echo After restarting, double-click this file again.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found!
node --version
npm --version
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [STEP 1] Installing dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencies installed successfully!
    echo.
) else (
    echo [OK] Dependencies already installed.
    echo.
)

echo ========================================
echo [STEP 2] Starting Lula Tea Website...
echo ========================================
echo.
echo The website will be available at:
echo.
echo    http://localhost:3000
echo.
echo Press Ctrl+C to stop the server.
echo.
echo Starting in 3 seconds...
timeout /t 3 >nul
echo.

REM Start the server
call npm run dev

echo.
echo ========================================
echo Server has stopped.
echo ========================================
pause
