// backend/controllers/moderationController.js
const moderationService = require('../services/moderationService');

async function getQueue(req, res, next) {
    try {
        // Extract filter/sort parameters from req.query
        // Example: /api/staff/moderation/queue?type=profile_picture&sortBy=newest
        const filters = {
            filterType: req.query.type, // Matches 'filter-type' from frontend
            sortBy: req.query.sortBy    // Matches 'sort-by' from frontend
        };
        
        const items = await moderationService.getReviewQueueItems(filters);
        res.status(200).json(items);
    } catch (error) {
        console.error('Error getting review queue:', error);
        // Pass error to the next error-handling middleware if you have one,
        // or send a generic error response.
        next(error); // Or res.status(500).json({ message: 'Failed to get review queue.' });
    }
}

async function submitAction(req, res, next) {
    try {
        const { itemId } = req.params; // From route parameter /items/:itemId/action
        const { itemType, action, reason, reportedUserId } = req.body; // itemType and reportedUserId are from frontend's mock data structure
        
        // staffId should come from the authenticated user (set by auth middleware)
        const staffId = req.staff?.id || req.user?.id; 

        if (!staffId) {
            return res.status(401).json({ message: 'Unauthorized: Staff ID not found in token.' });
        }
        if (!itemType || !action) {
            return res.status(400).json({ message: 'Missing required fields: itemType and action are required.' });
        }

        const result = await moderationService.performModerationAction({
            itemId,
            itemType,
            action,
            staffId,
            reason,
            reportedUserId // Pass this along if your service/model uses it
        });

        res.status(201).json({ message: 'Moderation action submitted successfully.', data: result });
    } catch (error) {
        console.error('Error submitting moderation action:', error);
        next(error); // Or res.status(500).json({ message: 'Failed to submit moderation action.' });
    }
}

module.exports = {
    getQueue,
    submitAction,
};
