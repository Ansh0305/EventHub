const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null;
  if (!token) return res.status(401).json({ success: false, error: 'Not authorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ success: false, error: 'User not found' });
    next();
  } catch { return res.status(401).json({ success: false, error: 'Not authorized' }); }
};

const admin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  return res.status(403).json({ success: false, error: 'Admin access required' });
};

const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer') ? req.headers.authorization.split(' ')[1] : null;
  if (token) {
    try { req.user = await User.findById(jwt.verify(token, process.env.JWT_SECRET).id); }
    catch { req.user = null; }
  }
  next();
};

module.exports = { protect, optionalAuth, admin };
