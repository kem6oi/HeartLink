// backend/services/supportTicketService.js
const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User'); // For including user details
const Staff = require('../models/Staff'); // For including staff details

// Mock data for the service layer
let mockTickets = [
    { id: 1, user_id: 1, staff_id: 1, subject: 'Login Issue', description: 'User cannot log in to their account. Password reset email not received.', status: 'Open', priority: 'High', createdAt: new Date('2023-10-25T10:00:00Z'), updatedAt: new Date('2023-10-25T10:00:00Z'), User: { id: 1, name: 'Alice Wonderland' }, assignedStaff: { id: 1, name: 'Bob The Staff' } },
    { id: 2, user_id: 2, staff_id: 2, subject: 'Billing question', description: 'User has a question about their recent invoice. They believe they were overcharged.', status: 'In Progress', priority: 'Medium', createdAt: new Date('2023-10-26T11:00:00Z'), updatedAt: new Date('2023-10-27T14:00:00Z'), User: { id: 2, name: 'Charlie Brown' }, assignedStaff: { id: 2, name: 'Carol The Staff' } },
    { id: 3, user_id: 1, staff_id: null, subject: 'Feature request: Dark Mode', description: 'User requests a dark mode option for the application interface.', status: 'Open', priority: 'Low', createdAt: new Date('2023-10-27T15:00:00Z'), updatedAt: new Date('2023-10-28T09:00:00Z'), User: { id: 1, name: 'Alice Wonderland' }, assignedStaff: null },
    { id: 4, user_id: 3, staff_id: 1, subject: 'Profile picture not updating', description: 'User is trying to update their profile picture, but it does not save.', status: 'Closed', priority: 'High', createdAt: new Date('2023-10-22T08:00:00Z'), updatedAt: new Date('2023-10-23T12:00:00Z'), User: { id: 3, name: 'David Copperfield' }, assignedStaff: { id: 1, name: 'Bob The Staff' } },
];

// Helper to format ticket for output (simulates Sequelize include)
function formatTicket(ticket) {
    if (!ticket) return null;
    return {
        id: ticket.id,
        userId: ticket.user_id, // Keep as user_id for consistency with model, or map to userId
        userName: ticket.User?.name || 'N/A', // From included User model
        subject: ticket.subject,
        description: ticket.description, // For getTicketById
        status: ticket.status,
        priority: ticket.priority,
        createdDate: ticket.createdAt.toISOString().split('T')[0], // Format as YYYY-MM-DD
        lastUpdated: ticket.updatedAt.toISOString().split('T')[0], // Format as YYYY-MM-DD
        assignedStaffId: ticket.staff_id,
        assignedStaffName: ticket.assignedStaff?.name || 'Unassigned', // From included Staff model
    };
}


