// backend/models/User.js - Minimal for relationship
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER, // Or DataTypes.UUID if you prefer UUIDs
        primaryKey: true,
        autoIncrement: true, // Remove if using UUID and generating them manually or with defaultValue
        // defaultValue: DataTypes.UUIDV4, // Example if using UUIDs
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false, // Assuming name is required
    },
    email: { // Basic user fields, can be expanded
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    // Add other essential user fields as needed for context, e.g., password_hash if users log in
    // Timestamps (createdAt, updatedAt) are automatically added by Sequelize by default
});

// TODO: Define associations for User model later (e.g., hasMany SupportTickets)

module.exports = User;
