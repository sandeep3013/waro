const dataStore = require('../services/dataStore');

exports.getSettings = (req, res) => {
  try {
    const settings = dataStore.getSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateSettings = (req, res) => {
  try {
    const updated = dataStore.updateSettings(req.body);
    res.json({ success: true, data: updated, message: 'Settings updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.resetWarehouseState = (req, res) => {
  try {
    const state = dataStore.resetState(true);
    res.json({ success: true, message: 'Warehouse state restored to default seed values.', state });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getWorkers = (req, res) => {
  try {
    const workers = dataStore.getWorkers();
    res.json({ success: true, count: workers.length, data: workers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
