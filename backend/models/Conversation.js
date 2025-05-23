// backend/models/Conversation.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
// User and Message models will be associated

const Conversation = sequelize.define('Conversation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user1_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Table name
            key: 'id'
        }
    },
    user2_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Table name
            key: 'id'
        }
    },
    last_message_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { // This FK is added later via ALTER TABLE in SQL.
                       // For Sequelize, define it, but manage migration order or use constraints: false
            model: 'messages', // Table name - ensure this matches the messages table name
            key: 'id'
        }
    }
    // createdAt and updatedAt are automatically handled by Sequelize
}, {
    tableName: 'conversations',
    // underscored: true, // Handled globally
    // timestamps: true,  // Handled globally
    indexes: [
        {
            unique: true,
            fields: ['user1_id', 'user2_id']
        }
    ]
    // The CHECK (user1_id < user2_id) constraint is a database-level check.
    // Apply directly in the database schema or via a raw query in migrations.
});

module.exports = Conversation;
