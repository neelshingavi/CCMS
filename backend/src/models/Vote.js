const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Vote = sequelize.define('Vote', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    election_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    vote_hash: {
        type: DataTypes.STRING,
        allowNull: false // Anonymized vote choice
    },
    txn_id: {
        type: DataTypes.STRING,
        allowNull: false, // The Algorand Transaction ID
        unique: true
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
    tableName: 'votes'
});

module.exports = Vote;
