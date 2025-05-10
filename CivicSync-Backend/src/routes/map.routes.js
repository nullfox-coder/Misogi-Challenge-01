const express = require('express');
const mapService = require('../services/map.service');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get all issues for map view
router.get('/issues', async (req, res, next) => {
    try {
        const bounds = req.query.bounds ? JSON.parse(req.query.bounds) : null;
        const issues = await mapService.getMapIssues(bounds);
        res.json(issues);
    } catch (error) {
        next(error);
    }
});

// Get detailed information for a specific issue (when clicking marker)
router.get('/issues/:id', async (req, res, next) => {
    try {
        const issue = await mapService.getIssueDetails(req.params.id);
        res.json(issue);
    } catch (error) {
        next(error);
    }
});

module.exports = router; 