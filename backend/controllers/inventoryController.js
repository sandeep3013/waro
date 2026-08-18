const dataStore = require('../services/dataStore');

exports.getAllInventory = (req, res) => {
  try {
    const { category, status, search } = req.query;
    let items = dataStore.getInventory();

    if (category && category !== 'All Categories') {
      items = items.filter(i => i.category === category);
    }
    if (status && status !== 'All Statuses') {
      items = items.filter(i => i.status.toLowerCase().replace(' ', '-') === status.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(i => i.sku.toLowerCase().includes(q) || i.name.toLowerCase().includes(q) || i.location.toLowerCase().includes(q));
    }

    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getInventoryItem = (req, res) => {
  try {
    const item = dataStore.getInventoryItem(req.params.sku);
    if (!item) return res.status(404).json({ success: false, error: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createInventoryItem = (req, res) => {
  try {
    const { sku, name, category, location, totalStock, unitPrice, reorderLevel, unitWeight } = req.body;
    if (!sku || !name || !location) {
      return res.status(400).json({ success: false, error: 'SKU, name, and location are required' });
    }

    const existing = dataStore.getInventoryItem(sku);
    if (existing) {
      return res.status(409).json({ success: false, error: `SKU ${sku} already exists` });
    }

    const newItem = {
      sku: sku.toUpperCase(),
      name,
      category: category || 'General',
      location: location.toUpperCase(),
      totalStock: parseInt(totalStock, 10) || 0,
      reservedStock: 0,
      damagedStock: 0,
      reorderLevel: parseInt(reorderLevel, 10) || 10,
      unitPrice: parseFloat(unitPrice) || 0,
      unitWeight: parseFloat(unitWeight) || 0.5,
      status: (parseInt(totalStock, 10) || 0) <= 0 ? 'Out of Stock' : (parseInt(totalStock, 10) || 0) <= (parseInt(reorderLevel, 10) || 10) ? 'Low Stock' : 'Healthy'
    };

    const saved = dataStore.createInventoryItem(newItem);
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateInventoryItem = (req, res) => {
  try {
    const updated = dataStore.updateInventoryItem(req.params.sku, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Item not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.adjustStock = (req, res) => {
  try {
    const { delta, reason } = req.body;
    const item = dataStore.getInventoryItem(req.params.sku);
    if (!item) return res.status(404).json({ success: false, error: 'Item not found' });

    const numDelta = parseInt(delta, 10);
    const newTotal = Math.max(0, item.totalStock + numDelta);
    const updated = dataStore.updateInventoryItem(req.params.sku, { totalStock: newTotal });

    dataStore.addActivityLog(
      'Alex Morgan (Manager)',
      `Stock adjusted for ${item.name} (${numDelta > 0 ? '+' : ''}${numDelta}). Reason: ${reason || 'Manual Adjustment'}`,
      'info',
      'Inventory Adjusted'
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.reportDamaged = (req, res) => {
  try {
    const { qty, notes } = req.body;
    const item = dataStore.getInventoryItem(req.params.sku);
    if (!item) return res.status(404).json({ success: false, error: 'Item not found' });

    const damQty = parseInt(qty, 10) || 1;
    const updated = dataStore.updateInventoryItem(req.params.sku, {
      damagedStock: item.damagedStock + damQty
    });

    dataStore.addException({
      type: 'Damaged Item',
      severity: 'Critical',
      orderId: null,
      sku: item.sku,
      productName: item.name,
      description: `${damQty}x damaged units reported in bin ${item.location}. Notes: ${notes || 'Visual inspection flaw.'}`,
      recommendedAction: 'Quarantine damaged stock, write-off defective inventory, and trigger replenishment if needed.',
      actionType: 'quarantine'
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.reorderStock = (req, res) => {
  try {
    const { qty } = req.body;
    const item = dataStore.getInventoryItem(req.params.sku);
    if (!item) return res.status(404).json({ success: false, error: 'Item not found' });

    const reorderQty = parseInt(qty, 10) || 25;
    const updated = dataStore.updateInventoryItem(req.params.sku, {
      totalStock: item.totalStock + reorderQty
    });

    dataStore.addActivityLog(
      'Alex Morgan (Manager)',
      `Placed emergency purchase order PO-${Math.floor(100 + Math.random()*900)} for ${reorderQty}x ${item.name}.`,
      'success',
      'PO Dispatched'
    );

    res.json({ success: true, data: updated, message: `Successfully reordered ${reorderQty} units.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
