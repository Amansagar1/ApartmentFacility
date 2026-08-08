const User = require('../models/User');
const { AppError } = require('../../../middlewares/errorHandler');
const { HTTP_STATUS } = require('../../../utils/constants');

// ----------------Get Association Members------------
// GET /api/v1/associations/:id/members
const getAssociationMembers = async (req, res, next) => {
  try {
    const associationId = req.params.id;
    const users = await User.find({
      'memberships.associationId': associationId
    }).select('fullName email memberships');

    // Format the response
    const members = users.map(user => {
      const membership = user.memberships.find(m => m.associationId.toString() === associationId);
      return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: membership.role,
        status: membership.status,
        unitNumber: membership.unitNumber
      };
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

// ----------------Update Membership Status (Approve/Reject)------------
// PUT /api/v1/associations/:id/members/:userId
const updateMembershipStatus = async (req, res, next) => {
  try {
    const associationId = req.params.id;
    const userId = req.params.userId;
    const { status, role } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
    }

    const membership = user.memberships.find(m => m.associationId.toString() === associationId);
    if (!membership) {
      return next(new AppError('Membership not found for this user', HTTP_STATUS.NOT_FOUND));
    }

    if (status) membership.status = status;
    if (role) membership.role = role;

    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Membership updated successfully',
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: membership.role,
        status: membership.status,
        unitNumber: membership.unitNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAssociationMembers, updateMembershipStatus };
