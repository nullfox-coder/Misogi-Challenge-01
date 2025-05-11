const { Issue, User, Vote, Media } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

const createIssue = async (issueData, userId) => {
    const issue = await Issue.create({
        ...issueData,
        user_id: userId
    });

    return issue;
};

const getIssueById = async (id) => {
    const issue = await Issue.findByPk(id, {
        include: [
            {
                model: User,
                attributes: ['id', 'name', 'email']
            },
            {
                model: Media,
                attributes: ['id', 'file_path', 'file_type']
            }
        ]
    });

    if (!issue) {
        throw new AppError('Issue not found', 404);
    }

    return issue;
};

const updateIssue = async (id, updateData, userId) => {
    const issue = await Issue.findByPk(id);
    
    if (!issue) {
        throw new AppError('Issue not found', 404);
    }

    if (issue.user_id !== userId) {
        throw new AppError('Not authorized to update this issue', 403);
    }

    if (issue.status !== 'PENDING') {
        throw new AppError('Can only update issues in PENDING state', 400);
    }

    await issue.update(updateData);
    return issue;
};

const deleteIssue = async (id, userId) => {
    const issue = await Issue.findByPk(id);
    
    if (!issue) {
        throw new AppError('Issue not found', 404);
    }

    if (issue.user_id !== userId) {
        throw new AppError('Not authorized to delete this issue', 403);
    }

    if (issue.status !== 'PENDING') {
        throw new AppError('Can only delete issues in PENDING state', 400);
    }

    await issue.destroy();
};

const getIssues = async (filters = {}, page = 1, limit = 10) => {
    const where = {};
    
    // Category filter
    if (filters.category) {
        where.category = filters.category;
    }
    
    // Status filter
    if (filters.status) {
        where.status = filters.status;
    }
    
    // Search by title
    if (filters.search) {
        where.title = {
            [Op.iLike]: `%${filters.search}%`  
        };
    }

    // User ID filter
    if (filters.user_id) {
        where.user_id = filters.user_id;
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const total = await Issue.count({ where });

    // Determine sort order
    let order = [['createdAt', 'DESC']]; // Default sort by newest
    if (filters.sort === 'votes') {
        order = [['vote_count', 'DESC']];
    }

    // Get paginated issues with user and media info
    let issues = await Issue.findAll({
        where,
        include: [
            {
                model: User,
                attributes: ['id', 'name', 'email']
            },
            {
                model: Media,
                attributes: ['id', 'file_path', 'file_type']
            }
        ],
        order,
        limit,
        offset
    });

    // If user is authenticated, check if they've voted on each issue
    if (filters.user_id) {
        const issuesWithVoteStatus = await Promise.all(
            issues.map(async (issue) => {
                const hasVoted = await Vote.findOne({
                    where: {
                        issue_id: issue.id,
                        user_id: filters.user_id
                    }
                });
                return {
                    ...issue.toJSON(),
                    has_voted: !!hasVoted
                };
            })
        );
        issues = issuesWithVoteStatus;
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);

    return {
        issues,
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};

const getIssuesByUser = async (userId, page = 1, limit = 10) => {
    return getIssues({ user_id: userId }, page, limit);
};

module.exports = {
    createIssue,
    getIssueById,
    updateIssue,
    deleteIssue,
    getIssues,
    getIssuesByUser
}; 