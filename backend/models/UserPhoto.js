// backend/models/UserPhoto.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
// const User = require('./User'); // For explicit association definition

const UserPhoto = sequelize.define('UserPhoto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Table name
            key: 'id'
        }
    },
    photo_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    caption: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_profile_picture: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    uploaded_at: { // This might be redundant if relying solely on createdAt
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
    // createdAt and updatedAt are automatically handled by Sequelize
}, {
    tableName: 'user_photos',
    // underscored: true, // Handled globally
    // timestamps: true,  // Handled globally
});

module.exports = UserPhoto;
