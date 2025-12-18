# FinSight System Architecture

## Project Overview
FinSight is a full-stack personal finance management application that helps users track expenses, manage assets and debts, and monitor their financial health using the 50-30-20 budgeting rule.

**Live Application:**
- Frontend: https://finsight-gray-two.vercel.app
- Backend API: https://finsight-ya2h.onrender.com

---

## Tech Stack

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **State Management:** React Context API + Hooks
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Repository:** `client/` folder

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js v5.2.1
- **Database:** MongoDB (via Mongoose ODM v9.0.1)
- **Authentication:** JSON Web Tokens (JWT)
- **Security:** 
  - bcryptjs (password hashing)
  - express-rate-limit (API protection)
  - CORS (cross-origin resource sharing)
- **Deployment:** Render
- **Repository:** `server/` folder

---

## High-Level Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                         USER BROWSER                          │
│                   (React SPA - Vite)                          │
└─────────────────────────┬─────────────────────────────────────┘
                          │
                          │ HTTPS/REST API
                          │ JWT Authentication
                          │
┌─────────────────────────▼─────────────────────────────────────┐
│                    FRONTEND (Vercel)                          │
│             https://finsight-gray-two.vercel.app              │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │               React Application                         │ │
│  │                                                         │ │
│  │  Components:                                            │ │
│  │  • Auth (SignIn, SignUp, ProtectedRoute)              │ │
│  │  • Dashboard (Financial Summary)                       │ │
│  │  • AssetsDebts (Asset & Debt Management)              │ │
│  │  • Finance Components (Modals, Forms)                  │ │
│  │  • Charts (Visualizations)                             │ │
│  │                                                         │ │
│  │  Context:                                               │ │
│  │  • AuthContext (User state)                            │ │
│  │  • ThemeContext (Dark/Light mode)                      │ │
│  │  • SidebarContext (Navigation)                         │ │
│  │                                                         │ │
│  │  Services:                                              │ │
│  │  • api.js (Axios instance)                             │ │
│  │  • auth.service.js                                     │ │
│  │  • user.service.js                                     │ │
│  │  • expense.service.js                                  │ │
│  │  • finance.service.js                                  │ │
│  │  • summary.service.js                                  │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            │ REST API Calls
                            │ Authorization: Bearer <JWT>
                            │
┌───────────────────────────▼───────────────────────────────────┐
│                   BACKEND (Render)                            │
│           https://finsight-ya2h.onrender.com                  │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                Middleware Stack                         │ │
│  │  • CORS (Vercel + localhost origins)                   │ │
│  │  • Rate Limiting (100 req/15min general)               │ │
│  │  • Rate Limiting (15 req/15min auth)                   │ │
│  │  • Body Parser (JSON/URL-encoded)                      │ │
│  │  • Request Logger (development)                        │ │
│  │  • JWT Verification (protected routes)                 │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  API Routes                             │ │
│  │                                                         │ │
│  │  /api/auth      → Authentication (register, login)     │ │
│  │  /api/user      → User Profile & Income                │ │
│  │  /api/expenses  → Expense CRUD Operations              │ │
│  │  /api/assets    → Asset CRUD Operations                │ │
│  │  /api/debts     → Debt CRUD + EMI Payments             │ │
│  │  /api/summary   → Financial Summary (50-30-20)         │ │
│  │  /api/net-worth → Net Worth Tracking                   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   Controllers                           │ │
│  │  • authController (register, login)                    │ │
│  │  • userController (profile, income)                    │ │
│  │  • expenseController (CRUD)                            │ │
│  │  • assetController (CRUD)                              │ │
│  │  • debtController (CRUD + EMI)                         │ │
│  │  • summaryController (aggregation)                     │ │
│  │  • netWorthController (snapshots)                      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   Models (Mongoose)                     │ │
│  │  • User (credentials, income, age)                     │ │
│  │  • Expense (amount, category, bucket, date)            │ │
│  │  • Asset (type, name, value)                           │ │
│  │  • Debt (principal, balance, EMI, rate)                │ │
│  │  • NetWorthSnapshot (monthly snapshots)                │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            │ Mongoose ODM
                            │
