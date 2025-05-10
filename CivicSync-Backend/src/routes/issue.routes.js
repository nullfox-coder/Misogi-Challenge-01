const express = require('express');
const issueService = require('../services/issue.service');
const { validateRequest } = require('../middleware/validateRequest');
const { auth } = require('../middleware/auth');
const { createIssueValidation, updateIssueValidation, getIssuesValidation, paginationValidation } = require('../utils/issue.validations');
const router = express.Router();


// Create issue
router.post('/', auth, createIssueValidation, validateRequest, async (req, res, next) => {
    try {
        const issue = await issueService.createIssue(req.body, req.user.id);
        res.status(201).json(issue);
    } catch (error) {
        next(error);
    }
});

// Get user's issues
router.get('/user', auth, paginationValidation, validateRequest, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const result = await issueService.getIssuesByUser(req.user.id, page, limit);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get issue by ID
router.get('/:id', async (req, res, next) => {
    try {
        const issue = await issueService.getIssueById(req.params.id);
        res.json(issue);
    } catch (error) {
        next(error);
    }
});

// Update issue
router.put('/:id', auth, updateIssueValidation, validateRequest, async (req, res, next) => {
    try {
        const issue = await issueService.updateIssue(req.params.id, req.body, req.user.id);
        res.json(issue);
    } catch (error) {
        next(error);
    }
});

// Delete issue
router.delete('/:id', auth, async (req, res, next) => {
    try {
        await issueService.deleteIssue(req.params.id, req.user.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// Get all issues (public feed)
router.get('/', [...getIssuesValidation, ...paginationValidation], validateRequest, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const filters = {
            category: req.query.category,
            status: req.query.status,
            search: req.query.search,
            sort: req.query.sort,
            userId: req.user?.id // Optional user ID for vote status
        };
        
        const result = await issueService.getIssues(filters, page, limit);
        res.json(result);
    } catch (error) {
        next(error);
    }
});


module.exports = router; 