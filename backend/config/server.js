// backend/config/server.js
require('dotenv').config(); // If you plan to use a .env file for environment variables

module.exports = {
    port: process.env.PORT || 3000, // Default to 3000 if PORT env var is not set
    jwtSecret: process.env.JWT_SECRET || 'your-very-secret-key-for-jwt', // Secret key for JWT
    jwtExpiration: process.env.JWT_EXPIRATION || '1h', // JWT token expiration time
};
