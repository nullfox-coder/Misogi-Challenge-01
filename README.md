# CivicSync – Citizen-Issue Reporting & Voting Platform

CivicSync is a comprehensive civic engagement platform that empowers citizens to report infrastructure issues, vote on critical problems, and collaborate with authorities to improve their communities.

## Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **UI Library**: Chakra UI with Emotion styling
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Maps Integration**: Mapbox GL
- **Data Visualization**: Chart.js with react-chartjs-2
- **Animation**: Framer Motion
- **Icons**: Chakra UI Icons and React Icons
- **Development Tools**:
  - TypeScript 5.8
  - ESLint 9
  - TypeScript ESLint

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (jsonwebtoken) with bcrypt
- **File Storage**: Google Cloud Storage via Firebase Admin
- **Validation**: Express Validator
- **Middleware**:
  - CORS for cross-origin requests
  - Helmet for security headers
  - Morgan for HTTP request logging
- **Logging**: Winston
- **Environment Variables**: dotenv
- **Unique Identifiers**: UUID
- **File Upload**: Multer

## Application Features

- **Issue Reporting**: Submit civic issues with detailed descriptions, location data, and images
- **Public Feed**: Browse all reported issues with search, filter, and sort capabilities
- **Authentication System**: Secure user registration and login
- **Voting System**: Support important issues with upvotes
- **Issue Tracking**: Monitor the status of reported issues (Pending, In Progress, Resolved)
- **User Dashboard**: Manage and track personal issue reports
- **Analytics**: View aggregate data about reported issues
- **Interactive Map**: Visualize issues geographically
- **Responsive Design**: Full functionality on mobile and desktop devices

## Architecture

CivicSync follows a client-server architecture with:
- RESTful API backend services
- Stateless authentication using JWT tokens
- Secure file storage in Google Cloud Storage
- Relational database for structured data with Sequelize ORM
- Component-based frontend with responsive UI design
- Context API for global state management

## Deployment

The application is designed to be deployed as:
- Frontend: Static hosting on cloud platforms (Vercel, Netlify, etc.)
- Backend: Containerized services on cloud providers (AWS, Google Cloud, etc.)
- Database: Managed PostgreSQL instances
- Media: Google Cloud Storage for images and files

## Development

1. Clone the repository
2. Set up environment variables
3. Install dependencies for both frontend and backend
4. Run the development servers
