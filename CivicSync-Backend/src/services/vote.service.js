const { Vote, Issue } = require('../models');
const { AppError } = require('../middleware/errorHandler');

const vote = async (issueId, userId) => {
    const issue = await Issue.findByPk(issueId);
    if (!issue) {
        throw new AppError('Issue not found', 404);
    }

    const existingVote = await Vote.findOne({
        where: {
            issue_id: issueId,
            user_id: userId
        }
    });

    if (existingVote) {
        throw new AppError('Already voted on this issue', 400);
    }

    const vote = await Vote.create({
        issue_id: issueId,
        user_id: userId
    });

    // Update vote count
    await issue.increment('vote_count');

    return vote;
};

const unvote = async (issueId, userId) => {
    const issue = await Issue.findByPk(issueId);
    if (!issue) {
        throw new AppError('Issue not found', 404);
    }

    const vote = await Vote.findOne({
        where: {
            issue_id: issueId,
            user_id: userId
        }
    });

    if (!vote) {
        throw new AppError('No vote found to remove', 404);
    }

    await vote.destroy();
    
    // Update vote count
    await issue.decrement('vote_count');

    return true;
};

const getVoteCount = async (issueId) => {
    const issue = await Issue.findByPk(issueId);
    if (!issue) {
        throw new AppError('Issue not found', 404);
    }

    return issue.vote_count;
};

const hasVoted = async (issueId, userId) => {
    const vote = await Vote.findOne({
        where: {
            issue_id: issueId,
            user_id: userId
        }
    });

    return !!vote;
};

module.exports = {
    vote,
    unvote,
    getVoteCount,
    hasVoted
}; 