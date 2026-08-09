const SupportTicket = require('../models/SupportTicket');
const { AppError } = require('../../../middlewares/errorHandler');

exports.createTicket = async (req, res, next) => {
  try {
    const { title, description, priority } = req.body;
    const ticket = await SupportTicket.create({
      title,
      description,
      priority,
      author: req.user.id
    });
    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

exports.getMyTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find({ author: req.user.id })
      .sort('-createdAt')
      .populate('author', 'fullName email')
      .populate('messages.sender', 'fullName isSuperAdmin');
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

exports.getAllTickets = async (req, res, next) => {
  try {
    const tickets = await SupportTicket.find()
      .sort('-createdAt')
      .populate('author', 'fullName email')
      .populate('messages.sender', 'fullName isSuperAdmin');
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

exports.getTicket = async (req, res, next) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('author', 'fullName email')
      .populate('messages.sender', 'fullName isSuperAdmin');
      
    if (!ticket) return next(new AppError('Ticket not found', 404));

    // Ensure the user is either a super admin or the author of the ticket
    if (!req.user.isSuperAdmin && ticket.author._id.toString() !== req.user.id) {
      return next(new AppError('Not authorized to view this ticket', 403));
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

exports.addMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return next(new AppError('Message content is required', 400));

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return next(new AppError('Ticket not found', 404));

    if (!req.user.isSuperAdmin && ticket.author.toString() !== req.user.id) {
      return next(new AppError('Not authorized to reply to this ticket', 403));
    }

    ticket.messages.push({
      sender: req.user.id,
      content
    });
    
    // Automatically change status if a super admin replies
    if (req.user.isSuperAdmin && ticket.status === 'OPEN') {
      ticket.status = 'IN_PROGRESS';
    }

    await ticket.save();

    const updatedTicket = await SupportTicket.findById(req.params.id)
      .populate('author', 'fullName email')
      .populate('messages.sender', 'fullName isSuperAdmin');

    res.status(200).json({ success: true, data: updatedTicket });
  } catch (error) {
    next(error);
  }
};

exports.updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return next(new AppError('Ticket not found', 404));

    ticket.status = status;
    await ticket.save();

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};
