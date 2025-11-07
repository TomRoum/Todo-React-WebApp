# Todo App - Project Structure (Final)

## Overview
A full-stack Todo application with JWT authentication, following the MVC (Model-View-Controller) pattern on the backend and component-based architecture on the frontend.

## Technology Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** for authentication
- **bcrypt** for password hashing
- **Mocha + Chai** for testing

### Frontend
- **React 18** with Vite
- **React Router** for routing
- **Context API** for state management
- No external UI libraries (custom CSS)

## Project Structure

```
todo-app/
│
├── server/                        # Backend application
│   ├── controllers/
│   │   ├── TaskController.js     # Task CRUD operations
│   │   └── UserController.js     # User authentication operations
│   │
│   ├── models/
│   │   ├── Task.js               # Task database queries
│   │   └── User.js               # User database queries
│   │
│   ├── routers/
│   │   ├── todoRouter.js         # Task routes
│   │   └── userRouter.js         # User routes
│   │
│   ├── helper/                   # Helper utilities (singular folder name)
│   │   ├── db.js                 # Database connection pool
│   │   ├── auth.js               # JWT authentication middleware
│   │   ├── ApiError.js           # Custom error class
│   │   ├── test.js               # Test utilities
│   │   └── logger.js             # Test logging system
│   │
│   ├── logs/
│   │   └── test-results.log      # Test execution logs
│   │
│   ├── index.js                  # Server entry point
│   ├── index.test.js             # Integration tests
│   ├── db.sql                    # Database schema
│   ├── .env                      # Environment variables
│   └── package.json              # Dependencies and scripts
│
└── client/                        # Frontend application
    ├── src/
    │   ├── screens/
    │   │   ├── App.jsx            # Main application screen
    │   │   ├── Authentication.jsx # Login/Signup screen
    │   │   └── NotFound.jsx       # 404 error page
    │   │
    │   ├── components/
    │   │   ├── TaskForm.jsx       # Add task form component
    │   │   ├── TaskList.jsx       # Task list container
    │   │   ├── TaskItem.jsx       # Individual task item
    │   │   ├── AuthForm.jsx       # Login/Signup form (if used)
    │   │   ├── ErrorDisplay.jsx   # Error message display
    │   │   └── ProtectedRoute.jsx # Route authentication guard
    │   │
    │   ├── context/
    │   │   └── userProvider.jsx   # User context & state management
    │   │
    │   ├── App.css                # Application styles
    │   ├── index.css              # Global styles
    │   └── main.jsx               # React entry point with routing
    │
    ├── public/
    │   └── favicon.svg            # Application icon
    │
    ├── index.html                 # HTML template
    ├── vite.config.js             # Vite configuration
    └── package.json               # Dependencies and scripts
```

## Backend Architecture

### MVC Pattern Implementation

**Models** (`models/`)
- Handle all database queries
- Return raw query results
- No business logic
- Example: `selectAllTasks()`, `createUser()`

**Controllers** (`controllers/`)
- Process requests and responses
- Contain business logic
- Handle validation
- Use models for data access
- Return standardized responses
- Example: `getTasks()`, `signup()`

**Routers** (`routers/`)
- Define API endpoints
- Connect routes to controllers
- Apply middleware (authentication)
- Example: `GET /`, `POST /create`

### Database Layer
- **Connection Pool**: Singleton pattern for efficient connections
- **Environment-based**: Separate development and test databases
- **SQL Queries**: Direct PostgreSQL queries (no ORM)

### Authentication System
- **JWT tokens**: Stateless authentication
- **bcrypt hashing**: Password security (10 salt rounds)
- **Middleware**: `auth.js` validates tokens on protected routes
- **Token expiry**: 1 hour lifetime

### Error Handling
- **ApiError class**: Custom error with status codes
- **Global error handler**: Centralized error responses
- **Consistent format**: `{ error: { message, status } }`

## Frontend Architecture

### Component Hierarchy

```
App (main.jsx)
├── UserProvider (Context)
│   ├── RouterProvider
│   │   ├── /signin → Authentication
│   │   ├── /signup → Authentication
│   │   └── / → ProtectedRoute
│   │       └── App
│   │           ├── ErrorDisplay
│   │           ├── TaskForm
│   │           └── TaskList
│   │               └── TaskItem (multiple)
```

