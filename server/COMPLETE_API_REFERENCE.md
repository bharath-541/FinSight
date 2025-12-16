# FinSight Backend - Complete API Reference & Feature Documentation

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Data Models](#data-models)
4. [Authentication System](#authentication-system)
5. [API Endpoints](#api-endpoints)
6. [Business Logic & Features](#business-logic--features)
7. [Response Formats](#response-formats)
8. [Security Features](#security-features)

---

## 🎯 System Overview

**FinSight** is a personal finance management backend implementing the **50/30/20 budgeting rule**. It provides user authentication, expense tracking, budget analysis, and financial insights.

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js v5.2.1 (CommonJS)
- **Database**: MongoDB with Mongoose ODM v9.0.1
- **Authentication**: JWT (jsonwebtoken v9.0.3)
- **Password Security**: bcryptjs v3.0.3
- **CORS**: Enabled for cross-origin requests

### Environment Variables
```env
PORT=5000                                      # Server port
NODE_ENV=development                           # Environment mode
MONGO_URI=mongodb://localhost:27017/finsight  # MongoDB connection string
JWT_SECRET=your_secure_secret_key             # JWT signing secret (min 32 chars recommended)
JWT_EXPIRES_IN=7d                             # Token expiration (7 days default)
```

---

## 🏗️ Architecture

### Folder Structure
```
server/
├── config/
│   └── db.js                 # MongoDB connection with error handling
├── controllers/
│   ├── authController.js     # Authentication logic (register/login)
│   ├── userController.js     # User profile & income management
│   ├── expenseController.js  # CRUD operations for expenses
│   └── summaryController.js  # Budget analysis & insights generation
├── middleware/
│   └── auth.js               # JWT token verification middleware
├── models/
│   ├── User.js               # User schema with bcrypt password hashing
│   └── Expense.js            # Expense schema with category/bucket tracking
├── routes/
│   ├── auth.js               # Authentication routes
│   ├── user.js               # User management routes
│   ├── expenses.js           # Expense management routes
│   └── summary.js            # Budget summary routes
├── services/
│   └── budgetService.js      # 50/30/20 budgeting calculations & insights
├── .env                      # Environment variables (not in git)
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── package.json              # Dependencies & scripts
└── server.js                 # Express app setup & entry point
```

### Design Pattern
**MVC (Model-View-Controller)** with Service Layer:
- **Models**: Define data structure and validation
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic (budget calculations)
- **Routes**: Map URLs to controllers
- **Middleware**: Handle cross-cutting concerns (auth)

---

## 📊 Data Models

### 1. User Model
**File**: `models/User.js`

**Schema Definition**:
```javascript
{
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,           // No duplicate emails allowed
    lowercase: true,        // Stored in lowercase
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6            // Minimum 6 characters
    // Stored as bcrypt hash (never plain text)
  },
  monthlyIncome: {
    type: Number,
    default: 0              // Optional, set after registration
  },
  age: {
    type: Number,
    min: 13,                // Minimum age 13
    max: 100,               // Maximum age 100
    required: false         // Optional field
  },
  createdAt: Date,          // Auto-generated timestamp
  updatedAt: Date           // Auto-generated timestamp
}
```

**Indexes**:
- Primary: `_id` (auto-created by MongoDB)
- Unique: `email` (ensures no duplicate emails)

**Pre-save Hook**:
```javascript
// Automatically hashes password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);      // Generate salt with 10 rounds
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
```

**Instance Methods**:
```javascript
// Compare plain text password with hashed password
user.comparePassword(candidatePassword) → Boolean
```

**Example Document**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
  "monthlyIncome": 5000,
  "age": 28,
  "createdAt": "2025-12-01T10:00:00.000Z",
  "updatedAt": "2025-12-15T14:30:00.000Z"
}
```

---

### 2. Expense Model
**File**: `models/Expense.js`

**Schema Definition**:
```javascript
{
  user: {
    type: ObjectId,
    ref: 'User',            // Reference to User model
    required: true,
    index: true             // Indexed for fast queries
  },
  amount: {
    type: Number,
    required: true,
    min: 0                  // Must be positive
  },
  category: {
    type: String,
    required: true,
    trim: true              // Remove whitespace
    // Examples: "Groceries", "Rent", "Entertainment", "Savings"
  },
  bucket: {
    type: String,
    required: true,
    enum: ['needs', 'wants', 'savings'],  // Only these 3 values allowed
    lowercase: true         // Automatically converted to lowercase
  },
  note: {
    type: String,
    trim: true,
    required: false         // Optional description
  },
  date: {
    type: Date,
    default: Date.now       // Defaults to current date/time
  },
  createdAt: Date,          // Auto-generated timestamp
  updatedAt: Date           // Auto-generated timestamp
}
```

**Indexes**:
- Primary: `_id` (auto-created)
- Compound: `{ user: 1, date: -1 }` (for efficient user expense queries sorted by date)
- Single: `user` (for user-specific lookups)

**Bucket Categories Explained**:
- **needs** (50%): Essential expenses (rent, utilities, groceries, healthcare, insurance)
- **wants** (30%): Non-essential expenses (dining out, entertainment, hobbies, shopping)
- **savings** (20%): Savings, investments, debt repayment, emergency fund

**Example Document**:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "user": "507f1f77bcf86cd799439011",
  "amount": 150,
  "category": "Groceries",
  "bucket": "needs",
  "note": "Weekly shopping at Whole Foods",
  "date": "2025-12-15T09:30:00.000Z",
  "createdAt": "2025-12-15T10:00:00.000Z",
  "updatedAt": "2025-12-15T10:00:00.000Z"
}
```

---

## 🔐 Authentication System

### JWT Token Structure
**Payload**:
```javascript
{
  userId: "507f1f77bcf86cd799439011",  // MongoDB ObjectId
  iat: 1702641234,                      // Issued at (Unix timestamp)
  exp: 1703246034                       // Expires in 7 days (configurable)
}
```

**Token Format**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE3MDI2NDEyMzQsImV4cCI6MTcwMzI0NjAzNH0.signature
```

### Authentication Flow
1. **Registration**:
   - User submits name, email, password
   - Server validates input
   - Password hashed with bcrypt (10 rounds)
   - User saved to database
   - JWT token generated and returned

2. **Login**:
   - User submits email, password
   - Server finds user by email
   - Password compared using bcrypt
   - JWT token generated and returned

3. **Protected Requests**:
   - Client includes token in Authorization header
   - Middleware verifies token signature
   - User ID extracted from token payload
   - Request proceeds with `req.userId` available

### Password Security
- **Algorithm**: bcrypt with 10 salt rounds
- **Hash Example**: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`
- **Never stored in plain text**
- **Never returned in API responses**

---

## 🚀 API Endpoints

### Base URL
```
http://localhost:5000/api
```

---

## 1️⃣ Authentication Endpoints

### POST /api/auth/register
**Purpose**: Register a new user account

**Access**: Public

**Request Body**:
```json
{
  "name": "Jane Doe",           // Required, String
  "email": "jane@example.com",  // Required, String, unique
  "password": "secure123"       // Required, String, min 6 characters
}
```

**Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "monthlyIncome": 0,
      "age": null
    }
  }
}
```

**Error Responses**:
```json
// Missing fields (400 Bad Request)
{
  "success": false,
  "message": "Please provide name, email, and password"
}

// Password too short (400 Bad Request)
{
  "success": false,
  "message": "Password must be at least 6 characters"
}

// Email already exists (400 Bad Request)
{
  "success": false,
  "message": "User already exists with this email"
}

// Server error (500 Internal Server Error)
{
  "success": false,
  "message": "Server error during registration"
}
```

**Validation Rules**:
- Name: Required, non-empty string
- Email: Required, valid email format, unique in database
- Password: Required, minimum 6 characters
- Email converted to lowercase automatically
- Password hashed before storage (never stored as plain text)

---

### POST /api/auth/login
**Purpose**: Authenticate existing user

**Access**: Public

**Request Body**:
```json
{
  "email": "jane@example.com",  // Required, String
  "password": "secure123"       // Required, String
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "monthlyIncome": 5000,
      "age": 28
    }
  }
}
```

**Error Responses**:
```json
// Missing credentials (400 Bad Request)
{
  "success": false,
  "message": "Please provide email and password"
}

