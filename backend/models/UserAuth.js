// backend/models/UserAuth.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
// const User = require('./User'); // Required for explicit association definition, but can be done later in index.js

const UserAuth = sequelize.define('UserAuth', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        references: { // Sequelize can infer this from associations, but good for clarity
            model: 'users', // Table name
            key: 'id'
        }
    },
    provider_type: {
        type: DataTypes.ENUM('email', 'google', 'facebook', 'apple'),
        allowNull: false
    },
    provider_id: { // Unique ID from the external provider
        type: DataTypes.STRING,
        unique: true,
        allowNull: true // Nullable if provider_type is 'email' (password stored in users table)
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    }
    // createdAt and updatedAt are automatically handled by Sequelize
}, {
    tableName: 'user_auth',
    // underscored: true, // Handled globally
    // timestamps: true,  // Handled globally
});

module.exports = UserAuth;
