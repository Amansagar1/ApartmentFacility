const express = require('express');
const { protect, restrictTo } = require('../../../middlewares/authMiddleware');
const supportController = require('../controllers/supportController');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(supportController.createTicket)
  .get((req, res, next) => {
    if (req.user.isSuperAdmin) {
      return supportController.getAllTickets(req, res, next);
    } else {
      return supportController.getMyTickets(req, res, next);
    }
  });

router.route('/:id')
  .get(supportController.getTicket);

router.route('/:id/messages')
  .post(supportController.addMessage);

router.route('/:id/status')
  .put(restrictToSuperAdmin, supportController.updateTicketStatus);

// Middleware specifically for Super Admin checks in routes
function restrictToSuperAdmin(req, res, next) {
  if (!req.user || !req.user.isSuperAdmin) {
    return res.status(403).json({ success: false, message: 'You do not have permission to perform this action' });
  }
  next();
}

module.exports = router;
