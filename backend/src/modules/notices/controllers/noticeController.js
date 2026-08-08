const Notice = require('../models/Notice');
const { HTTP_STATUS } = require('../../../utils/constants');

const createNotice = async (req, res, next) => {
  try {
    req.body.authorId = req.user.id;
    const notice = await Notice.create(req.body);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: notice });
  } catch (error) { next(error); }
};

const getNoticesForAssociation = async (req, res, next) => {
  try {
    const notices = await Notice.find({ associationId: req.params.associationId })
      .populate('authorId', 'fullName')
      .sort('-createdAt')
      .limit(10); // keep it to the latest 10 for simplicity
      
    res.status(HTTP_STATUS.OK).json({ success: true, count: notices.length, data: notices });
  } catch (error) { next(error); }
};

const updateNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!notice) return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Notice not found' });
    res.status(HTTP_STATUS.OK).json({ success: true, data: notice });
  } catch (error) { next(error); }
};

const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Notice not found' });
    res.status(HTTP_STATUS.OK).json({ success: true, data: {} });
  } catch (error) { next(error); }
};

module.exports = { createNotice, getNoticesForAssociation, updateNotice, deleteNotice };
