const dataStore = require('../services/dataStore');

exports.getAllExceptions = (req, res) => {
  try {
    const { status, severity, search } = req.query;
    let exceptions = dataStore.getExceptions();

    if (status && status !== 'All Statuses') {
      exceptions = exceptions.filter(e => e.status.toLowerCase() === status.toLowerCase());
    }
    if (severity && severity !== 'All Severities') {
      exceptions = exceptions.filter(e => e.severity.toLowerCase() === severity.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      exceptions = exceptions.filter(e => e.id.toLowerCase().includes(q) || (e.productName && e.productName.toLowerCase().includes(q)) || (e.description && e.description.toLowerCase().includes(q)));
    }

    res.json({ success: true, count: exceptions.length, data: exceptions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.addException = (req, res) => {
  try {
    const { type, severity, orderId, sku, productName, description, recommendedAction } = req.body;
    if (!type || !description) {
      return res.status(400).json({ success: false, error: 'Type and description are required' });
    }

    const newEx = dataStore.addException({
      type,
      severity: severity || 'Warning',
      orderId: orderId || null,
      sku: sku || null,
      productName: productName || 'Warehouse Item',
      description,
      recommendedAction: recommendedAction || 'Review discrepancy and take corrective action.',
      actionType: 'manual'
    });

    res.status(201).json({ success: true, data: newEx });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.resolveException = (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;
    const resolved = dataStore.resolveException(id, resolutionNotes || 'Resolved by Manager');
    if (!resolved) return res.status(404).json({ success: false, error: 'Exception not found' });
    res.json({ success: true, data: resolved, message: `Exception ${id} resolved.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
