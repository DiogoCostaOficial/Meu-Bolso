#!/bin/bash

# Script de Deployment para Vercel (Manual)
# Execute este script quando a API da Vercel estiver disponível

echo "🚀 Preparando deployment do Finanças Fácil..."

# Verificar se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI não encontrado. Instale com: npm i -g vercel"
    exit 1
fi

# Build do frontend
echo "📦 Criando build do frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build do frontend criado com sucesso!"
else
    echo "❌ Erro ao criar build do frontend"
    exit 1
fi

# Deploy do frontend
echo "🌐 Fazendo deploy do frontend..."
echo "⚠️  Este comando abrirá o navegador para configurar o deployment"
echo "📋 Configure as seguintes variáveis de ambiente:"
echo "   - VITE_API_URL: URL do seu backend"
echo ""
echo "Pressione ENTER para continuar..."
read

vercel --prod --cwd . --yes

# Deploy do backend
echo "🔧 Fazendo deploy do backend..."
cd server
vercel --prod --cwd . --yes

echo "✅ Deployment concluído!"
echo "📍 Verifique as URLs geradas no dashboard da Vercel"