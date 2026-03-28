@echo off
title ComHotel - Demarrage des serveurs

echo ========================================
echo    ComHotel - Demarrage des serveurs
echo ========================================
echo.

:: Tuer les processus existants sur les ports 3000 et 3002
echo Arret des serveurs existants...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul

:: Nettoyage des caches
echo.
echo Nettoyage des caches...

:: Supprimer le cache Next.js (.next)
if exist "C:\Users\elias\comhotel\apps\frontend\.next" (
    echo   - Suppression du cache Next.js...
    rmdir /s /q "C:\Users\elias\comhotel\apps\frontend\.next" 2>nul
    echo   - Cache Next.js supprime
) else (
    echo   - Pas de cache Next.js a supprimer
)

:: Supprimer le cache NestJS (dist)
if exist "C:\Users\elias\comhotel\apps\backend\dist" (
    echo   - Suppression du cache NestJS...
    rmdir /s /q "C:\Users\elias\comhotel\apps\backend\dist" 2>nul
    echo   - Cache NestJS supprime
) else (
    echo   - Pas de cache NestJS a supprimer
)

timeout /t 1 /nobreak >nul

echo.
echo Demarrage du backend (port 3000)...
start "ComHotel Backend" cmd /k "cd /d C:\Users\elias\comhotel\apps\backend && npm run dev"

echo.
echo Attente du demarrage du backend...
timeout /t 5 /nobreak >nul

echo.
echo Demarrage du frontend (port 3002)...
start "ComHotel Frontend" cmd /k "cd /d C:\Users\elias\comhotel\apps\frontend && npm run dev"

echo.
echo ========================================
echo    Serveurs en cours de demarrage
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:3002
echo.
echo Les serveurs sont lances dans des fenetres separees.
echo Fermez cette fenetre quand vous le souhaitez.
echo.
pause