┌───────────────────────────▼───────────────────────────────────┐
│                   DATABASE (MongoDB Atlas)                    │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    users     │  │   expenses   │  │    assets    │      │
│  │              │  │              │  │              │      │
│  │ • _id        │  │ • _id        │  │ • _id        │      │
│  │ • name       │  │ • user       │  │ • user       │      │
│  │ • email      │  │ • amount     │  │ • type       │      │
│  │ • password   │  │ • category   │  │ • name       │      │
│  │ • income     │  │ • bucket     │  │ • value      │      │
│  │ • age        │  │ • note       │  │ • timestamps │      │
│  │ • timestamps │  │ • date       │  └──────────────┘      │
│  └──────────────┘  │ • timestamps │                        │
│                     └──────────────┘                        │
│                                                              │
│  ┌──────────────┐  ┌───────────────────────┐              │
│  │    debts     │  │  networthsnapshots    │              │
│  │              │  │                        │              │
│  │ • _id        │  │ • _id                  │              │
│  │ • user       │  │ • user                 │              │
│  │ • name       │  │ • month (YYYY-MM)      │              │
│  │ • principal  │  │ • totalAssets          │              │
│  │ • balance    │  │ • totalDebts           │              │
│  │ • rate       │  │ • netWorth             │              │
│  │ • monthlyEMI │  │ • timestamps           │              │
│  │ • timestamps │  │                        │              │
│  └──────────────┘  └───────────────────────┘              │
└───────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Component Structure

```
client/src/
│
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.jsx      # Route guard (requires auth)
│   │   ├── SignInForm.jsx          # Login form
│   │   └── SignUpForm.jsx          # Registration form
│   │
│   ├── finance/
│   │   ├── AddAssetModal.jsx       # Create/edit asset modal
│   │   ├── AddDebtModal.jsx        # Create/edit debt modal
│   │   ├── BudgetCard.jsx          # Budget allocation card
│   │   ├── ExpenseModal.jsx        # Create/edit expense modal
│   │   └── ... (other finance components)
│   │
│   ├── charts/
│   │   ├── bar/                    # Bar chart components
│   │   └── line/                   # Line chart components
│   │
│   └── common/                     # Shared components
│
├── context/
│   ├── AuthContext.jsx             # User authentication state
│   ├── ThemeContext.jsx            # Dark/light theme
│   └── SidebarContext.jsx          # Sidebar toggle state
│
├── services/
│   ├── api.js                      # Axios instance & interceptors
│   ├── auth.service.js             # Auth API calls
│   ├── user.service.js             # User API calls
│   ├── expense.service.js          # Expense API calls
│   ├── finance.service.js          # Assets/Debts API calls
│   └── summary.service.js          # Summary API calls
│
├── pages/
│   ├── Dashboard/                  # Main dashboard
│   ├── AssetsDebts.jsx            # Assets & debts management
│   ├── AuthPages/                  # Login/Register pages
│   └── ... (other pages)
│
├── layout/
│   ├── AppLayout.jsx              # Main layout wrapper
│   ├── AppHeader.jsx              # Top navigation
│   └── AppSidebar.jsx             # Side navigation
│
└── utils/
    └── currency.js                # Currency formatting utilities
```

### State Management

**AuthContext:**
- Manages user authentication state
- Provides login/logout functions
- Checks token validity
- Auto-redirects on auth failure

**ThemeContext:**
- Manages dark/light theme preference
- Persists theme in localStorage
- Provides theme toggle function

**Component State:**
- Local state with `useState` for component-specific data
- `useEffect` for side effects (API calls, subscriptions)

### Routing

```javascript
<Routes>
  <Route path="/login" element={<SignIn />} />
  <Route path="/register" element={<SignUp />} />
  
  {/* Protected Routes */}
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/assets-debts" element={<AssetsDebts />} />
    <Route path="/profile" element={<UserProfile />} />
    {/* ... other protected routes */}
  </Route>
</Routes>
```

---

## Backend Architecture

### Folder Structure

