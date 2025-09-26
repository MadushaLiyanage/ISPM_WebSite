# SecureGuard Web Backend API

Backend API for the SecureGuard Cybersecurity Management Web Application.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Employee Management**: CRUD operations for employees with security training
- **Educational Content**: Management of cybersecurity learning materials
- **Quiz Management**: Security awareness testing and assessment
- **Phishing Simulation**: Controlled phishing tests for training
- **Dashboard Analytics**: Real-time security metrics and progress tracking
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
├── /employees
│   ├── GET    /             # Get all employees
│   ├── POST   /             # Create employee
│   ├── GET    /:id          # Get single employee
│   ├── PUT    /:id          # Update employee
│   └── DELETE /:id          # Delete employee
├── /education
│   ├── GET    /             # Get all educational content
│   ├── POST   /             # Create content
│   ├── GET    /:id          # Get single content
│   ├── PUT    /:id          # Update content
│   └── DELETE /:id          # Delete content
├── /quizzes
│   ├── GET    /             # Get all quizzes
│   ├── POST   /             # Create quiz
│   ├── GET    /:id          # Get single quiz
│   ├── PUT    /:id          # Update quiz
│   └── DELETE /:id          # Delete quiz
├── /dashboard
│   ├── GET /stats           # Dashboard statistics
│   ├── GET /activities      # Recent activities
│   └── GET /security-metrics # Security metrics data
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
DATABASE_URL=mongodb://localhost:27017/secureguard_web
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

### Employee
- Personal information (name, email, department, position)
- Authentication (password, role, tokens)
- Activity tracking (last login, status)
- Security training progress and compliance

### Educational Content
- Content details (title, description, type, category)
- Status tracking (draft, published, archived)
- Completion tracking and progress metrics

### Quiz
- Quiz details (title, description, questions, answers)
- Scoring and passing criteria
- Completion tracking and results

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