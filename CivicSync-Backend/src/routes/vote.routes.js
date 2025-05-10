const express = require('express');
const voteService = require('../services/vote.service');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Vote on an issue
router.post('/issues/:issueId', auth, async (req, res, next) => {
    try {
        const vote = await voteService.vote(req.params.issueId, req.user.id);
        res.status(201).json(vote);
    } catch (error) {
        next(error);
    }
});

// Remove vote from an issue
router.delete('/issues/:issueId', auth, async (req, res, next) => {
    try {
        await voteService.unvote(req.params.issueId, req.user.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// Get vote count for an issue
router.get('/issues/:issueId/count', async (req, res, next) => {
    try {
        const count = await voteService.getVoteCount(req.params.issueId);
        res.json({ count });
    } catch (error) {
        next(error);
    }
});

// Check if user has voted on an issue
router.get('/issues/:issueId/check', auth, async (req, res, next) => {
    try {
        const hasVoted = await voteService.hasVoted(req.params.issueId, req.user.id);
        res.json({ hasVoted });
    } catch (error) {
        next(error);
    }
});

module.exports = router; 