const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || 'civicsync',
    process.env.DB_USER || 'postgres',
    'duckduck',
    // process.env.DB_PASSWORD || 'postgres',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            ssl: {
              require: true,
              rejectUnauthorized: false // Disable only for local/dev
            }
          }
    }
);

module.exports = sequelize; 