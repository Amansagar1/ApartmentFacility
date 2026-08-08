const Association = require('../models/Association');
const User = require('../../users/models/User');
const { AppError } = require('../../../middlewares/errorHandler');
const { HTTP_STATUS } = require('../../../utils/constants');

// ----------------Create New Association------------
const createAssociation = async (req, res, next) => {
  try {
    const { name, address, city, state, pincode, totalUnits } = req.body;

    // 1. Create the base association document
    const association = await Association.create({
      name,
      address,
      city,
      state,
      pincode,
      totalUnits,
    });

    // 2. Automatically link the creator to this association as an 'Admin'
    // This is the core multi-tenancy rule
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: {
          memberships: {
            associationId: association._id,
            role: 'Admin',
            isActive: true,
          },
        },
      },
      { new: true } // Returns the newly updated document
    ).populate('memberships.associationId');

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Association created successfully',
      data: user, // Return the full updated user object so the Frontend can update Zustand
    });
  } catch (error) {
    next(error);
  }
};

// ----------------Get User's Associations------------
const getMyAssociations = async (req, res, next) => {
  try {
    // req.user is guaranteed to exist because of the 'protect' middleware
    const user = await User.findById(req.user.id).populate('memberships.associationId');
    
    // Extract just the association documents from the memberships array
    const associations = user.memberships.map(m => m.associationId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: associations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAssociation, getMyAssociations };
