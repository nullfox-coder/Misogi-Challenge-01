const express = require('express');
const multer = require('multer');
const mediaService = require('../services/media.service');
const { auth } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Upload media for an issue
router.post('/issues/:issueId', auth, upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            throw new AppError('No file uploaded', 400);
        }

        const media = await mediaService.uploadFile(req.file, req.params.issueId, req.user.id);
        res.status(201).json(media);
    } catch (error) {
        next(error);
    }
});

// Delete media
router.delete('/:mediaId', auth, async (req, res, next) => {
    try {
        await mediaService.deleteMedia(req.params.mediaId, req.user.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// Get media for an issue
router.get('/issues/:issueId', async (req, res, next) => {
    try {
        const media = await mediaService.getMediaByIssue(req.params.issueId);
        res.json(media);
    } catch (error) {
        next(error);
    }
});

module.exports = router; 