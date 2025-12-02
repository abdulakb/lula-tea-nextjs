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
    echo [ERROR] Node.js is not found!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Then restart your computer.
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
    
    REM Try to install
    npm install 2>nul
    
    REM If it failed, might be execution policy issue
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo Fixing PowerShell execution policy...
        powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
        echo.
        echo Retrying installation...
        npm install
        
        if %ERRORLEVEL% NEQ 0 (
            COLOR 0C
            echo [ERROR] Failed to install dependencies!
            echo.
            pause
            exit /b 1
        )
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
COLOR 0E
echo    http://localhost:3000
echo.
COLOR 0A
echo Press Ctrl+C to stop the server.
echo.
echo Starting now...
timeout /t 2 >nul
echo.

REM Start the server
npm run dev

echo.
echo ========================================
echo Server has stopped.
echo ========================================
pause
