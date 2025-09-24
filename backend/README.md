# IPSM Web Backend API

Backend API for the Integrated Project and Service Management Web Application.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Project Management**: CRUD operations for projects with team management
- **Task Management**: Complete task lifecycle management with dependencies
- **Dashboard Analytics**: Real-time statistics and progress tracking
- **User Management**: User CRUD with role assignments
- **File Uploads**: Support for project and task attachments
- **RESTful API**: Well-structured REST endpoints
- **Data Validation**: Comprehensive input validation
- **Error Handling**: Centralized error handling with detailed responses
- **Security**: Helmet, CORS, rate limiting, and input sanitization

## Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **Morgan** - Request logging
- **Express Validator** - Input validation
- **Multer** - File upload handling

## API Structure

```
/api/
├── /auth
│   ├── POST /register        # User registration
│   ├── POST /login          # User login
│   ├── GET  /logout         # User logout
│   ├── GET  /me             # Get current user
│   ├── PUT  /updatedetails  # Update user details
│   └── PUT  /updatepassword # Update password
├── /projects
│   ├── GET    /             # Get all projects
│   ├── POST   /             # Create project
│   ├── GET    /:id          # Get single project
│   ├── PUT    /:id          # Update project
│   ├── DELETE /:id          # Delete project
│   └── POST   /:id/team     # Add team member
├── /tasks
│   ├── GET    /             # Get all tasks
│   ├── POST   /             # Create task
│   ├── GET    /:id          # Get single task
│   ├── PUT    /:id          # Update task
│   └── DELETE /:id          # Delete task
├── /dashboard
│   ├── GET /stats           # Dashboard statistics
│   ├── GET /activities      # Recent activities
│   └── GET /project-progress # Project progress data
└── /users
    ├── GET    /             # Get all users (Admin)
    ├── POST   /             # Create user (Admin)
    ├── GET    /:id          # Get single user (Admin)
    ├── PUT    /:id          # Update user (Admin)
    └── DELETE /:id          # Delete user (Admin)
```

## Installation & Setup

### Prerequisites

- Node.js (v22 or higher)
- MongoDB (local or cloud)
- npm (v10 or higher)

### Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=mongodb://localhost:27017/ipsm_web
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
BCRYPT_SALT_ROUNDS=12
```

### Installation Steps

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. For production:
   ```bash
   npm start
   ```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Data Models

### User
- Personal information (name, email, department, position)
- Authentication (password, role, tokens)
- Activity tracking (last login, status)

### Project
- Basic info (name, description, status, priority)
- Timeline (start date, end date, deadline)
- Team management (manager, team members)
- Progress tracking and budget management

### Task
- Task details (title, description, status, priority)
- Assignment (assignee, assignedBy, project)
- Timeline (due date, estimated/actual hours)
- Dependencies and subtasks
- Comments and attachments

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (Admin, Manager, User)
- Request rate limiting
- CORS configuration
- Security headers with Helmet
- Input validation and sanitization

## Error Handling

The API uses a centralized error handling system with:
- Custom error classes
- Consistent error response format
- Detailed error messages in development
- Generic messages in production
- Proper HTTP status codes

## Deployment

### Environment Setup
- Set NODE_ENV to 'production'
- Configure production database URL
- Set secure JWT secret
- Configure proper CORS origins

### Recommended Hosting
- **Railway** - Easy deployment with GitHub integration
- **Heroku** - Platform as a Service
- **DigitalOcean** - VPS with Docker
- **AWS EC2** - Scalable cloud instances

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.