// Invalid credentials (401 Unauthorized)
{
  "success": false,
  "message": "Invalid email or password"
}

// Server error (500 Internal Server Error)
{
  "success": false,
  "message": "Server error during login"
}
```

**Security Notes**:
- Email is case-insensitive (stored and compared in lowercase)
- Same error message for invalid email or password (prevents email enumeration)
- Password compared using bcrypt (constant-time comparison)
- Token expires after 7 days (configurable via JWT_EXPIRES_IN)

---

## 2️⃣ User Management Endpoints

### GET /api/user/me
**Purpose**: Get current user profile

**Access**: Protected (requires JWT token)

**Headers**:
```
Authorization: Bearer <token>
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "monthlyIncome": 5000,
    "age": 28,
    "createdAt": "2025-12-01T10:00:00.000Z"
  }
}
```

**Error Responses**:
```json
// No token (401 Unauthorized)
{
  "success": false,
  "message": "Access denied. No token provided."
}

// Invalid token (401 Unauthorized)
{
  "success": false,
  "message": "Invalid token."
}

// Expired token (401 Unauthorized)
{
  "success": false,
  "message": "Token expired."
}

// User not found (404 Not Found)
{
  "success": false,
  "message": "User not found"
}

// Server error (500 Internal Server Error)
{
  "success": false,
  "message": "Server error while fetching profile"
}
```

**Notes**:
- Password field is never returned in response
- Useful for verifying token validity and getting user info
- Returns all profile data including timestamps

---

### PUT /api/user/income
**Purpose**: Set or update monthly income

**Access**: Protected (requires JWT token)

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "monthlyIncome": 5000  // Required, Number, >= 0
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Monthly income updated successfully",
  "data": {
    "monthlyIncome": 5000
  }
}
```

