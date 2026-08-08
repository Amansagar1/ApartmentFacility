const express = require('express');
const { createAssociation, getMyAssociations } = require('../controllers/associationController');
const { protect } = require('../../../middlewares/authMiddleware');
const validateRequest = require('../../../middlewares/validateRequest');
const { createAssociationSchema } = require('../models/associationValidators');

const router = express.Router();

// ----------------Association Router------------
// CRITICAL: ALL association routes require the user to be logged in
router.use(protect);

// Route: /api/v1/associations
router.route('/')
  .post(validateRequest(createAssociationSchema), createAssociation)
  .get(getMyAssociations);

module.exports = router;
