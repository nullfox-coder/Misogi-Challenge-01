const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Issue = sequelize.define('Issue', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('ROAD', 'WATER', 'SANITATION', 'ELECTRICITY', 'OTHER'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED'),
        defaultValue: 'PENDING'
    },  
    location_lat: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    location_lng: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    location_address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    vote_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['status']
        },
        {
            fields: ['category']
        },
        {
            fields: ['user_id']
        },
    ]
});

module.exports = Issue; 