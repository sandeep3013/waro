const dataStore = require('../services/dataStore');

exports.getPackingOrders = (req, res) => {
  try {
    const orders = dataStore.getOrders().filter(o => ['Packing', 'Quality Check'].includes(o.status));
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.completePacking = (req, res) => {
  try {
    const { orderId } = req.params;
    const { cartonSize, weight, trackingNumber } = req.body;
    const order = dataStore.getOrder(orderId);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    order.status = 'Ready to Dispatch';
    order.packageSize = cartonSize || 'Medium Box (12x9x6 in)';
    order.totalWeight = weight || 1.15;
    order.trackingNumber = trackingNumber || `TRK-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const packStage = order.timeline.find(t => t.stage === 'Packing');
    if (packStage) packStage.status = 'completed';
    const qcStage = order.timeline.find(t => t.stage === 'Quality Check');
    if (qcStage) qcStage.status = 'completed';
    const dispatchStage = order.timeline.find(t => t.stage === 'Dispatch');
    if (dispatchStage) {
      dispatchStage.status = 'active';
      dispatchStage.time = new Date().toLocaleTimeString().slice(0, 5);
    }

    const updated = dataStore.updateOrder(orderId, order);
    dataStore.addActivityLog(
      'Elena Rostova (Packer)',
      `Completed packing & QC on ${orderId}. Staged on Bay Dock 3 for dispatch. Tracking: ${order.trackingNumber}`,
      'success',
      'Ready to Dispatch'
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.reportPackingDamage = (req, res) => {
  try {
    const { orderId } = req.params;
    const { sku, reason } = req.body;
    const order = dataStore.getOrder(orderId);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    order.status = 'Quality Check';
    const item = (order.items || []).find(i => i.sku === sku) || order.items[0];
    if (item) item.status = 'Damaged';

    const qcStage = order.timeline.find(t => t.stage === 'Quality Check');
    if (qcStage) qcStage.status = 'problem';

    dataStore.updateOrder(orderId, order);

    const ex = dataStore.addException({
      type: 'Damaged Item',
      severity: 'Critical',
      orderId: orderId,
      sku: item ? item.sku : 'SKU-UNKNOWN',
      productName: item ? item.name : 'Unknown Product',
      description: `Physical defect flagged during packing/QC inspection: ${reason || 'Damaged casing'}.`,
      recommendedAction: 'Allocate replacement stock from reserve storage bin and write off damaged item.',
      actionType: 'allocate_replacement'
    });

    res.json({ success: true, data: order, exception: ex });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
