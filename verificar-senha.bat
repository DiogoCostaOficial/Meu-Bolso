@echo off
echo ========================================
echo   VERIFICANDO SENHA DO USUARIO
echo ========================================
echo.
cd server
node scripts/verificar-senha.js
echo.
echo ========================================
pause
