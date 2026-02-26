# Memory System Dashboard

Visual dashboard for OpenClaw memory system health metrics.

## Overview

This dashboard displays real-time metrics for the OpenClaw memory system:

- 📊 **Compression ratios** - Session → Observation → MEMORY.md efficiency
- 💰 **Token usage** - Memory operation costs (Observer, Reflector, heartbeat)
- ✅ **Heartbeat health** - Success rates and coverage
- 📁 **Storage metrics** - Session files, observations, archive sizes
- ⚠️ **Anomaly detection** - Bloat, gaps, failures

## Features

- **Self-contained** - Single Express.js server, no external dependencies
- **Dark theme** - Matches OpenClaw STYLES.md (dark background, neon accents)
- **Responsive** - Mobile-friendly layout
- **Real-time** - Regenerates on each request (can add caching if needed)
- **Mock data** - Uses example data in production (connect to real filesystem for live metrics)

## Local Development

```bash
npm install
npm run dev
# Open: http://localhost:3000
```

## Production (Vercel)

Deploys automatically on push to `main` branch via GitHub Actions.

**Live URL:** Will be assigned after first deployment

## Architecture

### Data Flow (Production with Real Data)
```
Heartbeat (3hr) → Session files → Observer (daily) → Observations → Reflector (weekly) → MEMORY.md
                                                          ↓
                                                    Dashboard reads metrics
```

### Current Implementation
- Uses **mock data** for demonstration
- Replace `generateDashboard()` function with real filesystem reads for production
- Connect to workspace via environment variables or API endpoint

## Metrics Displayed

### Overview Cards
- Compression ratio (session → observation)
- Session file count and total size
- Observation file count and total size
- MEMORY.md line count (target: <400)
- Token cost (last 7 days)

### Session Files Table
- File name, size, last modified
- All active session files listed

### Observation Files Table
- Last 7 days of observation logs
- Date, size, modified timestamp

### Anomaly Detection
- MEMORY.md >500 lines warning
- Session files >50KB bloat detection
- "All healthy" status when no issues

### System Architecture
- Visual flow diagram
- Automation schedule breakdown

## Future Enhancements

- [ ] Connect to real workspace filesystem (via API or mounted volume)
- [ ] Chart.js integration (compression trends, token usage over time)
- [ ] Export metrics to CSV/JSON
- [ ] Webhook integration for critical alerts
- [ ] Predictive analytics (storage growth projections)

## Related Apps

- **Token Analysis Dashboard** - Token usage across all operations
- **Research Viewer** - Research document browser

---

**Part of:** OpenClaw Memory Architecture (Phase 3)
**Created:** Feb 26, 2026
**Deployment:** Vercel (auto-deploy from main branch)
