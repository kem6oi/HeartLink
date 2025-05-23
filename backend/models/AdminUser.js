// backend/models/AdminUser.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminUser = sequelize.define('AdminUser', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'super_admin'),
        allowNull: false
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    }
    // createdAt and updatedAt are automatically handled by Sequelize
}, {
    tableName: 'admin_users',
    // underscored: true, // Handled globally
    // timestamps: true,  // Handled globally
});

module.exports = AdminUser;
