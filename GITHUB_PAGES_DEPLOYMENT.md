# GitHub Pages Deployment Guide

## Deployment Structure

This monorepo deploys both applications to GitHub Pages:

```
https://your-username.github.io/your-repo/
├── /                    → Marketing Site (apps/marketing-site)
└── /app/                → Main Application (apps/main-app)
```

## URLs

- **Marketing Site**: `https://your-username.github.io/your-repo/`
- **Main Application**: `https://your-username.github.io/your-repo/app/`

## Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment":
   - **Source**: Select **"GitHub Actions"** (not "Deploy from a branch")
   - This is crucial - it prevents automatic Jekyll builds

### 2. Deploy

The deployment happens automatically when you push to the `main` branch:

```bash
git push origin main
```

### 3. Manual Deployment

You can also trigger a deployment manually:
1. Go to **Actions** tab on GitHub
2. Select **"Deploy to GitHub Pages"** workflow
3. Click **"Run workflow"**

## How It Works

1. **Build Phase**:
   - Marketing site is built (`apps/marketing-site → dist/`)
   - Main app is built (`apps/main-app → dist/`)

2. **Deployment Phase**:
   - Marketing site deployed to root (`/`)
   - Main app deployed to `/app/` subdirectory
   - Shared assets copied to `/shared/`
   - `.nojekyll` file added to skip Jekyll processing

## Local Testing

### Marketing Site
```bash
cd apps/marketing-site
npm run dev
```

### Main App
```bash
cd apps/main-app
npm run dev
```

## Troubleshooting

### Jekyll Errors

If you see Jekyll-related errors like:
```
Error: No such file or directory @ rb_check_realpath_internal
```

**Solution**: Ensure GitHub Pages is set to **"GitHub Actions"** mode (not "Deploy from a branch").

### 404 Errors

If pages show 404:
1. Check that the workflow completed successfully in the **Actions** tab
2. Verify the build outputs exist in the workflow logs
3. Ensure paths in your HTML/JS match the deployment structure

### Asset Loading Issues

If assets don't load in the deployed app:
- Marketing site assets should use root-relative paths: `/assets/...`
- Main app assets should use: `/app/assets/...`

## CI/CD Workflows

- **`deploy-github-pages.yml`**: Deploys to GitHub Pages (runs on `main` branch)
- **`main-app-ci.yml`**: CI for main app (build, test, Docker)
- **`marketing-site-ci.yml`**: CI for marketing site (build, test, Docker)

## Notes

- The `.nojekyll` file disables Jekyll processing
- `_config.yml` and `.jekyllignore` are kept as fallbacks
- Both apps maintain independent build processes
- Docker deployments remain separate from GitHub Pages

