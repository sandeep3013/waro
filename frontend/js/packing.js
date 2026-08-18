/**
 * WARO - PACKING & QUALITY CHECK CONTROLLER
 * Package Sizing (S/M/L), Weight Scale, QC Inspection Checklist (Pass/Damage/Missing/Wrong Qty)
 */

document.addEventListener('DOMContentLoaded', () => {
  UI.initAppLayout('packing');
  PackingController.init();
});

const PackingController = {
  activeOrderId: 'ORD-1035',
  selectedBoxSize: 'Medium Box (12x9x6 in)',

  init: function() {
    this.bindEvents();
    this.renderOrdersList();
    this.renderActiveOrder();

    window.addEventListener('waro_state_updated', () => {
      this.renderOrdersList();
      this.renderActiveOrder();
    });
  },

  bindEvents: function() {
    //
  },

  renderOrdersList: function() {
    const container = document.getElementById('packingOrdersList');
    if (!container) return;

    const orders = StorageService.getOrders().filter(o => ['Packing', 'Quality Check'].includes(o.status));

    if (orders.length === 0) {
      container.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No orders currently at packing station.</div>`;
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="card" style="padding: 1rem; cursor: pointer; border: 1.5px solid ${order.id === this.activeOrderId ? 'var(--primary)' : 'var(--border-light)'}; background: ${order.id === this.activeOrderId ? '#f8faff' : '#ffffff'};" onclick="PackingController.selectOrder('${order.id}')">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
          <span class="tag-sku" style="font-weight: 800;">${order.id}</span>
          <span class="priority-badge ${order.priority === 'Critical' ? 'priority-critical' : order.priority === 'High' ? 'priority-high' : 'priority-medium'}">${order.priority}</span>
        </div>
        <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-main);">${order.customer}</div>
        <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">
          ${order.items.reduce((acc, i) => acc + i.qty, 0)} Items • Total: $${order.totalValue.toFixed(2)}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.5rem; font-size: 0.75rem;">
          <span class="badge ${order.status === 'Quality Check' ? 'badge-warning' : 'badge-info'}">${order.status}</span>
          <span style="color: var(--text-muted); font-family: var(--font-mono);">${order.carrier || 'FedEx'}</span>
        </div>
      </div>
    `).join('');
  },

  selectOrder: function(orderId) {
    this.activeOrderId = orderId;
    this.renderOrdersList();
    this.renderActiveOrder();
  },

  renderActiveOrder: function() {
    const container = document.getElementById('activePackingDetailContainer');
    if (!container) return;

    const order = StorageService.getOrderById(this.activeOrderId);
    if (!order) {
      container.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-muted);">Select an order from the left queue.</div>`;
      return;
    }

    const totalWeightKg = order.items.reduce((sum, i) => sum + (i.qty * 0.35), 0.25).toFixed(2);

    container.innerHTML = `
      <div class="card" style="box-shadow: var(--shadow-md);">
        <div class="card-header" style="border-bottom: 1px solid var(--border-light); padding-bottom: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">Packing & QC Inspection: ${order.id}</h2>
              <span class="priority-badge ${order.priority === 'Critical' ? 'priority-critical' : 'priority-high'}">${order.priority}</span>
              <span class="badge ${order.status === 'Quality Check' ? 'badge-warning' : 'badge-info'}">${order.status}</span>
            </div>
            <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px;">
              Customer: <strong>${order.customer}</strong> • Carrier: <strong>${order.carrier || 'FedEx Express'}</strong>
            </div>
          </div>
          <div>
            <button class="btn btn-success" onclick="PackingController.completePackingAndQC('${order.id}')">
              <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i>
              Pass QC & Move to Dispatch
            </button>
          </div>
        </div>

        <!-- PACKAGE SIZING & WEIGHT CONTAINER -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.25rem; margin: 1.25rem 0; padding: 1.25rem; background: var(--bg-surface-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-light);">
          <div>
            <label class="form-label">Shipping Carton Size</label>
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <button class="btn btn-sm ${this.selectedBoxSize.includes('Small') ? 'btn-primary' : 'btn-secondary'}" onclick="PackingController.setBoxSize('Small Padded Mailer')">Small Padded (6x9)</button>
              <button class="btn btn-sm ${this.selectedBoxSize.includes('Medium') ? 'btn-primary' : 'btn-secondary'}" onclick="PackingController.setBoxSize('Medium Box (12x9x6 in)')">Medium Box (12x9x6 in)</button>
              <button class="btn btn-sm ${this.selectedBoxSize.includes('Large') ? 'btn-primary' : 'btn-secondary'}" onclick="PackingController.setBoxSize('Large Heavy Carton (18x14x12)')">Large Carton (18x14x12)</button>
            </div>
          </div>
          <div>
            <label class="form-label">Scale Weight</label>
            <div style="font-size: 1.3rem; font-weight: 800; color: var(--text-main); font-family: var(--font-mono);">
              ${totalWeightKg} <span style="font-size: 0.85rem; color: var(--text-secondary);">kg (Tare incl.)</span>
            </div>
          </div>
        </div>

        <!-- QUALITY CHECK VERIFICATION CHECKLIST -->
        <div style="margin-bottom: 1.25rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
            <h3 style="font-size: 1rem; font-weight: 800; color: var(--text-main);">
              Quality Inspection Verification
            </h3>
            <span style="font-size: 0.8rem; color: var(--text-secondary);">Verify barcode, physical integrity, and quantity</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${order.items.map((item, idx) => {
              const isDamaged = item.status === 'Damaged' || (order.id === 'ORD-1035' && item.sku === 'SKU-UH-204');
              return `
                <div style="padding: 1rem 1.25rem; background: ${isDamaged ? '#fff5f5' : '#ffffff'}; border: 1px solid ${isDamaged ? '#feb2b2' : 'var(--border-light)'}; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                      <span style="font-size: 1.1rem;">${isDamaged ? '❌' : '✅'}</span>
                      <strong style="font-size: 0.95rem; color: var(--text-main);">${item.name}</strong>
                      <span class="tag-sku">${item.sku}</span>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 3px;">
                      Verified Qty: <strong>${item.qty} units</strong> • Expected Bin: ${item.location || 'A-03-18'}
                    </div>
                  </div>

                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    ${isDamaged ? `
                      <span class="badge badge-danger">Damaged Flagged (EX-109)</span>
                      <button class="btn btn-primary btn-sm" onclick="PackingController.resolveReplacement('${item.sku}')">
                        Allocate Replacement Unit
                      </button>
                    ` : `
                      <span class="badge badge-success">✓ Verified Pass</span>
                      <button class="btn btn-ghost btn-sm" onclick="PackingController.flagItemDamaged('${item.sku}', '${item.name}')" style="color: var(--danger);">
                        Flag Damage
                      </button>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  setBoxSize: function(sizeName) {
    this.selectedBoxSize = sizeName;
    this.renderActiveOrder();
    ToastService.show(`Carton size updated to: ${sizeName}`, 'info');
  },

  flagItemDamaged: function(sku, name) {
    const order = StorageService.getOrderById(this.activeOrderId);
    if (!order) return;

    const item = order.items.find(i => i.sku === sku);
    if (item) item.status = 'Damaged';
    order.status = 'Quality Check';
    order.risk = 'Damaged Item Exception Pending';
    StorageService.updateOrder(order.id, order);

    StorageService.addException({
      type: 'Damaged Item',
      severity: 'Critical',
      orderId: order.id,
      sku: sku,
      productName: name,
      description: `QC Inspector flagged physical defect on ${name} (${sku}) during packing.`,
      recommendedAction: 'Replacement stock is available in backup bin. Allocate 1 unit replacement immediately.',
      actionType: 'allocate_replacement'
    });

    ToastService.show(`Damaged unit flagged on ${name}. Exception generated.`, 'danger', 'QC Exception Created');
    this.renderActiveOrder();
    UI.updateLiveBadges();
  },

  resolveReplacement: function(sku) {
    const order = StorageService.getOrderById(this.activeOrderId);
    if (!order) return;

    const item = order.items.find(i => i.sku === sku);
    if (item) item.status = 'Passed';
    order.risk = 'QC Passed (Replacement Allocated)';
    StorageService.updateOrder(order.id, order);

    // Resolve exception EX-109
    StorageService.resolveException('EX-109', 'Allocated 1 unit replacement from reserve bin A-03-18. Damaged item written off.');
    ToastService.show(`Replacement unit for ${sku} allocated. Quality Check passed.`, 'success', 'Replacement Issued');

    this.renderActiveOrder();
    UI.updateLiveBadges();
  },

  completePackingAndQC: function(orderId) {
    const order = StorageService.getOrderById(orderId);
    if (!order) return;

    order.status = 'Ready to Dispatch';
    order.packageSize = this.selectedBoxSize;
    order.trackingNumber = `FDX-${Math.floor(1000000 + Math.random() * 9000000)}-US`;

    if (order.timeline && order.timeline[5]) {
      order.timeline[5].status = 'completed';
      order.timeline[5].time = '17:25';
    }
    if (order.timeline && order.timeline[6]) {
      order.timeline[6].status = 'completed';
      order.timeline[6].time = '17:30';
    }
    if (order.timeline && order.timeline[7]) {
      order.timeline[7].status = 'active';
    }

    StorageService.updateOrder(orderId, order);
    StorageService.addActivityLog('Elena Rostova (Packer)', `Completed packing & QC on ${orderId}. Staged on Bay Dock 3 for dispatch.`, 'success', 'Ready to Dispatch');
    ToastService.show(`Order ${orderId} packed and staged for Dispatch.`, 'success', 'QC Passed');

    this.renderOrdersList();
    this.renderActiveOrder();
    UI.updateLiveBadges();
  }
};

if (typeof window !== 'undefined') {
  window.PackingController = PackingController;
}
