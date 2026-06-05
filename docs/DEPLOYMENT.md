# 🚀 Deployment Guide

This project is configured for easy deployment to **Vercel**.

## 🛠️ Automated Deployment (CI/CD)

The project uses **GitHub Actions** for automated deployments.

- **Staging**: Every push to the `develop` branch is automatically deployed to staging.
- **Production**: Every push to the `main` branch is automatically deployed to production.

### Configuration

You need to set the following secrets in your GitHub repository settings:

1. `VERCEL_TOKEN`: Your Vercel Personal Access Token.
2. `VERCEL_ORG_ID`: Your Vercel Organization ID.
3. `VERCEL_PROJECT_ID`: Your Vercel Project ID.
4. `DATABASE_URL`: (Optional) If used by CI/CD tests.

## 📦 Manual Deployment

You can also deploy manually using the Vercel CLI:

```bash
# Deploy to staging
vercel

# Deploy to production
vercel --prod
```

## 🏗️ Build Process

The frontend is built using **Vite**.

```bash
npm run build
```

The server is a **Node.js/Express** app designed to run on Vercel as Serverless Functions or on a dedicated VPS.
