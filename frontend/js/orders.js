/**
 * WARO - ORDERS MANAGEMENT CONTROLLER
 * Priority Score calculation breakdown, Status filters, Order Timeline Drawer
 */

document.addEventListener('DOMContentLoaded', () => {
  UI.initAppLayout('orders');
  OrdersController.init();
});

const OrdersController = {
  currentFilter: 'all',
  priorityFilter: 'all',
  searchTerm: '',

  init: function() {
    this.bindEvents();
    this.renderTable();

    window.addEventListener('waro_state_updated', () => {
      this.renderTable();
    });
  },

  bindEvents: function() {
    const search = document.getElementById('orderSearchInput');
    if (search) {
      search.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase();
        this.renderTable();
      });
    }

    const statusSel = document.getElementById('orderStatusFilter');
    if (statusSel) {
      statusSel.addEventListener('change', (e) => {
        this.currentFilter = e.target.value;
        this.renderTable();
      });
    }

    const prioSel = document.getElementById('orderPriorityFilter');
    if (prioSel) {
      prioSel.addEventListener('change', (e) => {
        this.priorityFilter = e.target.value;
        this.renderTable();
      });
    }
  },

  renderTable: function() {
    const tbody = document.getElementById('ordersTableBody');
    const countEl = document.getElementById('ordersCountText');
    if (!tbody) return;

    let orders = [...StorageService.getOrders()];

    // Search filter
    if (this.searchTerm) {
      orders = orders.filter(o =>
        o.id.toLowerCase().includes(this.searchTerm) ||
        o.customer.toLowerCase().includes(this.searchTerm) ||
        (o.carrier && o.carrier.toLowerCase().includes(this.searchTerm))
      );
    }

    // Status filter
    if (this.currentFilter !== 'all') {
      orders = orders.filter(o => o.status === this.currentFilter);
    }

    // Priority filter
    if (this.priorityFilter !== 'all') {
      orders = orders.filter(o => o.priority === this.priorityFilter);
    }

    if (countEl) countEl.textContent = `Showing ${orders.length} orders`;

    if (orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 3rem; color: var(--text-muted);">
            <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 0.5rem;">No orders matched the filter criteria</div>
            <div style="font-size: 0.85rem;">Try resetting your filters or search keywords.</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = orders.map(order => {
      // Calculate dynamic priority score and breakdown using DecisionEngine
      const priorityInfo = DecisionEngine.calculatePriorityScore(order);

      let pBadgeClass = 'priority-low';
      if (order.priority === 'Critical') pBadgeClass = 'priority-critical';
      else if (order.priority === 'High') pBadgeClass = 'priority-high';
      else if (order.priority === 'Medium') pBadgeClass = 'priority-medium';

      let statusBadgeClass = 'badge-neutral';
      if (order.status === 'Dispatched' || order.status === 'Delivered') statusBadgeClass = 'badge-success';
      else if (order.status === 'Picking' || order.status === 'Packing') statusBadgeClass = 'badge-info';
      else if (order.status === 'Quality Check') statusBadgeClass = order.risk.includes('Exception') ? 'badge-danger' : 'badge-warning';
      else if (order.status === 'New' || order.status === 'Inventory Checking') statusBadgeClass = 'badge-warning';
      else if (order.status === 'Allocated') statusBadgeClass = 'badge-primary';

      const itemsSummary = order.items.map(i => `${i.qty}x ${i.name}`).join(', ');
      const formattedCreated = order.created ? order.created.replace('T', ' ').slice(5, 16) : '08-17 09:00';
      const formattedDeadline = order.deadline ? order.deadline.replace('T', ' ').slice(5, 16) : '08-17 18:00';

      return `
        <tr>
          <td><span class="tag-sku" style="font-size: 0.85rem; font-weight: 800;">${order.id}</span></td>
          <td>
            <div class="cell-primary-text">${order.customer}</div>
            <div class="cell-secondary-text">${order.customerTier}</div>
          </td>
          <td>
            <div style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.82rem;" title="${itemsSummary}">
              ${itemsSummary}
            </div>
            <div class="cell-secondary-text">${order.items.reduce((s, i) => s + i.qty, 0)} total units</div>
          </td>
          <td style="font-weight: 700; font-family: var(--font-mono);">$${order.totalValue.toFixed(2)}</td>
          <td style="font-size: 0.8rem; color: var(--text-secondary);">${formattedCreated}</td>
          <td style="font-size: 0.8rem; font-weight: 600; color: ${order.priority === 'Critical' ? 'var(--danger)' : 'var(--text-main)'};">
            ${formattedDeadline}
          </td>
          <td>
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <span class="priority-badge ${pBadgeClass}">${order.priority} (${order.priorityScore || priorityInfo.score})</span>
              <span style="font-size: 0.72rem; color: var(--text-muted); cursor: help;" title="${priorityInfo.rationale}">
                ℹ️ View Score Factors
              </span>
            </div>
          </td>
          <td><span class="badge ${statusBadgeClass}">${order.status}</span></td>
          <td>
            <span style="font-size: 0.78rem; font-weight: 600; color: ${order.risk.includes('Risk') || order.risk.includes('SLA') || order.risk.includes('Exception') ? 'var(--danger)' : 'var(--text-secondary)'};">
              ${order.risk}
            </span>
          </td>
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-sm" onclick="OrdersController.openOrderTimelineModal('${order.id}')">
              <i data-lucide="eye" style="width: 14px; height: 14px;"></i>
              View Workflow
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
  },

  openOrderTimelineModal: function(orderId) {
    const order = StorageService.getOrderById(orderId);
    if (!order) return;

    const priorityInfo = DecisionEngine.calculatePriorityScore(order);

    document.getElementById('modalOrderId').textContent = order.id;
    document.getElementById('modalOrderCustomer').textContent = `${order.customer} (${order.customerTier})`;
    document.getElementById('modalOrderValue').textContent = `$${order.totalValue.toFixed(2)}`;
    document.getElementById('modalOrderCarrier').textContent = order.carrier || 'Standard Ground';
    document.getElementById('modalOrderRationale').textContent = priorityInfo.rationale;

    // Render 8-stage timeline
    const stages = [
      { name: 'Order Created', key: 'Order Created' },
      { name: 'Priority Scored', key: 'Priority Engine' },
      { name: 'Inventory Checked', key: 'Inventory Checking' },
      { name: 'Smart Allocation', key: 'Smart Allocation' },
      { name: 'Picking', key: 'Picking' },
      { name: 'Packing', key: 'Packing' },
      { name: 'Quality Check', key: 'Quality Check' },
      { name: 'Dispatched', key: 'Dispatch' }
    ];

    const timelineContainer = document.getElementById('modalOrderTimeline');
    timelineContainer.innerHTML = stages.map((st, idx) => {
      const orderTimelineItem = (order.timeline || []).find(t => t.stage.toLowerCase().includes(st.key.toLowerCase())) || {};
      const status = orderTimelineItem.status || 'pending';
      const time = orderTimelineItem.time || '--:--';

      return `
        <div class="timeline-step ${status}">
          <div class="step-node">${idx + 1}</div>
          <div class="step-label">${st.name}</div>
          <div style="font-size: 0.68rem; color: var(--text-muted); font-family: var(--font-mono); margin-top: 2px;">${time}</div>
        </div>
      `;
    }).join('');

    // Items list table
    const itemsTbody = document.getElementById('modalOrderItemsTbody');
    itemsTbody.innerHTML = order.items.map(item => `
      <tr>
        <td><span class="tag-sku">${item.sku}</span></td>
        <td style="font-weight: 600;">${item.name}</td>
        <td><span class="tag-location">${item.location || 'A-01-01'}</span></td>
        <td style="font-weight: 700; text-align: center;">${item.qty}</td>
        <td style="text-align: right;">$${(item.price * item.qty).toFixed(2)}</td>
      </tr>
    `).join('');

    ModalService.open('orderDetailModal');
  }
};

if (typeof window !== 'undefined') {
  window.OrdersController = OrdersController;
}