```
server/
│
├── config/
│   └── db.js                      # MongoDB connection setup
│
├── middleware/
│   └── auth.js                    # JWT verification middleware
│
├── models/
│   ├── User.js                    # User schema with password hashing
│   ├── Expense.js                 # Expense schema with indexes
│   ├── Asset.js                   # Asset schema
│   ├── Debt.js                    # Debt schema
│   └── NetWorthSnapshot.js        # Net worth snapshot schema
│
├── controllers/
│   ├── authController.js          # Register, login logic
│   ├── userController.js          # Profile, income update
│   ├── expenseController.js       # Expense CRUD operations
│   ├── assetController.js         # Asset CRUD operations
│   ├── debtController.js          # Debt CRUD + EMI payments
│   ├── summaryController.js       # Financial summary calculation
│   └── netWorthController.js      # Net worth tracking
│
├── routes/
│   ├── auth.js                    # Auth routes
│   ├── user.js                    # User routes
│   ├── expenses.js                # Expense routes
│   ├── assets.js                  # Asset routes
│   ├── debts.js                   # Debt routes
│   ├── summary.js                 # Summary routes
│   └── netWorth.js                # Net worth routes
│
├── services/
│   └── budgetService.js           # Budget calculation utilities
│
├── docs/
│   ├── API_DOCUMENTATION.md       # API reference
│   └── SYSTEM_ARCHITECTURE.md     # This file
│
├── .env                           # Environment variables
├── package.json                   # Dependencies
└── server.js                      # Entry point
```

### Request Processing Flow

```
1. HTTP Request arrives
   ↓
2. CORS Middleware (validate origin)
   ↓
3. Rate Limiter (check request limit)
   ↓
4. Body Parser (parse JSON)
   ↓
5. Request Logger (log request - dev only)
   ↓
6. Route Handler (match endpoint)
   ↓
7. Auth Middleware (verify JWT - if protected)
   ↓
8. Controller Function (business logic)
   ↓
9. Database Query (via Mongoose)
   ↓
10. Response Formatting (JSON)
    ↓
11. Send Response to Client
```

---

## Database Schema Design

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String (required, trimmed),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  monthlyIncome: Number (default: 0),
  age: Number (13-100),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  - email: unique index
```

### Expenses Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, required),
  amount: Number (required, min: 0),
  category: String (required),
  bucket: Enum['needs', 'wants', 'savings'],
  note: String,
  date: Date (default: Date.now),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  - (user, date): compound index for efficient queries
```

### Assets Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, required),
  type: Enum['cash', 'investment', 'property', 'other'],
  name: String (required),
  currentValue: Number (required, min: 0),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  - (user, type): compound index
```

### Debts Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, required),
  name: String (required),
  principal: Number (required, min: 0),
  remainingBalance: Number (required, min: 0),
  interestRate: Number (required, 0-100),
  monthlyEMI: Number (required, min: 0),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  - user: single field index
```

### NetWorthSnapshots Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, required),
  month: String (required, format: YYYY-MM),
  totalAssets: Number (default: 0),
  totalDebts: Number (default: 0),
  netWorth: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}

Indexes:
  - (user, month): unique compound index
```

---

## Authentication & Security

### JWT Authentication Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Registration/Login                        │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │  Backend validates credentials │
         │  - Email format                │
         │  - Password strength           │
         │  - User existence check        │
         └──────────────┬─────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │  Generate JWT Token          │
         │  Payload: { userId }         │
         │  Secret: JWT_SECRET          │
         │  Expiry: 7 days              │
         └──────────────┬─────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │  Return token + user data    │
         └──────────────┬─────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │  Frontend stores in          │
         │  localStorage:               │
         │  - finsight_token            │
         │  - finsight_user             │
         └──────────────┬─────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │  Subsequent Requests:        │
         │  Authorization: Bearer <JWT> │
         └──────────────┬─────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │  Backend verifies token      │
         │  - Signature validation      │
         │  - Expiry check              │
         │  - Extract userId            │
         └──────────────┬─────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │  Process request with        │
         │  authenticated userId        │
         └──────────────────────────────┘
```

### Password Security

**Hashing Process:**
1. User enters password
2. bcryptjs generates salt (10 rounds)
3. Password hashed with salt
4. Hash stored in database (never plain text)

**Login Verification:**
1. User provides email + password
2. Fetch user by email
3. bcryptjs compares password with stored hash
4. Return result (valid/invalid)

### CORS Configuration

