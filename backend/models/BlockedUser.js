// backend/models/BlockedUser.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
// User model will be associated

const BlockedUser = sequelize.define('BlockedUser', {
    blocker_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'users', // Table name
            key: 'id'
        }
    },
    blocked_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'users', // Table name
            key: 'id'
        }
    }
    // createdAt and updatedAt are automatically handled by Sequelize
}, {
    tableName: 'blocked_users',
    // underscored: true, // Handled globally
    // timestamps: true,  // Handled globally
});

module.exports = BlockedUser;
