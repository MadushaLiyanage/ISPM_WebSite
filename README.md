# IPSM Web Application

Integrated Project and Service Management Web Application - A full-stack solution built with React frontend and Node.js backend.

## 🏗️ Architecture

This project follows a **full-stack architecture** with separate frontend and backend applications:

- **Frontend**: React + Vite (Modern SPA)
- **Backend**: Node.js + Express + MongoDB (RESTful API)
- **Authentication**: JWT-based auth with role management
- **Database**: MongoDB with Mongoose ODM

## 📁 Project Structure

```
IPSM Web 2/
├── frontend/               # React application (current directory)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── layouts/       # Layout components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   ├── services/      # API services
│   │   └── styles/        # Global styles
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
└── backend/                # Node.js API server
    ├── src/
    │   ├── controllers/    # Request handlers
    │   ├── models/         # Database models
    │   ├── routes/         # API routes
    │   ├── middleware/     # Custom middleware
    │   ├── services/       # Business logic
    │   └── utils/          # Helper functions
    ├── config/             # Configuration files
    ├── tests/              # Test files
    └── package.json        # Backend dependencies
```

## ✨ Features

### Frontend Features
- **Dashboard**: Overview of projects, tasks, and key metrics
- **Project Management**: Create, view, and manage projects
- **Task Management**: Track and organize tasks with priorities and status
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean and intuitive user interface
- **Real-time Updates**: Live data synchronization

### Backend Features
- **RESTful API**: Well-structured REST endpoints
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Data Validation**: Comprehensive input validation
- **Error Handling**: Centralized error handling with detailed responses
- **Security**: Helmet, CORS, rate limiting, and input sanitization
- **File Uploads**: Support for project and task attachments

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v22 or higher)
- **npm** (v10 or higher)
- **MongoDB** (local or cloud instance)

### Frontend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:5173`

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start API server**:
   ```bash
   npm run dev
   ```

5. **API will be available** at `http://localhost:3000`

## 📝 Available Scripts

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## 🔧 Technology Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **CSS3** - Styling with modern features
- **ESLint** - Code linting

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get single project
- `PUT /api/projects/:id` - Update project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/activities` - Recent activities

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (Admin, Manager, User)
- Request rate limiting
- CORS configuration
- Security headers with Helmet
- Input validation and sanitization

## 🌍 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=mongodb://localhost:27017/ipsm_web
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
```

## 📚 Documentation

- **Frontend Documentation**: See component documentation in `/src/components`
- **Backend API Documentation**: See `/backend/README.md` for detailed API docs
- **Database Schema**: See `/backend/src/models` for data models

## 🚀 Deployment

### Frontend Deployment
- **Vercel** - Recommended for React apps
- **Netlify** - Easy static site hosting
- **GitHub Pages** - Free hosting for public repos

### Backend Deployment
- **Railway** - Easy deployment with GitHub integration
- **Heroku** - Platform as a Service
- **DigitalOcean** - VPS with Docker
- **AWS EC2** - Scalable cloud instances

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@ipsmweb.com or create an issue in this repository.

---

**Built with ❤️ for efficient project and service management**
