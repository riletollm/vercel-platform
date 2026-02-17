/**
 * Token Usage Dashboard - Client-side Logic
 * Fetches data from API endpoints and renders charts/tables
 */

let charts = {};
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const CURRENCY_SYMBOL = '£';
const CURRENCY_CODE = 'GBP';

/**
 * Fetch data from API endpoint
 */
async function fetchAPI(endpoint) {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    return null;
  }
}

/**
 * Update last updated timestamp
 */
function updateTimestamp() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  document.getElementById('lastUpdated').textContent = timeStr;
}

/**
 * Render summary stats
 */
async function renderSummary() {
  const data = await fetchAPI('/api/summary');
  if (!data) return;

  const container = document.getElementById('summaryContainer');
  container.innerHTML = '';

  const periods = [
    { key: 'week', label: 'This Week', emoji: '📅' },
    { key: 'month', label: 'This Month', emoji: '📆' },
    { key: 'allTime', label: 'All Time', emoji: '🕐' },
  ];

  for (const { key, label, emoji } of periods) {
    const stats = data[key];

    const card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML = `
      <div class="stat-label">${emoji} ${label}</div>
      <div class="stat-value">${CURRENCY_SYMBOL}${stats.totalCost.toFixed(4)}</div>
      <div class="stat-subtext">${stats.totalTokens.toLocaleString()} tokens</div>
      <div class="time-period">
        ${stats.totalSessions} sessions • ${stats.entries} entries<br>
        Avg: ${CURRENCY_SYMBOL}${stats.avgCostPerSession.toFixed(4)}/session
      </div>
    `;
    container.appendChild(card);
  }
}

/**
 * Render Cost by Model chart (pie chart)
 */
async function renderCostByModel() {
  const data = await fetchAPI('/api/cost-by-model');
  if (!data || data.length === 0) return;

  const ctx = document.getElementById('costByModelChart').getContext('2d');

  // Destroy existing chart if it exists
  if (charts.costByModel) {
    charts.costByModel.destroy();
  }

  const colors = [
    '#3399ff', '#9933ff', '#ff8800', '#0099ff',
    '#bb00ff', '#ff6600', '#3366ff', '#9933ff',
    '#ff9900', '#3399ff',
  ];

  const borderColors = [
    '#3399ff', '#9933ff', '#ff8800', '#0099ff',
    '#bb00ff', '#ff6600', '#3366ff', '#9933ff',
    '#ff9900', '#3399ff',
  ];

  charts.costByModel = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.model),
      datasets: [
        {
          data: data.map(d => d.cost),
          backgroundColor: colors.slice(0, data.length).map(c => c + '40'),
          borderColor: borderColors.slice(0, data.length),
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            padding: 15,
            font: { size: 12, family: "'Courier New', monospace" },
            color: '#3399ff',
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const cost = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((cost / total) * 100).toFixed(1);
              return `${CURRENCY_SYMBOL}${cost.toFixed(4)} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

/**
 * Render Cost by Tag chart (horizontal bar)
 */
async function renderCostByTag() {
  const data = await fetchAPI('/api/cost-by-tag');
  if (!data || data.length === 0) return;

  const ctx = document.getElementById('costByTagChart').getContext('2d');

  // Destroy existing chart if it exists
  if (charts.costByTag) {
    charts.costByTag.destroy();
  }

  charts.costByTag = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.tag),
      datasets: [
        {
          label: `Cost (${CURRENCY_CODE})`,
          data: data.map(d => d.cost),
          backgroundColor: '#ff880040',
          borderColor: '#ff8800',
          borderWidth: 2,
          borderRadius: 4,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: { padding: 15, font: { size: 12, family: "'Courier New', monospace" }, color: '#ff8800' },
        },
        tooltip: {
          callbacks: {
            label: (context) => `${CURRENCY_SYMBOL}${context.parsed.x.toFixed(4)}`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          title: { display: true, text: `Cost (${CURRENCY_CODE})`, color: '#ff8800' },
          ticks: { color: '#ff8800' },
          grid: { color: 'rgba(255, 136, 0, 0.2)' },
        },
        y: {
          ticks: { color: '#ff8800' },
          grid: { color: 'rgba(255, 136, 0, 0.2)' },
        },
      },
    },
  });
}

/**
 * Render Session Timeline (line chart)
 */
async function renderTimeline() {
  const data = await fetchAPI('/api/timeline');
  if (!data || data.length === 0) return;

  const ctx = document.getElementById('timelineChart').getContext('2d');

  // Destroy existing chart if it exists
  if (charts.timeline) {
    charts.timeline.destroy();
  }

  const colors = [
    '#3399ff', '#9933ff', '#ff8800', '#0099ff',
    '#bb00ff', '#ff6600', '#3366ff', '#9933ff',
    '#ff9900', '#3399ff',
  ];

  const datasets = data.map((session, idx) => ({
    label: session.sessionKey,
    data: session.points.map(p => ({
      x: new Date(p.timestamp),
      y: p.cost,
    })),
    borderColor: colors[idx % colors.length],
    backgroundColor: colors[idx % colors.length] + '40',
    borderWidth: 2,
    tension: 0.3,
    fill: false,
    pointRadius: 4,
    pointHoverRadius: 6,
    pointBackgroundColor: colors[idx % colors.length],
    pointBorderColor: '#0a0e27',
    pointBorderWidth: 2,
  }));

  charts.timeline = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            padding: 15,
            font: { size: 11, family: "'Courier New', monospace" },
            color: '#3399ff',
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(10, 14, 39, 0.9)',
          borderColor: '#3399ff',
          borderWidth: 1,
          callbacks: {
            label: (context) => {
              const cost = context.parsed.y;
              return `${context.dataset.label}: ${CURRENCY_SYMBOL}${cost.toFixed(4)}`;
            },
          },
        },
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            displayFormats: { day: 'MMM D' },
          },
          title: { display: true, color: '#3399ff' },
          ticks: { color: '#3399ff' },
          grid: { color: 'rgba(51, 153, 255, 0.1)' },
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: `Cumulative Cost (${CURRENCY_CODE})`, color: '#3399ff' },
          ticks: { color: '#3399ff' },
          grid: { color: 'rgba(51, 153, 255, 0.1)' },
        },
      },
    },
  });
}

/**
 * Render Model Comparison Table
 */
async function renderModelTable() {
  const data = await fetchAPI('/api/cost-by-model');
  if (!data) return;

  const tbody = document.getElementById('modelTableBody');
  tbody.innerHTML = '';

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">No data</td></tr>';
    return;
  }

  for (const model of data) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${model.model}</strong></td>
      <td class="cost">${CURRENCY_SYMBOL}${model.cost.toFixed(4)}</td>
      <td>${model.tokens.toLocaleString()}</td>
      <td>${model.count}</td>
    `;
    tbody.appendChild(row);
  }
}

