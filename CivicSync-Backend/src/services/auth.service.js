const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { AppError } = require('../middleware/errorHandler');

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
};

const register = async (userData) => {
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
        throw new AppError('Email already registered', 400);
    }

    const user = await User.create(userData);
    const token = generateToken(user);

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        },
        token
    };
};

const login = async (email, password) => {
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
    }

    const token = generateToken(user);

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        },
        token
    };
};

const getProfile = async (userId) => {
    const user = await User.findByPk(userId, {
        attributes: ['id', 'email', 'name', 'role', 'createdAt', 'updatedAt']
    });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return user;
};

module.exports = {
    register,
    login,
    getProfile
}; 