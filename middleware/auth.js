const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ message: 'Super Admin access required' });
  }
};

const schoolOnly = (req, res, next) => {
  if (req.user && req.user.role === 'school') {
    next();
  } else {
    res.status(403).json({ message: 'School access required' });
  }
};

const teacherOnly = (req, res, next) => {
  if (req.user && req.user.role === 'teacher') {
    next();
  } else {
    res.status(403).json({ message: 'Teacher access required' });
  }
};

const counsellorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'counsellor') {
    next();
  } else {
    res.status(403).json({ message: 'Counsellor access required' });
  }
};

const staffOnly = (req, res, next) => {
  if (req.user && req.user.role === 'staff') {
    next();
  } else {
    res.status(403).json({ message: 'Staff access required' });
  }
};

module.exports = { auth, adminOnly, superAdminOnly, schoolOnly, teacherOnly, counsellorOnly, staffOnly };
