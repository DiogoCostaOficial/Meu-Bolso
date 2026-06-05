#!/bin/bash
# scripts/setup.sh
set -e

echo "🚀 Setting up development environment..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Install dependencies
echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing server dependencies..."
cd server && npm install && cd ..

# Configure environment variables
if [ ! -f ".env.example" ]; then
    echo "⚠️ .env.example not found in root."
else
    if [ ! -f ".env" ]; then
        echo "📝 Creating .env from .env.example..."
        cp .env.example .env
    fi
fi

if [ -d "server" ] && [ -f "server/.env.example" ]; then
    if [ ! -f "server/.env" ]; then
        echo "📝 Creating server/.env from server/.env.example..."
        cp server/.env.example server/.env
    fi
fi

echo "✅ Setup completed successfully!"
echo "🎉 Run 'npm run dev:all' to start both frontend and backend."
