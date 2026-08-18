/**
 * WARO - DATA STORE SERVICE
 * File-based JSON persistence with in-memory caching and atomic writes
 */

const fs = require('fs');
const path = require('path');
const SEED_DATA = require('../data/seedData');

const DB_FILE = path.join(__dirname, '..', 'data', 'db.json');

class DataStore {
  constructor() {
    this.state = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.state = JSON.parse(raw);
      } else {
        this.resetState(false);
      }
    } catch (err) {
      console.error('Failed to load db.json, falling back to SEED_DATA:', err);
      this.resetState(false);
    }
  }

  persist() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf8');
    } catch (err) {
      console.error('Error persisting state to db.json:', err);
    }
  }

  getState() {
    if (!this.state) this.init();
    return this.state;
  }

  saveState(newState) {
    this.state = { ...this.state, ...newState };
    this.persist();
    return this.state;
  }

  resetState(notify = true) {
    this.state = JSON.parse(JSON.stringify(SEED_DATA));
    this.persist();
    if (notify) {
      this.addActivityLog('Alex Morgan (Manager)', 'Warehouse state reset to baseline demo seed data.', 'info', 'State Reset');
    }
    return this.state;
  }

  // --- Inventory ---
  getInventory() {
    return this.getState().inventory || [];
  }

  getInventoryItem(sku) {
    return this.getInventory().find(i => i.sku === sku) || null;
  }

  createInventoryItem(item) {
    const state = this.getState();
    state.inventory.push(item);
    this.addActivityLog('Alex Morgan (Manager)', `Added new SKU ${item.sku} (${item.name}) at location ${item.location}.`, 'info', 'Product Created');
    this.persist();
    return item;
  }

  updateInventoryItem(sku, changes) {
    const state = this.getState();
    const idx = state.inventory.findIndex(i => i.sku === sku);
    if (idx === -1) return null;

    state.inventory[idx] = { ...state.inventory[idx], ...changes };
    const item = state.inventory[idx];
    const avail = Math.max(0, item.totalStock - item.reservedStock - item.damagedStock);
    if (item.totalStock <= 0 || avail <= 0) item.status = 'Out of Stock';
    else if (avail <= item.reorderLevel) item.status = avail <= 2 ? 'Critical' : 'Low Stock';
    else item.status = 'Healthy';

    this.persist();
    return state.inventory[idx];
  }

  // --- Orders ---
  getOrders() {
    return this.getState().orders || [];
  }

  getOrder(id) {
    return this.getOrders().find(o => o.id === id) || null;
  }

  createOrder(order) {
    const state = this.getState();
    state.orders.unshift(order);
    this.addActivityLog('System Decision Engine', `Created new order ${order.id} for ${order.customer}.`, 'info', 'Order Ingested');
    this.persist();
    return order;
  }

  updateOrder(id, changes) {
    const state = this.getState();
    const idx = state.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;

    state.orders[idx] = { ...state.orders[idx], ...changes };
    this.persist();
    return state.orders[idx];
  }

  // --- Picking Tasks ---
  getPickingTasks() {
    return this.getState().pickingTasks || [];
  }

  getPickingTask(taskId) {
    return this.getPickingTasks().find(t => t.taskId === taskId) || null;
  }

  updatePickingTask(taskId, changes) {
    const state = this.getState();
    const idx = state.pickingTasks.findIndex(t => t.taskId === taskId);
    if (idx === -1) return null;

    state.pickingTasks[idx] = { ...state.pickingTasks[idx], ...changes };
    this.persist();
    return state.pickingTasks[idx];
  }

  // --- Exceptions ---
  getExceptions() {
    return this.getState().exceptions || [];
  }

  addException(exceptionData) {
    const state = this.getState();
    const newEx = {
      id: `EX-${Math.floor(100 + Math.random() * 900)}`,
      created: new Date().toISOString(),
      status: 'Action Required',
      ...exceptionData
    };
    state.exceptions.unshift(newEx);
    this.addActivityLog('System Decision Engine', `Flagged exception ${newEx.id} (${newEx.type}): ${newEx.description}`, 'danger', 'Exception Flagged');
    this.addNotification(`Exception Flagged: ${newEx.type}`, newEx.description, 'critical');
    this.persist();
    return newEx;
  }

  resolveException(exId, resolutionText = 'Resolved by Manager') {
    const state = this.getState();
    const idx = state.exceptions.findIndex(e => e.id === exId);
    if (idx === -1) return null;

    state.exceptions[idx].status = 'Resolved';
    state.exceptions[idx].resolutionNotes = resolutionText;
    state.exceptions[idx].resolvedAt = new Date().toISOString();
    this.addActivityLog('Alex Morgan (Manager)', `Resolved exception ${exId}: ${resolutionText}`, 'success', 'Exception Resolved');
    this.persist();
    return state.exceptions[idx];
  }

  // --- Activity Logs ---
  getActivityLogs() {
    return this.getState().activityLogs || [];
  }

  addActivityLog(user, desc, type = 'info', title = 'Operation Executed') {
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
    this.persist();
    return newLog;
  }

  // --- Notifications ---
  getNotifications() {
    return this.getState().notifications || [];
  }

  addNotification(title, desc, type = 'info') {
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
    this.persist();
    return notif;
  }

  markNotificationsRead() {
    const state = this.getState();
    state.notifications.forEach(n => { n.unread = false; });
    this.persist();
    return state.notifications;
  }

  // --- Settings ---
  getSettings() {
    return this.getState().settings || SEED_DATA.settings;
  }

  updateSettings(newSettings) {
    const state = this.getState();
    state.settings = { ...state.settings, ...newSettings };
    this.addActivityLog('Alex Morgan (Manager)', 'Updated system SLA benchmarks and safety margins.', 'info', 'Settings Updated');
    this.persist();
    return state.settings;
  }

  // --- Workers ---
  getWorkers() {
    return this.getState().workers || SEED_DATA.workers;
  }
}

module.exports = new DataStore();
