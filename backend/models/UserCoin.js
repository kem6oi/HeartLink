// backend/models/UserCoin.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
// User model will be associated

const UserCoin = sequelize.define('UserCoin', {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true, // user_id is the primary key
        references: {
            model: 'users', // Table name
            key: 'id'
        }
    },
    balance: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    last_updated: { // Sequelize's `updatedAt` will cover this if only Sequelize updates the record.
                    // If other processes might update `last_updated` directly in DB, keep it.
                    // For simplicity with Sequelize, relying on `updatedAt` is often enough.
                    // If kept, its management needs to be explicit.
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW // This will set it on creation, but not auto-update on every change via Sequelize.
                                    // The SQL `ON UPDATE CURRENT_TIMESTAMP` is a DB feature.
                                    // Sequelize's `updatedAt` timestamp column is better for tracking record updates.
    }
    // createdAt and updatedAt are automatically handled by Sequelize
}, {
    tableName: 'user_coins',
    // underscored: true, // Handled globally
    // timestamps: true,  // Handled globally
});

module.exports = UserCoin;
