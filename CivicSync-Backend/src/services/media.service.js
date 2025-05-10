const { Media, Issue } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { bucket } = require('../config/firbase');


const uploadFile = async (file, issueId, userId) => {
    try {
        const issue = await Issue.findByPk(issueId);
        if (!issue) {
            throw new AppError('Issue not found', 404);
        }

        if (issue.user_id !== userId) {
            throw new AppError('Not authorized to upload media for this issue', 403);
        }

        if (!file || !file.buffer) {
            throw new AppError('No file data provided', 400);
        }

        const fileName = `${issueId}/${Date.now()}-${file.originalname}`;
        const fileUpload = bucket.file(fileName);

        const stream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype
            },
            resumable: false // Disable resumable uploads for smaller files
        });

        return new Promise((resolve, reject) => {
            stream.on('error', (error) => {
                console.error('Firebase upload error:', error);
                reject(new AppError(`Error uploading file: ${error.message}`, 500));
            });

            stream.on('finish', async () => {
                try {
                    const [url] = await fileUpload.getSignedUrl({
                        action: 'read',
                        expires: '03-01-2500' // Long expiration for demo purposes
                    });

                    const media = await Media.create({
                        issue_id: issueId,
                        file_path: url,
                        file_type: file.mimetype,
                        file_size: file.size
                    });

                    resolve(media);
                } catch (error) {
                    console.error('Error getting signed URL or creating media record:', error);
                    reject(new AppError(`Error processing uploaded file: ${error.message}`, 500));
                }
            });

            stream.end(file.buffer);
        });
    } catch (error) {
        console.error('Upload process error:', error);
        throw error;
    }
};

const deleteMedia = async (mediaId, userId) => {
    const media = await Media.findByPk(mediaId, {
        include: [Issue]
    });

    if (!media) {
        throw new AppError('Media not found', 404);
    }

    if (media.Issue.user_id !== userId) {
        throw new AppError('Not authorized to delete this media', 403);
    }

    // Delete from Firebase Storage
    const fileName = media.file_path.split('/').pop();
    // await bucket.file(fileName).delete();

    // Delete from database
    await media.destroy();

    return true;
};

const getMediaByIssue = async (issueId) => {
    return Media.findAll({
        where: { issue_id: issueId },
        attributes: ['id', 'file_path', 'file_type', 'createdAt']
    });
};

module.exports = {
    uploadFile,
    deleteMedia,
    getMediaByIssue
}; 