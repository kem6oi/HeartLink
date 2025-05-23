// backend/routes/staffRoutes.js
const express = require('express');
const router = express.Router();
const moderationController = require('../controllers/moderationController');
const supportTicketController = require('../controllers/supportTicketController');
const staffController = require('../controllers/staffController');
const { verifyToken, isStaff } = require('../middlewares/authMiddleware');

// --- Moderation Routes ---
// GET /api/staff/moderation/queue
router.get('/moderation/queue', verifyToken, isStaff, moderationController.getQueue);
// POST /api/staff/moderation/items/:itemId/action
router.post('/moderation/items/:itemId/action', verifyToken, isStaff, moderationController.submitAction);

// --- Support Ticket Routes ---
// GET /api/staff/support/tickets
router.get('/support/tickets', verifyToken, isStaff, supportTicketController.getAllTickets);
// GET /api/staff/support/tickets/:ticketId
router.get('/support/tickets/:ticketId', verifyToken, isStaff, supportTicketController.getTicket);
// PUT /api/staff/support/tickets/:ticketId
router.put('/support/tickets/:ticketId', verifyToken, isStaff, supportTicketController.updateTicketDetails);
// POST /api/staff/support/tickets
router.post('/support/tickets', verifyToken, isStaff, supportTicketController.createNewTicket);

// --- User Lookup/Assistance Routes ---
// GET /api/staff/users/search?searchTerm=...&searchType=...
router.get(
    '/users/search',
    verifyToken,
    isStaff,
    staffController.handleUserSearch
);

// GET /api/staff/users/:userId/details (Placeholder for a more detailed user view)
router.get(
    '/users/:userId/details',
    verifyToken,
    isStaff,
    staffController.handleGetUserDetails // Assuming this controller function exists
);


// --- Other Staff Routes (Example) ---
// router.get('/dashboard', verifyToken, isStaff, staffController.getDashboard); // Assuming staffController.getDashboard exists


module.exports = router;
