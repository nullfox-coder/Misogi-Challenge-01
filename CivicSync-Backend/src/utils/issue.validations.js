const { body, query } = require('express-validator');

// Create issue validation
const createIssueValidation = [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').isIn(['ROAD', 'WATER', 'SANITATION', 'ELECTRICITY', 'OTHER'])
        .withMessage('Invalid category'),
    body('location_lat').isFloat().withMessage('Invalid latitude'),
    body('location_lng').isFloat().withMessage('Invalid longitude'),
    body('location_address').notEmpty().withMessage('Location address is required')
];

// Update issue validation
const updateIssueValidation = [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('category').optional()
        .isIn(['ROAD', 'WATER', 'SANITATION', 'ELECTRICITY', 'OTHER'])
        .withMessage('Invalid category'),
    body('status').optional()
        .isIn(['PENDING', 'IN_PROGRESS', 'RESOLVED'])
        .withMessage('Invalid status')
];

// Get issues validation
const getIssuesValidation = [
    query('category').optional()
        .isIn(['ROAD', 'WATER', 'SANITATION', 'ELECTRICITY', 'OTHER'])
        .withMessage('Invalid category'),
    query('status').optional()
        .isIn(['PENDING', 'IN_PROGRESS', 'RESOLVED'])
        .withMessage('Invalid status'),
    query('search').optional()
        .isString()
        .withMessage('Search must be a string'),
    query('sort').optional()
        .isIn(['newest', 'votes'])
        .withMessage('Sort must be either "newest" or "votes"')
];

// Add pagination validation
const paginationValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 10 })
        .withMessage('Limit must be between 1 and 10')
];

module.exports = { createIssueValidation, updateIssueValidation, getIssuesValidation, paginationValidation };
