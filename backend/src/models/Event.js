const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Event = sequelize.define('Event', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    eventId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    startTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    organizerWallet: {
        type: DataTypes.STRING(58),
        allowNull: true
    },
    attendanceAppId: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    votingAppId: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    certificateAssetId: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'ACTIVE'
    }
}, {
    timestamps: true,
    tableName: 'events'
});

module.exports = Event;
