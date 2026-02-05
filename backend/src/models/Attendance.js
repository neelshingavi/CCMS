const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attendance = sequelize.define('Attendance', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    event_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    user_id: {
        type: DataTypes.STRING(64), // Supports both UUID and wallet hash
        allowNull: false
    },
    wallet_address: {
        type: DataTypes.STRING(58),
        allowNull: false
    },
    wallet_hash: {
        type: DataTypes.STRING(64), // SHA-256 hash for anonymization
        allowNull: false
    },
    txn_id: {
        type: DataTypes.STRING(52),
        allowNull: true, // May be null if blockchain txn fails but local record exists
        unique: true
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'FAILED'),
        defaultValue: 'PENDING'
    },
    checked_in_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
    tableName: 'attendances',
    indexes: [
        {
            unique: true,
            fields: ['event_id', 'user_id'] // Enforce one attendance per user per event
        }
    ]
});

module.exports = Attendance;
