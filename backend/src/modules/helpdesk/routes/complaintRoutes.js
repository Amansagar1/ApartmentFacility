const express = require('express');
const { raiseComplaint, getMyComplaints, getAllForAssociation, updateStatus, deleteComplaint } = require('../controllers/complaintController');
const { protect } = require('../../../middlewares/authMiddleware');
const validateRequest = require('../../../middlewares/validateRequest');
const { raiseComplaintSchema, updateComplaintStatusSchema } = require('../models/complaintValidators');

const router = express.Router();
router.use(protect);

router.post('/', validateRequest(raiseComplaintSchema), raiseComplaint);
router.get('/my', getMyComplaints);
router.get('/association/:associationId', getAllForAssociation);
router.patch('/:id/status', validateRequest(updateComplaintStatusSchema), updateStatus);
router.delete('/:id', deleteComplaint);

module.exports = router;
