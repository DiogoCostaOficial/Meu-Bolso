# Guia de Deploy - Finanças Fácil

## 📋 Status do Projeto
✅ **Build concluído com sucesso**  
✅ **Configuração Vercel pronta**  
⚠️ **Deploy pendente devido a limitação de API**

## 🚀 Como Fazer Deploy Manual no Vercel

### Opção 1: Deploy via Vercel CLI (Recomendado)

1. **Instale o Vercel CLI globalmente:**
   ```bash
   npm i -g vercel
   ```

2. **Faça login na Vercel:**
   ```bash
   vercel login
   ```

3. **Execute o deploy:**
   ```bash
   vercel --prod
   ```

4. **Siga as instruções interativas:**
   - Confirme as configurações do projeto
   - Selecione sua conta/organização
   - Confirme o deploy para produção

### Opção 2: Deploy via Interface Web

1. **Acesse:** https://vercel.com

2. **Importe seu projeto:**
   - Clique em "New Project"
   - Importe do GitHub/GitLab ou faça upload do diretório

3. **Configure o deploy:**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Variáveis de Ambiente (se necessário):**
   ```
   VITE_API_URL=https://sua-api-backend.vercel.app
   ```

## 📁 Estrutura de Deploy

O projeto já está configurado com:
- ✅ `vercel.json` - Configuração de deploy
- ✅ `dist/` - Pasta de build gerada
- ✅ Build otimizado com Vite

## 🔧 Configurações do vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

## 📊 Tamanho do Build

- **CSS:** 45.85 kB (7.50 kB gzipped)
- **JavaScript:** 817.05 kB (218.19 kB gzipped)
- **Total:** ~225 kB comprimido

> ⚠️ **Nota:** Alguns chunks são maiores que 500 kB. Isso é normal para aplicações React com muitas funcionalidades.

## 🌐 URLs Esperadas Após Deploy

- **Frontend:** `https://seu-projeto.vercel.app`
- **Backend:** Configurar separado (recomendado)

## 📝 Notas Importantes

1. **Backend Separado:** O backend (server/) precisa ser deployado separadamente
2. **Variáveis de Ambiente:** Configure as URLs da API no frontend
3. **Banco de Dados:** Considere usar um banco em nuvem (MongoDB Atlas, Supabase, etc.)
4. **Autenticação:** Verifique se o JWT_SECRET está configurado no backend

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs de build no Vercel
2. Confirme que o build local funciona: `npm run build`
3. Verifique as variáveis de ambiente
4. Teste localmente primeiro: `npm run dev`

---

**Status Atual:** Projeto pronto para deploy! 🎯
**Próximo Passo:** Executar um dos métodos acima quando a limitação de API for liberada.