**Allowed Origins:**
```javascript
[
  'https://finsight-gray-two.vercel.app',  // Production
  'http://localhost:5173',                  // Local dev (Vite)
  'http://localhost:4000'                   // Local dev (alt port)
]
```

**Settings:**
- Credentials: Enabled (allows cookies/auth headers)
- Methods: GET, POST, PUT, DELETE
- Headers: Content-Type, Authorization

### Rate Limiting

**General API Protection:**
- 100 requests per 15 minutes per IP
- Applies to all `/api/*` routes

**Auth Route Protection:**
- 15 attempts per 15 minutes per IP
- Applies to `/api/auth/login` and `/api/auth/register`
- Only failed attempts counted

---

## Data Flow Examples

### Example 1: User Logs In

```
Frontend                          Backend                       Database
   │                                 │                             │
   │  POST /api/auth/login           │                             │
   │  { email, password }            │                             │
   ├────────────────────────────────>│                             │
   │                                 │  Find user by email         │
   │                                 ├────────────────────────────>│
   │                                 │                             │
   │                                 │<────────────────────────────┤
   │                                 │  User document              │
   │                                 │                             │
   │                                 │  Compare password hashes    │
   │                                 │                             │
   │                                 │  Generate JWT token         │
   │                                 │  (userId, 7d expiry)        │
   │                                 │                             │
   │<────────────────────────────────┤                             │
   │  { token, user }                │                             │
   │                                 │                             │
   │  Store in localStorage          │                             │
   │  - finsight_token               │                             │
   │  - finsight_user                │                             │
   │                                 │                             │
   │  Redirect to /dashboard         │                             │
   │                                 │                             │
```

### Example 2: Get Financial Summary

```
Frontend                          Backend                       Database
   │                                 │                             │
   │  GET /api/summary?month=2025-12 │                             │
   │  Authorization: Bearer <JWT>    │                             │
   ├────────────────────────────────>│                             │
   │                                 │  Verify JWT token           │
   │                                 │  Extract userId             │
   │                                 │                             │
   │                                 │  Fetch user profile         │
   │                                 ├────────────────────────────>│
   │                                 │<────────────────────────────┤
   │                                 │  { monthlyIncome }          │
   │                                 │                             │
   │                                 │  Calculate budget           │
   │                                 │  (50-30-20 rule)            │
   │                                 │                             │
   │                                 │  Query expenses for month   │
   │                                 ├────────────────────────────>│
   │                                 │<────────────────────────────┤
   │                                 │  [expense documents]        │
   │                                 │                             │
   │                                 │  Aggregate by bucket        │
   │                                 │                             │
   │                                 │  Query all assets           │
   │                                 ├────────────────────────────>│
   │                                 │<────────────────────────────┤
   │                                 │  [asset documents]          │
   │                                 │                             │
   │                                 │  Sum asset values           │
   │                                 │                             │
   │                                 │  Query all debts            │
   │                                 ├────────────────────────────>│
   │                                 │<────────────────────────────┤
   │                                 │  [debt documents]           │
   │                                 │                             │
   │                                 │  Sum debt balances          │
   │                                 │                             │
   │                                 │  Calculate net worth        │
   │                                 │  = assets - debts           │
   │                                 │                             │
   │<────────────────────────────────┤                             │
   │  { expenses, budget, netWorth } │                             │
   │                                 │                             │
   │  Update UI with summary         │                             │
   │                                 │                             │
```

### Example 3: Create Expense

```
Frontend                          Backend                       Database
   │                                 │                             │
   │  POST /api/expenses             │                             │
   │  Authorization: Bearer <JWT>    │                             │
   │  { amount, category, bucket }   │                             │
   ├────────────────────────────────>│                             │
   │                                 │  Verify JWT token           │
   │                                 │  Extract userId             │
   │                                 │                             │
   │                                 │  Validate input             │
   │                                 │  - amount > 0               │
   │                                 │  - bucket in enum           │
   │                                 │                             │
   │                                 │  Create expense document    │
   │                                 │  with userId                │
   │                                 ├────────────────────────────>│
   │                                 │                             │
   │                                 │<────────────────────────────┤
   │                                 │  Created expense            │
   │                                 │                             │
   │<────────────────────────────────┤                             │
   │  { success, data }              │                             │
   │                                 │                             │
   │  Refresh expense list           │                             │
   │  Close modal                    │                             │
   │                                 │                             │
```

