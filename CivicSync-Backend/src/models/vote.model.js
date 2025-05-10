const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vote = sequelize.define('Vote', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['issue_id', 'user_id']
        }
    ]
});

module.exports = Vote; 