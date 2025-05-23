// backend/controllers/authController.js
const authService = require('../services/authService');

async function staffLogin(req, res, next) {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const result = await authService.loginStaff({ email, password });
        return res.status(200).json(result);
    } catch (error) {
        // Log the error for server-side observability
        console.error('Staff login error in controller:', error.message); 

        // Return a generic error or specific one based on statusCode
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        // Generic server error
        return res.status(500).json({ message: 'An unexpected error occurred during login.' });
    }
}

// TODO: Add controllers for user registration, user login, admin login etc.

module.exports = {
    staffLogin,
    // other auth controllers
};