async function listTickets(filters = {}) {
    console.log('Filtering tickets with (mock service):', filters);
    let currentMockTickets = [...mockTickets]; // Work with a copy

    if (filters.status && filters.status !== 'all') {
        currentMockTickets = currentMockTickets.filter(ticket => ticket.status === filters.status);
    }
    if (filters.priority && filters.priority !== 'all') {
        currentMockTickets = currentMockTickets.filter(ticket => ticket.priority === filters.priority);
    }

    // Sorting: 'newest', 'oldest', 'last_updated'
    if (filters.sortBy === 'oldest') {
        currentMockTickets.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (filters.sortBy === 'last_updated') {
        currentMockTickets.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } else { // Default to newest
        currentMockTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    // In a real scenario, this would be:
    // const tickets = await SupportTicket.findAll({
    //     include: [
    //         { model: User, as: 'user', attributes: ['id', 'name', 'email'] }, // Select specific user attributes
    //         { model: Staff, as: 'assignedStaff', attributes: ['id', 'name'] } // Select specific staff attributes
    //     ],
    //     where: sequelizeWhereFilters, // Constructed from filters
    //     order: sequelizeOrder // Constructed from sortBy
    // });
    // return tickets.map(formatTicket); // Or map directly in controller
    return Promise.resolve(currentMockTickets.map(t => ({...formatTicket(t), description: undefined}))); // Remove description for list view
}

async function getTicketById(ticketId) {
    // In a real scenario:
    // const ticket = await SupportTicket.findByPk(ticketId, {
    //     include: [
    //         { model: User, as: 'user' },
    //         { model: Staff, as: 'assignedStaff' }
    //     ]
    // });
    // if (!ticket) throw new Error('Ticket not found');
    // return formatTicket(ticket);

    const ticket = mockTickets.find(t => t.id === parseInt(ticketId));
    if (!ticket) {
        const error = new Error('Ticket not found');
        error.statusCode = 404;
        throw error;
    }
    return Promise.resolve(formatTicket(ticket));
}

async function updateTicket(ticketId, updateData, staffUserId) {
    // In a real scenario:
    // const ticket = await SupportTicket.findByPk(ticketId);
    // if (!ticket) throw new Error('Ticket not found');
    // await ticket.update({ ...updateData, staff_id: updateData.assigned_staff_id || ticket.staff_id }); // staff_id might be updated
    // console.log(`Ticket ${ticketId} updated by staff ${staffUserId}`);
    // return formatTicket(ticket); // Return updated ticket

    const ticketIndex = mockTickets.findIndex(t => t.id === parseInt(ticketId));
    if (ticketIndex === -1) {
        const error = new Error('Ticket not found for update');
        error.statusCode = 404;
        throw error;
    }

    const originalTicket = mockTickets[ticketIndex];
    mockTickets[ticketIndex] = {
        ...originalTicket,
        ...updateData, // Apply updates like status, priority
        staff_id: updateData.assigned_staff_id !== undefined ? updateData.assigned_staff_id : originalTicket.staff_id,
        assignedStaff: updateData.assigned_staff_id ? { id: updateData.assigned_staff_id, name: `Staff ${updateData.assigned_staff_id}` } : originalTicket.assignedStaff, // Mock staff name update
        updatedAt: new Date()
    };
    
    console.log(`Mock: Ticket ${ticketId} updated by staff ${staffUserId}. New data:`, mockTickets[ticketIndex]);
    console.log(`Mock: Update data received:`, updateData);
    
    // Simulate fetching the assignedStaff name if staff_id was changed
    if (updateData.assigned_staff_id) {
        // This would typically be handled by a StaffService or direct DB query
        const assignedStaff = await Staff.findByPk(updateData.assigned_staff_id); // Assuming Staff model has findByPk
        if(assignedStaff) {
            mockTickets[ticketIndex].assignedStaff = {id: assignedStaff.id, name: assignedStaff.name};
        } else if (updateData.assigned_staff_id === null) {
             mockTickets[ticketIndex].assignedStaff = null;
        }
        // If not found, it might remain as the old one or be set based on ID only for mock
    }


    return Promise.resolve(formatTicket(mockTickets[ticketIndex]));
}

async function createTicket(ticketData) {
    // In a real scenario:
    // const newTicket = await SupportTicket.create(ticketData);
    // return formatTicket(newTicket);

    const newId = mockTickets.length > 0 ? Math.max(...mockTickets.map(t => t.id)) + 1 : 1;
    const newTicket = {
        id: newId,
        ...ticketData, // Should include user_id, subject, description. Optional: priority, status
        status: ticketData.status || 'Open',
        priority: ticketData.priority || 'Medium',
        staff_id: ticketData.staff_id || null, // Can be initially unassigned
        createdAt: new Date(),
        updatedAt: new Date(),
        User: { id: ticketData.user_id, name: `User ${ticketData.user_id}` }, // Mock user name
        assignedStaff: ticketData.staff_id ? {id: ticketData.staff_id, name: `Staff ${ticketData.staff_id}`} : null
    };
    mockTickets.push(newTicket);
    console.log(`Mock: Ticket ${newId} created.`);
    return Promise.resolve(formatTicket(newTicket));
}

module.exports = {
    listTickets,
    getTicketById,
    updateTicket,
    createTicket,
};
