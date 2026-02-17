const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://vcwkgxwnzayxhysfjeqw.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Fetch token logs from Supabase
 */
async function parseTokenLogs() {
  if (!supabase) {
    console.warn('Supabase not configured, returning empty logs');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('token_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching token logs:', err);
    return [];
  }
}

function daysAgo(date) {
  const now = new Date();
  const dateObj = new Date(date);
  const diff = now - dateObj;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function filterByDays(entries, days) {
  return entries.filter(entry => daysAgo(entry.timestamp) <= days);
}

function calculateSummary(entries) {
  const now7day = filterByDays(entries, 7);
  const now30day = filterByDays(entries, 30);

  const calculate = (arr) => {
    if (arr.length === 0) {
      return {
        totalCost: 0,
        totalTokens: 0,
        totalSessions: 0,
        avgCostPerSession: 0,
        entries: arr.length,
      };
    }

    const totalCost = arr.reduce((sum, e) => sum + (parseFloat(e.cost) || 0), 0);
    const totalTokens = arr.reduce((sum, e) => sum + (e.tokens_in || 0) + (e.tokens_out || 0), 0);
    const sessions = new Set(arr.map(e => e.session_key)).size;

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

function costByModel(entries) {
  const breakdown = {};

  for (const entry of entries) {
    const model = entry.model || 'unknown';
    if (!breakdown[model]) {
      breakdown[model] = { cost: 0, tokens: 0, count: 0 };
    }
    breakdown[model].cost += parseFloat(entry.cost) || 0;
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

function costByTag(entries) {
  const breakdown = {};

  for (const entry of entries) {
    const tag = entry.tag || 'untagged';
    if (!breakdown[tag]) {
      breakdown[tag] = { cost: 0, tokens: 0, count: 0 };
    }
    breakdown[tag].cost += parseFloat(entry.cost) || 0;
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

function getRecentSessions(entries, limit = 20) {
  const sessionMap = {};

  for (const entry of entries) {
    const key = entry.session_key || 'unknown';
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
    sessionMap[key].cost += parseFloat(entry.cost) || 0;
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

function getSessionTimeline(entries) {
  const now30day = filterByDays(entries, 30);
  const timeline = {};

  for (const entry of now30day) {
    const key = entry.session_key || 'unknown';
    if (!timeline[key]) {
      timeline[key] = [];
    }
    timeline[key].push({
      timestamp: entry.timestamp,
      cost: parseFloat(entry.cost) || 0,
      cumulativeCost: 0,
    });
  }

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

  return result.slice(0, 10);
}

// API Endpoints
app.get('/api/summary', async (req, res) => {
  const entries = await parseTokenLogs();
  const summary = calculateSummary(entries);
  res.json(summary);
});

app.get('/api/cost-by-model', async (req, res) => {
  const entries = await parseTokenLogs();
  const breakdown = costByModel(entries);
  res.json(breakdown);
});

app.get('/api/cost-by-tag', async (req, res) => {
  const entries = await parseTokenLogs();
  const breakdown = costByTag(entries);
  res.json(breakdown);
});

app.get('/api/sessions', async (req, res) => {
  const entries = await parseTokenLogs();
  const sessions = getRecentSessions(entries);
  res.json(sessions);
});

app.get('/api/timeline', async (req, res) => {
  const entries = await parseTokenLogs();
  const timeline = getSessionTimeline(entries);
  res.json(timeline);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', supabaseConnected: !!supabase });
});

// Export for Vercel
module.exports = app;
