# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account** - Sign up at https://vercel.com
2. **Vercel CLI** - `npm install -g vercel`
3. **GitHub Repository** - Push dashboard to GitHub (recommended for CI/CD)

## Option 1: Deploy via GitHub (Recommended)

This enables automatic redeploys whenever you push changes.

### Steps:

1. **Create GitHub Repo:**
   ```bash
   cd /root/.openclaw/workspace/dashboard
   git init
   git add .
   git commit -m "Initial dashboard commit"
   git remote add origin https://github.com/YOUR_USERNAME/analytics-dashboard.git
   git branch -M main
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to https://vercel.com/new
   - Select "Import Git Repository"
   - Paste your GitHub repo URL
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Node.js
   - **Root Directory:** `./dashboard` (if using subdirectory)
   - **Build Command:** `npm install`
   - **Output Directory:** `public`
   - Click "Deploy"

4. **Access Dashboard:**
   Your dashboard will be live at: `https://your-project.vercel.app`

---

## Option 2: Manual Deploy via CLI

Quick one-off deployment:

```bash
cd /root/.openclaw/workspace/dashboard

# Login to Vercel (first time only)
vercel login

# Deploy
vercel --prod
```

Follow the prompts. Your dashboard will be live in ~30 seconds.

---

## Important: Environment for Token Logs

The dashboard reads `token-logs.jsonl` locally. For Vercel deployment:

1. **Option A:** Push token-logs.jsonl to GitHub (simpler for analytics)
   ```bash
   git add token-logs.jsonl
   git commit -m "Add initial token logs"
   git push
   ```

2. **Option B:** Copy logs periodically to deployed instance
   ```bash
   # After deployment, you can sync logs via:
   cp /root/.openclaw/workspace/token-logs.jsonl /root/.openclaw/workspace/dashboard/
   git add token-logs.jsonl
   git commit -m "Update token logs"
   git push
   # Vercel auto-redeploys on push
   ```

---

## Verification

After deployment, verify the dashboard works:

- Open `https://your-project.vercel.app`
- Check if data loads (or shows "No data yet" if logs are empty)
- Charts should render
- Auto-refresh should work

---

## Automatic Weekly Syncs (Optional)

To auto-sync token logs to Vercel weekly:

1. Add a cron job (in main OpenClaw):
   ```bash
   git -C /root/.openclaw/workspace add dashboard/token-logs.jsonl
   git -C /root/.openclaw/workspace commit -m "Weekly token logs sync"
   git -C /root/.openclaw/workspace push
   ```

This pushes updated logs → GitHub → Vercel auto-redeploys with fresh data.

---

## Troubleshooting

**"Module not found" error:**
- Run `npm install` in dashboard directory before deploying

**"Cannot read token-logs.jsonl":**
- Ensure file is tracked in git and pushed to GitHub
- Or copy it to the dashboard root before deployment

**"Port 3000 not available":**
- Vercel uses port 3000 by default; no config needed

---

**Next Steps:** When you have 2 weeks of data (~March 1), run one of the deploy options above to go live!
