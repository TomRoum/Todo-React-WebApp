# Architecture & Design Decisions

This document outlines the key architectural decisions, design patterns, libraries, and methodologies used in building this Todo application.

## Table of Contents

- [Design Patterns](#design-patterns)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Technology Choices](#technology-choices)
- [Security Decisions](#security-decisions)
- [Testing Strategy](#testing-strategy)
- [Data Flow](#data-flow)
- [Trade-offs & Alternatives](#trade-offs--alternatives)

---

## Design Patterns

### 1. Model-View-Controller (MVC) - Backend

**Decision**: Separate backend concerns into Models, Controllers, and Routers

**Rationale**:
- **Separation of Concerns**: Each layer has a single responsibility
- **Maintainability**: Easy to locate and modify specific functionality
- **Testability**: Components can be tested in isolation
- **Scalability**: New features can be added without affecting existing code

**Implementation**:

```
User Request
    ↓
Router (defines endpoints)
    ↓
Controller (business logic)
    ↓
Model (database queries)
    ↓
Database
    ↓
Controller (format response)
    ↓
Router (send response)
    ↓
User Response
```

**Example**:
```javascript
// Router: Define the endpoint
router.post("/create", auth, postTask);

// Controller: Process the request
const postTask = async (req, res, next) => {
  // Validation and business logic
  const result = await insertTask(description);
  // Format and send response
};

// Model: Database query
const insertTask = async (description) => {
  return await pool.query("INSERT INTO task...");
};
```

### 2. Component-Based Architecture - Frontend

**Decision**: Break UI into reusable, composable components

**Rationale**:
- **Reusability**: Components can be used across different screens
- **Maintainability**: Smaller, focused components are easier to understand
- **Testing**: Individual components can be tested
- **Development Speed**: Components can be developed independently

**Component Hierarchy**:
```
App
├── Authentication (Screen)
│   └── Form inputs
├── Main App (Screen)
│   ├── TaskForm (Component)
│   ├── TaskList (Component)
│   │   └── TaskItem (Component) [multiple]
│   └── ErrorDisplay (Component)
└── NotFound (Screen)
```

### 3. Repository Pattern - Database Layer

**Decision**: Abstract database operations into model files

**Rationale**:
- **Database Independence**: Easy to switch databases if needed
- **Query Reusability**: Same queries used across controllers
- **Centralized Data Access**: Single source of truth for queries
- **Type Safety**: Functions define clear interfaces

**Example**:
```javascript
// Task.js model
export const selectAllTasks = async () => {
  return await pool.query("SELECT * FROM task");
};

export const insertTask = async (description) => {
  return await pool.query("INSERT INTO task...", [description]);
};
```

### 4. Middleware Pattern - Authentication

**Decision**: Use Express middleware for authentication

**Rationale**:
- **Reusability**: Apply auth to multiple routes easily
- **Separation**: Auth logic separate from business logic
- **Standard Practice**: Express middleware is well-understood
- **Flexibility**: Easy to add/remove protection from routes

**Implementation**:
```javascript
// Middleware function
const auth = (req, res, next) => {
  const token = req.headers["authorization"];
  verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({...});
    next(); // Continue to controller
  });
};

// Applied to routes
router.post("/create", auth, postTask); // Protected
router.get("/", getTasks);              // Public
```

### 5. Context API Pattern - State Management

**Decision**: Use React Context for global user state

**Rationale**:
- **Built-in**: No external library needed
- **Simple**: Good for small to medium apps
- **Type Safety**: Clear provider/consumer relationship
- **Performance**: Sufficient for this app's needs

**Implementation**:
```javascript
// Provider wraps app
<UserProvider>
  <App />
</UserProvider>

// Components consume context
const { user, setUser, logout } = useUser();
```

---

## Backend Architecture

### Technology Choices

#### 1. **Node.js with Express.js**

**Why Express?**
- ✅ Minimal and flexible
- ✅ Large ecosystem of middleware
- ✅ Well-documented and mature
- ✅ Perfect for REST APIs
- ✅ Easy to learn

**Alternatives Considered**:
- **Fastify**: Faster but less middleware ecosystem
- **Koa**: More modern but smaller community
- **NestJS**: Too complex for this project scope

#### 2. **PostgreSQL**

**Why PostgreSQL?**
- ✅ Relational data model fits the use case
- ✅ ACID compliance for data integrity
- ✅ Strong type system
- ✅ Excellent for learning SQL
- ✅ Production-ready

**Alternatives Considered**:
- **MongoDB**: NoSQL overkill for simple tables
- **SQLite**: Not suitable for concurrent users
- **MySQL**: PostgreSQL has better features

**Schema Design**:
```sql
-- Simple, normalized schema
task (id, description)
account (id, email, password)

-- Future improvement: Add user_id to task for ownership
```

#### 3. **JWT (jsonwebtoken)**

**Why JWT?**
- ✅ Stateless authentication
- ✅ No server-side session storage needed
- ✅ Scalable across multiple servers
- ✅ Self-contained (payload includes user data)
- ✅ Industry standard

**Configuration**:
```javascript
jwt.sign(
  { user: email },           // Payload
  process.env.JWT_SECRET,    // Secret key
  { expiresIn: '1h' }        // Expiration
);
```

**Token Structure**:
```
Header.Payload.Signature
eyJhbGc...    (base64)
```

**Alternatives Considered**:
- **Session-based auth**: Requires server memory/Redis
- **OAuth**: Too complex for this use case
- **Basic Auth**: Not secure enough

#### 4. **bcrypt**

**Why bcrypt?**
- ✅ Purpose-built for password hashing
- ✅ Includes salt automatically
- ✅ Adjustable work factor (future-proof)
- ✅ Slow by design (prevents brute force)
- ✅ Industry standard

**Configuration**:
```javascript
const saltRounds = 10; // 2^10 iterations
hash(password, saltRounds, callback);
```

**Alternatives Considered**:
- **bcryptjs**: Pure JS but slower
- **argon2**: More secure but newer/less support
- **scrypt**: Less common in Node.js

#### 5. **pg (node-postgres)**

**Why pg?**
- ✅ Official PostgreSQL client
- ✅ Connection pooling built-in
- ✅ Supports promises and callbacks
- ✅ Well-maintained
- ✅ Great documentation

**Connection Pooling**:
```javascript
const pool = new Pool({...config});
// Reuses connections efficiently
// Handles concurrent requests
// Automatic cleanup
```

**Alternatives Considered**:
- **Sequelize**: ORM overkill for simple queries
- **TypeORM**: Requires TypeScript
- **Knex.js**: Query builder adds abstraction layer

### Error Handling Strategy

**Decision**: Custom ApiError class with global error handler

**Implementation**:
```javascript
// Custom error class
class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// Global error handler middleware
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: {
      message: err.message,
      status: statusCode,
    },
  });
});
```

**Benefits**:
- Consistent error format across API
- Controllers throw errors without handling responses
- Single source of truth for error structure
- Easy to add logging/monitoring

### Async/Await Pattern

**Decision**: Use async/await instead of callbacks throughout

**Rationale**:
- **Readability**: Linear, synchronous-looking code
- **Error Handling**: Try/catch blocks
- **Maintainability**: Easier to understand
- **Modern Standard**: Current best practice

**Example**:
```javascript
// Before (callback hell)
pool.query(sql, (err, result) => {
  if (err) return next(err);
  hash(password, 10, (err, hashed) => {
    if (err) return next(err);
    pool.query(insert, [hashed], (err, result) => {
      if (err) return next(err);
      res.json(result);
    });
  });
});

// After (async/await)
const result = await pool.query(sql);
const hashed = await hash(password, 10);
const inserted = await pool.query(insert, [hashed]);
res.json(inserted);
```

---

## Frontend Architecture

### Technology Choices

#### 1. **React 18**

**Why React?**
- ✅ Component-based architecture
- ✅ Large ecosystem and community
- ✅ Excellent documentation
- ✅ Industry standard
- ✅ Great for learning modern web dev

**Key Features Used**:
- Hooks (useState, useEffect, useContext)
- Context API for state management
- Component composition

**Alternatives Considered**:
- **Vue.js**: Easier learning curve but smaller job market
- **Svelte**: Less boilerplate but newer/smaller ecosystem
- **Vanilla JS**: Too much manual DOM manipulation

#### 2. **Vite**

**Why Vite?**
- ✅ Extremely fast development server
- ✅ Hot Module Replacement (HMR)
- ✅ Modern build tool
- ✅ Optimized production builds
- ✅ Better than Create React App

**Alternatives Considered**:
- **Create React App**: Slower, deprecated
- **Webpack**: More complex configuration
- **Parcel**: Less control over setup

#### 3. **React Router v6**

**Why React Router?**
- ✅ De facto routing library for React
- ✅ Declarative routing
- ✅ Nested routes support
- ✅ Protected routes with guards
- ✅ Browser history management

**Routing Structure**:
```javascript
const router = createBrowserRouter([
  {
    path: "/signin",
    element: <Authentication mode="signin" />
  },
  {
    element: <ProtectedRoute />,  // Auth guard
    children: [
      { path: "/", element: <App /> }
    ]
  }
]);
```

**Alternatives Considered**:
- **React Location**: Too new
- **Wouter**: Too minimal for this project
- **Manual routing**: Reinventing the wheel

#### 4. **Context API**

**Why Context API?**
- ✅ Built into React (no dependencies)
- ✅ Sufficient for this app's complexity
- ✅ Easy to understand
- ✅ No boilerplate
- ✅ Good learning tool

**User Context Implementation**:
```javascript
// Provider
const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Consumer
const { user, setUser } = useUser();
```

**When to Use Alternatives**:
- **Redux**: Large apps with complex state
- **Zustand**: Multiple context providers needed
- **Jotai**: Atomic state updates required

#### 5. **localStorage**

**Why localStorage?**
- ✅ Persists across browser sessions
- ✅ Simple API
- ✅ Sufficient for token storage
- ✅ No backend needed
- ✅ Works offline

**Usage**:
```javascript
// Save token
localStorage.setItem('token', jwtToken);

// Retrieve token
const token = localStorage.getItem('token');

// Clear on logout
localStorage.removeItem('token');
```

**Security Note**: XSS can access localStorage. In production, consider:
- HttpOnly cookies (more secure)
- Short token expiration times
- Refresh token mechanism

#### 6. **Native CSS**

**Why No CSS Framework?**
- ✅ Better learning experience
- ✅ Full control over styling
- ✅ No dependency bloat
- ✅ Custom design
- ✅ Smaller bundle size

**CSS Architecture**:
```css
/* Component-scoped classes */
.task-form { }
.task-list { }
.task-item { }

/* State classes */
.loading { }
.error-message { }

/* Responsive with media queries */
@media (max-width: 768px) { }
```

**When to Use Frameworks**:
- **Tailwind**: Rapid prototyping
- **Material-UI**: Enterprise apps
- **Styled Components**: Component-scoped styles with JS

---

## Security Decisions

### 1. Password Security

**Approach**: Hash + Salt with bcrypt

```javascript
// Hashing on signup
const hashedPassword = await hash(password, 10);

// Verification on login
const isMatch = await compare(password, hashedPassword);
```

**Security Properties**:
- Passwords never stored in plain text
- Salt prevents rainbow table attacks
- Work factor (10) makes brute force slow
- Each password has unique salt

### 2. JWT Token Security

**Configuration**:
```javascript
{
  expiresIn: '1h',           // Short expiration
  secret: process.env.JWT_SECRET  // Environment variable
}
```

**Best Practices Implemented**:
- ✅ Token expires after 1 hour
- ✅ Secret key in environment variables
- ✅ Token sent in Authorization header
- ✅ Server validates every request

**Production Improvements**:
- Add refresh tokens
- Implement token blacklist
- Use HttpOnly cookies
- Add CSRF protection

### 3. Input Validation

**Server-Side Validation**:
```javascript
// Email and password required
if (!user || !user.email || !user.password) {
  return next(new ApiError("Email and password are required", 400));
}

// Task description required
if (!task || !task.description || task.description.trim().length === 0) {
  return next(new ApiError("Task description is required", 400));
}
```

**Client-Side Validation**:
```javascript
// HTML5 validation
<input type="email" required />
<input type="password" required minLength={6} />

// Disabled submit button
<button disabled={loading || !description.trim()}>
```

**Defense in Depth**: Both client and server validate

### 4. Error Message Security

**Problem**: Detailed errors leak information

**Solution**: Generic messages to users
```javascript
// Bad - reveals user existence
return next(new ApiError("User not found", 404));

// Good - generic message
return next(new ApiError("Invalid email or password", 401));
```

### 5. CORS Configuration

**Implementation**:
```javascript
app.use(cors());  // Allow all origins (dev only)
```

**Production Configuration**:
```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

---

## Testing Strategy

### Testing Framework Selection

#### Mocha + Chai

**Why This Combination?**
- ✅ **Mocha**: Flexible test runner
- ✅ **Chai**: Readable assertions (expect syntax)
- ✅ **Widely Used**: Industry standard
- ✅ **Good Documentation**: Easy to learn
- ✅ **Async Support**: Native promise/async-await

**Alternatives Considered**:
- **Jest**: Batteries-included but opinionated
- **AVA**: Concurrent but less common
- **Tape**: Minimal but less features

### Test Organization

**Structure**:
```javascript
describe("Feature Group", () => {
  before(async () => {
    // Setup (runs once)
  });
  
  afterEach(async () => {
    // Cleanup after each test
  });
  
  it("should do something", async () => {
    // Test implementation
  });
});
```

**Three Test Suites**:

1. **Task Management Tests** (7 tests)
   - CRUD operations
   - Authorization checks
   - Validation tests
   
2. **User Management Tests** (8 tests)
   - Authentication flows
   - Error cases
   - Security checks
   
3. **End-to-End Tests** (1 test)
   - Complete user journey
   - Integration verification

### Custom Test Logger

**Decision**: Build custom logging system

**Rationale**:
- Track test execution flow
- Debug failing tests easily
- Audit trail for test runs
- Learn about logging systems

**Features**:
```javascript
logger.testStart("Test name");
logger.httpRequest("POST", url, body);
logger.httpResponse(status, data);
logger.testPass("Test name");
logger.testFail("Test name", error);
```

**Output**: `logs/test-results.log`
```
[2025-11-06T21:14:27.240Z] [TEST] Starting: GET all tasks
[2025-11-06T21:14:27.289Z] [HTTP] Response: 200
[2025-11-06T21:14:27.290Z] [PASS] ✓ GET all tasks
```

### Test Database Isolation

**Strategy**: Separate test database

**Configuration**:
```javascript
database: environment === "development" 
  ? process.env.DB_NAME 
  : process.env.TEST_DB_NAME
```

**Benefits**:
- Tests don't affect development data
- Can reset database between tests
- Parallel test execution possible
- Safe to run tests frequently

---

## Data Flow

### Authentication Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. POST /user/signup {email, password}
       ↓
┌─────────────┐
│   Express   │
└──────┬──────┘
       │ 2. Hash password with bcrypt
       ↓
┌─────────────┐
│ PostgreSQL  │
└──────┬──────┘
       │ 3. Save user
       ↓
┌─────────────┐
│   Express   │
└──────┬──────┘
       │ 4. Return success
       ↓
┌─────────────┐
│   Browser   │  5. Redirect to /signin
└──────┬──────┘
       │ 6. POST /user/signin {email, password}
       ↓
┌─────────────┐
│   Express   │  7. Verify password
└──────┬──────┘  8. Generate JWT token
       │
       ↓
┌─────────────┐
│   Browser   │  9. Save token to localStorage
└──────┬──────┘ 10. Redirect to /
       │
       ↓
```

### Task Creation Flow

```
┌─────────────┐
│   Browser   │ Task form input
└──────┬──────┘
       │ 1. POST /create {description}
       │    Authorization: <JWT token>
       ↓
┌─────────────┐
│ Auth        │  2. Verify JWT token
│ Middleware  │
└──────┬──────┘
       │ 3. Token valid? → Continue
       │    Token invalid? → 401 Error
       ↓
┌─────────────┐
│ Controller  │  4. Validate description
└──────┬──────┘  5. Call model
       │
       ↓
┌─────────────┐
│   Model     │  6. INSERT INTO task
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ PostgreSQL  │  7. Return new task
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ Controller  │  8. Format response
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   Browser   │  9. Update UI with new task
└─────────────┘
```

### State Management Flow

```
┌──────────────────┐
│   localStorage   │ ← Token persisted here
└────────┬─────────┘
         │ Loads on app start
         ↓
┌──────────────────┐
│  UserProvider    │ ← Global state
│  {user, token}   │
└────────┬─────────┘
         │ Provides context
         ↓
┌──────────────────┐
│  App Component   │ ← Consumes context
└────────┬─────────┘
         │ Passes to children
         ↓
┌──────────────────┐
│ Child Components │ ← Use useUser() hook
└──────────────────┘
```

---

## Trade-offs & Alternatives

### 1. Database Choice

**Chosen**: PostgreSQL (Relational)

**Trade-offs**:
- ✅ **Pro**: Data integrity, ACID compliance
- ✅ **Pro**: SQL is a valuable skill
- ✅ **Pro**: Clear schema definition
- ❌ **Con**: Requires separate server
- ❌ **Con**: More complex than NoSQL for simple data

**When to Use MongoDB Instead**:
- Flexible, evolving schema
- Document-based data model
- Rapid prototyping
- No complex relationships

### 2. State Management

**Chosen**: Context API

**Trade-offs**:
- ✅ **Pro**: Built into React
- ✅ **Pro**: Simple to understand
- ✅ **Pro**: Sufficient for this app
- ❌ **Con**: Performance issues with frequent updates
- ❌ **Con**: No time-travel debugging

**When to Use Redux Instead**:
- Large, complex state
- Many state updates
- Need DevTools debugging
- Team familiar with Redux

### 3. Authentication Method

**Chosen**: JWT (Stateless)

**Trade-offs**:
- ✅ **Pro**: Scalable (no server memory)
- ✅ **Pro**: Works across multiple servers
- ✅ **Pro**: Self-contained
- ❌ **Con**: Can't revoke tokens (without blacklist)
- ❌ **Con**: Larger request size

**When to Use Sessions Instead**:
- Need instant revocation
- Concerned about token size
- Already using Redis
- Don't need horizontal scaling

### 4. CSS Approach

**Chosen**: Native CSS

**Trade-offs**:
- ✅ **Pro**: Full control
- ✅ **Pro**: Better learning
- ✅ **Pro**: No dependencies
- ❌ **Con**: More code to write
- ❌ **Con**: Slower development

**When to Use Tailwind Instead**:
- Rapid prototyping
- Consistent design system
- Team preference
- Utility-first approach

### 5. No ORM

**Chosen**: Raw SQL queries

**Trade-offs**:
- ✅ **Pro**: Full control over queries
- ✅ **Pro**: Better performance understanding
- ✅ **Pro**: Learn SQL
- ✅ **Pro**: Less abstraction = less confusion
- ❌ **Con**: More code to write
- ❌ **Con**: Potential SQL injection (must sanitize)

**When to Use Sequelize/TypeORM Instead**:
- Complex data models
- Many tables with relationships
- TypeScript project
- Team familiar with ORMs

---

## Lessons Learned & Best Practices

### 1. Start Simple, Add Complexity

**Principle**: Begin with minimal working version

**Application**:
- Started with basic CRUD
- Added authentication later
- Improved error handling iteratively
- Refactored to MVC pattern

### 2. Test Early, Test Often

**Principle**: Write tests alongside features

**Application**:
- Test database setup first
- Test each endpoint as built
- End-to-end test verifies everything works
- Logging helps debug failures

### 3. Separate Concerns

**Principle**: Each file/function has one job

**Application**:
- Models only query database
- Controllers only process requests
- Routers only define endpoints
- Components only render UI

### 4. Environment-Based Configuration

**Principle**: Use environment variables

**Application**:
- Database credentials in `.env`
- JWT secret in `.env`
- Different DBs for dev/test
- Port configuration

### 5. Error Handling is Critical

**Principle**: Plan for failures

**Application**:
- Try-catch in async functions
- Custom error class
- Global error handler
- Consistent error format

---

## Conclusion

This architecture represents a balance between:
- **Simplicity**: Easy to understand for learning
- **Best Practices**: Industry-standard patterns
- **Scalability**: Can grow with more features
- **Security**: Proper authentication and validation
- **Testability**: Comprehensive test coverage

The choices made prioritize:
1. Learning and understanding
2. Code maintainability
3. Industry relevance
4. Production-ready patterns

This foundation can be extended with:
- User-specific tasks
- Task categories
- Due dates
- Task completion status
- Profile management
- And much more!
