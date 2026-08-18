/**
 * WARO - CORE APPLICATION RUNTIME & SERVICES
 * State Storage, Backend REST API Sync, Authentication, Toast Notifications, Navigation Controller, Modals
 */

// Storage Key Constants
const STORAGE_KEY = 'waro_warehouse_state_v1';
const AUTH_KEY = 'waro_auth_user_v1';

/* ==========================================================================
   1. Centralized State Storage Service (Backend Synced)
   ========================================================================== */
const StorageService = {
  initialized: false,

  // Initialize state with seed data & async sync with backend API
  init: async function() {
    if (this.initialized) return;
    this.initialized = true;

    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing && typeof SEED_DATA !== 'undefined') {
      this.saveState(SEED_DATA);
    }

    // Attempt backend sync
    if (typeof API !== 'undefined') {
      try {
        const res = await API.getState();
        if (res && res.success && res.state) {
          this.saveState(res.state);
        }
      } catch (e) {
        console.info('[StorageService] Operating with cached warehouse state');
      }
    }
  },

  getState: function() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : (typeof SEED_DATA !== 'undefined' ? SEED_DATA : {});
    } catch (e) {
      console.error('Error parsing state from localStorage', e);
      return typeof SEED_DATA !== 'undefined' ? SEED_DATA : {};
    }
  },

  saveState: function(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      // Dispatch custom event for real-time reactivity in current tab
      window.dispatchEvent(new CustomEvent('waro_state_updated', { detail: state }));
    } catch (e) {
      console.error('Error saving state to localStorage', e);
    }
  },

  resetDemoData: async function(triggerToast = true) {
    if (typeof API !== 'undefined') {
      try {
        const res = await API.resetState();
        if (res && res.state) {
          this.saveState(res.state);
          if (triggerToast && window.ToastService) {
            ToastService.show('Backend database & local state restored to demo seed values.', 'info', 'Database Reset');
          }
          return;
        }
      } catch (e) {
        console.warn('Backend reset failed, using local seed data', e);
      }
    }

    // Fallback if backend offline
    if (typeof SEED_DATA !== 'undefined') {
      const freshData = JSON.parse(JSON.stringify(SEED_DATA));
      this.saveState(freshData);
      if (triggerToast && window.ToastService) {
        ToastService.show('Demo warehouse state has been restored to default values.', 'info', 'State Reset');
      }
    }
  },

  // Entity-specific helpers
  getInventory: function() {
    return this.getState().inventory || [];
  },

  updateInventoryItem: function(sku, changes) {
    const state = this.getState();
    const idx = state.inventory.findIndex(i => i.sku === sku);
    if (idx !== -1) {
      state.inventory[idx] = { ...state.inventory[idx], ...changes };
      // Recalculate status
      const item = state.inventory[idx];
      const avail = Math.max(0, item.totalStock - item.reservedStock - item.damagedStock);
      if (item.totalStock <= 0 || avail <= 0) item.status = 'Out of Stock';
      else if (avail <= item.reorderLevel) item.status = avail <= 2 ? 'Critical' : 'Low Stock';
      else item.status = 'Healthy';

      this.saveState(state);

      // Async backend sync
      if (typeof API !== 'undefined') {
        API.updateInventoryItem(sku, changes).catch(() => {});
      }

      return state.inventory[idx];
    }
    return null;
  },

  getOrders: function() {
    return this.getState().orders || [];
  },

  getOrderById: function(orderId) {
    const orders = this.getOrders();
    return orders.find(o => o.id === orderId) || null;
  },

  updateOrder: function(orderId, changes) {
    const state = this.getState();
    const idx = state.orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      state.orders[idx] = { ...state.orders[idx], ...changes };
      this.saveState(state);

      // Async backend sync
      if (typeof API !== 'undefined') {
        API.updateOrder(orderId, changes).catch(() => {});
      }

      return state.orders[idx];
    }
    return null;
  },

  getPickingTasks: function() {
    return this.getState().pickingTasks || [];
  },

  updatePickingTask: function(taskId, changes) {
    const state = this.getState();
    const idx = state.pickingTasks.findIndex(t => t.taskId === taskId);
    if (idx !== -1) {
      state.pickingTasks[idx] = { ...state.pickingTasks[idx], ...changes };
      this.saveState(state);

      // Async backend sync
      if (typeof API !== 'undefined') {
        API.updatePickingTask(taskId, changes).catch(() => {});
      }

      return state.pickingTasks[idx];
    }
    return null;
  },

  getExceptions: function() {
    return this.getState().exceptions || [];
  },

  addException: function(exceptionData) {
    const state = this.getState();
    const newEx = {
      id: `EX-${Math.floor(100 + Math.random() * 900)}`,
      created: new Date().toISOString(),
      status: 'Action Required',
      ...exceptionData
    };
    state.exceptions.unshift(newEx);
    this.addActivityLog('System Decision Engine', `Created exception ${newEx.id} (${newEx.type}): ${newEx.description}`, 'danger');
    this.addNotification(`Exception Flagged: ${newEx.type}`, newEx.description, 'critical');
    this.saveState(state);

    // Async backend sync
    if (typeof API !== 'undefined') {
      API.addException(exceptionData).catch(() => {});
    }

    return newEx;
  },

  resolveException: function(exId, resolutionText = 'Resolved by Manager') {
    const state = this.getState();
    const idx = state.exceptions.findIndex(e => e.id === exId);
    if (idx !== -1) {
      state.exceptions[idx].status = 'Resolved';
      state.exceptions[idx].resolutionNotes = resolutionText;
      state.exceptions[idx].resolvedAt = new Date().toISOString();
      this.addActivityLog('Alex Morgan (Manager)', `Resolved exception ${exId}: ${resolutionText}`, 'success');
      this.saveState(state);

      // Async backend sync
      if (typeof API !== 'undefined') {
        API.resolveException(exId, resolutionText).catch(() => {});
      }

      return state.exceptions[idx];
    }
    return null;
  },

  getActivityLogs: function() {
    return this.getState().activityLogs || [];
  },

  addActivityLog: function(user, desc, type = 'info', title = 'Operation Executed') {
    const state = this.getState();
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newLog = {
      id: `LOG-${Math.floor(500 + Math.random() * 500)}`,
      time: timeStr,
      user: user || 'Alex Morgan (Manager)',
      title: title,
      desc: desc,
      type: type
    };
    state.activityLogs.unshift(newLog);
    if (state.activityLogs.length > 50) state.activityLogs.pop();
    this.saveState(state);

    // Async backend sync
    if (typeof API !== 'undefined') {
      API.addActivityLog({ user, desc, type, title }).catch(() => {});
    }
  },

  getNotifications: function() {
    return this.getState().notifications || [];
  },

  addNotification: function(title, desc, type = 'info') {
    const state = this.getState();
    const notif = {
      id: `NOTIF-${Date.now()}`,
      title: title,
      desc: desc,
      time: 'Just now',
      type: type,
      unread: true
    };
    state.notifications.unshift(notif);
    this.saveState(state);

    // Async backend sync
    if (typeof API !== 'undefined') {
      API.addNotification({ title, desc, type }).catch(() => {});
    }
  },

  markNotificationsRead: function() {
    const state = this.getState();
    state.notifications.forEach(n => { n.unread = false; });
    this.saveState(state);

    // Async backend sync
    if (typeof API !== 'undefined') {
      API.markNotificationsRead().catch(() => {});
    }
  },

  getSettings: function() {
    return this.getState().settings || (typeof SEED_DATA !== 'undefined' ? SEED_DATA.settings : {});
  }
};

