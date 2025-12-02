@echo off
COLOR 0B
title Lula Tea - Testing Node.js
echo ==========================================
echo   Testing if Node.js is properly installed
echo ==========================================
echo.
echo Checking Node.js...
echo.

node --version
if %ERRORLEVEL% NEQ 0 (
    COLOR 0C
    echo.
    echo [FAILED] Node.js is NOT working!
    echo.
    echo SOLUTION: Restart your computer
    echo.
    echo After installing Node.js, Windows needs to be
    echo restarted to recognize the 'node' command.
    echo.
    echo After restarting your computer:
    echo 1. Double-click START-WEBSITE.bat
    echo 2. Your website will start!
    echo.
) else (
    COLOR 0A
    echo.
    echo [SUCCESS] Node.js is working!
    echo.
    npm --version
    echo.
    echo You are ready to start the website!
    echo.
    echo Next step: Double-click START-WEBSITE.bat
    echo.
)

pause
