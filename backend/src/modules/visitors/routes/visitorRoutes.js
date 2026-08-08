const express = require('express');
const { addVisitor, updateStatus, getPendingForFlat, getAllForAssociation } = require('../controllers/visitorController');
const { protect } = require('../../../middlewares/authMiddleware');
const validateRequest = require('../../../middlewares/validateRequest');
const { addVisitorSchema, updateVisitorStatusSchema } = require('../models/visitorValidators');

const router = express.Router();

// Require user to be logged in
router.use(protect);

router.post('/', validateRequest(addVisitorSchema), addVisitor);
router.patch('/:id/status', validateRequest(updateVisitorStatusSchema), updateStatus);
router.get('/flat/:flatId/pending', getPendingForFlat);
router.get('/association/:associationId', getAllForAssociation);

module.exports = router;
