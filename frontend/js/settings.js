/**
 * WARO - SETTINGS & CONFIGURATION CONTROLLER
 * Warehouse parameters, SLA targets, Worker management, Demo Reset Button
 */

document.addEventListener('DOMContentLoaded', () => {
  UI.initAppLayout('settings');
  SettingsController.init();
});

const SettingsController = {
  init: function() {
    this.bindEvents();
    this.populateForm();
    this.renderWorkers();
  },

  bindEvents: function() {
    const saveBtn = document.getElementById('saveSettingsBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveSettings());
    }

    const resetBtn = document.getElementById('resetDemoBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all warehouse demo data back to factory defaults?')) {
          StorageService.resetDemoData(true);
          this.populateForm();
          this.renderWorkers();
          UI.updateLiveBadges();
        }
      });
    }
  },

  populateForm: function() {
    const s = StorageService.getSettings();

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };

    setVal('settingWhName', s.warehouseName);
    setVal('settingLocation', s.location);
    setVal('settingPickingTarget', s.targetPickingMinutes);
    setVal('settingPackingTarget', s.targetPackingMinutes);
    setVal('settingDispatchTarget', s.targetDispatchMinutes);
    setVal('settingSafetyMargin', s.autoReorderSafetyMargin);
  },

  saveSettings: function() {
    const newSettings = {
      warehouseName: document.getElementById('settingWhName').value,
      location: document.getElementById('settingLocation').value,
      targetPickingMinutes: parseInt(document.getElementById('settingPickingTarget').value, 10) || 10,
      targetPackingMinutes: parseInt(document.getElementById('settingPackingTarget').value, 10) || 5,
      targetDispatchMinutes: parseInt(document.getElementById('settingDispatchTarget').value, 10) || 15,
      autoReorderSafetyMargin: parseInt(document.getElementById('settingSafetyMargin').value, 10) || 20,
      enableAiDecisions: true,
      enableRouteOptimization: true
    };

    const state = StorageService.getState();
    state.settings = newSettings;
    StorageService.saveState(state);

    StorageService.addActivityLog('Alex Morgan (Manager)', 'Updated system SLA benchmarks and safety margin configurations.', 'info', 'Settings Updated');
    ToastService.show('Warehouse configuration successfully updated.', 'success', 'Saved');
  },

  renderWorkers: function() {
    const tbody = document.getElementById('settingsWorkersTableBody');
    if (!tbody) return;

    const workers = StorageService.getState().workers || [];
    tbody.innerHTML = workers.map(w => `
      <tr>
        <td style="font-weight: 700;">${w.id}</td>
        <td><strong>${w.name}</strong></td>
        <td><span class="badge badge-neutral">${w.role}</span></td>
        <td>${w.shift}</td>
        <td><span class="badge ${w.status === 'Active' ? 'badge-success' : 'badge-warning'}">${w.status}</span></td>
        <td style="text-align: right;">
          <button class="btn btn-ghost btn-sm" onclick="alert('Worker profile for ${w.name}')">Edit</button>
        </td>
      </tr>
    `).join('');
  }
};

if (typeof window !== 'undefined') {
  window.SettingsController = SettingsController;
}
