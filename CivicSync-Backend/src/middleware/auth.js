const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

const auth = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            throw new AppError('Authentication required', 401);
        }

        // Check if token is in correct format
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw new AppError('Invalid token format', 401);
        }

        const token = parts[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach user to request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };
        
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            next(new AppError('Invalid token', 401));
        } else if (error.name === 'TokenExpiredError') {
            next(new AppError('Token expired', 401));
        } else {
            next(error);
        }
    }
};

const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new AppError('Authentication required', 401);
        }

        if (roles.length && !roles.includes(req.user.role)) {
            throw new AppError('Unauthorized access', 403);
        }

        next();
    };
};

module.exports = {
    auth,
    authorize
}; 