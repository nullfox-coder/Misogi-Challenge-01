const express = require('express');
const analyticsService = require('../services/analytics.service');
const { auth } = require('../middleware/auth');

const router = express.Router();


// Get issues by category
router.get('/issues-by-category', async (req, res, next) => {
    try {
        const pagination = {
            page: req.query.page,
            limit: req.query.limit
        };
        
        const data = await analyticsService.getIssuesByCategory(pagination);
        res.json(data);
    } catch (error) {
        next(error);
    }
});

// Get daily submissions for past 7 days
router.get('/daily-submissions', async (req, res, next) => {
    try {
        const data = await analyticsService.getDailySubmissions();
        res.json(data);
    } catch (error) {
        next(error);
    }
});

// Get most voted issues by category
router.get('/most-voted-by-category', async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const data = await analyticsService.getMostVotedIssuesByCategory(limit);
        res.json(data);
    } catch (error) {
        next(error);
    }
});

module.exports = router; 