**Error Responses**:
```json
// Missing income (400 Bad Request)
{
  "success": false,
  "message": "Please provide monthlyIncome"
}

// Invalid income (400 Bad Request)
{
  "success": false,
  "message": "Monthly income must be a positive number"
}

// User not found (404 Not Found)
{
  "success": false,
  "message": "User not found"
}

// Server error (500 Internal Server Error)
{
  "success": false,
  "message": "Server error while updating income"
}
```

**Validation Rules**:
- Must be a number
- Must be >= 0 (zero is allowed)
- Required for budget summary to work
- Can be updated any time

**Usage Flow**:
1. User registers (income = 0 by default)
2. User logs in
3. User sets income via this endpoint
4. User can now use budget summary features

---

## 3️⃣ Expense Management Endpoints

### POST /api/expenses
**Purpose**: Create a new expense

**Access**: Protected (requires JWT token)

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "amount": 150,                  // Required, Number, > 0
  "category": "Groceries",        // Required, String
  "bucket": "needs",              // Required, Enum: needs|wants|savings
  "note": "Weekly shopping",      // Optional, String
  "date": "2025-12-15T09:30:00Z"  // Optional, ISO Date (defaults to now)
}
```

**Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "user": "507f1f77bcf86cd799439011",
    "amount": 150,
    "category": "Groceries",
    "bucket": "needs",
    "note": "Weekly shopping",
    "date": "2025-12-15T09:30:00.000Z",
    "createdAt": "2025-12-15T10:00:00.000Z",
    "updatedAt": "2025-12-15T10:00:00.000Z"
  }
}
```

