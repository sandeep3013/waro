/**
 * WARO - SMART ALLOCATION CONTROLLER
 * Strategy selection, Conflict detection workbench, Interactive 1-click Approval
 */

document.addEventListener('DOMContentLoaded', () => {
  UI.initAppLayout('allocation');
  AllocationController.init();
});

const AllocationController = {
  selectedStrategy: 'Smart Balanced',

  init: function() {
    this.bindEvents();
    this.renderStrategyCards();
    this.renderConflicts();
    this.renderAllocationQueue();

    window.addEventListener('waro_state_updated', () => {
      this.renderConflicts();
      this.renderAllocationQueue();
    });
  },

  bindEvents: function() {
    // Strategy selection cards
    document.querySelectorAll('.strategy-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.strategy-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedStrategy = card.dataset.strategy;
        this.renderConflicts();
        ToastService.show(`Allocation strategy switched to "${this.selectedStrategy}".`, 'info', 'Strategy Changed');
      });
    });
  },

  renderStrategyCards: function() {
    const cards = document.querySelectorAll('.strategy-card');
    cards.forEach(c => {
      if (c.dataset.strategy === this.selectedStrategy) {
        c.classList.add('selected');
      } else {
        c.classList.remove('selected');
      }
    });
  },

  renderConflicts: function() {
    const container = document.getElementById('conflictWorkbenchContainer');
    if (!container) return;

    const state = StorageService.getState();
    const urgentOrder = state.orders.find(o => o.id === 'ORD-1042');
    const competingOrder = state.orders.find(o => o.id === 'ORD-1048');
    const wm = state.inventory.find(i => i.sku === 'SKU-WM-101');
    const availableWM = wm ? Math.max(0, wm.totalStock - wm.reservedStock - wm.damagedStock) : 7;

    if (!urgentOrder || urgentOrder.status === 'Allocated' || urgentOrder.status === 'Dispatched') {
      container.innerHTML = `
        <div style="padding: 2.5rem; text-align: center; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
          <div style="width: 48px; height: 48px; border-radius: var(--radius-full); background: var(--success-bg); color: var(--success); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--text-main);">Zero Unresolved Stock Conflicts</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 480px; margin: 0.4rem auto 1.25rem;">
            All conflicting orders have been resolved through the Smart Decision Engine. Orders are advancing smoothly through picking and packing.
          </p>
          <button class="btn btn-secondary btn-sm" onclick="StorageService.resetDemoData(); AllocationController.init();">
            <i data-lucide="refresh-cw" style="width: 14px; height: 14px;"></i> Reset Demo Conflict Scenario
          </button>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    // Build recommendation steps dynamically based on strategy
    const steps = [
      `1. Allocate all <strong>${availableWM} available units</strong> of Wireless Mouse Pro to <strong>Critical Order #ORD-1042</strong> (Apex Global).`,
      `2. Keep remaining <strong>3 unfulfilled units</strong> of #ORD-1042 on prioritized cross-dock backlog.`,
      `3. Temporarily hold <strong>Normal Order #ORD-1048</strong> (Metro Retail, 5 units requested) until scheduled supplier restock.`,
      `4. Automatically generate <strong>Purchase Order (PO-941)</strong> for 30 replenishment units to primary vendor.`,
      `5. Notify Shift Supervisor and update dispatch queue SLA.`
    ];

    container.innerHTML = `
      <div class="card" style="border: 2px solid #f87171; background: #fffdfd; box-shadow: var(--shadow-md);">
        <div class="card-header" style="border-bottom: 1px solid #fecaca; padding-bottom: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="priority-badge priority-critical" style="padding: 0.35rem 0.85rem; font-size: 0.85rem;">
              ⚠️ INVENTORY CONFLICT DETECTED
            </span>
            <span style="font-size: 1.1rem; font-weight: 800; color: #991b1b;">SKU-WM-101 (Wireless Mouse Pro)</span>
          </div>
          <span class="tag-location" style="font-size: 0.85rem;">Location: A-03-14</span>
        </div>

        <!-- Conflict Comparison Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 1.25rem 0; padding: 1rem; background: #ffffff; border-radius: var(--radius-md); border: 1px solid #fed7d7;">
          <!-- Order A -->
          <div style="padding: 1rem; border-radius: var(--radius-md); background: #fef2f2; border: 1px solid #fca5a5;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="font-weight: 800; font-size: 1rem; color: #991b1b;">Order A: #ORD-1042</span>
              <span class="priority-badge priority-critical">Critical (94/100)</span>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
              <div>Customer: <strong>Apex Global Technologies (VIP)</strong></div>
              <div>Required: <strong style="color: #dc2626; font-size: 1rem;">10 units</strong></div>
              <div>Deadline: <strong>Today 18:00 (SLA Penalty Risk)</strong></div>
              <div>Available Now: <strong>${availableWM} units</strong></div>
            </div>
          </div>

          <!-- Order B -->
          <div style="padding: 1rem; border-radius: var(--radius-md); background: var(--bg-surface-subtle); border: 1px solid var(--border-light);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="font-weight: 800; font-size: 1rem; color: var(--text-main);">Order B: #ORD-1048</span>
              <span class="priority-badge priority-medium">Medium (58/100)</span>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
              <div>Customer: <strong>Metro Retail Outlets</strong></div>
              <div>Required: <strong>5 units</strong></div>
              <div>Deadline: <strong>In 3 Days (Standard SLA)</strong></div>
              <div>Status: <strong>Queued for Allocation</strong></div>
            </div>
          </div>
        </div>

        <!-- Decision Engine Recommendation Card -->
        <div style="background: #ffffff; border: 1.5px solid var(--primary); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.25rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
            <div class="ai-glow-badge"><i data-lucide="sparkles" style="width: 14px; height: 14px;"></i> Decision Engine</div>
            <h4 style="font-size: 1rem; font-weight: 800; color: var(--primary);">Recommended Action Plan (${this.selectedStrategy} Mode):</h4>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.88rem; color: var(--text-main); margin-bottom: 1rem;">
            ${steps.map(s => `<div>${s}</div>`).join('')}
          </div>

          <div style="font-size: 0.8rem; color: var(--text-secondary); padding: 0.6rem; background: var(--primary-light); border-radius: var(--radius-sm);">
            <strong>Operational Impact:</strong> Prevents $5,000 SLA penalty breach on Tier 1 VIP account. Metro Retail order has 72 hours buffer until fulfillment cutoff.
          </div>
        </div>

        <!-- Decision Actions -->
        <div style="display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem;">
          <button class="btn btn-secondary" onclick="AllocationController.rejectDecision()">Reject</button>
          <button class="btn btn-secondary" onclick="AllocationController.openModifyModal()">Modify Decision</button>
          <button class="btn btn-primary btn-lg" onclick="AllocationController.approveDecision()">
            <i data-lucide="check-circle" style="width: 18px; height: 18px;"></i>
            Approve Decision & Dispatch Wave
          </button>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  approveDecision: function() {
    const orderId = 'ORD-1042';
    const order = StorageService.getOrderById(orderId);
    if (!order) return;

    // Update order status
    order.status = 'Allocated';
    order.risk = 'Allocated (7 Units) - Picking Assigned';
    if (order.timeline && order.timeline[3]) {
      order.timeline[3].status = 'completed';
      order.timeline[3].time = '17:05';
    }
    if (order.timeline && order.timeline[4]) {
      order.timeline[4].status = 'active';
    }
    StorageService.updateOrder(orderId, order);

    // Reserve 7 units of Wireless Mouse
    const wm = StorageService.getInventory().find(i => i.sku === 'SKU-WM-101');
    if (wm) {
      StorageService.updateInventoryItem('SKU-WM-101', {
        reservedStock: wm.reservedStock + 7
      });
    }

    // Spawn / Activate picking task
    const task = StorageService.getPickingTasks().find(t => t.orderId === orderId);
    if (task) {
      StorageService.updatePickingTask(task.taskId, { status: 'In Progress' });
    }

    // Log and notify
    StorageService.addActivityLog('Alex Morgan (Manager)', 'Approved Smart Allocation for ORD-1042 (7 Wireless Mice allocated to VIP order, ORD-1048 held).', 'success', 'Allocation Approved');
    ToastService.show('Allocation approved successfully. Picking task PK-204 dispatched.', 'success', 'Fulfillment Executed');

    this.renderConflicts();
    this.renderAllocationQueue();
    UI.updateLiveBadges();
  },

  modifyDecision: function(customAlloc) {
    ToastService.show(`Manual override applied: ${customAlloc} units allocated.`, 'info', 'Allocation Modified');
    this.approveDecision();
  },

  rejectDecision: function() {
    ToastService.show('Smart Allocation recommendation was dismissed. Orders remain in pending status.', 'warning', 'Decision Rejected');
  },

  openModifyModal: function() {
    const custom = prompt('Enter custom quantity to allocate to #ORD-1042 (0 to 7):', '7');
    if (custom !== null) {
      this.modifyDecision(parseInt(custom, 10) || 7);
    }
  },

  renderAllocationQueue: function() {
    const tbody = document.getElementById('allocationQueueTableBody');
    if (!tbody) return;

    const orders = StorageService.getOrders().filter(o => ['New', 'Inventory Checking', 'Allocated'].includes(o.status));

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">No orders currently pending allocation.</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><span class="tag-sku">${o.id}</span></td>
        <td style="font-weight: 700;">${o.customer}</td>
        <td>${o.items.map(i => `${i.qty}x ${i.name}`).join(', ')}</td>
        <td><span class="priority-badge ${o.priority === 'Critical' ? 'priority-critical' : o.priority === 'High' ? 'priority-high' : 'priority-medium'}">${o.priority}</span></td>
        <td><span class="badge ${o.status === 'Allocated' ? 'badge-primary' : 'badge-warning'}">${o.status}</span></td>
        <td style="font-size: 0.8rem; color: var(--text-secondary);">${o.deadline.replace('T', ' ')}</td>
        <td style="text-align: right;">
          ${o.status !== 'Allocated' ? `
            <button class="btn btn-primary btn-sm" onclick="AllocationController.approveDecision()">Allocate Now</button>
          ` : `
            <span class="badge badge-success">Allocated</span>
          `}
        </td>
      </tr>
    `).join('');
  }
};

if (typeof window !== 'undefined') {
  window.AllocationController = AllocationController;
}
