const Complaint = require('../models/Complaint');
const { AppError } = require('../../../middlewares/errorHandler');
const { HTTP_STATUS } = require('../../../utils/constants');

const raiseComplaint = async (req, res, next) => {
  try {
    req.body.residentId = req.user.id;
    const complaint = await Complaint.create(req.body);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: complaint });
  } catch (error) { next(error); }
};

const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ residentId: req.user.id }).sort('-createdAt');
    res.status(HTTP_STATUS.OK).json({ success: true, count: complaints.length, data: complaints });
  } catch (error) { next(error); }
};

const getAllForAssociation = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ associationId: req.params.associationId })
      .populate('residentId', 'fullName email')
      .sort('-createdAt');
    res.status(HTTP_STATUS.OK).json({ success: true, count: complaints.length, data: complaints });
  } catch (error) { next(error); }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    
    if (!complaint) return next(new AppError('Complaint not found', HTTP_STATUS.NOT_FOUND));

    res.status(HTTP_STATUS.OK).json({ success: true, data: complaint });
  } catch (error) { next(error); }
};

const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return next(new AppError('Complaint not found', HTTP_STATUS.NOT_FOUND));
    res.status(HTTP_STATUS.OK).json({ success: true, data: {} });
  } catch (error) { next(error); }
};

module.exports = { raiseComplaint, getMyComplaints, getAllForAssociation, updateStatus, deleteComplaint };