**Error Responses**:
```json
// Missing required fields (400 Bad Request)
{
  "success": false,
  "message": "Please provide amount, category, and bucket"
}

// Invalid bucket (400 Bad Request)
{
  "success": false,
  "message": "Bucket must be one of: needs, wants, savings"
}

// Invalid amount (400 Bad Request)
{
  "success": false,
  "message": "Amount must be a positive number"
}

// Server error (500 Internal Server Error)
{
  "success": false,
  "message": "Server error while creating expense"
}
```

**Validation Rules**:
- **amount**: Must be a number > 0
- **category**: Required, trimmed (whitespace removed)
- **bucket**: Must be one of: `needs`, `wants`, `savings` (case-insensitive)
- **note**: Optional, trimmed if provided
- **date**: Optional, defaults to current date/time
- User ID automatically attached from JWT token

---

### GET /api/expenses
**Purpose**: Get all expenses or filter by month

**Access**: Protected (requires JWT token)

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
month (optional): YYYY-MM format (e.g., 2025-12)
```

**Example Requests**:
```http
# Get all expenses for current user
GET /api/expenses

# Get expenses for December 2025
GET /api/expenses?month=2025-12
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "user": "507f1f77bcf86cd799439011",
      "amount": 1200,
      "category": "Rent",
      "bucket": "needs",
      "note": "Monthly rent",
      "date": "2025-12-15T00:00:00.000Z",
      "createdAt": "2025-12-15T10:00:00.000Z",
      "updatedAt": "2025-12-15T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "user": "507f1f77bcf86cd799439011",
      "amount": 150,
      "category": "Groceries",
      "bucket": "needs",
      "note": "Weekly shopping",
      "date": "2025-12-14T09:30:00.000Z",
      "createdAt": "2025-12-14T10:00:00.000Z",
      "updatedAt": "2025-12-14T10:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "user": "507f1f77bcf86cd799439011",
      "amount": 50,
      "category": "Dining",
      "bucket": "wants",
      "note": "Dinner with friends",
      "date": "2025-12-13T19:00:00.000Z",
      "createdAt": "2025-12-13T20:00:00.000Z",
      "updatedAt": "2025-12-13T20:00:00.000Z"
    }
  ]
}
```

**Error Responses**:
```json
// Invalid month format (400 Bad Request)
{
  "success": false,
  "message": "Invalid month format. Use YYYY-MM"
}

// Server error (500 Internal Server Error)
{
  "success": false,
  "message": "Server error while fetching expenses"
}
```

**Behavior**:
- Returns only expenses belonging to authenticated user
- Sorted by date (newest first)
- If no month specified, returns all expenses
- Month filter includes entire month (1st to last day)
- Count field shows number of expenses returned

---

### PUT /api/expenses/:id
**Purpose**: Update an existing expense

**Access**: Protected (requires JWT token, must own the expense)

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters**:
```
id: MongoDB ObjectId of the expense
```

**Request Body** (all fields optional):
```json
{
  "amount": 175,                // Optional, Number, > 0
  "category": "Groceries",      // Optional, String
  "bucket": "needs",            // Optional, Enum: needs|wants|savings
  "note": "Updated note",       // Optional, String
  "date": "2025-12-15T10:00:00Z" // Optional, ISO Date
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Expense updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "user": "507f1f77bcf86cd799439011",
    "amount": 175,
    "category": "Groceries",
    "bucket": "needs",
    "note": "Updated note",
    "date": "2025-12-15T10:00:00.000Z",
    "createdAt": "2025-12-15T10:00:00.000Z",
    "updatedAt": "2025-12-15T14:30:00.000Z"
  }
}
```

**Error Responses**:
```json
// Expense not found or not owned by user (404 Not Found)
{
  "success": false,
  "message": "Expense not found"
}

// Invalid bucket (400 Bad Request)
{
  "success": false,
  "message": "Bucket must be one of: needs, wants, savings"
}

// Invalid amount (400 Bad Request)
{
  "success": false,
  "message": "Amount must be a positive number"
}

