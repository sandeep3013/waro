/**
 * WARO - EXCEPTIONS RESOLUTION CENTER CONTROLLER
 * Exception types: Damaged, Missing, Low Stock, Stockout, Delays, Inventory Conflicts
 */

document.addEventListener('DOMContentLoaded', () => {
  UI.initAppLayout('exceptions');
  ExceptionsController.init();
});

const ExceptionsController = {
  statusFilter: 'all',
  severityFilter: 'all',

  init: function() {
    this.bindEvents();
    this.renderExceptions();

    window.addEventListener('waro_state_updated', () => {
      this.renderExceptions();
    });
  },

  bindEvents: function() {
    const statusSelect = document.getElementById('exceptionStatusFilter');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.statusFilter = e.target.value;
        this.renderExceptions();
      });
    }

    const sevSelect = document.getElementById('exceptionSeverityFilter');
    if (sevSelect) {
      sevSelect.addEventListener('change', (e) => {
        this.severityFilter = e.target.value;
        this.renderExceptions();
      });
    }
  },

  renderExceptions: function() {
    const container = document.getElementById('exceptionsListContainer');
    const countEl = document.getElementById('exceptionsTotalCount');
    if (!container) return;

    let exceptions = [...StorageService.getExceptions()];

    if (this.statusFilter !== 'all') {
      exceptions = exceptions.filter(e => e.status === this.statusFilter);
    }

    if (this.severityFilter !== 'all') {
      exceptions = exceptions.filter(e => e.severity === this.severityFilter);
    }

    if (countEl) countEl.textContent = `Showing ${exceptions.length} exceptions`;

    if (exceptions.length === 0) {
      container.innerHTML = `
        <div style="padding: 3rem; text-align: center; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px solid var(--border-light); color: var(--text-muted);">
          <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 0.4rem;">No matching exceptions found</div>
          <div style="font-size: 0.85rem;">All operational issues have been resolved or filtered out.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = exceptions.map(ex => {
      let cardBorder = '#e2e8f0';
      let sevBadge = '<span class="badge badge-neutral">Info</span>';

      if (ex.severity === 'Critical') {
        cardBorder = '#fca5a5';
        sevBadge = '<span class="priority-badge priority-critical">Critical Severity</span>';
      } else if (ex.severity === 'Warning') {
        cardBorder = '#fde68a';
        sevBadge = '<span class="priority-badge priority-high">Warning</span>';
      }

      let statusBadge = '<span class="badge badge-neutral">Open</span>';
      if (ex.status === 'Resolved') statusBadge = '<span class="badge badge-success">✓ Resolved</span>';
      else if (ex.status === 'Action Required') statusBadge = '<span class="badge badge-danger">Action Required</span>';
      else if (ex.status === 'Investigating') statusBadge = '<span class="badge badge-warning">Investigating</span>';

      const formattedTime = ex.created ? ex.created.replace('T', ' ').slice(5, 16) : '08-17 08:30';

      return `
        <div class="card" style="border-left: 5px solid ${ex.severity === 'Critical' ? 'var(--danger)' : ex.severity === 'Warning' ? 'var(--warning)' : 'var(--info)'}; margin-bottom: 1rem; box-shadow: var(--shadow-sm);">
          <div class="card-header" style="margin-bottom: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
              <span class="tag-sku" style="font-size: 0.85rem; font-weight: 800;">${ex.id}</span>
              ${sevBadge}
              <span style="font-size: 1.05rem; font-weight: 800; color: var(--text-main);">${ex.type.toUpperCase()}: ${ex.productName || 'Operational Alert'}</span>
              ${ex.orderId ? `<span class="badge badge-neutral">${ex.orderId}</span>` : ''}
              ${ex.sku ? `<span class="tag-sku">${ex.sku}</span>` : ''}
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-mono);">${formattedTime}</span>
              ${statusBadge}
            </div>
          </div>

          <div style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 0.85rem;">
            ${ex.description}
          </div>

          <!-- Recommended Action Box -->
          <div style="padding: 0.85rem 1rem; background: var(--bg-surface-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-bottom: 1rem; font-size: 0.85rem;">
            <div style="display: flex; align-items: center; gap: 0.4rem; color: var(--primary); font-weight: 700; margin-bottom: 3px;">
              <i data-lucide="sparkles" style="width: 14px; height: 14px;"></i>
              Recommended Resolution:
            </div>
            <div style="color: var(--text-main); font-weight: 500;">
              ${ex.recommendedAction}
            </div>
          </div>

          <!-- Actions -->
          <div style="display: flex; align-items: center; justify-content: flex-end; gap: 0.6rem;">
            ${ex.status !== 'Resolved' ? `
              ${ex.actionType === 'allocate_replacement' ? `
                <button class="btn btn-primary btn-sm" onclick="ExceptionsController.resolveWithAction('${ex.id}', 'Allocated replacement unit from backup inventory.')">
                  <i data-lucide="check" style="width: 14px; height: 14px;"></i>
                  Allocate Replacement Stock
                </button>
              ` : ex.actionType === 'approve_conflict' ? `
                <button class="btn btn-primary btn-sm" onclick="window.location.href='allocation.html'">
                  <i data-lucide="git-merge" style="width: 14px; height: 14px;"></i>
                  Open Allocation Workbench
                </button>
              ` : ex.actionType === 'backorder' ? `
                <button class="btn btn-warning btn-sm" onclick="ExceptionsController.resolveWithAction('${ex.id}', 'Order placed on supplier backorder with ETA +48h.')">
                  <i data-lucide="clock" style="width: 14px; height: 14px;"></i>
                  Confirm Backorder Status
                </button>
              ` : ex.actionType === 'reorder' ? `
                <button class="btn btn-success btn-sm" onclick="ExceptionsController.resolveWithAction('${ex.id}', 'Dispatched expedited purchase requisition.')">
                  <i data-lucide="truck" style="width: 14px; height: 14px;"></i>
                  Trigger Replenishment PO
                </button>
              ` : `
                <button class="btn btn-secondary btn-sm" onclick="ExceptionsController.resolveWithAction('${ex.id}', 'Resolved after cycle inspection.')">
                  <i data-lucide="check" style="width: 14px; height: 14px;"></i>
                  Mark Resolved
                </button>
              `}
            ` : `
              <span style="font-size: 0.8rem; color: var(--success); font-weight: 600;">
                ✓ Resolution executed: ${ex.resolutionNotes || 'Manager approved'}
              </span>
            `}
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
  },

  resolveWithAction: function(exId, resolutionNote) {
    StorageService.resolveException(exId, resolutionNote);
    ToastService.show(`Exception ${exId} marked as Resolved.`, 'success', 'Resolution Saved');
    this.renderExceptions();
    UI.updateLiveBadges();
  }
};

if (typeof window !== 'undefined') {
  window.ExceptionsController = ExceptionsController;
}
