const dataStore = require('../services/dataStore');
const decisionEngine = require('../services/decisionEngineService');

exports.getAllOrders = (req, res) => {
  try {
    const { status, priority, search, sortBy } = req.query;
    let orders = dataStore.getOrders();

    if (status && status !== 'All') {
      orders = orders.filter(o => o.status.toLowerCase() === status.toLowerCase());
    }
    if (priority && priority !== 'All') {
      orders = orders.filter(o => o.priority.toLowerCase() === priority.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      orders = orders.filter(o => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || (o.carrier && o.carrier.toLowerCase().includes(q)));
    }

    if (sortBy === 'priority') {
      orders.sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
    } else if (sortBy === 'value') {
      orders.sort((a, b) => b.totalValue - a.totalValue);
    }

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getOrderById = (req, res) => {
  try {
    const order = dataStore.getOrder(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createOrder = (req, res) => {
  try {
    const { customer, customerTier, items, carrier, deadline } = req.body;
    if (!customer || !items || !items.length) {
      return res.status(400).json({ success: false, error: 'Customer and items are required' });
    }

    const orderId = `ORD-${Math.floor(1100 + Math.random() * 900)}`;
    const totalVal = items.reduce((acc, it) => acc + (it.price || 20) * (it.qty || 1), 0);

    const newOrder = {
      id: orderId,
      customer,
      customerTier: customerTier || 'Standard',
      items,
      totalValue: +totalVal.toFixed(2),
      created: new Date().toISOString(),
      deadline: deadline || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      priority: customerTier === 'VIP / Tier 1' ? 'Critical' : 'Medium',
      status: 'New',
      risk: 'None',
      carrier: carrier || 'FedEx Express',
      assignedWorker: null,
      timeline: [
        { stage: 'Order Created', time: new Date().toLocaleTimeString().slice(0, 5), status: 'completed' },
        { stage: 'Priority Engine', time: new Date().toLocaleTimeString().slice(0, 5), status: 'completed' },
        { stage: 'Inventory Checking', time: new Date().toLocaleTimeString().slice(0, 5), status: 'active' },
        { stage: 'Smart Allocation', time: null, status: 'pending' },
        { stage: 'Picking', time: null, status: 'pending' },
        { stage: 'Packing', time: null, status: 'pending' },
        { stage: 'Quality Check', time: null, status: 'pending' },
        { stage: 'Dispatch', time: null, status: 'pending' }
      ]
    };

    newOrder.priorityScore = decisionEngine.calculatePriorityScore(newOrder);
    const saved = dataStore.createOrder(newOrder);
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateOrder = (req, res) => {
  try {
    const updated = dataStore.updateOrder(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