// Server error (500 Internal Server Error)
{
  "success": false,
  "message": "Server error while updating expense"
}
```

**Behavior**:
- Only updates fields provided in request body
- Other fields remain unchanged
- Verifies user owns the expense before updating
- Updates `updatedAt` timestamp automatically
- Can clear note by sending `note: ""` or `note: null`

---

### DELETE /api/expenses/:id
**Purpose**: Delete an expense

**Access**: Protected (requires JWT token, must own the expense)

**Headers**:
```
Authorization: Bearer <token>
```

**URL Parameters**:
```
id: MongoDB ObjectId of the expense
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

**Error Responses**:
```json
// Expense not found or not owned by user (404 Not Found)
{
  "success": false,
  "message": "Expense not found"
}

// Server error (500 Internal Server Error)
{
  "success": false,
  "message": "Server error while deleting expense"
}
```

**Behavior**:
- Permanently deletes expense from database
- Verifies user owns the expense before deletion
- Cannot be undone
- Returns success even if expense doesn't exist (idempotent)

---

## 4️⃣ Budget Summary & Insights Endpoint

### GET /api/summary
**Purpose**: Get comprehensive budget analysis and insights for a specific month

**Access**: Protected (requires JWT token and monthly income set)

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
month (required): YYYY-MM format (e.g., 2025-12)
```

**Example Request**:
```http
GET /api/summary?month=2025-12
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "month": "2025-12",
    "budget": {
      "income": 5000,
      "totalSpent": 2400,
      "needs": {
        "amount": 1350,
        "percentage": 27,
        "limit": 2500
      },
      "wants": {
        "amount": 450,
        "percentage": 9,
        "limit": 1500
      },
      "savings": {
        "amount": 600,
        "percentage": 12,
        "target": 1000
      },
      "status": "warning",
      "warnings": [
        "Savings below 20%"
      ]
    },
    "insights": {
      "safeToSpend": 2650,
      "topCategories": [
        {
          "category": "Rent",
          "amount": 1200
        },
        {
          "category": "Savings Transfer",
          "amount": 600
        },
        {
          "category": "Groceries",
          "amount": 300
        }
      ],
      "dailyAverage": 77.42,
      "monthlyComparison": {
        "currentMonth": 2400,
        "previousMonth": 2200,
        "changePercentage": 9.09
      },
      "expenseStreak": 8
    }
  }
}
```

**Error Responses**:
```json
// Missing month parameter (400 Bad Request)
{
  "success": false,
  "message": "Please provide month parameter in YYYY-MM format"
}

// Invalid month format (400 Bad Request)
{
  "success": false,
  "message": "Invalid month format. Use YYYY-MM"
}

// Income not set (400 Bad Request)
{
  "success": false,
  "message": "Please set your monthly income first using PUT /api/user/income"
}

// User not found (404 Not Found)
{
  "success": false,
  "message": "User not found"
}