/**
 * Render Tag Usage Table
 */
async function renderTagTable() {
  const data = await fetchAPI('/api/cost-by-tag');
  if (!data) return;

  const tbody = document.getElementById('tagTableBody');
  tbody.innerHTML = '';

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">No data</td></tr>';
    return;
  }

  for (const tag of data) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${tag.tag}</strong></td>
      <td class="cost">${CURRENCY_SYMBOL}${tag.cost.toFixed(4)}</td>
      <td>${tag.tokens.toLocaleString()}</td>
      <td>${tag.count}</td>
    `;
    tbody.appendChild(row);
  }
}

/**
 * Render Recent Sessions Table
 */
async function renderSessionTable() {
  const data = await fetchAPI('/api/sessions');
  if (!data) return;

  const tbody = document.getElementById('sessionTableBody');
  tbody.innerHTML = '';

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">No data</td></tr>';
    return;
  }

  for (const session of data) {
    const tagsHTML = session.tags.length > 0
      ? session.tags.map(t => `<span class="tag">${t}</span>`).join('')
      : '<span style="color: #999;">—</span>';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${session.sessionKey}</strong></td>
      <td class="cost">${CURRENCY_SYMBOL}${session.cost.toFixed(4)}</td>
      <td>${session.tokens.toLocaleString()}</td>
      <td>${session.count}</td>
      <td><div class="tags-cell">${tagsHTML}</div></td>
    `;
    tbody.appendChild(row);
  }
}

/**
 * Check if data exists and toggle empty state
 */
async function checkDataExists() {
  const summary = await fetchAPI('/api/summary');
  const hasData =
    summary &&
    (summary.allTime.entries > 0 ||
      summary.week.entries > 0 ||
      summary.month.entries > 0);

  if (!hasData) {
    document.getElementById('chartsContainer').style.display = 'none';
    document.getElementById('tablesContainer').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
  } else {
    document.getElementById('chartsContainer').style.display = 'grid';
    document.getElementById('tablesContainer').style.display = 'grid';
    document.getElementById('emptyState').style.display = 'none';
  }
}

/**
 * Refresh all data
 */
async function refreshDashboard() {
  updateTimestamp();
  await checkDataExists();
  await renderSummary();
  await renderCostByModel();
  await renderCostByTag();
  await renderTimeline();
  await renderModelTable();
  await renderTagTable();
  await renderSessionTable();
}

/**
 * Initialize dashboard
 */
async function initDashboard() {
  console.log('🚀 Initializing Token Usage Dashboard...');
  await refreshDashboard();

  // Setup auto-refresh every 5 minutes
  setInterval(refreshDashboard, REFRESH_INTERVAL);
  console.log('✅ Dashboard ready. Auto-refreshing every 5 minutes.');
}

// Start on page load
document.addEventListener('DOMContentLoaded', initDashboard);
