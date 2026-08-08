const Flat = require('../models/Flat');
const { AppError } = require('../../../middlewares/errorHandler');
const { HTTP_STATUS } = require('../../../utils/constants');

// ----------------Add New Flat------------
const addFlat = async (req, res, next) => {
  try {
    const { associationId, blockName, flatNumber, ownerEmail, tenantEmail } = req.body;

    // Check if flat already exists
    const flatExists = await Flat.findOne({ associationId, blockName, flatNumber });
    if (flatExists) {
      return next(new AppError(`Flat ${flatNumber} already exists in Block ${blockName}`, HTTP_STATUS.BAD_REQUEST));
    }

    const flat = await Flat.create({
      associationId,
      blockName,
      flatNumber,
      ownerEmail,
      tenantEmail,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Flat added successfully',
      data: flat,
    });
  } catch (error) {
    next(error);
  }
};

// ----------------Get All Flats for Association------------
const getFlatsByAssociation = async (req, res, next) => {
  try {
    const { associationId } = req.params;

    // Sort by block name then flat number
    const flats = await Flat.find({ associationId }).sort({ blockName: 1, flatNumber: 1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: flats.length,
      data: flats,
    });
  } catch (error) {
    next(error);
  }
};

// ----------------Update Flat------------
const updateFlat = async (req, res, next) => {
  try {
    const { blockName, flatNumber, ownerEmail, tenantEmail } = req.body;

    const flat = await Flat.findByIdAndUpdate(
      req.params.id,
      { blockName, flatNumber, ownerEmail, tenantEmail },
      { new: true, runValidators: true }
    );

    if (!flat) {
      return next(new AppError('Flat not found', HTTP_STATUS.NOT_FOUND));
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Flat updated successfully',
      data: flat,
    });
  } catch (error) {
    next(error);
  }
};

// ----------------Delete Flat------------
const deleteFlat = async (req, res, next) => {
  try {
    const flat = await Flat.findByIdAndDelete(req.params.id);

    if (!flat) {
      return next(new AppError('Flat not found', HTTP_STATUS.NOT_FOUND));
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Flat deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addFlat, getFlatsByAssociation, updateFlat, deleteFlat };
