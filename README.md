# Vercel Platform

Monorepo for OpenClaw web applications deployed to Vercel.

## Apps

1. **Dashboard** (`/dashboard`) - Token usage analytics
2. **Research Viewer** (`/research-viewer`) - Research document browser
3. **Memory Dashboard** (`/memory-dashboard`) - Memory system health metrics

## Deployment

Auto-deploys to Vercel on push to `main` branch via GitHub Actions.

**Live URLs:**
- Token Analysis Dashboard: https://token-analysis-dashboard-letos-projects-a7d7dbf1.vercel.app
- Research Viewer: https://research-viewer-letos-projects-a7d7dbf1.vercel.app
- Memory Dashboard: _(assigned after first deployment)_

## Local Development

Each app runs independently:

```bash
cd dashboard && npm install && npm run dev
cd research-viewer && npm install && npm run dev
cd memory-dashboard && npm install && npm run dev
```
