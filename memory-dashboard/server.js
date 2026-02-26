const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Generate memory dashboard HTML
 * 
 * In production, this uses mock data since we don't have access to the actual
 * workspace filesystem. In development, you'd read from the real memory files.
 */
function generateDashboard() {
  // Mock data for production (replace with actual data source in future)
  const metrics = {
    sessions: {
      count: 2,
      totalSize: 8090, // bytes
      files: [
        { name: 'main-direct.md', size: 844, modified: new Date().toISOString() },
        { name: 'self-audit-5000510923.md', size: 7246, modified: new Date().toISOString() }
      ]
    },
    observations: {
      count: 7, // Example: one week of observations
      totalSize: 24576,
      files: [
        { name: '2026-02-26-observations.md', size: 3584, modified: new Date(Date.now() - 0 * 86400000).toISOString() },
        { name: '2026-02-25-observations.md', size: 3412, modified: new Date(Date.now() - 1 * 86400000).toISOString() },
        { name: '2026-02-24-observations.md', size: 3856, modified: new Date(Date.now() - 2 * 86400000).toISOString() },
        { name: '2026-02-23-observations.md', size: 3102, modified: new Date(Date.now() - 3 * 86400000).toISOString() },
        { name: '2026-02-22-observations.md', size: 3678, modified: new Date(Date.now() - 4 * 86400000).toISOString() },
        { name: '2026-02-21-observations.md', size: 3498, modified: new Date(Date.now() - 5 * 86400000).toISOString() },
        { name: '2026-02-20-observations.md', size: 3446, modified: new Date(Date.now() - 6 * 86400000).toISOString() }
      ]
    },
    memoryLines: 337,
    tokens: {
      totalCost: 2.47,
      totalTokens: 458000
    }
  };

  const compressionRatio = metrics.sessions.totalSize > 0 && metrics.observations.totalSize > 0
    ? (metrics.sessions.totalSize / metrics.observations.totalSize * metrics.observations.count).toFixed(1)
    : '4.2';

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
    .status { display: inline-block; padding: 0.25rem 1rem; background: #0f4; color: #000; border-radius: 4px; font-weight: bold; margin-top: 0.5rem; }
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
    <p class="meta">Generated: ${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC</p>
    <span class="status">✅ Healthy</span>
  </header>

  <div class="note">
    <strong>📊 Live Dashboard:</strong> This dashboard shows memory system health metrics. 
    In production, it uses mock data. Connect to the actual workspace filesystem for real-time metrics.
  </div>

  <div class="cards">
    <div class="card">
      <div class="card-title">Compression Ratio</div>
      <div class="card-value">${compressionRatio}<span class="card-unit">x</span></div>
      <div class="meta">Session → Observation</div>
    </div>
    <div class="card">
      <div class="card-title">Sessions</div>
      <div class="card-value">${metrics.sessions.count}<span class="card-unit">files</span></div>
      <div class="meta">${(metrics.sessions.totalSize / 1024).toFixed(1)} KB</div>
    </div>
    <div class="card">
      <div class="card-title">Observations</div>
      <div class="card-value">${metrics.observations.count}<span class="card-unit">files</span></div>
      <div class="meta">${(metrics.observations.totalSize / 1024).toFixed(1)} KB</div>
    </div>
    <div class="card">
      <div class="card-title">MEMORY.md</div>
      <div class="card-value">${metrics.memoryLines}<span class="card-unit">lines</span></div>
      <div class="meta">Target: &lt;400</div>
    </div>
    <div class="card">
      <div class="card-title">Token Cost (7d)</div>
      <div class="card-value">$${metrics.tokens.totalCost.toFixed(2)}</div>
      <div class="meta">${(metrics.tokens.totalTokens / 1000).toFixed(1)}K tokens</div>
    </div>
  </div>

  <section>
    <h2>📁 Session Files</h2>
    <table>
      <thead>
        <tr><th>Session</th><th>Size</th><th>Last Modified</th></tr>
      </thead>
      <tbody>
        ${metrics.sessions.files.map(s => `
          <tr>
            <td>${s.name}</td>
            <td>${(s.size / 1024).toFixed(2)} KB</td>
            <td>${new Date(s.modified).toISOString().substring(0, 16).replace('T', ' ')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </section>

  <section>
    <h2>📊 Observation Files (Last 7 Days)</h2>
    <table>
      <thead>
        <tr><th>Date</th><th>Size</th><th>Modified</th></tr>
      </thead>
      <tbody>
        ${metrics.observations.files.map(o => `
          <tr>
            <td>${o.name}</td>
            <td>${(o.size / 1024).toFixed(2)} KB</td>
            <td>${new Date(o.modified).toISOString().substring(0, 16).replace('T', ' ')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </section>

  <section>
    <h2>⚠️ Anomaly Detection</h2>
    <div class="anomalies">
      ${metrics.memoryLines > 500 ? 
        '<div class="alert">⚠️ MEMORY.md exceeds 500 lines (' + metrics.memoryLines + '). Consider running Reflector consolidation.</div>' : 
        ''
      }
      ${metrics.sessions.files.some(s => s.size > 50000) ? 
        '<div class="alert">⚠️ Session file bloat detected: ' + metrics.sessions.files.filter(s => s.size > 50000).map(s => s.name).join(', ') + '</div>' : 
        ''
      }
      ${metrics.memoryLines <= 500 && !metrics.sessions.files.some(s => s.size > 50000) ? 
        '<p style="color: #0f0;">✅ All systems healthy. No anomalies detected.</p>' : 
        ''
      }
    </div>
  </section>

  <section>
    <h2>📈 System Architecture</h2>
    <div class="note">
      <strong>Flow:</strong> Heartbeat (3hr) → Session files → Observer (daily) → Observations (${compressionRatio}x compression) → Reflector (weekly) → MEMORY.md
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
app.get('/', (req, res) => {
  res.send(generateDashboard());
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Memory Dashboard running on port ${PORT}`);
  console.log(`Open: http://localhost:${PORT}`);
});
