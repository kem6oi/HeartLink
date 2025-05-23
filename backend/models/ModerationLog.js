// backend/models/ModerationLog.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Staff = require('./Staff'); // To create association

const ModerationLog = sequelize.define('ModerationLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    item_id: {
        type: DataTypes.STRING, // Using STRING to accommodate various ID types (e.g., user UUIDs, content integer IDs)
        allowNull: false,
        comment: 'ID of the content being moderated (e.g., reported message ID, user ID, image ID)',
    },
    item_type: {
        type: DataTypes.STRING, // Consider ENUM if your DB supports it well with Sequelize
        allowNull: false,
        comment: "Type of content (e.g., 'profile_picture', 'chat_message', 'user_bio')",
        // Example validation for predefined types, if not using ENUM:
        // validate: {
        //     isIn: [['profile_picture', 'chat_message', 'user_bio', 'user_report']],
        // }
    },
    staff_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Staff,
            key: 'id',
        },
        comment: 'ID of the staff member who took the action',
    },
    action_taken: {
        type: DataTypes.STRING, // Consider ENUM
        allowNull: false,
        comment: "Moderation action (e.g., 'approved', 'rejected', 'content_removed', 'user_warned', 'user_banned')",
        // Example validation:
        // validate: {
        //     isIn: [['approved', 'rejected', 'content_removed', 'user_warned', 'user_banned', 'escalated']],
        // }
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: true, // Reason can be optional
        comment: "Staff member's notes or reason for the action",
    },
    // createdAt and updatedAt are automatically added by Sequelize by default
});

// Define associations
// A ModerationLog belongs to a Staff member
ModerationLog.belongsTo(Staff, {
    foreignKey: 'staff_id',
    as: 'staffMember' // Optional alias for when you include the association
});
Staff.hasMany(ModerationLog, {
    foreignKey: 'staff_id',
    as: 'moderationActions' // Optional alias
});


module.exports = ModerationLog;
