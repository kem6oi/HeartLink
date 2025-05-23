// backend/models/Staff.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Use the configured Sequelize instance

const Staff = sequelize.define('Staff', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'support', // e.g., 'support', 'moderator', 'admin_staff'
    },
    // Timestamps (createdAt, updatedAt) are automatically added by Sequelize by default
});

// Optional: Add instance methods or class methods here if needed
// Example: Method to compare password (though typically done in service layer)
// Staff.prototype.isValidPassword = async function(password) {
//     const bcrypt = require('bcryptjs');
//     return await bcrypt.compare(password, this.password_hash);
// };

module.exports = Staff;
