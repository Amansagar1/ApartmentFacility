const Visitor = require('../models/Visitor');
const { AppError } = require('../../../middlewares/errorHandler');
const { HTTP_STATUS } = require('../../../utils/constants');

// ----------------Add New Visitor (Gatekeeper logs entry)------------
const addVisitor = async (req, res, next) => {
  try {
    const visitor = await Visitor.create(req.body);
    res.status(HTTP_STATUS.CREATED).json({ 
      success: true, 
      message: 'Visitor logged successfully',
      data: visitor 
    });
  } catch (error) { 
    next(error); 
  }
};

// ----------------Update Visitor Status (Resident approves, Gatekeeper marks exit)------------
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    let updateData = { status };
    
    // Automatically log times based on status
    if (status === 'ENTERED') updateData.entryTime = new Date();
    if (status === 'EXITED') updateData.exitTime = new Date();

    const visitor = await Visitor.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    
    if (!visitor) {
      return next(new AppError('Visitor not found', HTTP_STATUS.NOT_FOUND));
    }

    res.status(HTTP_STATUS.OK).json({ 
      success: true, 
      message: `Visitor status updated to ${status}`,
      data: visitor 
    });
  } catch (error) { 
    next(error); 
  }
};

// ----------------Get Pending Visitors for a specific Flat (For Resident)------------
const getPendingForFlat = async (req, res, next) => {
  try {
    const visitors = await Visitor.find({ 
      flatId: req.params.flatId, 
      status: 'PENDING' 
    }).sort('-createdAt');
    
    res.status(HTTP_STATUS.OK).json({ 
      success: true, 
      count: visitors.length, 
      data: visitors 
    });
  } catch (error) { 
    next(error); 
  }
};

// ----------------Get All Visitors for Association (For Gatekeeper History)------------
const getAllForAssociation = async (req, res, next) => {
  try {
    // Populate the flat details so the gatekeeper can see "Block A - 101" instead of just an ID
    const visitors = await Visitor.find({ 
      associationId: req.params.associationId 
    }).populate('flatId', 'blockName flatNumber').sort('-createdAt');
    
    res.status(HTTP_STATUS.OK).json({ 
      success: true, 
      count: visitors.length, 
      data: visitors 
    });
  } catch (error) { 
    next(error); 
  }
};

module.exports = { addVisitor, updateStatus, getPendingForFlat, getAllForAssociation };
