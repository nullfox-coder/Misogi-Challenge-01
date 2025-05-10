/**
 * Apply pagination to a Sequelize query
 * @param {Object} options - Query options
 * @param {Object} pagination - Pagination parameters
 * @param {number} pagination.page - Page number (1-based)
 * @param {number} pagination.limit - Items per page
 * @returns {Object} Updated query options with pagination
 */
const paginate = (options = {}, pagination = {}) => {
    const page = Math.max(1, parseInt(pagination.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(pagination.limit) || 10));
    const offset = (page - 1) * limit;
    
    return {
        ...options,
        limit,
        offset,
    };
};

/**
 * Format pagination metadata for response
 * @param {number} total - Total number of items
 * @param {Object} pagination - Pagination parameters
 * @param {number} pagination.page - Current page
 * @param {number} pagination.limit - Items per page
 * @returns {Object} Pagination metadata
 */
const paginationMeta = (total, pagination = {}) => {
    const page = Math.max(1, parseInt(pagination.page) || 1);
    const limit = Math.max(1, parseInt(pagination.limit) || 10);
    const totalPages = Math.ceil(total / limit);
    
    return {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    };
};

module.exports = {
    paginate,
    paginationMeta
}; 