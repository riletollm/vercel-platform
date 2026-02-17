# Token Usage Analytics Dashboard

A real-time dashboard for monitoring OpenClaw token consumption, costs, and usage patterns.

## Features

✨ **Real-time Analytics**
- 7-day, 30-day, and all-time cost tracking
- Total tokens and session statistics
- Average cost per session

📊 **Rich Visualizations**
- Cost breakdown by model (pie chart)
- Cost breakdown by tag (horizontal bar chart)
- Per-session cost timeline (line chart, last 30 days)

📋 **Detailed Tables**
- Model comparison with token counts and usage frequency
- Tag usage breakdown
- Recent sessions with associated tags

⚡ **Auto-refresh**
- Dashboard updates automatically every 5 minutes
- Fast startup, no database required
- Graceful error handling for malformed log entries

## Tech Stack

- **Backend**: Express.js (Node.js)
- **Frontend**: Vanilla HTML/CSS with Chart.js
- **Data Source**: `/root/.openclaw/workspace/token-logs.jsonl`
- **Port**: 3000

## Setup

### 1. Install Dependencies

```bash
cd /root/.openclaw/workspace/dashboard
npm install
```

### 2. Run the Server

```bash
npm start
```

Or for development:

```bash
npm run dev
```

The dashboard will be available at: **http://localhost:3000**

### 3. Using Make (Alternative)

If you prefer using Make, create a simple Makefile or use standard Make commands:

```bash
make install  # npm install
make start    # npm start
```

## Data Format

The dashboard reads from `/root/.openclaw/workspace/token-logs.jsonl`, which should contain one JSON object per line:

```json
{
  "timestamp": "2025-01-10T14:23:45Z",
  "sessionKey": "main",
  "model": "anthropic/claude-haiku-4-5",
  "tokens_in": 1240,
  "tokens_out": 340,
  "cost": 0.0024,
  "tag": "admin",
  "duration_seconds": 15
}
```

**Required fields:**
- `timestamp` (ISO-8601 format)
- `cost` (numeric)

**Optional fields:**
- `sessionKey` (defaults to "unknown")
- `model` (defaults to "unknown")
- `tokens_in`, `tokens_out` (defaults to 0)
- `tag` (defaults to "untagged")
- `duration_seconds`

## API Endpoints

All endpoints return JSON data. The dashboard automatically calls these every 5 minutes.

### `GET /api/summary`

Returns summary statistics for different time periods.

```json
{
  "week": {
    "totalCost": 0.0048,
    "totalTokens": 2500,
    "totalSessions": 2,
    "avgCostPerSession": 0.0024,
    "entries": 10
  },
  "month": { ... },
  "allTime": { ... }
}
```

### `GET /api/cost-by-model`

Returns cost breakdown grouped by model.

```json
[
  {
    "model": "anthropic/claude-haiku-4-5",
    "cost": 0.0045,
    "tokens": 2100,
    "count": 8
  }
]
```

### `GET /api/cost-by-tag`

Returns cost breakdown grouped by tag.

```json
[
  {
    "tag": "admin",
    "cost": 0.0024,
    "tokens": 1200,
    "count": 5
  }
]
```

### `GET /api/sessions`

Returns recent sessions with aggregated costs (limit: 20 most recent).

```json
[
  {
    "sessionKey": "main",
    "cost": 0.0048,
    "tokens": 2500,
    "count": 10,
    "lastTimestamp": "2025-01-10T14:23:45Z",
    "tags": ["admin", "analytics"]
  }
]
```

### `GET /api/timeline`

Returns per-session cost timeline for the last 30 days (top 10 sessions).

```json
[
  {
    "sessionKey": "main",
    "points": [
      { "timestamp": "2025-01-10T14:23:45Z", "cost": 0.0012 },
      { "timestamp": "2025-01-10T15:45:30Z", "cost": 0.0024 }
    ]
  }
]
```

### `GET /`

Serves the main dashboard HTML page.

## File Structure

```
dashboard/
├── index.js                 # Express server with API endpoints
├── public/
│   ├── index.html          # Frontend dashboard (self-contained)
│   └── app.js              # Client-side logic (Chart.js, data fetching)
├── package.json            # Node.js dependencies
├── README.md               # This file
└── Makefile               # Optional Make commands
```

## Performance Notes

- **Fast startup**: No database initialization needed
- **Log parsing**: O(n) linear scan of token-logs.jsonl on each API call
- **Graceful degradation**: Malformed lines are skipped with a console warning
- **Memory efficient**: Processes one line at a time

For production deployments with very large logs, consider:
- Implementing log rotation
- Adding log indexing
- Using a persistent cache layer

## Troubleshooting

**Dashboard shows "No token usage data yet"**
- Ensure `/root/.openclaw/workspace/token-logs.jsonl` exists
- Check that the file contains valid JSON entries (comments starting with `#` are ignored)

**Charts not loading**
- Check browser console for errors
- Verify the API endpoints are returning data with `curl http://localhost:3000/api/summary`

**Server won't start**
- Verify port 3000 is not in use: `lsof -i :3000`
- Check Node.js version: `node --version` (requires Node 14+)

**API returns empty data**
- Verify token-logs.jsonl has valid JSON entries (one per line)
- Check file permissions: `ls -la /root/.openclaw/workspace/token-logs.jsonl`

## Development

To make changes to the frontend:

1. Edit `public/index.html` or `public/app.js`
2. Reload the browser (no server restart needed)

To make changes to the backend:

1. Edit `index.js`
2. Stop the server (`Ctrl+C`)
3. Restart with `npm start`

## License

MIT
