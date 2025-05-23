// backend/services/authService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Staff = require('../models/Staff'); // Assuming Staff model is set up
const serverConfig = require('../config/server');

// Mocked DB Interaction for now
const MOCK_STAFF_USERS = []; // Initialize an empty array for mock staff users

async function initializeMockStaff() {
    if (MOCK_STAFF_USERS.length === 0) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        MOCK_STAFF_USERS.push({
            id: 1,
            name: 'Test Staff User',
            email: 'staff@example.com',
            password_hash: hashedPassword,
            role: 'moderator',
            // Sequelize model might have these methods, but for mock they are plain data
            // toJSON: function() { return { id: this.id, name: this.name, email: this.email, role: this.role }; }
        });
        MOCK_STAFF_USERS.push({
            id: 2,
            name: 'Support Staff Alpha',
            email: 'support.alpha@example.com',
            password_hash: await bcrypt.hash('supportpass', 10),
            role: 'support',
        });
    }
}
// Initialize mock staff data when the service is loaded
initializeMockStaff();


async function loginStaff({ email, password }) {
    try {
        // Simulate DB findByEmail
        // In a real app: const staffUser = await Staff.findOne({ where: { email } });
        const staffUser = MOCK_STAFF_USERS.find(user => user.email === email);

        if (!staffUser) {
            const error = new Error('Staff member not found');
            error.statusCode = 404;
            throw error;
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, staffUser.password_hash);
        if (!isMatch) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        // Generate JWT
        const payload = {
            id: staffUser.id,
            email: staffUser.email,
            role: staffUser.role,
            type: 'staff' // To differentiate from regular user tokens if any
        };

        const token = jwt.sign(
            payload,
            serverConfig.jwtSecret,
            { expiresIn: serverConfig.jwtExpiration }
        );

        // Return staff data (without password) and token
        const staffDataForToken = {
            id: staffUser.id,
            name: staffUser.name,
            email: staffUser.email,
            role: staffUser.role
        };

        return { staff: staffDataForToken, token };

    } catch (error) {
        console.error('Error in loginStaff service:', error.message);
        throw error; // Re-throw to be caught by controller
    }
}

module.exports = {
    loginStaff,
};
