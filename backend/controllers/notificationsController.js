const dataStore = require('../services/dataStore');

exports.getNotifications = (req, res) => {
  try {
    const notifs = dataStore.getNotifications();
    res.json({ success: true, count: notifs.length, data: notifs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.addNotification = (req, res) => {
  try {
    const { title, desc, type } = req.body;
    if (!title || !desc) return res.status(400).json({ success: false, error: 'Title and description are required' });

    const notif = dataStore.addNotification(title, desc, type);
    res.status(201).json({ success: true, data: notif });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.markRead = (req, res) => {
  try {
    const notifs = dataStore.markNotificationsRead();
    res.json({ success: true, data: notifs, message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
