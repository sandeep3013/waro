const dataStore = require('../services/dataStore');

exports.getDispatchOrders = (req, res) => {
  try {
    const ready = dataStore.getOrders().filter(o => o.status === 'Ready to Dispatch');
    const recentDispatched = dataStore.getOrders().filter(o => o.status === 'Dispatched' || o.status === 'Delivered').slice(0, 10);
    res.json({
      success: true,
      readyCount: ready.length,
      ready,
      recentDispatched
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.dispatchOrder = (req, res) => {
  try {
    const { orderId } = req.params;
    const { carrier, trackingNumber } = req.body;
    const order = dataStore.getOrder(orderId);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    order.status = 'Dispatched';
    if (carrier) order.carrier = carrier;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    const dispatchStage = order.timeline.find(t => t.stage === 'Dispatch');
    if (dispatchStage) {
      dispatchStage.status = 'completed';
      dispatchStage.time = new Date().toLocaleTimeString().slice(0, 5);
    }

    const updated = dataStore.updateOrder(orderId, order);
    dataStore.addActivityLog(
      'Sarah Jenkins (Dispatch)',
      `Order ${orderId} handed over to ${order.carrier} with Tracking #${order.trackingNumber || 'DHL-8849102-EU'}.`,
      'info',
      'Order Dispatched'
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