### State Management
- **Context API**: Global user state
- **Local State**: Component-specific data (tasks, loading, errors)
- **localStorage**: Token persistence

### Routing
- **React Router v6**: Client-side routing
- **Protected Routes**: Authentication guard
- **Nested Routes**: Clean URL structure
- **Error Boundary**: 404 handling

## API Endpoints

### Tasks
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | Get all tasks |
| POST | `/create` | Yes | Create a new task |
| DELETE | `/delete/:id` | No | Delete a task |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/user/signup` | No | Create new account |
| POST | `/user/signin` | No | Login (alternative) |
| POST | `/user/login` | No | Login (primary) |
| POST | `/user/logout` | Yes | Logout |

## Database Schema

```sql
-- Task table
CREATE TABLE task (
  id SERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL
);

-- User account table
CREATE TABLE account (
  id SERIAL PRIMARY KEY,
  email VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);
```

## Authentication Flow

```
1. User visits /signup
   ↓
2. Creates account (POST /user/signup)
   ↓
3. Password hashed with bcrypt
   ↓
4. User saved to database
   ↓
5. Redirected to /signin
   ↓
6. Logs in (POST /user/signin)
   ↓
7. Credentials verified
   ↓
8. JWT token generated
   ↓
9. Token saved to localStorage
   ↓
10. User context updated
   ↓
11. Redirected to / (main app)
   ↓
12. Protected routes accessible
   ↓
13. Token sent in Authorization header
   ↓
14. Logout clears token from localStorage
```

## Testing Strategy

### Test Suites (16 total tests)

**Task Management Tests (7 tests)**
- GET all tasks
- POST create with auth
- POST create without auth (401)
- POST create with invalid token (401)
- DELETE task
- POST create without description (400)
- DELETE non-existent task (404)

**User Management Tests (8 tests)**
- POST signup
- POST signup duplicate email (409)
- POST signin
- POST login
- POST login wrong password (401)
- POST login non-existent user (401)
- POST logout

**End-to-End Test (1 test)**
- Complete user flow: Signup → Signin → Create → Verify → Delete → Logout

### Test Tools
- **Mocha**: Test runner
- **Chai**: Assertion library
- **Custom Logger**: Detailed test execution logs
- **Test Database**: Isolated test environment

## Environment Variables

```env
# Server Configuration
PORT=3001

# Database - Development
DB_USER=postgres
DB_HOST=localhost
DB_NAME=todo
DB_PASSWORD=your_password
DB_PORT=5432

# Database - Testing
TEST_DB_NAME=test_todo

# Security
JWT_SECRET=your_secret_key_here
```

## Running the Application

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- npm or yarn

### Setup

```bash
# Backend setup
cd server
npm install
psql -U postgres -d todo -f db.sql

# Frontend setup
cd client
npm install
```

### Development

```bash
# Backend (port 3001)
cd server
npm run devStart

# Frontend (port 5173)
cd client
npm run dev
```

### Testing

```bash
cd server
npm test
```

### Production Build

```bash
# Frontend
cd client
npm run build
```

## Key Features Implemented

### Security
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Protected routes
- ✅ Token validation middleware
- ✅ Secure error messages (no info leakage)

### User Experience
- ✅ Responsive error messages
- ✅ Loading states
- ✅ Form validation
- ✅ Empty state handling
- ✅ Logout functionality

### Code Quality
- ✅ MVC pattern
- ✅ Component reusability
- ✅ Consistent error handling
- ✅ Comprehensive testing
- ✅ Clean code organization
- ✅ Detailed logging

### Data Management
- ✅ Context API for global state
- ✅ localStorage for persistence
- ✅ Database connection pooling
- ✅ Environment-based configuration

## Performance Considerations

- **Database**: Connection pooling for efficiency
- **Frontend**: Component memoization potential
- **API**: Async/await for non-blocking operations
- **Testing**: Test database isolation

## Future Enhancements

Potential improvements:
- Task editing functionality
- User-specific tasks (task ownership)
- Task categories/tags
- Due dates and priorities
- Task completion status
- User profile management
- Password reset functionality
- Email verification
- Refresh token mechanism
- Rate limiting
- Frontend unit tests
- E2E tests with Cypress/Playwright

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

This project is for educational purposes.
