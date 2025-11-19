@echo off
echo ========================================
echo   RESETANDO SENHA (FORCADO)
echo ========================================
echo.
echo Este script vai FORCAR o reset da senha
echo para: Teste@2025
echo.
pause
echo.
cd server
node scripts/resetar-senha-forcado.js
echo.
echo ========================================
echo.
echo AGORA:
echo 1. REINICIE O BACKEND (Ctrl+C e npm run dev)
echo 2. LIMPE O NAVEGADOR (F12, Console: localStorage.clear())
echo 3. RECARREGUE (F5)
echo 4. LOGIN DO ZERO
echo.
pause