---

## Deployment Architecture

### Frontend Deployment (Vercel)

```
┌───────────────────────────────────────────────────────────┐
│                    GitHub Repository                       │
│                    (main branch)                           │
└────────────────────┬──────────────────────────────────────┘
                     │
                     │ Git Push
                     │
┌────────────────────▼──────────────────────────────────────┐
│                  Vercel Platform                          │
│                                                           │
│  1. Detect changes in client/ folder                     │
│  2. Run build command: npm run build                     │
│  3. Bundle React app with Vite                           │
│  4. Optimize assets (code splitting, minification)       │
│  5. Deploy to CDN (global distribution)                  │
│                                                           │
└────────────────────┬──────────────────────────────────────┘
                     │
                     │ Live URL
                     │
┌────────────────────▼──────────────────────────────────────┐
│           https://finsight-gray-two.vercel.app            │
│                                                           │
│  • Automatic HTTPS                                        │
│  • Global CDN caching                                     │
│  • Instant rollbacks                                      │
│  • Preview deployments for branches                       │
└───────────────────────────────────────────────────────────┘
```

### Backend Deployment (Render)

```
┌───────────────────────────────────────────────────────────┐
│                    GitHub Repository                       │
│                    (main branch)                           │
└────────────────────┬──────────────────────────────────────┘
                     │
                     │ Git Push
                     │
┌────────────────────▼──────────────────────────────────────┐
│                   Render Platform                         │
│                                                           │
│  1. Detect changes in server/ folder                     │
│  2. Run install: npm install                             │
│  3. Set environment variables                            │
│  4. Start server: npm start                              │
│  5. Monitor health checks                                │
│                                                           │
└────────────────────┬──────────────────────────────────────┘
                     │
                     │ Live URL
                     │
┌────────────────────▼──────────────────────────────────────┐
│         https://finsight-ya2h.onrender.com                │
│                                                           │
│  • Automatic HTTPS                                        │
│  • Auto-restart on crashes                                │
│  • Health monitoring                                      │
│  • Environment variable management                        │
└────────────────────┬──────────────────────────────────────┘
                     │
                     │ MongoDB Connection
                     │
┌────────────────────▼──────────────────────────────────────┐
│                  MongoDB Atlas                            │
│                                                           │
│  • Managed database cluster                               │
│  • Automatic backups                                      │
│  • IP whitelisting                                        │
│  • Authentication required                                │
└───────────────────────────────────────────────────────────┘
```

---

## Performance Optimizations

### Frontend

**Code Splitting:**
- Route-based code splitting with React.lazy()
- Reduces initial bundle size
- Loads pages on demand

**Asset Optimization:**
- Vite bundler optimizations
- Minification of JS/CSS
- Image optimization
- Tree shaking (remove unused code)

**Caching:**
- Browser caching for static assets
- Service worker for offline support (future)
- localStorage for user data

**API Call Optimization:**
- Debounced search inputs
- Pagination for large data sets
- Conditional rendering (loading states)

### Backend

**Database Indexing:**
```javascript
// Expenses: compound index on (user, date)
expenseSchema.index({ user: 1, date: -1 });

// Assets: compound index on (user, type)
assetSchema.index({ user: 1, type: 1 });

// NetWorth: unique compound index
netWorthSnapshotSchema.index({ user: 1, month: 1 }, { unique: true });
```

**Query Optimization:**
- Filter by userId first (indexed)
- Use date range queries (indexed)
- Limit result sets with pagination
- Projection (select specific fields only)

**Connection Pooling:**
- Mongoose maintains connection pool
- Reuses connections across requests
- Reduces connection overhead

---

## Security Features

### Input Validation

**Frontend:**
- Form validation before submission
- Email format validation
- Number range validation
- Date format validation

**Backend:**
- Request body validation
- Email regex validation
- Password strength requirements
- Enum value validation
- Number range checks (min/max)

### Authentication Security

**Token Management:**
- 7-day token expiration
- Auto-logout on 401 errors
- Token stored in localStorage
- HTTPS-only transmission

