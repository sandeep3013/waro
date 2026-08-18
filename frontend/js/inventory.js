/**
 * WARO - INVENTORY MANAGEMENT CONTROLLER
 * Table rendering, Available Stock math (Total - Reserved - Damaged), Filtering, Modals
 */

document.addEventListener('DOMContentLoaded', () => {
  UI.initAppLayout('inventory');
  InventoryController.init();
});

const InventoryController = {
  currentSort: { column: 'name', asc: true },
  searchTerm: '',
  categoryFilter: 'all',
  statusFilter: 'all',

  init: function() {
    this.bindEvents();
    this.renderTable();
    this.renderCategoryOptions();

    window.addEventListener('waro_state_updated', () => {
      this.renderTable();
    });
  },

  bindEvents: function() {
    const searchInput = document.getElementById('inventorySearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase();
        this.renderTable();
      });
    }

    const catSelect = document.getElementById('categoryFilterSelect');
    if (catSelect) {
      catSelect.addEventListener('change', (e) => {
        this.categoryFilter = e.target.value;
        this.renderTable();
      });
    }

    const statusSelect = document.getElementById('statusFilterSelect');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.statusFilter = e.target.value;
        this.renderTable();
      });
    }
  },

  renderCategoryOptions: function() {
    const select = document.getElementById('categoryFilterSelect');
    if (!select) return;

    const inventory = StorageService.getInventory();
    const categories = Array.from(new Set(inventory.map(i => i.category))).sort();

    select.innerHTML = `<option value="all">All Categories (${inventory.length})</option>` +
      categories.map(c => `<option value="${c}">${c}</option>`).join('');
  },

  renderTable: function() {
    const tbody = document.getElementById('inventoryTableBody');
    const countEl = document.getElementById('inventoryItemCount');
    if (!tbody) return;

    let items = [...StorageService.getInventory()];

    // Search filter
    if (this.searchTerm) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(this.searchTerm) ||
        item.sku.toLowerCase().includes(this.searchTerm) ||
        item.location.toLowerCase().includes(this.searchTerm) ||
        item.category.toLowerCase().includes(this.searchTerm)
      );
    }

    // Category filter
    if (this.categoryFilter !== 'all') {
      items = items.filter(item => item.category === this.categoryFilter);
    }

    // Status filter
    if (this.statusFilter !== 'all') {
      items = items.filter(item => {
        const avail = item.totalStock - item.reservedStock - item.damagedStock;
        if (this.statusFilter === 'Out of Stock') return item.totalStock <= 0 || avail <= 0;
        if (this.statusFilter === 'Critical') return avail > 0 && avail <= 2;
        if (this.statusFilter === 'Low Stock') return avail > 2 && avail <= item.reorderLevel;
        if (this.statusFilter === 'Healthy') return avail > item.reorderLevel;
        return true;
      });
    }

    // Sorting
    items.sort((a, b) => {
      let valA = a[this.currentSort.column];
      let valB = b[this.currentSort.column];

      if (this.currentSort.column === 'available') {
        valA = a.totalStock - a.reservedStock - a.damagedStock;
        valB = b.totalStock - b.reservedStock - b.damagedStock;
      }

      if (typeof valA === 'string') {
        return this.currentSort.asc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return this.currentSort.asc ? (valA - valB) : (valB - valA);
    });

    if (countEl) countEl.textContent = `Showing ${items.length} items`;

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="11" style="text-align: center; padding: 3rem; color: var(--text-muted);">
            <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem;">No inventory matches found</div>
            <div style="font-size: 0.85rem;">Try adjusting your filters or search keywords.</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(item => {
      const available = Math.max(0, item.totalStock - item.reservedStock - item.damagedStock);

      let statusBadge = '';
      if (item.totalStock <= 0 || available <= 0) {
        statusBadge = `<span class="badge badge-danger">Out of Stock</span>`;
      } else if (available <= 2) {
        statusBadge = `<span class="badge badge-danger">Critical</span>`;
      } else if (available <= item.reorderLevel) {
        statusBadge = `<span class="badge badge-warning">Low Stock</span>`;
      } else {
        statusBadge = `<span class="badge badge-success">Healthy</span>`;
      }

      const stockPct = Math.min(100, Math.round((available / Math.max(1, item.reorderLevel * 2)) * 100));
      const meterClass = stockPct > 50 ? 'high' : stockPct > 20 ? 'medium' : 'low';

      return `
        <tr>
          <td><span class="tag-sku">${item.sku}</span></td>
          <td>
            <div class="cell-primary-text">${item.name}</div>
            <div class="cell-secondary-text">$${item.unitPrice.toFixed(2)} • ${item.unitWeight}kg</div>
          </td>
          <td><span class="badge badge-neutral">${item.category}</span></td>
          <td><span class="tag-location">${item.location}</span></td>
          <td style="font-weight: 700;">${item.totalStock}</td>
          <td style="color: var(--text-secondary);">${item.reservedStock}</td>
          <td>
            <div class="stock-meter">
              <span style="font-weight: 800; font-size: 1rem; color: ${available <= item.reorderLevel ? 'var(--danger)' : 'var(--text-main)'};">${available}</span>
              <div class="stock-meter-bar">
                <div class="stock-meter-fill ${meterClass}" style="width: ${stockPct}%;"></div>
              </div>
            </div>
          </td>
          <td style="color: ${item.damagedStock > 0 ? 'var(--danger)' : 'var(--text-muted)'}; font-weight: ${item.damagedStock > 0 ? '700' : '400'};">
            ${item.damagedStock}
          </td>
          <td style="color: var(--text-secondary);">${item.reorderLevel}</td>
          <td>${statusBadge}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <button class="btn btn-secondary btn-sm" onclick="InventoryController.openAdjustModal('${item.sku}')" title="Adjust Stock">
                Adjust
              </button>
              <button class="btn btn-ghost btn-sm" onclick="InventoryController.openDamageModal('${item.sku}')" title="Report Damaged" style="color: var(--danger);">
                Damaged
              </button>
              ${available <= item.reorderLevel ? `
                <button class="btn btn-primary btn-sm" onclick="InventoryController.openReorderModal('${item.sku}')" title="Reorder">
                  Reorder
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  sort: function(column) {
    if (this.currentSort.column === column) {
      this.currentSort.asc = !this.currentSort.asc;
    } else {
      this.currentSort.column = column;
      this.currentSort.asc = true;
    }
    this.renderTable();
  },

  openAdjustModal: function(sku) {
    const item = StorageService.getInventory().find(i => i.sku === sku);
    if (!item) return;

    document.getElementById('adjustSku').value = item.sku;
    document.getElementById('adjustName').textContent = `${item.name} (${item.sku})`;
    document.getElementById('adjustCurrent').textContent = `${item.totalStock} units`;
    document.getElementById('adjustDelta').value = '0';
    document.getElementById('adjustReason').value = 'Cycle Count Adjustment';

    ModalService.open('adjustStockModal');
  },

  saveStockAdjustment: function() {
    const sku = document.getElementById('adjustSku').value;
    const delta = parseInt(document.getElementById('adjustDelta').value, 10) || 0;
    const reason = document.getElementById('adjustReason').value;

    const item = StorageService.getInventory().find(i => i.sku === sku);
    if (!item) return;

    const newTotal = Math.max(0, item.totalStock + delta);
    StorageService.updateInventoryItem(sku, { totalStock: newTotal });
    StorageService.addActivityLog('Alex Morgan (Manager)', `Stock adjusted for ${item.name} (${delta > 0 ? '+' : ''}${delta}). Reason: ${reason}`, 'info', 'Inventory Adjusted');
    ToastService.show(`Stock for ${item.name} updated to ${newTotal} units.`, 'success', 'Adjustment Saved');

    ModalService.close('adjustStockModal');
    this.renderTable();
  },

  openDamageModal: function(sku) {
    const item = StorageService.getInventory().find(i => i.sku === sku);
    if (!item) return;

    document.getElementById('damageSku').value = item.sku;
    document.getElementById('damageName').textContent = `${item.name} (${item.sku})`;
    document.getElementById('damageQty').value = '1';
    document.getElementById('damageReason').value = 'Cracked Casing / Dropped during handling';

    ModalService.open('markDamageModal');
  },

  saveDamageReport: function() {
    const sku = document.getElementById('damageSku').value;
    const qty = parseInt(document.getElementById('damageQty').value, 10) || 1;
    const reason = document.getElementById('damageReason').value;

    const item = StorageService.getInventory().find(i => i.sku === sku);
    if (!item) return;

    StorageService.updateInventoryItem(sku, {
      damagedStock: item.damagedStock + qty
    });

    // Auto-create exception
    StorageService.addException({
      type: 'Damaged Item',
      severity: 'Warning',
      sku: sku,
      productName: item.name,
      description: `${qty} unit(s) flagged damaged in bin ${item.location}. Reason: ${reason}`,
      recommendedAction: `Move ${qty} unit(s) to quarantine bin and write off defect.`,
      actionType: 'quarantine'
    });

    ToastService.show(`${qty} unit(s) of ${item.name} marked damaged. Exception created.`, 'warning', 'Damage Logged');
    ModalService.close('markDamageModal');
    this.renderTable();
  },

  openReorderModal: function(sku) {
    const item = StorageService.getInventory().find(i => i.sku === sku);
    if (!item) return;

    document.getElementById('reorderSku').value = item.sku;
    document.getElementById('reorderName').textContent = `${item.name} (${item.sku})`;
    document.getElementById('reorderQty').value = '30';
    document.getElementById('reorderSupplier').value = 'Primary Global Tech Logistics Ltd.';

    ModalService.open('reorderModal');
  },

  saveReorder: function() {
    const sku = document.getElementById('reorderSku').value;
    const qty = parseInt(document.getElementById('reorderQty').value, 10) || 30;

    const item = StorageService.getInventory().find(i => i.sku === sku);
    if (!item) return;

    StorageService.updateInventoryItem(sku, {
      totalStock: item.totalStock + qty
    });

    StorageService.addActivityLog('Alex Morgan (Manager)', `Placed Purchase Order for ${qty}x ${item.name}.`, 'success', 'PO Dispatched');
    ToastService.show(`Replenishment of ${qty} units processed for ${item.name}.`, 'success', 'Order Placed');

    ModalService.close('reorderModal');
    this.renderTable();
  },

  openAddProductModal: function() {
    ModalService.open('addProductModal');
  },

  saveNewProduct: function() {
    const name = document.getElementById('newProdName').value;
    const sku = document.getElementById('newProdSku').value;
    const cat = document.getElementById('newProdCategory').value;
    const loc = document.getElementById('newProdLoc').value;
    const stock = parseInt(document.getElementById('newProdStock').value, 10) || 0;
    const reorder = parseInt(document.getElementById('newProdReorder').value, 10) || 10;
    const price = parseFloat(document.getElementById('newProdPrice').value) || 29.99;

    if (!name || !sku) {
      ToastService.show('Please fill in required Product Name and SKU.', 'danger', 'Validation Error');
      return;
    }

    const state = StorageService.getState();
    state.inventory.unshift({
      sku: sku.toUpperCase(),
      name: name,
      category: cat,
      location: loc.toUpperCase(),
      totalStock: stock,
      reservedStock: 0,
      damagedStock: 0,
      reorderLevel: reorder,
      unitPrice: price,
      unitWeight: 0.25,
      status: stock > reorder ? 'Healthy' : stock > 0 ? 'Low Stock' : 'Out of Stock'
    });

    StorageService.saveState(state);
    StorageService.addActivityLog('Alex Morgan (Manager)', `Added new SKU ${sku} (${name}) to location ${loc}.`, 'info', 'Product Created');
    ToastService.show(`Product ${name} created successfully.`, 'success', 'SKU Added');

    ModalService.close('addProductModal');
    this.renderTable();
    this.renderCategoryOptions();
  }
};

if (typeof window !== 'undefined') {
  window.InventoryController = InventoryController;
}
