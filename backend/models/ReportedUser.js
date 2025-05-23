// backend/models/ReportedUser.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
// User model will be associated

const ReportedUser = sequelize.define('ReportedUser', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    reporter_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Table name
            key: 'id'
        }
    },
    reported_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Table name
            key: 'id'
        }
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending_review', 'action_taken', 'dismissed'),
        defaultValue: 'pending_review'
    },
    reported_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
    // createdAt and updatedAt are automatically handled by Sequelize
}, {
    tableName: 'reported_users',
    // underscored: true, // Handled globally
    // timestamps: true,  // Handled globally
});

module.exports = ReportedUser;
