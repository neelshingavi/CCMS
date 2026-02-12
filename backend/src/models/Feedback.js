const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Feedback = sequelize.define('Feedback', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    event_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    wallet_hash: {
        type: DataTypes.STRING(64), // Anonymized - NO raw wallet stored
        allowNull: false
    },
    content_hash: {
        type: DataTypes.STRING(64), // Hash of feedback for blockchain anchoring
        allowNull: false
    },
    feedback_text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    sentiment: {
        type: DataTypes.ENUM('positive', 'neutral', 'negative'),
        defaultValue: 'neutral'
    },
    sentiment_score: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    txn_id: {
        type: DataTypes.STRING(52),
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'feedbacks',
    indexes: [
        {
            unique: true,
            fields: ['event_id', 'wallet_hash'] // One feedback per wallet per event
        }
    ]
});

module.exports = Feedback;
