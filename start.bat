@echo off
cd /d "%~dp0"
title GeoMap.AI - Spatial Data Harmonization Platform

echo =========================================================
echo   GeoMap.AI - Spatial Data Harmonization Platform
echo =========================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not found in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

if not exist node_modules (
    echo Installing dependencies. Please wait...
    call npm install
)

echo Starting GeoMap.AI local server...
echo URL: http://localhost:5173
echo.

start http://localhost:5173
call npm run dev

pause