// Server error (500 Internal Server Error)
{
  "success": false,
  "message": "Server error while generating summary"
}
```

---

## 💡 Business Logic & Features

### 50/30/20 Budget Analysis

**Budget Calculation Logic** (`services/budgetService.js`):

1. **Fetch Expenses**: Get all expenses for specified month and user
2. **Categorize by Bucket**:
   - Sum all expenses with `bucket: "needs"`
   - Sum all expenses with `bucket: "wants"`
   - Sum all expenses with `bucket: "savings"`
3. **Calculate Percentages**:
   ```javascript
   needsPercentage = (needsTotal / monthlyIncome) × 100
   wantsPercentage = (wantsTotal / monthlyIncome) × 100
   savingsPercentage = (savingsTotal / monthlyIncome) × 100
   ```
4. **Determine Status**:
   - Start with `status = "on_track"`
   - If needs > 60% OR wants > 40% OR savings < 10%: `status = "off_track"`
   - Else if needs > 50% OR wants > 30% OR savings < 20%: `status = "warning"`
   - Otherwise: `status = "on_track"`
5. **Generate Warnings**: Array of human-readable warning messages

**Budget Object Structure**:
```javascript
{
  income: 5000,                    // User's monthly income
  totalSpent: 2400,                // Sum of all expenses
  needs: {
    amount: 1350,                  // Total needs spending
    percentage: 27.00,             // Percentage of income (rounded to 2 decimals)
    limit: 2500                    // 50% of income
  },
  wants: {
    amount: 450,                   // Total wants spending
    percentage: 9.00,              // Percentage of income
    limit: 1500                    // 30% of income
  },
  savings: {
    amount: 600,                   // Total savings
    percentage: 12.00,             // Percentage of income
    target: 1000                   // 20% of income
  },
  status: "warning",               // on_track | warning | off_track
  warnings: ["Savings below 20%"] // Array or null
}
```

**Status Rules**:

| Status | Needs | Wants | Savings | Description |
|--------|-------|-------|---------|-------------|
| **on_track** | ≤ 50% | ≤ 30% | ≥ 20% | All categories within recommended limits |
| **warning** | 50-60% | 30-40% | 10-20% | One or more categories slightly off |
| **off_track** | > 60% | > 40% | < 10% | Severe deviation from recommended limits |

---

### Financial Insights

**1. Safe-to-Spend Calculation**:
```javascript
safeToSpend = income - needsSpent - (income × 0.20)
```

**Purpose**: Shows remaining money available for wants after covering needs and mandatory 20% savings.

**Example**:
- Income: $5000
- Needs spent: $1350
- Savings target: $1000 (20%)
- Safe-to-spend: $5000 - $1350 - $1000 = $2650

**Interpretation**:
- Positive value: You have this amount to spend on wants
- Zero or negative: You've exceeded recommended spending

---

**2. Top 3 Spending Categories**:
```javascript
topCategories: [
  { category: "Rent", amount: 1200 },
  { category: "Groceries", amount: 300 },
  { category: "Dining", amount: 200 }
]
```

**Calculation**:
1. Group all expenses by category
2. Sum amounts for each category
3. Sort by total amount (descending)
4. Return top 3

**Use Case**: Identify where money is going the most

---

**3. Daily Average Spending**:
```javascript
dailyAverage = totalSpent / daysInMonth
```

**Purpose**: Average spending per day for the month

**Example**:
- Total spent: $2400
- Days in December: 31
- Daily average: $2400 / 31 = $77.42

**Note**: Uses total days in month, not days elapsed

---

**4. Monthly Comparison**:
```javascript
monthlyComparison: {
  currentMonth: 2400,      // Total spent this month
  previousMonth: 2200,     // Total spent last month
  changePercentage: 9.09   // Percentage change
}
```

**Calculation**:
```javascript
changePercentage = ((currentTotal - prevTotal) / prevTotal) × 100
```

**Interpretation**:
- Positive: Spending increased
- Negative: Spending decreased
- Zero: No change

---

**5. Expense Streak**:
```javascript
expenseStreak: 8  // Number of consecutive days
```

**Calculation**:
1. Calculate daily budget: `monthlyIncome / daysInMonth`
2. Group expenses by day
3. For each day in month (up to today):
   - If total spending ≤ daily budget: increment streak
   - Otherwise: reset streak to 0
4. Return final streak count

**Purpose**: Gamification - track how many days user stayed within daily budget

**Example**:
- Monthly income: $5000
- Days in month: 31
- Daily budget: $5000 / 31 = $161.29
- If spending ≤ $161.29 for 8 consecutive days → streak = 8

---

### Data Flow Example

**Complete User Journey**:

```
1. POST /api/auth/register
   Input: { name, email, password }
   Output: { token, user }
   
2. PUT /api/user/income
   Headers: { Authorization: Bearer <token> }
   Input: { monthlyIncome: 5000 }
   Output: { monthlyIncome: 5000 }

3. POST /api/expenses (×3)
   Headers: { Authorization: Bearer <token> }
   
   Expense 1: { amount: 1200, category: "Rent", bucket: "needs" }
   Expense 2: { amount: 150, category: "Groceries", bucket: "needs" }
   Expense 3: { amount: 1000, category: "Emergency Fund", bucket: "savings" }
   
   Output: { expense } (×3)

