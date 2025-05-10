const { Issue } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

const getMapIssues = async (bounds = null) => {
    try {
        const where = {};
        
        // If bounds are provided, filter issues within those bounds
        if (bounds) {
            where.location_lat = {
                [Op.between]: [bounds[0], bounds[2]] // [south, north]
            };
            where.location_lng = {
                [Op.between]: [bounds[1], bounds[3]] // [west, east]
            };
        }

        const issues = await Issue.findAll({
            where,
            attributes: [
                'id',
                'title',
                'status',
                'vote_count',
                'location_lat',
                'location_lng',
                'category'
            ],
            order: [['createdAt', 'DESC']]
        });

        return issues;
    } catch (error) {
        throw new AppError('Error fetching map issues', 500);
    }
};

const getIssueDetails = async (issueId) => {
    try {
        const issue = await Issue.findByPk(issueId, {
            attributes: [
                'id',
                'title',
                'description',
                'status',
                'vote_count',
                'category',
                'createdAt',
                'location_address'
            ]
        });

        if (!issue) {
            throw new AppError('Issue not found', 404);
        }

        return issue;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getMapIssues,
    getIssueDetails
}; 