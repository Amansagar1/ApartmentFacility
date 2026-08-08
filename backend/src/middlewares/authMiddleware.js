const jwt = require('jsonwebtoken');
const User = require('../modules/users/models/User');
const { AppError } = require('./errorHandler');
const { HTTP_STATUS } = require('../utils/constants');

// ----------------Protect Routes: Verify JWT Token------------
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in cookies (Web) or Headers (Mobile App fallback)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Not authorized to access this route', HTTP_STATUS.UNAUTHORIZED));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token and attach to request object
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new AppError('User belonging to this token no longer exists', HTTP_STATUS.UNAUTHORIZED));
    }

    next();
  } catch (error) {
    return next(new AppError('Not authorized to access this route (Invalid Token)', HTTP_STATUS.UNAUTHORIZED));
  }
};

// ----------------Global Role Authorization------------
// Note: Specific association roles are checked within association routes
const authorizeSuperAdmin = (req, res, next) => {
  if (!req.user || !req.user.isSuperAdmin) {
    return next(new AppError('Access Denied. Super Admin only.', HTTP_STATUS.FORBIDDEN));
  }
  next();
};

module.exports = { protect, authorizeSuperAdmin };
