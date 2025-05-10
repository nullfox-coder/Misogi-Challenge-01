# Authentication
POST /api/auth/register
POST /api/auth/login
GET /api/auth/profile

# Issues
POST /api/issues
GET /api/issues/:id
PUT /api/issues/:id
DELETE /api/issues/:id
GET /api/issues
GET /api/issues/user

# Votes
POST /api/votes/issues/:id
GET /api/votes/issues/:id/count
DELETE /api/votes/issues/:id

# Media
POST /api/media/issues/:id
GET /api/media/issues/:id
DELETE /api/media/:id

# Analytics
GET /api/analytics/issues-by-category
GET /api/analytics/daily-submissions
