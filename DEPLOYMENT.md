# Deployment Guide - Finanças Fácil

## Como fazer o deploy do projeto

### Frontend (Vercel)
1. Acesse [Vercel](https://vercel.com)
2. Clique em "New Project"
3. Importe o repositório do GitHub
4. Configure as variáveis de ambiente:
   - `VITE_API_URL`: URL do seu backend
5. Clique em "Deploy"

### Backend (Vercel)
1. Na pasta `server`, execute:
   ```bash
   vercel
   ```
2. Siga as instruções para configurar o projeto
3. Configure as variáveis de ambiente necessárias

### Configurações importantes:
- Frontend: porta 5173 (desenvolvimento) / build estática
- Backend: porta 3001 (API)
- Banco de dados: JSON local (pode ser substituído por MongoDB/PostgreSQL)

### Arquivos de configuração criados:
- `vercel.json` - Configuração do frontend
- `server/vercel.json` - Configuração do backend
- `.env.production` - Variáveis de ambiente para produção

### Notas:
- O projeto usa autenticação JWT
- O banco de dados atual é em arquivo JSON
- Para produção, considere usar um banco de dados real
- Configure as variáveis de ambiente corretamente

## Comandos úteis:
```bash
# Build do frontend
npm run build

# Deploy manual (se tiver CLI do Vercel)
vercel --prod
```