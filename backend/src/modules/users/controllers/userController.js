const User = require('../models/User');
const Association = require('../../associations/models/Association');
const { AppError } = require('../../../middlewares/errorHandler');
const { HTTP_STATUS, ROLES, MEMBERSHIP_STATUS } = require('../../../utils/constants');

// ----------------Create User (Super Admin only)------------
const createUser = async (req, res, next) => {
  try {
    const { fullName, email, password, role, associationId, phone } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return next(new AppError('User with this email already exists', HTTP_STATUS.BAD_REQUEST));
    }

    let isSuperAdmin = false;
    let isGatekeeper = false;
    let memberships = [];

    if (role === ROLES.SUPER_ADMIN) {
      isSuperAdmin = true;
    } else {
      // All other roles require an associationId
      if (!associationId) {
        return next(new AppError(`Please provide an associationId for role ${role}`, HTTP_STATUS.BAD_REQUEST));
      }

      // Verify association exists
      const association = await Association.findById(associationId);
      if (!association) {
        return next(new AppError('Association not found', HTTP_STATUS.NOT_FOUND));
      }

      if (role === ROLES.EMPLOYEE) {
        isGatekeeper = true;
      }

      memberships.push({
        associationId,
        role: role,
        status: MEMBERSHIP_STATUS.ACTIVE
      });
    }

    user = await User.create({
      fullName,
      email,
      password,
      phone,
      isSuperAdmin,
      isGatekeeper,
      memberships
    });

    // Don't return password in response
    user.password = undefined;

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// ----------------Get All Users (Super Admin only)------------
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .populate('memberships.associationId', 'name address')
      .sort('-createdAt');
      
    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getAllUsers
};
