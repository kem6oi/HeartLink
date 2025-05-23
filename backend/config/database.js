// backend/config/database.js
require('dotenv').config(); // Load environment variables from .env file

// Configuration for Sequelize ORM
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'heartmatch_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '', // Default to empty password if not set
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false, // Log SQL queries in development
        pool: { // Optional: connection pooling configuration
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            underscored: true, // Ensures Sequelize uses snake_case for auto-generated fields like foreign keys
            timestamps: true // Model will have createdAt and updatedAt
        }
    }
);

module.exports = sequelize;

// To test the connection (optional, can be done in app.js or a separate script)
// async function testDbConnection() {
//     try {
//         await sequelize.authenticate();
//         console.log('Database connection has been established successfully.');
//     } catch (error) {
//         console.error('Unable to connect to the database:', error);
//     }
// }
// testDbConnection();
