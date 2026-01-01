@echo off
echo ====================================
echo Redemarrage des serveurs ComHotel
echo ====================================
echo.

echo [1/4] Arret des processus sur les ports 3000 et 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo   - Arret du processus %%a sur le port 3000
    taskkill //PID %%a //F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
    echo   - Arret du processus %%a sur le port 3001
    taskkill //PID %%a //F >nul 2>&1
)
echo   Ports liberes!
echo.

echo [2/4] Attente de 2 secondes...
timeout /t 2 /nobreak >nul
echo.

echo [3/4] Demarrage du backend (port 3001)...
start "Backend - NestJS" cmd /k "cd /d c:\Users\elias\comhotel\apps\backend && npm run dev"
echo   Backend lance dans une nouvelle fenetre
echo.

echo [4/4] Attente de 3 secondes avant de lancer le frontend...
timeout /t 3 /nobreak >nul
echo.

echo Demarrage du frontend (port 3000)...
start "Frontend - Next.js" cmd /k "cd /d c:\Users\elias\comhotel\apps\frontend && npm run dev"
echo   Frontend lance dans une nouvelle fenetre
echo.

echo ====================================
echo Serveurs demarres avec succes!
echo ====================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause >nul
