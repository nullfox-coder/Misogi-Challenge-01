const { Issue, Vote } = require('../models');
const sequelize = require('../config/database');
const { fn, col, literal, Op } = require('sequelize');
const { AppError } = require('../middleware/errorHandler');
const { paginate, paginationMeta } = require('../utils/pagination');


const getIssuesByCategory = async (paginationOptions = {}) => {
    // getIssuesByStatus
    const allCategories = await Issue.findAll({
        attributes: ['category', [fn('COUNT', '*'), 'count']],
        group: ['category'],
        order: [['category', 'ASC']]
    });
    
    const total = allCategories.length;
    
    // Then apply manual pagination
    const page = Math.max(1, parseInt(paginationOptions.page) || 1);
    const limit = Math.max(1, parseInt(paginationOptions.limit) || 10);
    const offset = (page - 1) * limit;
    
    const paginatedCategories = allCategories.slice(offset, offset + limit);
    
    return {
        categories: paginatedCategories,
        pagination: paginationMeta(total, paginationOptions)
    };
};

const getDailySubmissions = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailySubmissions = await Issue.findAll({
        attributes: [
            [fn('DATE', col('createdAt')), 'date'],
            [fn('COUNT', '*'), 'count']
        ],
        where: {
            createdAt: {
                [Op.gte]: sevenDaysAgo
            }
        },
        group: [fn('DATE', col('createdAt'))],
        order: [[fn('DATE', col('createdAt')), 'ASC']],
        raw: true
    });

    // Fill in missing dates with zero counts
    const result = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const submission = dailySubmissions.find(s => s.date === dateStr);
        result.unshift({
            date: dateStr,
            count: submission ? parseInt(submission.count) : 0
        });
    }

    return result;
};

const getMostVotedIssuesByCategory = async (limit = 5) => {
    const categories = ['ROAD', 'WATER', 'SANITATION', 'ELECTRICITY', 'OTHER'];
    const result = {};

    // Get top voted issues for each category
    for (const category of categories) {
        const topIssues = await Issue.findAll({
            where: {
                category: category
            },
            attributes: [
                'id',
                'title',
                'category',
                'status',
                'vote_count',
                'createdAt'
            ],
            order: [['vote_count', 'DESC']],
            limit: limit,
            include: [{
                model: Vote,
                attributes: []
            }]
        });

        result[category] = topIssues.map(issue => ({
            id: issue.id,
            title: issue.title,
            status: issue.status,
            vote_count: issue.vote_count,
            created_at: issue.createdAt
        }));
    }

    // Get category-wise total votes
    const categoryTotals = await Issue.findAll({
        attributes: [
            'category',
            [fn('SUM', col('vote_count')), 'total_votes'],
            [fn('COUNT', col('id')), 'total_issues']
        ],
        group: ['category'],
        raw: true
    });

    // Add summary statistics
    const summary = categoryTotals.reduce((acc, curr) => {
        acc[curr.category] = {
            total_votes: parseInt(curr.total_votes) || 0,
            total_issues: parseInt(curr.total_issues) || 0,
            average_votes: curr.total_issues ? 
                (parseInt(curr.total_votes) / parseInt(curr.total_issues)).toFixed(2) : 0
        };
        return acc;
    }, {});

    return {
        top_issues: result,
        summary: summary
    };
};

module.exports = {
    getIssuesByCategory,
    getDailySubmissions,
    getMostVotedIssuesByCategory
}; 