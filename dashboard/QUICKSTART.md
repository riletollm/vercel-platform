# Quick Start Guide

## 🚀 Get Started in 2 Minutes

### 1. Install & Start
```bash
cd /root/.openclaw/workspace/dashboard
npm install
npm start
```

The dashboard will be available at: **http://localhost:3000**

### 2. Open in Browser
```
http://localhost:3000
```

That's it! 🎉

## Using Make Commands (Optional)

If you prefer Make:

```bash
make install  # Install dependencies
make start    # Start the server
make dev      # Development mode
make clean    # Clean node_modules
make logs     # Watch token-logs.jsonl
```

## What You'll See

- **Summary Cards**: 7-day, 30-day, and all-time cost/token stats
- **Cost by Model**: Pie chart showing which models are used most
- **Cost by Tag**: Horizontal bar chart of spending by tag (admin, dev, chat, etc.)
- **Timeline**: Line chart showing cumulative session costs over 30 days
- **Tables**: Detailed breakdowns by model, tag, and session
- **Auto-Refresh**: Updates every 5 minutes automatically

## Data Format

The dashboard reads from `/root/.openclaw/workspace/token-logs.jsonl`. Each line should be a JSON object:

```json
{
  "timestamp": "2026-02-16T10:00:00Z",
  "sessionKey": "main",
  "model": "anthropic/claude-haiku-4-5",
  "tokens_in": 1200,
  "tokens_out": 400,
  "cost": 0.0042,
  "tag": "admin",
  "duration_seconds": 14
}
```

The system automatically handles:
- ✅ Missing or malformed lines (skipped gracefully)
- ✅ Comments (lines starting with `#`)
- ✅ Empty lines
- ✅ New data arriving as the log file grows

## Endpoints (For Programmatic Access)

```bash
# Summary stats (7-day, 30-day, all-time)
curl http://localhost:3000/api/summary

# Cost breakdown by model
curl http://localhost:3000/api/cost-by-model

# Cost breakdown by tag
curl http://localhost:3000/api/cost-by-tag

# Recent sessions
curl http://localhost:3000/api/sessions

# Session cost timeline
curl http://localhost:3000/api/timeline
```

## Troubleshooting

**Port 3000 in use?**
```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>
```

**No data showing?**
- Verify `/root/.openclaw/workspace/token-logs.jsonl` exists
- Check that it contains valid JSON entries (comments starting with `#` are ignored)
- Refresh the page

**Server won't start?**
- Check Node.js version: `node --version` (need v14+)
- Check error logs for details

## Next Steps

- The dashboard will auto-read new data from `token-logs.jsonl` as it grows
- No cron jobs or databases needed
- Just keep the server running and it'll continuously update

Happy analyzing! 📊
