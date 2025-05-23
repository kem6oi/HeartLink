// backend/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', { // Model name 'User', table name will be 'users' (pluralized by default, or set by tableName)
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    username: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    first_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'non-binary', 'other'),
        allowNull: false
    },
    birth_date: {
        type: DataTypes.DATEONLY, // For DATE SQL type
        allowNull: false
    },
    phone_number: {
        type: DataTypes.STRING(20),
        allowNull: true // Default is true, explicitly stating
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    profile_picture: {
        type: DataTypes.STRING,
        allowNull: true
    },
    cover_photo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true
    },
    last_active: {
        type: DataTypes.DATE, // For DATETIME SQL type
        allowNull: true
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_premium: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    status: {
        type: DataTypes.ENUM('active', 'suspended', 'banned'),
        defaultValue: 'active'
    }
    // createdAt and updatedAt are handled by Sequelize due to `timestamps: true` and `underscored: true` in sequelize options
    // and matching column names created_at, updated_at in the SQL.
}, {
    tableName: 'users', // Explicitly set table name
    // underscored: true, // Not needed here if set globally in sequelize instance
    // timestamps: true,  // Not needed here if set globally
});

module.exports = User;
