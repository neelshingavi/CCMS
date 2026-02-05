const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Certificate = sequelize.define('Certificate', {
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
        type: DataTypes.STRING(64), // Changed from UUID to support wallet hash
        allowNull: false
    },
    wallet_address: {
        type: DataTypes.STRING(58),
        allowNull: false
    },
    wallet_hash: {
        type: DataTypes.STRING(64), // SHA256 hash for privacy lookups
        allowNull: true
    },
    asset_id: {
        type: DataTypes.BIGINT, // Algorand ASA ID
        allowNull: true
    },
    certificate_hash: {
        type: DataTypes.STRING(64),
        allowNull: false
    },
    txn_id: {
        type: DataTypes.STRING(52),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'MINTED', 'TRANSFERRED', 'FAILED'),
        defaultValue: 'PENDING'
    },
    issued_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'certificates',
    indexes: [
        {
            unique: true,
            fields: ['event_id', 'user_id']
        },
        {
            fields: ['wallet_hash'] // For wallet-based lookups
        }
    ]
});

module.exports = Certificate;
