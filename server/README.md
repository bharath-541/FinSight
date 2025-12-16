# FinSight Backend API

Personal finance management backend built with Node.js, Express, and MongoDB implementing the 50/30/20 budgeting rule.

> **Note**: "FinanceGuide" refers to the academic case-study name, while "FinSight" is the product implementation.

## Features

- **User Authentication**: JWT-based registration and login
- **Expense Tracking**: Create, read, update, and delete expenses
- **Budget Analysis**: 50/30/20 budgeting engine with status tracking
- **Financial Insights**: Safe-to-spend calculations, top categories, monthly comparisons, and expense streaks

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js (CommonJS)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs

## Project Structure

```
server/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Register & Login
│   ├── userController.js     # User profile & income
│   ├── expenseController.js  # CRUD operations for expenses
│   └── summaryController.js  # Budget summary & insights
├── middleware/
│   └── auth.js               # JWT verification
├── models/
│   ├── User.js               # User schema
│   └── Expense.js            # Expense schema
├── routes/
│   ├── auth.js               # Auth routes
│   ├── user.js               # User routes
│   ├── expenses.js           # Expense routes
│   └── summary.js            # Summary routes
├── services/
│   └── budgetService.js      # 50/30/20 budgeting logic
├── .env.example              # Environment variables template
├── package.json
└── server.js                 # Entry point
```

## Installation

1. **Clone the repository**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/finsight
   JWT_SECRET=your_secure_secret_key
   JWT_EXPIRES_IN=7d
   ```

4. **Start MongoDB**
   ```bash
   # Using local MongoDB
   mongod
   
   # Or use MongoDB Atlas cloud connection
   ```

5. **Run the server**
   ```bash
   npm start
   ```

   Server will start on `http://localhost:5000`

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### User Management

#### Get Profile
```http
GET /api/user/me
Authorization: Bearer <token>
```

#### Update Monthly Income
```http
PUT /api/user/income
Authorization: Bearer <token>
Content-Type: application/json

{
  "monthlyIncome": 5000
}
```

### Expense Management

#### Create Expense
```http
POST /api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 150,
  "category": "Groceries",
  "bucket": "needs",
  "note": "Weekly shopping",
  "date": "2025-12-15"
}
```

**Bucket options**: `needs`, `wants`, `savings`

#### Get Expenses (with optional month filter)
```http
GET /api/expenses?month=2025-12
Authorization: Bearer <token>
```

#### Update Expense
```http
PUT /api/expenses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 200,
  "category": "Groceries",
  "bucket": "needs"
}
```

#### Delete Expense
```http
DELETE /api/expenses/:id
Authorization: Bearer <token>
```

### Budget Summary & Insights

#### Get Monthly Summary
```http
GET /api/summary?month=2025-12
Authorization: Bearer <token>
```

**Response includes**:
- 50/30/20 budget breakdown
- Status: `on_track`, `warning`, or `off_track`
- Safe-to-spend amount
- Top 3 spending categories
- Monthly comparison with previous month
- Daily average spending
- Expense streak (days within budget)

## Business Logic

### 50/30/20 Budgeting Rule

- **Needs (50%)**: Essential expenses (rent, utilities, groceries, etc.)
- **Wants (30%)**: Non-essential expenses (entertainment, dining out, etc.)
- **Savings (20%)**: Savings and debt repayment

### Status Rules

- **on_track**: All categories within limits
- **warning**: 
  - Needs > 50%
  - Wants > 30%
  - Savings < 20%
- **off_track**:
  - Needs > 60%
  - Wants > 40%
  - Savings < 10%
  - Indicates severe deviation from recommended budget limits

### Insights Calculations

1. **Safe-to-spend**: `income - needsSpent - (income × 0.20)`
2. **Top Categories**: Top 3 by total spending
3. **Monthly Comparison**: Current vs previous month spending
4. **Daily Average**: Total spending / days elapsed in the current month
5. **Expense Streak**: Consecutive days staying within daily budget limits

## Data Models

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  monthlyIncome: Number (optional, collected after signup),
  age: Number (optional),
  timestamps: true
}
```

### Expense Model
```javascript
{
  user: ObjectId (ref: User, required),
  amount: Number (required, min: 0),
  category: String (required),
  bucket: Enum ['needs', 'wants', 'savings'] (required),
  note: String (optional),
  date: Date (default: now),
  timestamps: true
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `404`: Not Found
- `500`: Internal Server Error

## Security Features

- Password hashing with bcryptjs (10 salt rounds)
- JWT token authentication
- Protected routes with auth middleware
- Environment variable configuration
- Input validation on all endpoints
- User data isolation (expenses tied to user ID)

## Development Notes

- **CommonJS** module system used throughout
- **async/await** for all asynchronous operations
- No server crashes on user errors (proper error handling)
- `process.exit(1)` only used for startup failures
- Clean separation of concerns (MVC pattern)

## Testing the API

Use tools like:
- **Postman**: Import endpoints and test
- **Thunder Client**: VS Code extension
- **curl**: Command-line testing

Example curl request:
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Future Enhancements (Out of Scope)

These features are **NOT** implemented:
- AI chatbot
- SIP/investment calculators
- Goal planner
- CSV import/export
- Bank API integrations
- Notifications
- Admin panel
- Machine learning models
- Refresh tokens
- Role-based access (admin/coach)

## License

ISC

## Author

FinSight Team
