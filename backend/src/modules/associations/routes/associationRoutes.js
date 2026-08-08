const express = require('express');
const { createAssociation, getMyAssociations, getAllAssociations } = require('../controllers/associationController');
const { protect, authorizeSuperAdmin } = require('../../../middlewares/authMiddleware');
const validateRequest = require('../../../middlewares/validateRequest');
const { createAssociationSchema } = require('../models/associationValidators');

const { getAssociationMembers, updateMembershipStatus } = require('../../users/controllers/membershipController');

const router = express.Router();

// ----------------Association Router------------
// CRITICAL: ALL association routes require the user to be logged in
router.use(protect);

router.get('/all', authorizeSuperAdmin, getAllAssociations);

// Route: /api/v1/associations
router.route('/')
  .post(authorizeSuperAdmin, validateRequest(createAssociationSchema), createAssociation)
  .get(getMyAssociations);

// Membership Routes
router.get('/:id/members', getAssociationMembers);
router.put('/:id/members/:userId', updateMembershipStatus);

module.exports = router;
