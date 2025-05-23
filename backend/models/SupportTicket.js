// backend/models/SupportTicket.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User'); // User model for association
const Staff = require('./Staff'); // Staff model for association

const SupportTicket = sequelize.define('SupportTicket', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER, // Assuming User ID is INTEGER
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    staff_id: { // Assigned staff member
        type: DataTypes.INTEGER,
        allowNull: true, // Can be unassigned
        references: {
            model: Staff,
            key: 'id',
        },
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Open', 'In Progress', 'Pending User Response', 'Closed'),
        allowNull: false,
        defaultValue: 'Open',
    },
    priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High', 'Urgent'),
        allowNull: false,
        defaultValue: 'Medium',
    },
    // Timestamps createdAt and updatedAt are automatically added by Sequelize
});

// Define associations
SupportTicket.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user' // Optional alias
});
User.hasMany(SupportTicket, { // Optional: for User model to have access to its tickets
    foreignKey: 'user_id',
    as: 'supportTickets'
});

SupportTicket.belongsTo(Staff, {
    foreignKey: 'staff_id',
    as: 'assignedStaff' // Optional alias
});
Staff.hasMany(SupportTicket, { // Optional: for Staff model to have access to assigned tickets
    foreignKey: 'staff_id',
    as: 'assignedSupportTickets'
});

module.exports = SupportTicket;
