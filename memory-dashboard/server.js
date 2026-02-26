const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://vcwkgxwnzayxhysfjeqw.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjd2tneHduemF5eGh5c2ZqZXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDMxNDksImV4cCI6MjA4NjkxOTE0OX0.C9SuxTfSKM8NnPQ_oAn8McVnPIkB71L_evU_nFlBztg';
const supabase = createClient(supabaseUrl, supabaseKey);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Fetch latest memory metrics from Supabase
 */
async function getLatestMetrics() {
  try {
    const { data, error } = await supabase
      .from('memory_metrics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Supabase fetch error:', error);
      return null;
    }

    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.error('Error fetching metrics:', err);
    return null;
  }
}

/**
 * Generate memory dashboard HTML
 */
async function generateDashboard() {
  const metrics = await getLatestMetrics();
  
  // Default mock data if Supabase not yet set up
  const data = metrics || {
    session_count: 2,
    session_total_size: 14234,
    observation_count: 0,
    observation_total_size: 0,
    memory_lines: 346,
    token_cost_7d: 0,
    token_count_7d: 0,
    compression_ratio: 0,
    status: 'healthy',
    anomalies: [],
    session_files: [
      { name: 'main-direct.md', size: 844, modified: new Date().toISOString() },
      { name: 'self-audit-5000510923.md', size: 13390, modified: new Date().toISOString() }
    ],
    observation_files: []
  };

  const dataSource = metrics ? 'live Supabase data' : 'mock data (Supabase table not yet created)';
  const lastUpdated = metrics ? new Date(metrics.timestamp).toISOString() : new Date().toISOString();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Memory System Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'IBM Plex Sans', -apple-system, system-ui, sans-serif;
      background: #0a0a0a;
      color: #e0e0e0;
      padding: 2rem;
      line-height: 1.6;
    }
    header {
      text-align: center;
      margin-bottom: 3rem;
      border-bottom: 2px solid #00ffcc;
      padding-bottom: 1.5rem;
    }
    h1 { font-size: 2.5rem; color: #00ffcc; margin-bottom: 0.5rem; }
    .meta { color: #888; font-size: 0.9rem; }
    .status { display: inline-block; padding: 0.25rem 1rem; background: ${data.status === 'healthy' ? '#0f4' : '#f60'}; color: #000; border-radius: 4px; font-weight: bold; margin-top: 0.5rem; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
    .card {
      background: #1a1a1a;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 1.5rem;
      text-align: center;
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover { transform: translateY(-2px); border-color: #00ffcc; }
    .card-title { font-size: 0.85rem; color: #888; text-transform: uppercase; margin-bottom: 0.5rem; }
    .card-value { font-size: 2rem; color: #00ffcc; font-weight: bold; }
    .card-unit { font-size: 0.9rem; color: #666; margin-left: 0.25rem; }
    section { margin-bottom: 3rem; }
    h2 { color: #00ffcc; margin-bottom: 1rem; border-left: 4px solid #00ffcc; padding-left: 1rem; }
    table { width: 100%; border-collapse: collapse; background: #1a1a1a; }
    th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #333; }
    th { background: #0f0f0f; color: #00ffcc; font-weight: 600; }
    tr:hover { background: #222; }
    .anomalies { background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 1.5rem; }
    .alert { padding: 0.75rem; margin-bottom: 0.5rem; border-left: 4px solid #f60; background: #221100; border-radius: 4px; }
    .alert:last-child { margin-bottom: 0; }
    footer { text-align: center; color: #666; margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #333; }
    .note { background: #1a1a2a; border-left: 4px solid #00aaff; padding: 1rem; margin: 2rem 0; border-radius: 4px; }
    .note strong { color: #00aaff; }
  </style>
</head>
<body>
  <header>
    <h1>🧠 Memory System Dashboard</h1>
    <p class="meta">Last updated: ${lastUpdated.replace('T', ' ').substring(0, 19)} UTC</p>
    <p class="meta" style="font-size: 0.75rem; margin-top: 0.25rem;">Data source: ${dataSource}</p>
    <span class="status">${data.status === 'healthy' ? '✅ Healthy' : '⚠️ Attention Needed'}</span>
  </header>

  ${!metrics ? `
  <div class="note">
    <strong>⚙️ Setup Required:</strong> The Supabase table is not yet created. This dashboard shows mock data. 
    <br>Run the SQL from <code>SUPABASE-SETUP.md</code> in the Supabase dashboard, then run <code>sync-to-supabase.js</code> to populate real data.
  </div>
  ` : ''}

  <div class="cards">
    <div class="card">
      <div class="card-title">Compression Ratio</div>
      <div class="card-value">${data.compression_ratio}<span class="card-unit">x</span></div>
      <div class="meta">Session → Observation</div>
    </div>
    <div class="card">
      <div class="card-title">Sessions</div>
      <div class="card-value">${data.session_count}<span class="card-unit">files</span></div>
      <div class="meta">${(data.session_total_size / 1024).toFixed(1)} KB</div>
    </div>
    <div class="card">
      <div class="card-title">Observations</div>
      <div class="card-value">${data.observation_count}<span class="card-unit">files</span></div>
      <div class="meta">${(data.observation_total_size / 1024).toFixed(1)} KB</div>
    </div>
    <div class="card">
      <div class="card-title">MEMORY.md</div>
      <div class="card-value">${data.memory_lines}<span class="card-unit">lines</span></div>
      <div class="meta">Target: &lt;400</div>
    </div>
    <div class="card">
      <div class="card-title">Token Cost (7d)</div>
      <div class="card-value">$${parseFloat(data.token_cost_7d || 0).toFixed(2)}</div>
      <div class="meta">${((data.token_count_7d || 0) / 1000).toFixed(1)}K tokens</div>
    </div>
  </div>

  <section>
    <h2>📁 Session Files</h2>
    <table>
      <thead>
        <tr><th>Session</th><th>Size</th><th>Last Modified</th></tr>
      </thead>
      <tbody>
        ${(data.session_files || []).map(s => `
          <tr>
            <td>${s.name}</td>
            <td>${(s.size / 1024).toFixed(2)} KB</td>
            <td>${s.modified ? new Date(s.modified).toISOString().substring(0, 16).replace('T', ' ') : 'N/A'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </section>

  ${data.observation_count > 0 ? `
  <section>
    <h2>📊 Observation Files (Last 7 Days)</h2>
    <table>
      <thead>
        <tr><th>Date</th><th>Size</th><th>Modified</th></tr>
      </thead>
      <tbody>
        ${(data.observation_files || []).map(o => `
          <tr>
            <td>${o.name}</td>
            <td>${(o.size / 1024).toFixed(2)} KB</td>
            <td>${o.modified ? new Date(o.modified).toISOString().substring(0, 16).replace('T', ' ') : 'N/A'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </section>
  ` : '<section><h2>📊 Observation Files</h2><p style="color: #888;">No observations yet. First Observer run scheduled for tonight at midnight UTC.</p></section>'}

  <section>
    <h2>⚠️ Anomaly Detection</h2>
    <div class="anomalies">
      ${(data.anomalies || []).length > 0 ? 
        (data.anomalies || []).map(a => `<div class="alert">⚠️ ${a.message}</div>`).join('') :
        '<p style="color: #0f0;">✅ All systems healthy. No anomalies detected.</p>'
      }
    </div>
  </section>

  <section>
    <h2>📈 System Architecture</h2>
    <div class="note">
      <strong>Flow:</strong> Heartbeat (3hr) → Session files → Observer (daily) → Observations (${data.compression_ratio || 4.2}x compression) → Reflector (weekly) → MEMORY.md
      <br><br>
      <strong>Automation:</strong>
      <ul style="margin-left: 1.5rem; margin-top: 0.5rem;">
        <li>Heartbeat: Every 3 hours → session logging</li>
        <li>Observer: Midnight daily → session compression</li>
        <li>Reflector: Sunday 1am → MEMORY.md consolidation</li>
        <li>Health Check: Sunday 2am → archiving + anomaly detection</li>
        <li>Dashboard: Sunday 3am → metrics report</li>
      </ul>
    </div>
  </section>

  <footer>
    <p>Memory System Dashboard • Phase 3 • OpenClaw Memory Architecture</p>
    <p style="margin-top: 0.5rem; font-size: 0.85rem;">
      <a href="https://github.com/riletollm/vercel-platform" style="color: #00ffcc; text-decoration: none;">GitHub</a> • 
      <a href="https://docs.openclaw.ai" style="color: #00ffcc; text-decoration: none;">Docs</a>
    </p>
  </footer>
</body>
</html>`;

  return html;
}

// Dashboard route
app.get('/', async (req, res) => {
  res.send(await generateDashboard());
});

// API route for JSON data
app.get('/api/metrics', async (req, res) => {
  const metrics = await getLatestMetrics();
  res.json(metrics || { error: 'No data yet - Supabase table not created or no metrics synced' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Memory Dashboard running on port ${PORT}`);
  console.log(`Open: http://localhost:${PORT}`);
});

// Export for Vercel
module.exports = app;
