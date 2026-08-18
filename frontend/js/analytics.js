/**
 * WARO - ANALYTICS & WHAT-IF SIMULATOR CONTROLLER
 * Chart.js Telemetry Visualizations, Operational KPI Indexes, Non-Destructive What-If Simulation
 */

document.addEventListener('DOMContentLoaded', () => {
  UI.initAppLayout('analytics');
  AnalyticsController.init();
});

const AnalyticsController = {
  charts: {},

  init: function() {
    this.bindEvents();
    this.initCharts();
    this.renderWorkerLeaderboard();
    this.populateSimulatorProducts();
    this.runSimulation(); // Default run with seed numbers

    window.addEventListener('waro_state_updated', () => {
      this.updateCharts();
    });
  },

  bindEvents: function() {
    const simBtn = document.getElementById('runSimBtn');
    if (simBtn) {
      simBtn.addEventListener('click', () => this.runSimulation());
    }

    const simProductSelect = document.getElementById('simProductSelect');
    if (simProductSelect) {
      simProductSelect.addEventListener('change', (e) => {
        const sku = e.target.value;
        const item = StorageService.getInventory().find(i => i.sku === sku);
        if (item) {
          const avail = Math.max(0, item.totalStock - item.reservedStock - item.damagedStock);
          document.getElementById('simCurrentStock').value = avail;
          this.runSimulation();
        }
      });
    }
  },

  populateSimulatorProducts: function() {
    const select = document.getElementById('simProductSelect');
    if (!select) return;

    const inventory = StorageService.getInventory();
    select.innerHTML = inventory.map(item => `
      <option value="${item.sku}" ${item.sku === 'SKU-WM-101' ? 'selected' : ''}>
        ${item.name} (${item.sku}) - Avail: ${Math.max(0, item.totalStock - item.reservedStock - item.damagedStock)}
      </option>
    `).join('');
  },

  runSimulation: function() {
    const select = document.getElementById('simProductSelect');
    const skuName = select ? select.options[select.selectedIndex].text.split(' - ')[0] : 'Wireless Mouse Pro';
    const currentStock = parseInt(document.getElementById('simCurrentStock').value, 10) || 7;
    const urgentQty = parseInt(document.getElementById('simUrgentQty').value, 10) || 10;
    const normalQty = parseInt(document.getElementById('simNormalQty').value, 10) || 5;

    const sim = DecisionEngine.simulateWhatIf(skuName, currentStock, urgentQty, normalQty);

    document.getElementById('simResUrgent').innerHTML = `
      <div style="font-size: 1.5rem; font-weight: 800; color: ${sim.urgentFulfilled < sim.urgentRequested ? 'var(--danger)' : 'var(--success)'};">
        ${sim.urgentFulfilled} / ${sim.urgentRequested}
      </div>
      <div style="font-size: 0.8rem; color: var(--text-secondary);">${sim.urgentPct}% Fulfilled</div>
    `;

    document.getElementById('simResNormal').innerHTML = `
      <div style="font-size: 1.5rem; font-weight: 800; color: ${sim.normalFulfilled < sim.normalRequested ? 'var(--danger)' : 'var(--success)'};">
        ${sim.normalFulfilled} / ${sim.normalRequested}
      </div>
      <div style="font-size: 0.8rem; color: var(--text-secondary);">${sim.normalPct}% Fulfilled</div>
    `;

    document.getElementById('simResRemaining').textContent = `${sim.remainingStock} units`;
    document.getElementById('simResDeficit').textContent = `${sim.deficit} units`;

    const riskBadge = document.getElementById('simResRisk');
    riskBadge.textContent = sim.riskLevel;
    riskBadge.className = `badge ${sim.riskClass}`;

    document.getElementById('simResRecommendation').textContent = sim.recommendation;
  },

  initCharts: function() {
    if (typeof Chart === 'undefined') return;

    const state = StorageService.getState();
    const orders = state.orders || [];

    // 1. Stage Cycle Times vs SLA Benchmark Chart
    const ctxCycle = document.getElementById('cycleTimeChart');
    if (ctxCycle) {
      this.charts.cycle = new Chart(ctxCycle, {
        type: 'bar',
        data: {
          labels: ['Picking Stage', 'Packing Stage', 'QC Verification', 'Dispatch Dock'],
          datasets: [
            {
              label: 'Actual Average (mins)',
              data: [18, 6, 4, 14],
              backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#10b981'],
              borderRadius: 6
            },
            {
              label: 'SLA Target (mins)',
              data: [10, 5, 5, 15],
              backgroundColor: '#cbd5e1',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top' } },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Minutes' } }
          }
        }
      });
    }

    // 2. Orders by Status Distribution Chart
    const ctxStatus = document.getElementById('orderStatusChart');
    if (ctxStatus) {
      const counts = {
        'New / Checking': orders.filter(o => ['New', 'Inventory Checking'].includes(o.status)).length,
        'Allocated': orders.filter(o => o.status === 'Allocated').length,
        'Picking': orders.filter(o => o.status === 'Picking').length,
        'Packing & QC': orders.filter(o => ['Packing', 'Quality Check'].includes(o.status)).length,
        'Ready / Dispatched': orders.filter(o => ['Ready to Dispatch', 'Dispatched', 'Delivered'].includes(o.status)).length
      };

      this.charts.status = new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
          labels: Object.keys(counts),
          datasets: [{
            data: Object.values(counts),
            backgroundColor: ['#f59e0b', '#4f46e5', '#0284c7', '#8b5cf6', '#10b981']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    // 3. Exceptions Breakdown Chart
    const ctxEx = document.getElementById('exceptionsTypeChart');
    if (ctxEx) {
      const exList = state.exceptions || [];
      const exTypes = {};
      exList.forEach(e => {
        exTypes[e.type] = (exTypes[e.type] || 0) + 1;
      });

      this.charts.exceptions = new Chart(ctxEx, {
        type: 'polarArea',
        data: {
          labels: Object.keys(exTypes),
          datasets: [{
            data: Object.values(exTypes),
            backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#ec4899']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }
  },

  updateCharts: function() {
    if (this.charts.status) {
      const orders = StorageService.getOrders();
      const counts = [
        orders.filter(o => ['New', 'Inventory Checking'].includes(o.status)).length,
        orders.filter(o => o.status === 'Allocated').length,
        orders.filter(o => o.status === 'Picking').length,
        orders.filter(o => ['Packing', 'Quality Check'].includes(o.status)).length,
        orders.filter(o => ['Ready to Dispatch', 'Dispatched', 'Delivered'].includes(o.status)).length
      ];
      this.charts.status.data.datasets[0].data = counts;
      this.charts.status.update();
    }
  },

  renderWorkerLeaderboard: function() {
    const tbody = document.getElementById('workerLeaderboardTableBody');
    if (!tbody) return;

    const workers = StorageService.getState().workers || [];
    tbody.innerHTML = workers.map((w, idx) => `
      <tr>
        <td style="font-weight: 800; color: var(--primary);">#${idx + 1}</td>
        <td>
          <div style="font-weight: 700; color: var(--text-main);">${w.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${w.role} • ${w.shift} Shift</div>
        </td>
        <td><span class="badge ${w.status === 'Active' ? 'badge-success' : 'badge-warning'}">${w.status}</span></td>
        <td style="font-weight: 700; text-align: center;">${w.completedToday}</td>
        <td style="font-weight: 800; color: #059669; text-align: right;">${w.efficiency}</td>
      </tr>
    `).join('');
  }
};

if (typeof window !== 'undefined') {
  window.AnalyticsController = AnalyticsController;
}
