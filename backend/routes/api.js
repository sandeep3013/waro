/**
 * WARO - CENTRAL API ROUTER
 */

const express = require('express');
const router = express.Router();

const inventoryCtrl = require('../controllers/inventoryController');
const ordersCtrl = require('../controllers/ordersController');
const pickingCtrl = require('../controllers/pickingController');
const packingCtrl = require('../controllers/packingController');
const dispatchCtrl = require('../controllers/dispatchController');
const allocationCtrl = require('../controllers/allocationController');
const exceptionsCtrl = require('../controllers/exceptionsController');
const analyticsCtrl = require('../controllers/analyticsController');
const decisionCtrl = require('../controllers/decisionEngineController');
const logsCtrl = require('../controllers/activityLogsController');
const notifsCtrl = require('../controllers/notificationsController');
const settingsCtrl = require('../controllers/settingsController');
const authCtrl = require('../controllers/authController');
const dataStore = require('../services/dataStore');

// --- System & State ---
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    service: 'Waro WMS Backend API',
    uptime: process.uptime()
  });
});

router.get('/state', (req, res) => {
  res.json({ success: true, state: dataStore.getState() });
});

router.post('/reset', settingsCtrl.resetWarehouseState);

// --- Inventory Endpoints ---
router.get('/inventory', inventoryCtrl.getAllInventory);
router.get('/inventory/:sku', inventoryCtrl.getInventoryItem);
router.post('/inventory', inventoryCtrl.createInventoryItem);
router.put('/inventory/:sku', inventoryCtrl.updateInventoryItem);
router.post('/inventory/:sku/adjust', inventoryCtrl.adjustStock);
router.post('/inventory/:sku/damage', inventoryCtrl.reportDamaged);
router.post('/inventory/:sku/reorder', inventoryCtrl.reorderStock);

// --- Orders Endpoints ---
router.get('/orders', ordersCtrl.getAllOrders);
router.get('/orders/:id', ordersCtrl.getOrderById);
router.post('/orders', ordersCtrl.createOrder);
router.put('/orders/:id', ordersCtrl.updateOrder);

// --- Picking Endpoints ---
router.get('/picking', pickingCtrl.getAllPickingTasks);
router.get('/picking/:taskId', pickingCtrl.getPickingTask);
router.put('/picking/:taskId', pickingCtrl.updatePickingTask);
router.post('/picking/:taskId/optimize-route', pickingCtrl.optimizeRoute);
router.post('/picking/:taskId/complete', pickingCtrl.completePickingTask);

// --- Packing Endpoints ---
router.get('/packing', packingCtrl.getPackingOrders);
router.post('/packing/:orderId/complete', packingCtrl.completePacking);
router.post('/packing/:orderId/damage', packingCtrl.reportPackingDamage);

// --- Dispatch Endpoints ---
router.get('/dispatch', dispatchCtrl.getDispatchOrders);
router.post('/dispatch/:orderId', dispatchCtrl.dispatchOrder);

// --- Allocation Endpoints ---
router.get('/allocation/conflicts', allocationCtrl.getConflicts);
router.post('/allocation/resolve', allocationCtrl.resolveConflict);

// --- Exceptions Endpoints ---
router.get('/exceptions', exceptionsCtrl.getAllExceptions);
router.post('/exceptions', exceptionsCtrl.addException);
router.put('/exceptions/:id/resolve', exceptionsCtrl.resolveException);

// --- Decision Engine & Analytics ---
router.get('/analytics', analyticsCtrl.getAnalytics);
router.get('/decision-engine/health-score', decisionCtrl.getHealthScore);
router.get('/decision-engine/recommendations', decisionCtrl.getRecommendations);
router.post('/decision-engine/simulate', decisionCtrl.simulateWhatIf);

// --- Activity Logs & Notifications ---
router.get('/activity-logs', logsCtrl.getActivityLogs);
router.post('/activity-logs', logsCtrl.addActivityLog);
router.get('/notifications', notifsCtrl.getNotifications);
router.post('/notifications', notifsCtrl.addNotification);
router.post('/notifications/read', notifsCtrl.markRead);

// --- Settings & Workers ---
router.get('/settings', settingsCtrl.getSettings);
router.put('/settings', settingsCtrl.updateSettings);
router.get('/workers', settingsCtrl.getWorkers);

// --- Auth ---
router.get('/auth/roles', authCtrl.getAvailableRoles);
router.post('/auth/login', authCtrl.login);

module.exports = router;
