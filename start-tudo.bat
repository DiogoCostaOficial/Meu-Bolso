@echo off
echo ========================================
echo   INICIANDO SISTEMA COMPLETO
echo ========================================
echo.
echo Abrindo Backend...
start "Backend - Financas Facil" cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak > nul
echo.
echo Abrindo Frontend...
start "Frontend - Financas Facil" cmd /k "npm run dev"
echo.
echo ========================================
echo   Sistema iniciado!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Usuario admin: admin / senha: admin
echo.
pause
