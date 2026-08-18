/**
 * WARO - DASHBOARD CONTROLLER
 * KPI Cards, AI Decision Engine Recommendations, Health Score Gauge, Bottlenecks, Activity Feed
 */

document.addEventListener('DOMContentLoaded', () => {
  UI.initAppLayout('dashboard');
  DashboardController.init();
});

const DashboardController = {
  init: function() {
    this.renderKPIs();
    this.renderHealthScore();
    this.renderBottleneckBanner();
    this.renderAIDecisionCards();
    this.renderActivityTimeline();

    // Listen for state changes
    window.addEventListener('waro_state_updated', () => {
      this.renderKPIs();
      this.renderHealthScore();
      this.renderBottleneckBanner();
      this.renderAIDecisionCards();
      this.renderActivityTimeline();
    });
  },

  renderKPIs: function() {
    const state = StorageService.getState();
    const orders = state.orders || [];
    const inventory = state.inventory || [];
    const pickingTasks = state.pickingTasks || [];

    const totalOrdersCount = orders.length;
    const pendingPickingCount = orders.filter(o => ['Allocated', 'Picking'].includes(o.status)).length;
    const urgentPickingCount = orders.filter(o => ['Allocated', 'Picking'].includes(o.status) && (o.priority === 'Critical' || o.priority === 'High')).length;

    let lowStockCount = 0;
    let outOfStockCount = 0;
    let criticalStockCount = 0;

    inventory.forEach(item => {
      const avail = item.totalStock - item.reservedStock - item.damagedStock;
      if (item.totalStock <= 0 || avail <= 0) outOfStockCount++;
      else if (avail <= 2) criticalStockCount++;
      else if (avail <= item.reorderLevel) lowStockCount++;
    });

    const dispatchedCount = orders.filter(o => o.status === 'Dispatched' || o.status === 'Delivered').length;
    const fulfillRate = totalOrdersCount > 0 ? Math.round((dispatchedCount / totalOrdersCount) * 100 + 42) : 87;

    // Update DOM elements
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('kpiTotalOrders', totalOrdersCount);
    setVal('kpiPendingPicking', pendingPickingCount);
    setVal('kpiPendingPickingSub', `${urgentPickingCount} urgent SLA`);
    setVal('kpiLowStock', lowStockCount + criticalStockCount);
    setVal('kpiLowStockSub', `${criticalStockCount} critical items`);
    setVal('kpiOutOfStock', outOfStockCount);
    setVal('kpiFulfillmentRate', `${Math.min(99, fulfillRate)}%`);
  },

  renderHealthScore: function() {
    const state = StorageService.getState();
    const health = DecisionEngine.calculateWarehouseHealth(state.inventory, state.orders, state.exceptions);

    const scoreEl = document.getElementById('healthScoreValue');
    const badgeEl = document.getElementById('healthScoreBadge');
    const circleEl = document.getElementById('healthScoreCircle');

    if (scoreEl) scoreEl.textContent = health.score;
    if (badgeEl) {
      badgeEl.textContent = health.status;
      badgeEl.className = `badge badge-${health.statusClass}`;
    }

    if (circleEl) {
      // Stroke circumference is 2 * PI * r = 2 * 3.14159 * 60 = ~377
      const offset = 377 - (377 * (health.score / 100));
      circleEl.style.strokeDashoffset = offset;
    }

    // Breakdown bars
    const b = health.breakdown;
    const updateBar = (id, fillId, val) => {
      const valEl = document.getElementById(id);
      const fillEl = document.getElementById(fillId);
      if (valEl) valEl.textContent = `${val}%`;
      if (fillEl) {
        fillEl.style.width = `${val}%`;
        fillEl.style.background = val > 80 ? 'var(--success)' : val > 65 ? 'var(--warning)' : 'var(--danger)';
      }
    };

    updateBar('barInvVal', 'barInvFill', b.inventoryHealth);
    updateBar('barFulfillVal', 'barFulfillFill', b.fulfillmentRate);
    updateBar('barPickVal', 'barPickFill', b.pickingEfficiency);
    updateBar('barQualityVal', 'barQualityFill', b.qualityPassRate);
    updateBar('barExVal', 'barExFill', b.exceptionIndex);
  },

  renderBottleneckBanner: function() {
    const container = document.getElementById('bottleneckContainer');
    if (!container) return;

    const bottlenecks = DecisionEngine.detectBottlenecks(StorageService.getSettings());
    if (bottlenecks.length === 0) {
      container.innerHTML = '';
      return;
    }

    const b = bottlenecks[0];
    container.innerHTML = `
      <div class="bottleneck-banner">
        <div class="bottleneck-content">
          <div class="bottleneck-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div>
            <div class="bottleneck-title">OPERATIONAL BOTTLENECK DETECTED: ${b.stage.toUpperCase()} STAGE (${b.performanceText})</div>
            <div class="bottleneck-desc">${b.rootCause} Current cycle: <strong>${b.actualDuration}</strong> (Target: ${b.targetDuration}).</div>
            <div style="font-size: 0.8rem; font-weight: 700; color: #991b1b; margin-top: 4px;">Recommended: "${b.recommendation}"</div>
          </div>
        </div>
        <div>
          <button class="btn btn-danger btn-sm" onclick="DashboardController.resolveBottleneck()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Auto-Rebalance Staff
          </button>
        </div>
      </div>
    `;
  },

  resolveBottleneck: function() {
    StorageService.addActivityLog('Alex Morgan (Manager)', 'Auto-rebalanced 2 workers to Zone A Picking to resolve cycle bottleneck.', 'success', 'Staffing Rebalanced');
    ToastService.show('2 workers reassigned to Zone A Picking. Bottleneck cleared.', 'success', 'Staffing Optimized');
    const container = document.getElementById('bottleneckContainer');
    if (container) container.innerHTML = '';
  },

  renderAIDecisionCards: function() {
    const listEl = document.getElementById('aiDecisionsList');
    if (!listEl) return;

    const state = StorageService.getState();
    const urgentOrder = state.orders.find(o => o.id === 'ORD-1042');
    const wmItem = state.inventory.find(i => i.sku === 'SKU-WM-101');
    const availableWM = wmItem ? Math.max(0, wmItem.totalStock - wmItem.reservedStock - wmItem.damagedStock) : 7;

    const cardsHtml = [];

    // CARD 1: DEMO CASE 1 - URGENT ORDER CONFLICT #ORD-1042
    if (urgentOrder && urgentOrder.status !== 'Allocated' && urgentOrder.status !== 'Dispatched') {
      cardsHtml.push(`
        <div class="ai-decision-card urgent">
          <div class="decision-card-top">
            <div>
              <div class="decision-headline">
                <span class="priority-badge priority-critical">Critical Action</span>
                <span class="decision-title">URGENT ORDER #ORD-1042 CONFLICT</span>
                <span class="tag-sku">SKU-WM-101 (Wireless Mouse)</span>
              </div>
              <div class="decision-meta">
                <span>Customer: <strong>Apex Global Technologies</strong> (Tier 1 VIP)</span>
                <span>•</span>
                <span>Deadline: <strong>Today 18:00 (SLA At Risk)</strong></span>
                <span>•</span>
                <span>Demand: <strong>10 units req. / ${availableWM} available</strong></span>
              </div>
            </div>
            <div class="decision-actions">
              <button class="btn btn-secondary btn-sm" onclick="window.location.href='allocation.html'">Review Details</button>
              <button class="btn btn-primary btn-sm" onclick="DashboardController.approveUrgentAllocation('ORD-1042')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Approve Recommendation
              </button>
            </div>
          </div>
          <div class="decision-body">
            <div class="decision-quote">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              <span>"Allocate all ${availableWM} available units to urgent VIP order #ORD-1042, hold competing normal order #ORD-1048, and queue remaining 3 units for cross-dock fulfillment."</span>
            </div>
            <div class="decision-rationale">
              <strong>Why this decision:</strong> Priority Engine score is 94/100 (Critical). Apex Global SLA breach carries penalty, while Metro Retail order #ORD-1048 has 72 hours until delivery deadline.
            </div>
          </div>
        </div>
      `);
    }

    // CARD 2: LOW STOCK REORDER RECOMMENDATION
    if (wmItem && availableWM <= wmItem.reorderLevel) {
      cardsHtml.push(`
        <div class="ai-decision-card warning">
          <div class="decision-card-top">
            <div>
              <div class="decision-headline">
                <span class="priority-badge priority-high">Reorder Alert</span>
                <span class="decision-title">STOCK BREACH: Wireless Mouse Pro</span>
                <span class="tag-location">Location: A-03-14</span>
              </div>
              <div class="decision-meta">
                <span>Available: <strong>${availableWM} units</strong></span>
                <span>•</span>
                <span>Reorder Threshold: <strong>${wmItem.reorderLevel} units</strong></span>
                <span>•</span>
                <span>Lead Time: <strong>24 Hours</strong></span>
              </div>
            </div>
            <div class="decision-actions">
              <button class="btn btn-success btn-sm" onclick="DashboardController.createReorderRecommendation('SKU-WM-101', 30)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                Order 30 Units
              </button>
            </div>
          </div>
          <div class="decision-body">
            <div class="decision-quote">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              <span>"Available stock (${availableWM}) is below safety threshold (${wmItem.reorderLevel}). Recommended replenishment: 30 units from Primary Vendor."</span>
            </div>
          </div>
        </div>
      `);
    }

    // CARD 3: PICKING DELAY & ROUTE OPTIMIZATION
    cardsHtml.push(`
      <div class="ai-decision-card info">
        <div class="decision-card-top">
          <div>
            <div class="decision-headline">
              <span class="badge badge-info">Optimization</span>
              <span class="decision-title">TASK DELAY: Picking Task #PK-203</span>
              <span class="badge badge-neutral">Worker: Marcus Vance</span>
            </div>
            <div class="decision-meta">
              <span>Order: <strong>#ORD-1039</strong></span>
              <span>•</span>
              <span>Locations: <strong>A-03-14, B-01-07, A-03-18, B-01-05</strong></span>
            </div>
          </div>
          <div class="decision-actions">
            <button class="btn btn-primary btn-sm" onclick="window.location.href='picking.html'">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Apply Route Optimizer
            </button>
          </div>
        </div>
        <div class="decision-body">
          <div class="decision-quote">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
            <span>"Current travel sequence is zigzagging between Aisles A and B. Reordering path saves 5.2 minutes walking time."</span>
          </div>
        </div>
      </div>
    `);

    listEl.innerHTML = cardsHtml.join('');
  },

  approveUrgentAllocation: function(orderId) {
    const order = StorageService.getOrderById(orderId);
    if (!order) return;

    // 1. Update order status
    order.status = 'Allocated';
    order.risk = 'Resolved / Assigned to Wave';
    if (order.timeline && order.timeline[3]) {
      order.timeline[3].status = 'completed';
      order.timeline[3].time = '17:05';
    }
    if (order.timeline && order.timeline[4]) {
      order.timeline[4].status = 'active';
    }
    StorageService.updateOrder(orderId, order);

    // 2. Adjust reserved stock
    const wm = StorageService.getInventory().find(i => i.sku === 'SKU-WM-101');
    if (wm) {
      StorageService.updateInventoryItem('SKU-WM-101', {
        reservedStock: wm.reservedStock + 7
      });
    }

    // 3. Spawn or activate Picking Task
    const existingTask = StorageService.getPickingTasks().find(t => t.orderId === orderId);
    if (existingTask) {
      StorageService.updatePickingTask(existingTask.taskId, { status: 'In Progress' });
    }

    // 4. Log and notify
    StorageService.addActivityLog('Alex Morgan (Manager)', `Approved Smart Allocation for Urgent Order #${orderId}. 7 units reserved, picking task dispatched.`, 'success', 'Allocation Approved');
    ToastService.show(`Smart Allocation approved for ${orderId}. Order moved to Picking queue.`, 'success', 'Decision Executed');

    // Refresh UI
    this.renderKPIs();
    this.renderAIDecisionCards();
    this.renderActivityTimeline();
    UI.updateLiveBadges();
  },

  createReorderRecommendation: function(sku, qty) {
    const item = StorageService.getInventory().find(i => i.sku === sku);
    const name = item ? item.name : sku;

    StorageService.updateInventoryItem(sku, {
      totalStock: (item ? item.totalStock : 10) + qty
    });

    StorageService.addActivityLog('Alex Morgan (Manager)', `Approved automated replenishment PO for ${qty} units of ${name}.`, 'info', 'PO Created');
    ToastService.show(`Purchase Order for ${qty}x ${name} dispatched to supplier. Stock updated.`, 'success', 'Replenishment Approved');

    this.renderKPIs();
    this.renderAIDecisionCards();
    this.renderActivityTimeline();
  },

  renderActivityTimeline: function() {
    const container = document.getElementById('dashboardActivityTimeline');
    if (!container) return;

    const logs = StorageService.getActivityLogs().slice(0, 6);
    container.innerHTML = logs.map(log => `
      <div class="timeline-item">
        <div class="timeline-dot ${log.type}"></div>
        <div class="timeline-header">
          <span class="timeline-title">${log.title}</span>
          <span class="timeline-time">${log.time}</span>
        </div>
        <div class="timeline-desc">${log.desc}</div>
        <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">By: ${log.user}</div>
      </div>
    `).join('');
  }
};

if (typeof window !== 'undefined') {
  window.DashboardController = DashboardController;
}
