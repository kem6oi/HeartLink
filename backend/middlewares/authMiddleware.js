// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const serverConfig = require('../config/server');

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided or token is not Bearer type.' });
    }

    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    try {
        const decoded = jwt.verify(token, serverConfig.jwtSecret);
        req.user = decoded; // For general user data (might contain type: 'staff' or 'user')
        
        // If you want a specific req.staff for staff routes:
        if (decoded.type === 'staff') {
            req.staff = decoded;
        }
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token.' });
        }
        // For other errors, it might be a server issue
        console.error("JWT verification error:", error);
        return res.status(500).json({ message: 'Failed to authenticate token.' });
    }
}

// Optional: Middleware to check if the authenticated user is staff
function isStaff(req, res, next) {
    if (req.user && req.user.type === 'staff' && req.user.role) { // Check for role to ensure it's a staff payload
        next();
    } else {
        return res.status(403).json({ message: 'Access forbidden. Staff role required.' });
    }
}

// Placeholder for isAdmin - similar to isStaff but checks for admin role
function isAdmin(req, res, next) {
    if (req.user && req.user.type === 'admin' && req.user.role === 'admin_super') { // Example admin role check
         next();
    } else {
        return res.status(403).json({ message: 'Access forbidden. Admin role required.' });
    }
}


module.exports = {
    verifyToken,
    isStaff,
    isAdmin,
    // Add other role-specific middleware as needed
};
