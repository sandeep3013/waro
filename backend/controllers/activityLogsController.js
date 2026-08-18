const dataStore = require('../services/dataStore');

exports.getActivityLogs = (req, res) => {
  try {
    const logs = dataStore.getActivityLogs();
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.addActivityLog = (req, res) => {
  try {
    const { user, desc, type, title } = req.body;
    if (!desc) return res.status(400).json({ success: false, error: 'Description is required' });

    const log = dataStore.addActivityLog(user, desc, type, title);
    res.status(201).json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
