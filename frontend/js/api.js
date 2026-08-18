/**
 * WARO - FRONTEND API CLIENT
 * Connects Frontend UI to Express REST API Backend
 */

const API = {
  getBaseUrl: function() {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      // If running on Render-hosted domain, use full URL
      if (host.endsWith('onrender.com')) {
        return `https://${host}/api`;
      }
      const isLocalFile = window.location.protocol === 'file:';
      const isLocalDevOtherPort = (host === 'localhost' || host === '127.0.0.1') && window.location.port && window.location.port !== '5000';
      if (isLocalFile || isLocalDevOtherPort) {
        return 'http://localhost:5000/api';
      }
    }
    return '/api';
  },

  isConnected: false,

  // Generic Request Helper
  request: async function(endpoint, options = {}) {
    const url = `${this.getBaseUrl()}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    try {
      const res = await fetch(url, {
        ...options,
        headers
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      this.isConnected = true;
      this.updateConnectionStatus(true);
      return await res.json();
    } catch (err) {
      console.warn(`[API] Request to ${endpoint} failed:`, err.message);
      this.isConnected = false;
      this.updateConnectionStatus(false);
      throw err;
    }
  },

  // Health Check
  checkHealth: async function() {
    try {
      const data = await this.request('/health');
      this.isConnected = true;
      this.updateConnectionStatus(true);
      return data;
    } catch (e) {
      this.isConnected = false;
      this.updateConnectionStatus(false);
      return null;
    }
  },

  updateConnectionStatus: function(online) {
    if (typeof document === 'undefined') return;
    const badge = document.getElementById('backendStatusBadge');
    if (badge) {
      if (online) {
        badge.innerHTML = `<span class="status-indicator online"></span> Backend Connected`;
        badge.className = 'backend-badge online';
        badge.title = `Connected to API at ${this.getBaseUrl()}`;
      } else {
        badge.innerHTML = `<span class="status-indicator offline"></span> Local Offline Mode`;
        badge.className = 'backend-badge offline';
        badge.title = `Could not reach ${this.getBaseUrl()}. Operating in local memory/cache mode.`;
      }
    }
  },

  // --- State & Reset ---
  getState: function() {
    return this.request('/state');
  },

  resetState: function() {
    return this.request('/reset', { method: 'POST' });
  },

  // --- Inventory ---
  getInventory: function(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/inventory${query ? '?' + query : ''}`);
  },

  getInventoryItem: function(sku) {
    return this.request(`/inventory/${encodeURIComponent(sku)}`);
  },

  createInventoryItem: function(item) {
    return this.request('/inventory', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  },

  updateInventoryItem: function(sku, changes) {
    return this.request(`/inventory/${encodeURIComponent(sku)}`, {
      method: 'PUT',
      body: JSON.stringify(changes)
    });
  },

  adjustStock: function(sku, delta, reason) {
    return this.request(`/inventory/${encodeURIComponent(sku)}/adjust`, {
      method: 'POST',
      body: JSON.stringify({ delta, reason })
    });
  },

  reportDamage: function(sku, qty, notes) {
    return this.request(`/inventory/${encodeURIComponent(sku)}/damage`, {
      method: 'POST',
      body: JSON.stringify({ qty, notes })
    });
  },

  reorderStock: function(sku, qty) {
    return this.request(`/inventory/${encodeURIComponent(sku)}/reorder`, {
      method: 'POST',
      body: JSON.stringify({ qty })
    });
  },

  // --- Orders ---
  getOrders: function(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/orders${query ? '?' + query : ''}`);
  },

  getOrder: function(id) {
    return this.request(`/orders/${encodeURIComponent(id)}`);
  },

  createOrder: function(order) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(order)
    });
  },

  updateOrder: function(id, changes) {
    return this.request(`/orders/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(changes)
    });
  },

  // --- Picking ---
  getPickingTasks: function() {
    return this.request('/picking');
  },

  getPickingTask: function(taskId) {
    return this.request(`/picking/${encodeURIComponent(taskId)}`);
  },

  updatePickingTask: function(taskId, changes) {
    return this.request(`/picking/${encodeURIComponent(taskId)}`, {
      method: 'PUT',
      body: JSON.stringify(changes)
    });
  },

  optimizeRoute: function(taskId) {
    return this.request(`/picking/${encodeURIComponent(taskId)}/optimize-route`, {
      method: 'POST'
    });
  },

  completePickingTask: function(taskId) {
    return this.request(`/picking/${encodeURIComponent(taskId)}/complete`, {
      method: 'POST'
    });
  },

  // --- Packing ---
  getPackingOrders: function() {
    return this.request('/packing');
  },

  completePacking: function(orderId, data) {
    return this.request(`/packing/${encodeURIComponent(orderId)}/complete`, {
      method: 'POST',
      body: JSON.stringify(data || {})
    });
  },

  reportPackingDamage: function(orderId, data) {
    return this.request(`/packing/${encodeURIComponent(orderId)}/damage`, {
      method: 'POST',
      body: JSON.stringify(data || {})
    });
  },

  // --- Dispatch ---
  getDispatchOrders: function() {
    return this.request('/dispatch');
  },

  dispatchOrder: function(orderId, data) {
    return this.request(`/dispatch/${encodeURIComponent(orderId)}`, {
      method: 'POST',
      body: JSON.stringify(data || {})
    });
  },

  // --- Allocation ---
  getConflicts: function() {
    return this.request('/allocation/conflicts');
  },

  resolveConflict: function(data) {
    return this.request('/allocation/resolve', {
      method: 'POST',
      body: JSON.stringify(data || {})
    });
  },

  // --- Exceptions ---
  getExceptions: function(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/exceptions${query ? '?' + query : ''}`);
  },

  addException: function(data) {
    return this.request('/exceptions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  resolveException: function(id, resolutionNotes) {
    return this.request(`/exceptions/${encodeURIComponent(id)}/resolve`, {
      method: 'PUT',
      body: JSON.stringify({ resolutionNotes })
    });
  },

  // --- Decision Engine & Analytics ---
  getAnalytics: function() {
    return this.request('/analytics');
  },

  getHealthScore: function() {
    return this.request('/decision-engine/health-score');
  },

  getRecommendations: function() {
    return this.request('/decision-engine/recommendations');
  },

  simulateWhatIf: function(data) {
    return this.request('/decision-engine/simulate', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // --- Activity Logs & Notifications ---
  getActivityLogs: function() {
    return this.request('/activity-logs');
  },

  addActivityLog: function(data) {
    return this.request('/activity-logs', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  getNotifications: function() {
    return this.request('/notifications');
  },

  markNotificationsRead: function() {
    return this.request('/notifications/read', { method: 'POST' });
  },

  // --- Settings & Workers ---
  getSettings: function() {
    return this.request('/settings');
  },

  updateSettings: function(data) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  getWorkers: function() {
    return this.request('/workers');
  },

  // --- Auth ---
  getRoles: function() {
    return this.request('/auth/roles');
  },

  login: function(roleName) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ roleName })
    });
  }
};

if (typeof window !== 'undefined') {
  window.API = API;
}
