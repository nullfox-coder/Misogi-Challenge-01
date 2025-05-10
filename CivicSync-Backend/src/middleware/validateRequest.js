const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.param,
            message: error.msg
        }));
        throw new AppError('Validation failed', 400, errorMessages);
    }
    next();
};

module.exports = {
    validateRequest
}; 