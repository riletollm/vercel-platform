const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const LOG_FILE = '/root/.openclaw/workspace/token-logs.jsonl';

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Parse token-logs.jsonl and return array of entries
 * Handles malformed lines gracefully
 */
function parseTokenLogs() {
  const entries = [];
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return entries;
    }

    const content = fs.readFileSync(LOG_FILE, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      // Skip empty lines and comments
      if (!line.trim() || line.trim().startsWith('#')) {
        continue;
      }

      try {
        const entry = JSON.parse(line);
        // Validate required fields
        if (entry.timestamp && entry.cost !== undefined) {
          entry.date = new Date(entry.timestamp);
          entries.push(entry);
        }
      } catch (e) {
        // Log parsing error but continue
        console.warn(`Skipping malformed line: ${line.substring(0, 50)}...`);
      }
    }
  } catch (err) {
    console.error('Error reading token logs:', err);
  }

  return entries;
}

/**
 * Calculate days ago from a date
 */
function daysAgo(date) {
  const now = new Date();
  const diff = now - date;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Filter entries by time range
 */
function filterByDays(entries, days) {
  return entries.filter(entry => daysAgo(entry.date) <= days);
}

/**
 * Calculate summary stats
 */
function calculateSummary(entries) {
  const now7day = filterByDays(entries, 7);
  const now30day = filterByDays(entries, 30);

  const calculate = (arr) => {
    if (arr.length === 0) {
      return {
        totalCost: 0,
        totalTokens: 0,
        totalSessions: new Set(arr.map(e => e.sessionKey)).size,
        avgCostPerSession: 0,
        entries: arr.length,
      };
    }

    const totalCost = arr.reduce((sum, e) => sum + (e.cost || 0), 0);
    const totalTokens = arr.reduce((sum, e) => sum + (e.tokens_in || 0) + (e.tokens_out || 0), 0);
    const sessions = new Set(arr.map(e => e.sessionKey)).size;

    return {
      totalCost: Math.round(totalCost * 10000) / 10000,
      totalTokens,
      totalSessions: sessions,
      avgCostPerSession: sessions > 0 ? Math.round((totalCost / sessions) * 10000) / 10000 : 0,
      entries: arr.length,
    };
  };

  return {
    week: calculate(now7day),
    month: calculate(now30day),
    allTime: calculate(entries),
  };
}

/**
 * Cost breakdown by model
 */
function costByModel(entries) {
  const breakdown = {};

  for (const entry of entries) {
    const model = entry.model || 'unknown';
    if (!breakdown[model]) {
      breakdown[model] = { cost: 0, tokens: 0, count: 0 };
    }
    breakdown[model].cost += entry.cost || 0;
    breakdown[model].tokens += (entry.tokens_in || 0) + (entry.tokens_out || 0);
    breakdown[model].count += 1;
  }

  return Object.entries(breakdown)
    .map(([model, data]) => ({
      model,
      cost: Math.round(data.cost * 10000) / 10000,
      tokens: data.tokens,
      count: data.count,
    }))
    .sort((a, b) => b.cost - a.cost);
}

/**
 * Cost breakdown by tag
 */
function costByTag(entries) {
  const breakdown = {};

  for (const entry of entries) {
    const tag = entry.tag || 'untagged';
    if (!breakdown[tag]) {
      breakdown[tag] = { cost: 0, tokens: 0, count: 0 };
    }
    breakdown[tag].cost += entry.cost || 0;
    breakdown[tag].tokens += (entry.tokens_in || 0) + (entry.tokens_out || 0);
    breakdown[tag].count += 1;
  }

  return Object.entries(breakdown)
    .map(([tag, data]) => ({
      tag,
      cost: Math.round(data.cost * 10000) / 10000,
      tokens: data.tokens,
      count: data.count,
    }))
    .sort((a, b) => b.cost - a.cost);
}

/**
 * Get recent sessions with aggregated costs
 */
function getRecentSessions(entries, limit = 20) {
  const sessionMap = {};

  for (const entry of entries) {
    const key = entry.sessionKey || 'unknown';
    if (!sessionMap[key]) {
      sessionMap[key] = {
        sessionKey: key,
        cost: 0,
        tokens: 0,
        count: 0,
        lastTimestamp: entry.timestamp,
        tags: new Set(),
      };
    }
    sessionMap[key].cost += entry.cost || 0;
    sessionMap[key].tokens += (entry.tokens_in || 0) + (entry.tokens_out || 0);
    sessionMap[key].count += 1;
    if (entry.tag) sessionMap[key].tags.add(entry.tag);
    if (new Date(entry.timestamp) > new Date(sessionMap[key].lastTimestamp)) {
      sessionMap[key].lastTimestamp = entry.timestamp;
    }
  }

  return Object.values(sessionMap)
    .map(s => ({
      ...s,
      cost: Math.round(s.cost * 10000) / 10000,
      tags: Array.from(s.tags),
    }))
    .sort((a, b) => new Date(b.lastTimestamp) - new Date(a.lastTimestamp))
    .slice(0, limit);
}

/**
 * Get per-session cost timeline (last 30 days)
 */
function getSessionTimeline(entries) {
  const now30day = filterByDays(entries, 30);
  const timeline = {};

  for (const entry of now30day) {
    const key = entry.sessionKey || 'unknown';
    if (!timeline[key]) {
      timeline[key] = [];
    }
    timeline[key].push({
      timestamp: entry.timestamp,
      cost: entry.cost || 0,
      cumulativeCost: 0,
    });
  }

  // Calculate cumulative costs per session
  const result = [];
  for (const [sessionKey, entries] of Object.entries(timeline)) {
    entries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    let cumulativeCost = 0;
    const points = entries.map(e => {
      cumulativeCost += e.cost;
      return {
        timestamp: e.timestamp,
        cost: Math.round(cumulativeCost * 10000) / 10000,
      };
    });
    result.push({ sessionKey, points });
  }

  return result.slice(0, 10); // Top 10 sessions
}

// API Endpoints

/**
 * GET /api/summary
 * Returns 7-day, 30-day, and all-time summary stats
 */
app.get('/api/summary', (req, res) => {
  const entries = parseTokenLogs();
  const summary = calculateSummary(entries);
  res.json(summary);
});

/**
 * GET /api/cost-by-model
 * Returns cost breakdown by model
 */
app.get('/api/cost-by-model', (req, res) => {
  const entries = parseTokenLogs();
  const breakdown = costByModel(entries);
  res.json(breakdown);
});

/**
 * GET /api/cost-by-tag
 * Returns cost breakdown by tag
 */
app.get('/api/cost-by-tag', (req, res) => {
  const entries = parseTokenLogs();
  const breakdown = costByTag(entries);
  res.json(breakdown);
});

/**
 * GET /api/sessions
 * Returns recent sessions with aggregated costs
 */
app.get('/api/sessions', (req, res) => {
  const entries = parseTokenLogs();
  const sessions = getRecentSessions(entries);
  res.json(sessions);
});

/**
 * GET /api/timeline
 * Returns per-session cost timeline
 */
app.get('/api/timeline', (req, res) => {
  const entries = parseTokenLogs();
  const timeline = getSessionTimeline(entries);
  res.json(timeline);
});

/**
 * GET /
 * Serve dashboard index
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`📊 Token Usage Dashboard running at http://localhost:${PORT}`);
  console.log(`📁 Reading logs from: ${LOG_FILE}`);
});
