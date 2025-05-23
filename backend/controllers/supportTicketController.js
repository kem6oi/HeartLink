// backend/controllers/supportTicketController.js
const supportTicketService = require('../services/supportTicketService');

async function getAllTickets(req, res, next) {
    try {
        // Extract filter/sort parameters from req.query
        // Example: /api/staff/support/tickets?status=Open&priority=High&sortBy=newest
        const filters = {
            status: req.query.status,
            priority: req.query.priority,
            sortBy: req.query.sortBy 
        };
        
        const tickets = await supportTicketService.listTickets(filters);
        res.status(200).json(tickets);
    } catch (error) {
        console.error('Error getting all support tickets:', error);
        next(error); 
    }
}

async function getTicket(req, res, next) {
    try {
        const { ticketId } = req.params;
        const ticket = await supportTicketService.getTicketById(ticketId);
        // Service now throws an error if not found, which will be caught here
        res.status(200).json(ticket);
    } catch (error) {
        console.error(`Error getting support ticket ${req.params.ticketId}:`, error);
        if (error.statusCode === 404) { 
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
}

async function updateTicketDetails(req, res, next) {
    try {
        const { ticketId } = req.params;
        const updateData = req.body; // e.g., { status, priority, assigned_staff_id }
        
        const staffId = req.staff?.id || req.user?.id; 
        if (!staffId) {
            return res.status(401).json({ message: 'Unauthorized: Staff ID not found in token for logging action.' });
        }

        // Basic validation for updateData (can be expanded or moved to middleware)
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No update data provided.' });
        }
        // Validate specific fields if necessary
        const allowedUpdates = ['status', 'priority', 'assigned_staff_id']; // Example
        for (const key in updateData) {
            if (!allowedUpdates.includes(key)) {
                // return res.status(400).json({ message: \`Invalid field for update: \${key}\` });
                // For now, we'll be flexible or assume service layer handles unknown fields
            }
        }


        const updatedTicket = await supportTicketService.updateTicket(ticketId, updateData, staffId);
        res.status(200).json(updatedTicket);
    } catch (error) {
        console.error(`Error updating support ticket ${req.params.ticketId}:`, error);
         if (error.statusCode === 404) {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
}

// Staff might create tickets on behalf of users or for internal tracking.
async function createNewTicket(req, res, next) {
    try {
        const ticketData = req.body; // { user_id, subject, description, priority, status }
        const staffId = req.staff?.id || req.user?.id; // Creator staff ID

        // Validate required fields for ticket creation
        if (!ticketData.user_id || !ticketData.subject || !ticketData.description) {
            return res.status(400).json({ message: 'Missing required fields: user_id, subject, and description are required.' });
        }
        
        // Add staffId as creator or initial assignee if needed, or handle in service
        const fullTicketData = {...ticketData, created_by_staff_id: staffId};

        const newTicket = await supportTicketService.createTicket(fullTicketData);
        res.status(201).json(newTicket);
    } catch (error) {
        console.error('Error creating new support ticket by staff:', error);
        next(error);
    }
}

module.exports = {
    getAllTickets,
    getTicket,
    updateTicketDetails,
    createNewTicket, 
};
