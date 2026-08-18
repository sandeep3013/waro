/**
 * WARO - DISPATCH & SHIPPING HUB CONTROLLER
 * Courier carrier assignment, Tracking Barcodes, Handover execution, Inventory deduction
 */

document.addEventListener('DOMContentLoaded', () => {
  UI.initAppLayout('dispatch');
  DispatchController.init();
});

const DispatchController = {
  carrierFilter: 'all',

  init: function() {
    this.bindEvents();
    this.renderDispatchQueue();
    this.renderDispatchedHistory();

    window.addEventListener('waro_state_updated', () => {
      this.renderDispatchQueue();
      this.renderDispatchedHistory();
    });
  },

  bindEvents: function() {
    const filter = document.getElementById('dispatchCarrierFilter');
    if (filter) {
      filter.addEventListener('change', (e) => {
        this.carrierFilter = e.target.value;
        this.renderDispatchQueue();
      });
    }
  },

  renderDispatchQueue: function() {
    const tbody = document.getElementById('readyDispatchTableBody');
    const countEl = document.getElementById('readyDispatchCount');
    if (!tbody) return;

    let orders = StorageService.getOrders().filter(o => o.status === 'Ready to Dispatch');

    if (this.carrierFilter !== 'all') {
      orders = orders.filter(o => (o.carrier || '').includes(this.carrierFilter));
    }

    if (countEl) countEl.textContent = `${orders.length} orders ready at loading dock`;

    if (orders.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            <div style="font-weight: 700; font-size: 1rem; margin-bottom: 0.35rem;">No orders waiting on loading dock</div>
            <div style="font-size: 0.82rem;">Completed packing tasks will automatically appear here.</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><span class="tag-sku" style="font-weight: 800; font-size: 0.85rem;">${o.id}</span></td>
        <td>
          <div class="cell-primary-text">${o.customer}</div>
          <div class="cell-secondary-text">${o.customerTier}</div>
        </td>
        <td>${o.packageSize || 'Medium Box (12x9x6 in)'}</td>
        <td style="font-family: var(--font-mono); font-weight: 700;">${o.totalWeight || '1.10'} kg</td>
        <td>
          <span class="badge badge-neutral" style="font-weight: 700;">${o.carrier || 'FedEx Express'}</span>
        </td>
        <td>
          <span class="font-mono" style="font-size: 0.8rem; color: var(--primary); font-weight: 700;">
            ${o.trackingNumber || `TRK-${Math.floor(1000000 + Math.random() * 9000000)}`}
          </span>
        </td>
        <td><span class="priority-badge ${o.priority === 'Critical' ? 'priority-critical' : 'priority-high'}">${o.priority}</span></td>
        <td style="text-align: right;">
          <button class="btn btn-primary btn-sm" onclick="DispatchController.executeDispatch('${o.id}')">
            <i data-lucide="send" style="width: 14px; height: 14px;"></i>
            Dispatch Order
          </button>
        </td>
      </tr>
    `).join('');

    if (window.lucide) lucide.createIcons();
  },

  renderDispatchedHistory: function() {
    const tbody = document.getElementById('dispatchedHistoryTableBody');
    if (!tbody) return;

    const dispatched = StorageService.getOrders().filter(o => o.status === 'Dispatched' || o.status === 'Delivered').slice(0, 8);

    tbody.innerHTML = dispatched.map(o => `
      <tr>
        <td><span class="tag-sku">${o.id}</span></td>
        <td><strong>${o.customer}</strong></td>
        <td>${o.carrier || 'DHL Express'}</td>
        <td style="font-family: var(--font-mono);">${o.trackingNumber || 'DHL-8849102-EU'}</td>
        <td><span class="badge badge-success">✓ Dispatched</span></td>
        <td style="font-size: 0.8rem; color: var(--text-secondary);">${o.deadline ? o.deadline.replace('T', ' ') : 'Today'}</td>
      </tr>
    `).join('');
  },

  executeDispatch: function(orderId) {
    const order = StorageService.getOrderById(orderId);
    if (!order) return;

    // 1. Update order status
    order.status = 'Dispatched';
    if (order.timeline && order.timeline[7]) {
      order.timeline[7].status = 'completed';
      order.timeline[7].time = '17:40';
    }
    StorageService.updateOrder(orderId, order);

    // 2. Relieve reserved inventory
    const inventory = StorageService.getInventory();
    order.items.forEach(orderItem => {
      const inv = inventory.find(i => i.sku === orderItem.sku);
      if (inv) {
        StorageService.updateInventoryItem(inv.sku, {
          totalStock: Math.max(0, inv.totalStock - orderItem.qty),
          reservedStock: Math.max(0, inv.reservedStock - orderItem.qty)
        });
      }
    });

    // 3. Log activity
    StorageService.addActivityLog('Sarah Jenkins (Dispatcher)', `Dispatched ${order.id} (${order.customer}) via ${order.carrier}. Tracking #${order.trackingNumber || 'FDX-9982410-US'}.`, 'success', 'Order Dispatched');
    ToastService.show(`Order ${orderId} successfully handed over to ${order.carrier}.`, 'success', 'Shipment Dispatched');

    this.renderDispatchQueue();
    this.renderDispatchedHistory();
    UI.updateLiveBadges();
  }
};

if (typeof window !== 'undefined') {
  window.DispatchController = DispatchController;
}
