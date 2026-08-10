const User = require('../models/User');
const { AppError } = require('../../../middlewares/errorHandler');
const { HTTP_STATUS } = require('../../../utils/constants');

// ----------------Helper function to send JWT in cookie------------
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true, // Crucial for security against XSS
    secure: true,
    sameSite: 'none',
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
    },
  });
};

// ----------------Register User------------
const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError('User with this email already exists', HTTP_STATUS.BAD_REQUEST));
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
    });

    sendTokenResponse(user, HTTP_STATUS.CREATED, res);
  } catch (error) {
    next(error);
  }
};

// ----------------Login User------------
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user and include password field for verification
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return next(new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED));
    }

    sendTokenResponse(user, HTTP_STATUS.OK, res);
  } catch (error) {
    next(error);
  }
};

// ----------------Get Current User (Protected)------------
const getMe = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user.id).populate('memberships.associationId', 'name address');
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ----------------Logout User------------
const logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000), // Expire in 10 seconds
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getMe };
