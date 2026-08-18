const roles = [
  { role: 'Manager', name: 'Alex Morgan', title: 'Warehouse Operations Manager', avatarColor: '#4f46e5', email: 'alex.morgan@waro.io' },
  { role: 'Admin', name: 'Dr. Sarah Connor', title: 'System Administrator', avatarColor: '#059669', email: 'dr.sarah.connor@waro.io' },
  { role: 'Worker', name: 'Marcus Vance', title: 'Senior Lead Picker', avatarColor: '#d97706', email: 'marcus.vance@waro.io' }
];

exports.getAvailableRoles = (req, res) => {
  res.json({ success: true, data: roles });
};

exports.login = (req, res) => {
  const { roleName } = req.body;
  const user = roles.find(r => r.role.toLowerCase() === (roleName || '').toLowerCase()) || roles[0];
  res.json({
    success: true,
    user: {
      ...user,
      loginTime: new Date().toISOString(),
      token: `mock_jwt_token_${user.role.toLowerCase()}_${Date.now()}`
    }
  });
};
