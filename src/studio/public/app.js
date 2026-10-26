// REA Studio Frontend Logic
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  loadSystemStatus();
  loadHarEndpoints();
  loadElectronDemoGraph();
  initMockTester();
  initZeroDockerGenerator();
});

// Tab Switching
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });
}

// System Status
async function loadSystemStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    if (data.ok) {
      const pillText = document.querySelector('#system-status-pill .status-text');
      if (pillText) {
        pillText.textContent = `Core Engine Conectado (${data.toolsCount} MCP Tools)`;
      }
    }
  } catch (err) {
    console.warn('Could not fetch status:', err);
  }
}

// Load HAR Replicated Endpoints
async function loadHarEndpoints() {
  const tbody = document.getElementById('endpoints-tbody');
  const countBadge = document.getElementById('endpoints-count-badge');
  const totalRecordsSpan = document.getElementById('har-total-records');

  try {
    const res = await fetch('/api/har/endpoints');
    const data = await res.json();

    if (!data.ok || !data.endpoints) return;

    if (countBadge) countBadge.textContent = `${data.endpoints.length} Endpoints`;
    if (totalRecordsSpan) totalRecordsSpan.textContent = `${data.totalRecords} peticiones`;

    tbody.innerHTML = '';
    data.endpoints.forEach((ep) => {
      const tr = document.createElement('tr');
      const methodClass = `method-${ep.method.toLowerCase()}`;

      tr.innerHTML = `
        <td><span class="method-tag ${methodClass}">${ep.method}</span></td>
        <td><span class="path-code">${ep.pathTemplate}</span></td>
        <td><span class="status-code-tag">${ep.statuses.join(', ')}</span></td>
        <td><span class="text-muted" style="font-size: 11px; font-family: monospace;">${ep.queryParameters.length > 0 ? ep.queryParameters.join(', ') : '—'}</span></td>
        <td>
          <button class="btn btn-sm btn-outline test-btn" data-method="${ep.method}" data-path="${ep.examplePath}">
            Probar
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // Wire "Probar" buttons
    document.querySelectorAll('.test-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const method = btn.dataset.method;
        const path = btn.dataset.path;
        setMockTester(method, path);
        executeMockRequest(method, path);
      });
    });

  } catch (err) {
    console.error('Error loading HAR endpoints:', err);
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted">Error cargando endpoints de la réplica.</td></tr>`;
  }
}

// Mock Tester setup
function initMockTester() {
  const sendBtn = document.getElementById('btn-send-mock');
  const methodSelect = document.getElementById('mock-method');
  const pathInput = document.getElementById('mock-path');

  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      const method = methodSelect.value;
      const path = pathInput.value.trim();
      executeMockRequest(method, path);
    });
  }

  // Quick chips
  document.querySelectorAll('.quick-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const path = chip.dataset.path;
      const method = chip.dataset.method;
      setMockTester(method, path);
      executeMockRequest(method, path);
    });
  });
}

function setMockTester(method, path) {
  const methodSelect = document.getElementById('mock-method');
  const pathInput = document.getElementById('mock-path');
  if (methodSelect) methodSelect.value = method;
  if (pathInput) pathInput.value = path;
}

async function executeMockRequest(method, path) {
  const resBadge = document.getElementById('res-status');
  const resTime = document.getElementById('res-time');
  const codeBlock = document.getElementById('mock-response-body');

  codeBlock.textContent = `Enviando ${method} ${path}...`;
  const startTime = performance.now();

  try {
    const res = await fetch('/api/mock/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, path })
    });

    const elapsed = (performance.now() - startTime).toFixed(1);
    const data = await res.json();

    if (resTime) resTime.textContent = `${elapsed} ms`;

    if (data.matched) {
      if (resBadge) {
        resBadge.textContent = `${data.status} OK`;
        resBadge.className = 'res-status-badge status-200';
      }
      codeBlock.textContent = JSON.stringify(data.body, null, 2);
    } else {
      if (resBadge) {
        resBadge.textContent = '404 NOT FOUND';
        resBadge.className = 'res-status-badge status-404';
      }
      codeBlock.textContent = JSON.stringify(data.body, null, 2);
    }
  } catch (err) {
    codeBlock.textContent = `Error de red: ${err.message}`;
  }
}

// Zero-Docker Generator
function initZeroDockerGenerator() {
  const exportTopBtn = document.getElementById('btn-export-replica-top');
  const generateBtn = document.getElementById('btn-generate-zero-docker');
  const resultBox = document.getElementById('export-result-box');

  const handleExport = async () => {
    if (resultBox) {
      resultBox.classList.remove('hidden');
      resultBox.textContent = '⏳ Generando servidor de réplica autónomo sin Docker...';
    }

    try {
      const res = await fetch('/api/export-replica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetDir: 'standalone-replica' })
      });
      const data = await res.json();

      if (data.ok) {
        resultBox.innerHTML = `
          <strong>✓ Servidor de réplica generado exitosamente:</strong><br>
          📁 Carpeta: <code>${data.directory}</code><br>
          📊 Endpoints listos: <strong>${data.endpointsCount}</strong><br>
          ⚡ Para ejecutarlo ahora sin Docker:<br>
          <code>cd standalone-replica && node server.mjs</code>
        `;
      } else {
        resultBox.textContent = `Error generando réplica: ${data.error}`;
      }
    } catch (err) {
      resultBox.textContent = `Error de conexión: ${err.message}`;
    }
  };

  if (exportTopBtn) exportTopBtn.addEventListener('click', handleExport);
  if (generateBtn) generateBtn.addEventListener('click', handleExport);
}

// Load Electron IPC Channels Graph
async function loadElectronDemoGraph() {
  const grid = document.getElementById('channels-grid');
  if (!grid) return;

  try {
    const res = await fetch('/api/electron/demo-graph');
    const data = await res.json();

    if (!data.ok || !data.ipcChannels) return;

    grid.innerHTML = '';
    data.ipcChannels.forEach(ch => {
      const card = document.createElement('div');
      card.className = 'channel-card';
      card.innerHTML = `
        <div class="channel-card-title">📡 ${ch.name}</div>
        <div class="channel-row">
          <span>Dirección:</span>
          <span style="color: #38bdf8;">${ch.direction}</span>
        </div>
        <div class="channel-row">
          <span>Main (Servidor):</span>
          <span><code>${ch.mainMode}</code></span>
        </div>
        <div class="channel-row">
          <span>Renderer (Cliente):</span>
          <span><code>${ch.rendererMode}</code></span>
        </div>
        <div class="channel-row" style="margin-top: 8px;">
          <span>Seguridad:</span>
          <span class="status-badge badge-green">✓ Validado</span>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading IPC demo graph:', err);
  }
}