/* ==========================================================================
   2. Mock Authentication & Session Manager
   ========================================================================== */
const AuthService = {
  getAvailableRoles: function() {
    return [
      { role: 'Manager', name: 'Alex Morgan', title: 'Warehouse Operations Manager', avatarColor: '#4f46e5' },
      { role: 'Admin', name: 'Dr. Sarah Connor', title: 'System Administrator', avatarColor: '#059669' },
      { role: 'Worker', name: 'Marcus Vance', title: 'Senior Lead Picker', avatarColor: '#d97706' }
    ];
  },

  getCurrentUser: function() {
    try {
      const auth = localStorage.getItem(AUTH_KEY);
      if (auth) return JSON.parse(auth);
    } catch (e) {}
    // Default fallback
    return {
      role: 'Manager',
      name: 'Alex Morgan',
      title: 'Warehouse Operations Manager',
      email: 'alex.morgan@waro.io',
      avatarColor: '#4f46e5'
    };
  },

  login: function(roleName = 'Manager') {
    const match = this.getAvailableRoles().find(r => r.role.toLowerCase() === roleName.toLowerCase()) || this.getAvailableRoles()[0];
    const userObj = {
      ...match,
      email: `${match.name.toLowerCase().replace(' ', '.')}@waro.io`,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(userObj));
    window.location.href = 'dashboard.html';
  },

  logout: function() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'index.html';
  },

  checkSession: function() {
    const isLoginPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
    const user = localStorage.getItem(AUTH_KEY);
    if (!user && !isLoginPage) {
      window.location.href = 'index.html';
    }
  }
};

