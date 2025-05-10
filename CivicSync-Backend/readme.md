# CivicSync Backend

CivicSync is a web-based platform designed to empower citizens to report civic issues, browse issues submitted by others, vote on what's important, and visualize resolution trends over time.

## Features

- User authentication and authorization
- Issue management (create, read, update, delete)
- Voting system with one-vote-per-issue constraint
- Image upload for issues
- Analytics and reporting
- Real-time issue tracking

## Tech Stack

- Node.js with Express.js
- PostgreSQL database
- Sequelize ORM
- JWT authentication
- Firebase Storage for file uploads
- Express Validator for request validation

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Firebase project with Storage enabled

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   DB_NAME=civicsync
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_HOST=localhost
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=24h
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY=your_private_key
   FIREBASE_CLIENT_EMAIL=your_client_email
   FIREBASE_STORAGE_BUCKET=your_storage_bucket
   PORT=3000
   NODE_ENV=development
   ```

4. Create a `firebase-service-account.json` file with your Firebase service account credentials

5. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user profile

### Issues
- POST /api/issues - Create a new issue
- GET /api/issues - Get all issues
- GET /api/issues/:id - Get issue by ID
- PUT /api/issues/:id - Update issue
- DELETE /api/issues/:id - Delete issue
- GET /api/issues/user - Get current user's issues

### Votes
- POST /api/votes/issues/:issueId - Vote on an issue
- DELETE /api/votes/issues/:issueId - Remove vote from an issue
- GET /api/votes/issues/:issueId/count - Get vote count for an issue
- GET /api/votes/issues/:issueId/check - Check if user has voted

### Media
- POST /api/media/issues/:issueId - Upload media for an issue
- DELETE /api/media/:mediaId - Delete media
- GET /api/media/issues/:issueId - Get media for an issue

### Analytics
- GET /api/analytics/issues-by-status - Get issues by status
- GET /api/analytics/issues-by-category - Get issues by category
- GET /api/analytics/resolution-time - Get resolution time statistics
- GET /api/analytics/trending-issues - Get trending issues
- GET /api/analytics/voting-trends - Get voting trends

## Error Handling

The API uses a consistent error response format:

```json
{
    "status": "error",
    "message": "Error message",
    "errors": [
        {
            "field": "field_name",
            "message": "Error message for this field"
        }
    ]
}
```

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation
- File upload restrictions
- Role-based authorization

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.