4. GET /api/expenses?month=2025-12
   Headers: { Authorization: Bearer <token> }
   Output: { count: 3, data: [expenses] }

5. GET /api/summary?month=2025-12
   Headers: { Authorization: Bearer <token> }
   Output: {
     budget: {
       income: 5000,
       needs: { amount: 1350, percentage: 27 },
       wants: { amount: 0, percentage: 0 },
       savings: { amount: 1000, percentage: 20 },
       status: "on_track"
     },
     insights: {
       safeToSpend: 2650,
       topCategories: [...],
       dailyAverage: 75.81,
       ...
     }
   }
```

---

## 📤 Response Formats

### Success Response Structure
```json
{
  "success": true,
  "message": "Optional success message",
  "data": {
    // Response data (object or array)
  },
  "count": 10  // Optional: used in list endpoints
}
```

### Error Response Structure
```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| **200** | OK | Successful GET, PUT, DELETE |
| **201** | Created | Successful POST (resource created) |
| **400** | Bad Request | Validation errors, missing fields |
| **401** | Unauthorized | Invalid/missing/expired token |
| **404** | Not Found | Resource doesn't exist |
| **500** | Internal Server Error | Unexpected server errors |

---

## 🔒 Security Features

### 1. Password Security
- **Hashing Algorithm**: bcrypt with 10 salt rounds
- **Never stored in plain text**
- **Never returned in API responses**
- **Constant-time comparison** (prevents timing attacks)
- **Minimum length**: 6 characters (configurable)

### 2. JWT Authentication
- **Signing Algorithm**: HS256 (HMAC SHA-256)
- **Secret Key**: Stored in environment variable
- **Token Expiration**: 7 days (configurable)
- **Payload**: Only contains user ID (no sensitive data)
- **Verification**: Every protected endpoint validates token

### 3. Authorization
- **User Isolation**: Users can only access their own data
- **Ownership Verification**: Expenses verified before update/delete
- **Token-based**: No session management needed

### 4. Input Validation
- **Required Fields**: Validated for presence
- **Data Types**: Type checking on all inputs
- **Enum Values**: Bucket must be needs|wants|savings
- **Ranges**: Age (13-100), amount (>0), income (≥0)
- **Sanitization**: Strings trimmed, emails lowercased

### 5. Database Security
- **Indexes**: Efficient queries, unique email constraint
- **Connection String**: Stored in environment variable
- **Error Handling**: Database errors caught and logged
- **ObjectId Validation**: MongoDB IDs validated before queries

### 6. CORS Protection
- **Enabled**: Allows cross-origin requests (configurable)
- **Production**: Should be restricted to specific origins

### 7. Environment Variables
- **Sensitive Data**: Never committed to version control
- **Validation**: Required variables checked at startup
- **.env.example**: Template provided for setup

### 8. Error Handling
- **User Errors**: Return 400 with helpful message
- **Server Errors**: Return 500, log details
- **No Crashes**: Proper try-catch blocks throughout
- **No Information Leakage**: Generic error messages in production

---

## 🛠️ Utility Features

### Health Check Endpoint
```http
GET /health
```

