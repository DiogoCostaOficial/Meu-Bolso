# scripts/setup.ps1
Write-Host "🚀 Setting up development environment..." -ForegroundColor Cyan

# Check Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is required but not installed." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
npm install

Write-Host "📦 Installing server dependencies..." -ForegroundColor Yellow
Set-Location server
npm install
Set-Location ..

# Configure environment variables
if (Test-Path .env.example) {
    if (!(Test-Path .env)) {
        Write-Host "📝 Creating .env from .env.example..." -ForegroundColor Green
        Copy-Item .env.example .env
    }
}

if (Test-Path server\.env.example) {
    if (!(Test-Path server\.env)) {
        Write-Host "📝 Creating server\.env from server\.env.example..." -ForegroundColor Green
        Copy-Item server\.env.example server\.env
    }
}

Write-Host "✅ Setup completed successfully!" -ForegroundColor Green
Write-Host "🎉 Run 'npm run dev:all' to start both frontend and backend." -ForegroundColor Gray
