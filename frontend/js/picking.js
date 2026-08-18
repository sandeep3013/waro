/**
 * WARO - PICKING & ROUTE OPTIMIZATION CONTROLLER
 * Worker Task Workbench, Snake Aisle Route Sorting, Damage/Missing Exception Handlers
 */

document.addEventListener('DOMContentLoaded', () => {
  UI.initAppLayout('picking');
  PickingController.init();
});

const PickingController = {
  activeTaskId: 'PK-203',
  isOptimized: true,

  init: function() {
    this.bindEvents();
    this.renderTasksList();
    this.renderActiveTask();

    window.addEventListener('waro_state_updated', () => {
      this.renderTasksList();
      this.renderActiveTask();
    });
  },

  bindEvents: {
    //
  },

  renderTasksList: function() {
    const container = document.getElementById('pickingTaskList');
    if (!container) return;

    const tasks = StorageService.getPickingTasks();

    container.innerHTML = tasks.map(task => `
      <div class="card" style="padding: 1rem; cursor: pointer; border: 1.5px solid ${task.taskId === this.activeTaskId ? 'var(--primary)' : 'var(--border-light)'}; background: ${task.taskId === this.activeTaskId ? '#f8faff' : '#ffffff'};" onclick="PickingController.selectTask('${task.taskId}')">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
          <span class="tag-sku" style="font-weight: 800;">${task.taskId}</span>
          <span class="priority-badge ${task.priority === 'Critical' ? 'priority-critical' : task.priority === 'High' ? 'priority-high' : 'priority-medium'}">${task.priority}</span>
        </div>
        <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-main);">${task.orderId}</div>
        <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">
          Picker: <strong>${task.worker}</strong> • ${task.totalQty} Units
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.5rem; font-size: 0.75rem;">
          <span class="badge ${task.status === 'Completed' ? 'badge-success' : task.status === 'In Progress' ? 'badge-info' : 'badge-neutral'}">${task.status}</span>
          <span style="color: var(--text-muted); font-family: var(--font-mono);">${task.estimatedTime}</span>
        </div>
      </div>
    `).join('');
  },

  selectTask: function(taskId) {
    this.activeTaskId = taskId;
    this.renderTasksList();
    this.renderActiveTask();
  },

  toggleRouteOptimization: function() {
    this.isOptimized = !this.isOptimized;
    this.renderActiveTask();
    ToastService.show(`Route mode set to: ${this.isOptimized ? 'Optimized Aisle Sweep' : 'Original Order Sequence'}.`, 'info', 'Route Recalculated');
  },

  renderActiveTask: function() {
    const container = document.getElementById('activeTaskDetailContainer');
    if (!container) return;

    const task = StorageService.getPickingTasks().find(t => t.taskId === this.activeTaskId);
    if (!task) {
      container.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-muted);">Select a picking task from the left list.</div>`;
      return;
    }

    // Run route optimization
    const routeData = DecisionEngine.optimizePickingRoute(task.locations);
    const locationsToDisplay = this.isOptimized ? routeData.optimized : routeData.original;

    const allPicked = locationsToDisplay.every(l => l.picked);

    container.innerHTML = `
      <div class="card" style="box-shadow: var(--shadow-md);">
        <div class="card-header" style="border-bottom: 1px solid var(--border-light); padding-bottom: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">Picking Task #${task.taskId}</h2>
              <span class="priority-badge ${task.priority === 'Critical' ? 'priority-critical' : task.priority === 'High' ? 'priority-high' : 'priority-medium'}">${task.priority}</span>
              <span class="badge ${task.status === 'Completed' ? 'badge-success' : 'badge-info'}">${task.status}</span>
            </div>
            <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px;">
              Assigned Order: <strong>${task.orderId}</strong> • Assigned Picker: <strong>${task.worker}</strong>
            </div>
          </div>
          <div>
            ${task.status !== 'Completed' ? `
              <button class="btn btn-success" onclick="PickingController.completeTask('${task.taskId}')" ${!allPicked ? '' : ''}>
                <i data-lucide="check-circle-2" style="width: 16px; height: 16px;"></i>
                Complete Picking & Send to Packing
              </button>
            ` : `
              <span class="badge badge-success" style="font-size: 0.85rem; padding: 0.5rem 1rem;">✓ Completed & Moved to Packing</span>
            `}
          </div>
        </div>

        <!-- ROUTE OPTIMIZATION BANNER -->
        <div class="route-optimization-box" style="margin: 1.25rem 0;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
              <div class="ai-glow-badge"><i data-lucide="zap" style="width: 14px; height: 14px;"></i> Route Optimizer</div>
              <strong style="color: #065f46; font-size: 0.95rem;">
                ${this.isOptimized ? 'Optimized Aisle-Bay Pick Path Active' : 'Standard Chronological Pick Path'}
              </strong>
            </div>
            <div style="font-size: 0.82rem; color: #065f46;">
              ${this.isOptimized
                ? `Snake sweep traversal active. <strong>Estimated walking time saved: ${routeData.timeSavedMinutes} minutes</strong> (Travel: ${routeData.optimizedDistanceMeters}m vs ${routeData.originalDistanceMeters}m).`
                : 'Showing unoptimized order sequence with cross-aisle travel.'}
            </div>

            <!-- Path Steps -->
            <div class="route-steps-flow" style="margin-top: 0.75rem;">
              ${locationsToDisplay.map((loc, idx) => `
                <span class="route-step-pill ${loc.picked ? 'picked' : ''}" style="${loc.picked ? 'background: #d1fae5; text-decoration: line-through;' : ''}">
                  ${idx + 1}. ${loc.loc} (${loc.name})
                </span>
                ${idx < locationsToDisplay.length - 1 ? '<span style="color: #059669; font-weight: 800;">➔</span>' : ''}
              `).join('')}
            </div>
          </div>

          <div>
            <button class="btn btn-secondary btn-sm" onclick="PickingController.toggleRouteOptimization()">
              <i data-lucide="shuffle" style="width: 14px; height: 14px;"></i>
              ${this.isOptimized ? 'Show Original Route' : 'Apply Optimized Route'}
            </button>
          </div>
        </div>

        <!-- ITEMS PICK CHECKLIST -->
        <h3 style="font-size: 1rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.75rem;">
          Pick Checklist (${locationsToDisplay.filter(l => l.picked).length} / ${locationsToDisplay.length} Items Picked)
        </h3>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${locationsToDisplay.map((item, idx) => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem; background: ${item.picked ? '#f0fdf4' : 'var(--bg-surface-subtle)'}; border: 1px solid ${item.picked ? '#a7f3d0' : 'var(--border-light)'}; border-radius: var(--radius-md);">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <input type="checkbox" ${item.picked ? 'checked' : ''} onchange="PickingController.toggleItemPicked('${item.sku}', this.checked)" style="width: 20px; height: 20px; cursor: pointer; accent-color: var(--primary);">
                <div>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span class="tag-location" style="font-size: 0.85rem; font-weight: 800;">${item.loc}</span>
                    <span style="font-weight: 800; font-size: 0.95rem; color: var(--text-main); ${item.picked ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${item.name}</span>
                    <span class="tag-sku">${item.sku}</span>
                  </div>
                  <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 3px;">
                    Quantity to Pick: <strong style="font-size: 0.9rem; color: var(--primary);">${item.qty} units</strong>
                  </div>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button class="btn btn-ghost btn-sm" onclick="PickingController.reportItemProblem('${item.sku}', '${item.name}', 'Missing')" title="Item Missing in Bin" style="color: var(--warning-dark);">
                  <i data-lucide="help-circle" style="width: 14px; height: 14px;"></i> Report Missing
                </button>
                <button class="btn btn-ghost btn-sm" onclick="PickingController.reportItemProblem('${item.sku}', '${item.name}', 'Damaged')" title="Item Damaged" style="color: var(--danger);">
                  <i data-lucide="alert-octagon" style="width: 14px; height: 14px;"></i> Report Damaged
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  toggleItemPicked: function(sku, isPicked) {
    const task = StorageService.getPickingTasks().find(t => t.taskId === this.activeTaskId);
    if (!task) return;

    const loc = task.locations.find(l => l.sku === sku);
    if (loc) loc.picked = isPicked;

    StorageService.updatePickingTask(task.taskId, { locations: task.locations });
    this.renderActiveTask();
    ToastService.show(`Item ${sku} marked as ${isPicked ? 'PICKED' : 'UNPICKED'}.`, 'info');
  },

  reportItemProblem: function(sku, name, problemType) {
    const reason = prompt(`Reason for reporting ${problemType} on ${name} (${sku}):`, `${problemType} during warehouse retrieval`);
    if (!reason) return;

    // Create exception
    StorageService.addException({
      type: `${problemType} Item`,
      severity: 'Critical',
      orderId: this.activeTaskId,
      sku: sku,
      productName: name,
      description: `Picker reported ${problemType.toLowerCase()} unit of ${name} during task ${this.activeTaskId}. Reason: ${reason}`,
      recommendedAction: `Allocate replacement stock from backup shelf and flag bin for inspection.`,
      actionType: 'allocate_replacement'
    });

    ToastService.show(`Exception logged for ${name} (${problemType}). Decision Engine notified.`, 'danger', 'Exception Created');
    UI.updateLiveBadges();
  },

  completeTask: function(taskId) {
    const task = StorageService.getPickingTasks().find(t => t.taskId === taskId);
    if (!task) return;

    task.status = 'Completed';
    task.locations.forEach(l => l.picked = true);
    StorageService.updatePickingTask(taskId, task);

    // Update corresponding order to Packing stage
    const order = StorageService.getOrderById(task.orderId);
    if (order) {
      order.status = 'Packing';
      if (order.timeline && order.timeline[4]) {
        order.timeline[4].status = 'completed';
        order.timeline[4].time = '17:15';
      }
      if (order.timeline && order.timeline[5]) {
        order.timeline[5].status = 'active';
      }
      StorageService.updateOrder(order.id, order);
    }

    StorageService.addActivityLog(task.worker, `Completed picking task ${taskId} for Order ${task.orderId}. Advanced to Packing.`, 'success', 'Picking Completed');
    ToastService.show(`Task ${taskId} completed! Order moved to Packing Station.`, 'success', 'Stage Advanced');

    this.renderTasksList();
    this.renderActiveTask();
    UI.updateLiveBadges();
  }
};

if (typeof window !== 'undefined') {
  window.PickingController = PickingController;
}
