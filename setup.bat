@echo off
echo ========================================
echo   CONFIGURACAO RAPIDA - Financas Facil
echo ========================================
echo.

echo [1/5] Instalando dependencias do BACKEND...
cd server
call npm install
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias do backend
    pause
    exit /b 1
)
echo OK - Backend instalado!
echo.

echo [2/5] Criando arquivo .env do backend...
if not exist .env (
    copy .env.example .env
    echo AVISO: Configure o arquivo server\.env com suas credenciais!
    echo.
) else (
    echo Arquivo .env ja existe
    echo.
)

cd ..

echo [3/5] Instalando dependencias do FRONTEND...
call npm install
if errorlevel 1 (
    echo ERRO: Falha ao instalar dependencias do frontend
    pause
    exit /b 1
)
echo OK - Frontend instalado!
echo.

echo [4/5] Criando arquivo .env do frontend...
if not exist .env (
    echo VITE_API_URL=http://localhost:5000/api > .env
    echo OK - Arquivo .env criado!
) else (
    echo Arquivo .env ja existe
)
echo.

echo [5/5] Configuracao concluida!
echo.
echo ========================================
echo   PROXIMOS PASSOS:
echo ========================================
echo.
echo 1. Configure o arquivo server\.env com suas credenciais de email
echo.
echo 2. Edite src\main.jsx e altere:
echo    De:   import App from './App.jsx'
echo    Para: import App from './AppNovo.jsx'
echo.
echo 3. Inicie o backend:
echo    cd server
echo    npm run dev
echo.
echo 4. Em outro terminal, inicie o frontend:
echo    npm run dev
echo.
echo 5. Acesse: http://localhost:5173
echo    Usuario admin: admin / senha: admin
echo.
echo ========================================
echo.
pause
