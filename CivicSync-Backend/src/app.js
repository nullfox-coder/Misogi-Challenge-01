const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/issues', require('./routes/issue.routes'));
app.use('/api/votes', require('./routes/vote.routes'));
app.use('/api/media', require('./routes/media.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/map', require('./routes/map.routes'));

// Error handling
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

module.exports = app; 