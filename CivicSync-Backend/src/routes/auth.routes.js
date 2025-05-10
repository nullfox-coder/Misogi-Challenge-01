const express = require('express');
const authService = require('../services/auth.service');
const { validateRequest } = require('../middleware/validateRequest');
const { auth } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../utils/auth.validations');

const router = express.Router();


// Register route
router.post('/register', registerValidation, validateRequest, async (req, res, next) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

// Login route
router.post('/login', loginValidation, validateRequest, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get current user profile
router.get('/profile', auth, async (req, res, next) => {
    try {
        const user = await authService.getProfile(req.user.id);
        res.json(user);
    } catch (error) {
        next(error);
    }
});




module.exports = router; 