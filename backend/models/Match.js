// backend/models/Match.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
// User model will be associated

const Match = sequelize.define('Match', {
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
    matched_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
    // createdAt and updatedAt are automatically handled by Sequelize
}, {
    tableName: 'matches',
    // underscored: true, // Handled globally
    // timestamps: true,  // Handled globally
    indexes: [
        {
            unique: true,
            fields: ['user1_id', 'user2_id'] // For the UNIQUE (user1_id, user2_id) constraint
        }
    ]
    // The CHECK (user1_id < user2_id) constraint is a database-level check.
    // Sequelize doesn't directly support CHECK constraints in model definitions.
    // This should be applied directly in the database schema or via a raw query in migrations.
});

module.exports = Match;
