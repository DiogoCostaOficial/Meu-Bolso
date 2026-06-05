@echo off
echo Iniciando Financas Facil...

:: Iniciar Backend
start "Financas Backend" cmd /k "cd server && npm run dev"

:: Aguardar 3 segundos
timeout /t 3 /nobreak >nul

:: Iniciar Frontend
start "Financas Frontend" cmd /k "npm run dev"

:: O frontend já está configurado para abrir o navegador automaticamente
:: Aguardar a finalização do script
echo.
echo Servidores iniciados!
echo Backend rodando em http://localhost:5000 (ou porta definida)
echo Frontend rodando em http://localhost:5173
echo.
