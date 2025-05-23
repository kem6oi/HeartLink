// backend/controllers/staffController.js
const staffService = require('../services/staffService');

async function handleUserSearch(req, res, next) {
    try {
        const { searchTerm, searchType } = req.query;

        // Basic validation (optional, or use validation middleware)
        if (!searchTerm) {
            return res.status(400).json({ message: 'Search term is required.' });
        }
        // searchType can be optional, service might have default search behavior

        const users = await staffService.searchUsers({ searchTerm, searchType });
        
        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found matching your criteria.' });
        }
        
        res.status(200).json(users);

    } catch (error) {
        console.error('Error in handleUserSearch controller:', error);
        next(error); // Pass to global error handler
    }
}

// Placeholder for handling a request for detailed user information
async function handleGetUserDetails(req, res, next) {
    try {
        const { userId } = req.params; // Assuming route like /users/:userId
        const userDetails = await staffService.getUserDetailsById(userId);

        if (!userDetails) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        res.status(200).json(userDetails);

    } catch (error) {
        console.error(`Error in handleGetUserDetails controller for user ${req.params.userId}:`, error);
        next(error);
    }
}


// TODO: Add other staff-specific controller functions (e.g., getDashboard)

module.exports = {
    handleUserSearch,
    handleGetUserDetails, // Export if you add a route for it
    // other staff controller functions
};