**Purpose**: Verify server is running

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "FinSight API is running",
  "timestamp": "2025-12-15T14:30:00.000Z"
}
```

**Use Cases**:
- Load balancer health checks
- Monitoring/alerting systems
- Quick connectivity tests

---

### 404 Handler
All undefined routes return:
```json
{
  "success": false,
  "message": "Route not found"
}
```

---

### Development Logger
In development mode (`NODE_ENV !== 'production'`):
```
2025-12-15T14:30:00.000Z - POST /api/auth/login
2025-12-15T14:30:05.000Z - GET /api/user/me
2025-12-15T14:30:10.000Z - POST /api/expenses
```

**Purpose**: Debug request flow during development

---

## 📝 Summary of All Features

### Core Features (Implemented)
✅ User registration with email/password  
✅ User login with JWT authentication  
✅ Password hashing with bcrypt  
✅ Token-based authorization  
✅ Monthly income management  
✅ Create expenses with categories and buckets  
✅ View all expenses or filter by month  
✅ Update existing expenses  
✅ Delete expenses  
✅ 50/30/20 budget analysis  
✅ Budget status tracking (on_track/warning/off_track)  
✅ Safe-to-spend calculation  
✅ Top 3 spending categories  
✅ Daily average spending  
✅ Monthly spending comparison  
✅ Expense streak tracking  
✅ User profile retrieval  
✅ Complete input validation  
✅ Comprehensive error handling  
✅ MongoDB with Mongoose ODM  
✅ RESTful API design  
✅ CORS support  
✅ Environment-based configuration  
✅ Health check endpoint  
✅ Request logging (development)  

### Database Features
✅ User collection with unique email index  
✅ Expense collection with compound indexes  
✅ Timestamps on all documents  
✅ Reference relationships (User ← Expenses)  
✅ Pre-save hooks for password hashing  
✅ Instance methods for password comparison  

### Security Features
✅ JWT token authentication  
✅ Bcrypt password hashing (10 rounds)  
✅ Protected routes with middleware  
✅ User data isolation  
✅ Token expiration  
✅ Environment variable security  
✅ Input sanitization  
✅ Ownership verification  
✅ No information leakage  

---

## 📊 Complete Endpoint Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | /health | Public | Server health check |
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login existing user |
| GET | /api/user/me | Protected | Get user profile |
| PUT | /api/user/income | Protected | Set monthly income |
| POST | /api/expenses | Protected | Create expense |
| GET | /api/expenses | Protected | List expenses (filterable) |
| PUT | /api/expenses/:id | Protected | Update expense |
| DELETE | /api/expenses/:id | Protected | Delete expense |
| GET | /api/summary | Protected | Budget analysis & insights |

**Total Endpoints**: 10

---

## 🎯 Complete Feature List

### Authentication & Authorization
1. User registration with email validation
2. User login with password verification
3. JWT token generation
4. Token verification middleware
5. Protected route access control

### User Management
6. User profile retrieval
7. Monthly income setting
8. Profile data management
9. Timestamp tracking (created/updated)

### Expense Management
10. Expense creation with validation
11. Expense listing with pagination
12. Month-based expense filtering
13. Expense updates with ownership check
14. Expense deletion with ownership check
15. Category tracking
16. Bucket classification (needs/wants/savings)
17. Optional notes
18. Date tracking

### Budget Analysis
19. 50/30/20 budget calculation
20. Needs spending tracking (50% target)
21. Wants spending tracking (30% target)
22. Savings tracking (20% target)
23. Percentage calculations
24. Budget status determination
25. Warning message generation
26. Income vs spending analysis

### Financial Insights
27. Safe-to-spend calculation
28. Top 3 spending categories
29. Daily average spending
30. Monthly comparison (current vs previous)
31. Spending trend percentage
32. Expense streak tracking
33. Budget limit calculations

### Data & Security
34. MongoDB integration
35. Mongoose ODM
36. Password hashing (bcrypt)
37. Email uniqueness enforcement
38. Database indexing for performance
39. User data isolation
40. Input validation
41. Data sanitization

### Developer Experience
42. Environment variable configuration
43. Error handling
44. Logging (development)
45. Health check endpoint
46. CORS support
47. Consistent API response format
48. Comprehensive documentation

**Total Features**: 48

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start server
npm start

# Start with auto-reload (Node 18+)
npm run dev
```

---

## 📚 Additional Resources

- **README.md**: General project overview and setup
- **API_TESTING.md**: curl examples and testing guide
- **IMPLEMENTATION.md**: Technical implementation details
- **.env.example**: Environment configuration template

---

**Last Updated**: December 15, 2025  
**Version**: 1.0.0  
**API Base URL**: http://localhost:5000/api