/* ==========================================================================
   3. Toast Notification Service
   ========================================================================== */
const ToastService = {
  container: null,

  init: function() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show: function(message, type = 'info', title = '', duration = 4000) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>`;
    } else if (type === 'danger') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else if (type === 'warning') {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    } else {
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOutRight 0.3s forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

/* ==========================================================================
   4. Modal Overlay Controller
   ========================================================================== */
const ModalService = {
  open: function(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
  },

  close: function(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
  },

  closeAll: function() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  }
};

/* ==========================================================================
   5. Dynamic Header, Sidebar & Notifications Drawer Renderer
   ========================================================================== */
const UI = {
  initAppLayout: function(activePage = 'dashboard') {
    StorageService.init();
    AuthService.checkSession();
    this.renderBackendBadge();
    this.renderNotificationsDrawer();
    this.bindHeaderActions();
    this.updateLiveBadges();
    this.updateUserWidget();

    // Check backend connection health
    if (typeof API !== 'undefined') {
      API.checkHealth();
    }

    // Listen for state changes to refresh badges
    window.addEventListener('waro_state_updated', () => {
      this.updateLiveBadges();
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  renderBackendBadge: function() {
    const headerRight = document.querySelector('.header-right');
    if (headerRight && !document.getElementById('backendStatusBadge')) {
      const badgeContainer = document.createElement('div');
      badgeContainer.id = 'backendStatusBadge';
      badgeContainer.className = 'backend-badge online';
      badgeContainer.innerHTML = `<span class="status-indicator online"></span> Backend Connected`;
      badgeContainer.title = `REST API Connected`;
      headerRight.insertBefore(badgeContainer, headerRight.firstChild);
    }
  },

  updateUserWidget: function() {
    const user = AuthService.getCurrentUser();
    const nameEl = document.querySelector('.user-name');
    const roleEl = document.querySelector('.user-role');
    const avatarEl = document.querySelector('.user-avatar');

    if (nameEl) nameEl.textContent = user.name || 'Alex Morgan';
    if (roleEl) roleEl.textContent = `${user.role} • Active`;
    if (avatarEl) {
      avatarEl.textContent = (user.name || 'A').charAt(0);
      if (user.avatarColor) avatarEl.style.background = user.avatarColor;
    }
  },

  updateLiveBadges: function() {
    const state = StorageService.getState();
    const exceptions = state.exceptions || [];
    const openExceptions = exceptions.filter(e => e.status === 'Action Required' || e.status === 'Open').length;
    const orders = state.orders || [];
    const pendingOrders = orders.filter(o => ['New', 'Inventory Checking', 'Allocated'].includes(o.status)).length;
    const pickingTasks = (state.pickingTasks || []).filter(t => t.status !== 'Completed').length;

    // Badges in sidebar
    const exBadge = document.querySelector('.badge-exceptions-count');
    if (exBadge) {
      exBadge.textContent = openExceptions;
      exBadge.style.display = openExceptions > 0 ? 'inline-block' : 'none';
    }

    const pickBadge = document.querySelector('.badge-picking-count');
    if (pickBadge) {
      pickBadge.textContent = pickingTasks;
      pickBadge.style.display = pickingTasks > 0 ? 'inline-block' : 'none';
    }

    const orderBadge = document.querySelector('.badge-orders-count');
    if (orderBadge) {
      orderBadge.textContent = pendingOrders;
      orderBadge.style.display = pendingOrders > 0 ? 'inline-block' : 'none';
    }

    // Top header notifications dot
    const notifs = state.notifications || [];
    const unreadCount = notifs.filter(n => n.unread).length;
    const notifDot = document.querySelector('.header-badge-dot');
    if (notifDot) {
      notifDot.style.display = unreadCount > 0 ? 'block' : 'none';
    }
  },

  renderNotificationsDrawer: function() {
    let drawer = document.getElementById('notificationsDrawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'notificationsDrawer';
      drawer.className = 'notifications-drawer';
      document.body.appendChild(drawer);
    }

    const notifs = StorageService.getNotifications();
    drawer.innerHTML = `
      <div class="drawer-header">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--text-main);">Notifications</h3>
          <span class="badge badge-neutral">${notifs.filter(n => n.unread).length} Unread</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <button class="btn btn-ghost btn-sm" onclick="StorageService.markNotificationsRead(); UI.renderNotificationsDrawer(); UI.updateLiveBadges();">Mark read</button>
          <button class="modal-close" onclick="UI.toggleNotificationsDrawer(false)">&times;</button>
        </div>
      </div>
      <div class="drawer-body">
        ${notifs.map(n => `
          <div class="notif-item ${n.unread ? 'unread' : ''} ${n.type}">
            <div class="notif-icon">
              ${n.type === 'critical' ? '🔴' : n.type === 'warning' ? '⚠️' : 'ℹ️'}
            </div>
            <div style="flex: 1;">
              <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-main);">${n.title}</div>
              <div class="notif-text">${n.desc}</div>
              <div class="notif-time">${n.time}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  toggleNotificationsDrawer: function(show) {
    const drawer = document.getElementById('notificationsDrawer');
    if (drawer) {
      if (show === undefined) {
        drawer.classList.toggle('active');
      } else if (show) {
        drawer.classList.add('active');
      } else {
        drawer.classList.remove('active');
      }
    }
  },

  bindHeaderActions: function() {
    const notifBtn = document.getElementById('headerNotifBtn');
    if (notifBtn) {
      notifBtn.addEventListener('click', () => {
        this.renderNotificationsDrawer();
        this.toggleNotificationsDrawer();
      });
    }

    const mobileMenuBtn = document.getElementById('mobileMenuToggle');
    const sidebar = document.querySelector('.sidebar');
    const mobileOverlay = document.getElementById('mobileOverlay');

    if (mobileMenuBtn && sidebar) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        if (mobileOverlay) mobileOverlay.classList.toggle('active');
      });
    }

    if (mobileOverlay && sidebar) {
      mobileOverlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        mobileOverlay.classList.remove('active');
      });
    }

    // Global shortcut: Escape closes modals & drawer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        ModalService.closeAll();
        this.toggleNotificationsDrawer(false);
      }
    });
  }
};

// Global exports
if (typeof window !== 'undefined') {
  window.StorageService = StorageService;
  window.AuthService = AuthService;
  window.ToastService = ToastService;
  window.ModalService = ModalService;
  window.UI = UI;
}