**Password Security:**
- bcrypt hashing (10 rounds)
- Minimum 6 characters
- Pre-save hooks for hashing
- Never log or expose passwords

### API Security

**Rate Limiting:**
- Prevents brute force attacks
- Protects against DoS
- Separate limits for auth vs general API

**CORS:**
- Whitelist specific origins
- Prevents unauthorized access
- Credentials support for cookies/tokens

**Error Handling:**
- Generic error messages (no data leakage)
- Detailed logs server-side only
- Stack traces hidden in production

---

## Monitoring & Logging

### Frontend

**Error Tracking:**
- Console logging in development
- Error boundaries for React components
- User-friendly error messages

**Analytics (Future):**
- Page view tracking
- User interaction events
- Performance metrics

### Backend

**Request Logging:**
- Development: All requests logged with timestamp
- Production: Errors only
- Format: `YYYY-MM-DD HH:MM:SS - METHOD PATH`

**Error Logging:**
- Unhandled errors logged to console
- Stack traces included
- Error context (request details)

**Health Monitoring:**
- `/health` endpoint for uptime checks
- `/api/health` for API status
- Database connection status

---

## Future Enhancements

### Planned Features

**1. Recurring Expenses**
- Auto-create monthly expenses
- Template management
- Schedule configuration

**2. Budget Alerts**
- Email notifications
- In-app notifications
- Budget threshold warnings

**3. Data Export**
- CSV export for expenses
- PDF reports (monthly/yearly)
- Transaction history

**4. Analytics Dashboard**
- Spending trends
- Category breakdowns
- Predictions & insights

**5. Multi-Currency Support**
- Currency selection per user
- Real-time exchange rates
- Conversion calculations

**6. Investment Tracking**
- Real-time portfolio values
- Stock/crypto integrations
- ROI calculations

**7. Goal Setting**
- Savings goals
- Progress tracking
- Milestone celebrations

### Technical Improvements

**1. Caching Layer**
- Redis for frequently accessed data
- Reduce database load
- Faster response times

**2. WebSocket Integration**
- Real-time updates
- Live collaboration
- Push notifications

**3. GraphQL API**
- More flexible queries
- Reduce over-fetching
- Better developer experience

**4. Microservices Architecture**
- Separate services for domains
- Independent scaling
- Better fault isolation

**5. Containerization**
- Docker containers
- Kubernetes orchestration
- Easier deployment

**6. Testing**
- Unit tests (Jest/Vitest)
- Integration tests
- End-to-end tests (Cypress)

**7. CI/CD Pipeline**
- Automated testing on PR
- Automated deployment
- Code quality checks

---

## Development Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MongoDB (local or Atlas)
- Git

### Local Development

**Backend:**
```bash
cd server
npm install
# Create .env file with required variables
npm run dev  # Runs with --watch flag
```

**Frontend:**
```bash
cd client
npm install
npm run dev  # Vite dev server on port 5173
```

### Environment Variables

**Frontend (.env):**
```env
VITE_API_BASE_URL=http://localhost:4000/api
```

**Backend (.env):**
```env
MONGO_URI=mongodb://localhost:27017/finsight
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=4000
```

---

## API Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* resource data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### List Response
```json
{
  "success": true,
  "data": [ /* array of resources */ ]
}
```

---

## Glossary

**50-30-20 Rule:** Budgeting principle where 50% goes to needs, 30% to wants, and 20% to savings.

**Bucket:** Category classification for expenses (needs, wants, savings).

**EMI:** Equated Monthly Installment - fixed payment on a debt.

**Net Worth:** Total assets minus total debts.

**JWT:** JSON Web Token - authentication token format.

**ODM:** Object Document Mapper - Mongoose for MongoDB.

**SPA:** Single Page Application - React frontend.

**CORS:** Cross-Origin Resource Sharing - security mechanism.

**Rate Limiting:** Restriction on number of API requests.

---

## Support & Contact

For questions or issues, refer to:
- API Documentation: `/docs/API_DOCUMENTATION.md`
- GitHub Issues: (repository link)
- Technical Support: (contact email)

---

**Last Updated:** December 18, 2025  
**Version:** 1.0.0
