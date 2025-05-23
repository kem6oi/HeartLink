// backend/models/Message.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
// Conversation and User models will be associated

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    conversation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'conversations', // Table name
            key: 'id'
        }
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Table name
            key: 'id'
        }
    },
    message_text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    sent_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
    // createdAt and updatedAt are automatically handled by Sequelize
}, {
    tableName: 'messages',
    // underscored: true, // Handled globally
    // timestamps: true,  // Handled globally
});

module.exports = Message;
