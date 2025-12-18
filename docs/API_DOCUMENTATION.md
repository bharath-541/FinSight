# FinSight API Documentation

**Base URL:** `https://finsight-ya2h.onrender.com/api`  
**Frontend:** `https://finsight-gray-two.vercel.app`  
**Authentication:** JWT Bearer Token

---

## Table of Contents
- [Authentication](#authentication)
- [User Profile](#user-profile)
- [Expenses](#expenses)
- [Assets](#assets)
- [Debts](#debts)
- [Summary](#summary)
- [Frontend Integration](#frontend-integration)

---

## Authentication

### Register
**POST** `/api/auth/register`

**Frontend Service:** `authService.register(name, email, password)`  
**Frontend Location:** `client/src/services/auth.service.js`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "monthlyIncome": 0,
      "age": null
    }
  }
}
```

**Frontend Handling:**
- Token saved to `localStorage.finsight_token`
- User saved to `localStorage.finsight_user`
- Automatic redirect after successful registration

---

### Login
**POST** `/api/auth/login`

**Frontend Service:** `authService.login(email, password)`  
**Frontend Location:** `client/src/services/auth.service.js`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "monthlyIncome": 50000,
      "age": 28
    }
  }
}
```

**Frontend Handling:**
- Token saved to `localStorage.finsight_token`
- User saved to `localStorage.finsight_user`
- Protected route access granted

---

### Logout
**Client-side only**

**Frontend Service:** `authService.logout()`  
**Frontend Location:** `client/src/services/auth.service.js`

**Action:**
- Clears `localStorage.finsight_token`
- Clears `localStorage.finsight_user`
- Redirects to login page

---

## User Profile 🔒

### Get Profile
**GET** `/api/user/me`

**Frontend Service:** `userService.getProfile()`  
**Frontend Location:** `client/src/services/user.service.js`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "monthlyIncome": 50000,
    "age": 28
  }
}
```

**Frontend Usage:**
- Used in UserProfile components
- Displayed in dashboard header
- Used for budget calculations

---

### Update Income
**PUT** `/api/user/income`

**Frontend Service:** `userService.updateIncome(monthlyIncome)`  
**Frontend Location:** `client/src/services/user.service.js`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "monthlyIncome": 75000
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Monthly income updated successfully",
  "data": {
    "monthlyIncome": 75000
  }
}
```

**Frontend Handling:**
- Updates cached user in localStorage
- Triggers budget recalculation
- Updates dashboard displays

---

## Expenses 🔒

### Get Expenses (with optional month filter)
**GET** `/api/expenses?month=2025-12`

**Frontend Service:** `expenseService.getExpenses(month)`  
**Frontend Location:** `client/src/services/expense.service.js`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `month` (optional): Format `YYYY-MM`. Returns current month if not provided.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "expense_id",
      "amount": 5000,
      "category": "Groceries",
      "bucket": "needs",
      "note": "Weekly shopping",
      "date": "2025-12-15T00:00:00.000Z"
    }
  ]
}
```

**Frontend Usage:**
- Displayed in expense tables
- Used in charts and visualizations
- Filtered by month selector

---

### Create Expense
**POST** `/api/expenses`

**Frontend Service:** `expenseService.createExpense(expenseData)`  
**Frontend Location:** `client/src/services/expense.service.js`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 5000,
  "category": "Groceries",
  "bucket": "needs",
  "note": "Weekly shopping",
  "date": "2025-12-15"
}
```

**Bucket Values:** `needs` | `wants` | `savings`

**Response (201):**
```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "_id": "expense_id",
    "amount": 5000,
    "category": "Groceries",
    "bucket": "needs",
    "note": "Weekly shopping",
    "date": "2025-12-15T00:00:00.000Z"
  }
}
```

**Frontend Handling:**
- Form submission from expense modal
- Refreshes expense list after creation
- Updates summary calculations

---

### Update Expense
**PUT** `/api/expenses/:id`

**Frontend Service:** `expenseService.updateExpense(id, expenseData)`  
**Frontend Location:** `client/src/services/expense.service.js`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (all fields optional)
```json
{
  "amount": 6000,
  "category": "Groceries",
  "note": "Updated shopping"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Expense updated successfully",
  "data": { /* updated expense */ }
}
```

**Frontend Usage:**
- Edit expense modal
- Inline editing in tables
- Refreshes data after update

---

### Delete Expense
**DELETE** `/api/expenses/:id`

**Frontend Service:** `expenseService.deleteExpense(id)`  
**Frontend Location:** `client/src/services/expense.service.js`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

**Frontend Handling:**
- Confirmation modal before deletion
- Removes from UI immediately
- Updates summary totals

---

## Assets 🔒

### Get All Assets
**GET** `/api/assets`

**Frontend Service:** `financeService.getAssets()`  
**Frontend Location:** `client/src/services/finance.service.js`  
**Frontend Page:** `client/src/pages/AssetsDebts.jsx`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "asset_id",
      "type": "cash",
      "name": "Savings Account",
      "currentValue": 50000
    },
    {
      "_id": "asset_id_2",
      "type": "investment",
      "name": "Mutual Funds",
      "currentValue": 250000
    }
  ]
}
```

**Frontend Usage:**
- Displayed in Assets & Debts page
- Used in net worth calculations
- Shown in financial charts

---

### Create Asset
**POST** `/api/assets`

**Frontend Service:** `financeService.createAsset(assetData)`  
**Frontend Location:** `client/src/services/finance.service.js`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "investment",
  "name": "Mutual Funds",
  "currentValue": 250000
}
```

**Type Values:** `cash` | `investment` | `property` | `other`

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "asset_id",
    "type": "investment",
    "name": "Mutual Funds",
    "currentValue": 250000
  }
}
```

**Frontend Component:** `AddAssetModal.jsx`

---

### Update Asset
**PUT** `/api/assets/:id`

**Frontend Service:** `financeService.updateAsset(assetId, assetData)`  
**Frontend Location:** `client/src/services/finance.service.js`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentValue": 300000
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Asset updated successfully",
  "data": { /* updated asset */ }
}
```

---

### Delete Asset
**DELETE** `/api/assets/:id`

**Frontend Service:** `financeService.deleteAsset(assetId)`  
**Frontend Location:** `client/src/services/finance.service.js`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Asset deleted successfully"
}
```

---

## Debts 🔒

### Get All Debts
**GET** `/api/debts`

**Frontend Service:** `financeService.getDebts()`  
**Frontend Location:** `client/src/services/finance.service.js`  
**Frontend Page:** `client/src/pages/AssetsDebts.jsx`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "debt_id",
      "name": "Home Loan",
      "principal": 5000000,
      "remainingBalance": 4500000,
      "interestRate": 8.5,
      "monthlyEMI": 45000
    }
  ]
}
```

**Frontend Usage:**
- Displayed in Assets & Debts page
- Used in net worth calculations
- EMI payment tracking

---

### Create Debt
**POST** `/api/debts`

**Frontend Service:** `financeService.createDebt(debtData)`  
**Frontend Location:** `client/src/services/finance.service.js`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Home Loan",
  "principal": 5000000,
  "remainingBalance": 4500000,
  "interestRate": 8.5,
  "monthlyEMI": 45000
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "debt_id",
    "name": "Home Loan",
    "principal": 5000000,
    "remainingBalance": 4500000,
    "interestRate": 8.5,
    "monthlyEMI": 45000
  }
}
```

---

### Update Debt
**PUT** `/api/debts/:id`

**Frontend Service:** `financeService.updateDebt(debtId, debtData)`  
**Frontend Location:** `client/src/services/finance.service.js`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "remainingBalance": 4400000,
  "monthlyEMI": 45000
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Debt updated successfully",
  "data": { /* updated debt */ }
}
```

---

### Delete Debt
**DELETE** `/api/debts/:id`

**Frontend Service:** `financeService.deleteDebt(debtId)`  
**Frontend Location:** `client/src/services/finance.service.js`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Debt deleted successfully"
}
```

---

### Pay EMI
**POST** `/api/debts/:id/pay-emi`

**Frontend Service:** `financeService.payEMI(debtId, month)`  
**Frontend Location:** `client/src/services/finance.service.js`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** *(optional)*
```json
{
  "amount": 45000
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "EMI payment recorded successfully",
  "data": {
    "_id": "debt_id",
    "remainingBalance": 4455000
  }
}
```

---

## Summary 🔒

### Get Financial Summary
**GET** `/api/summary?month=2025-12`

**Frontend Service:** `summaryService.getSummary(month)`  
**Frontend Location:** `client/src/services/summary.service.js`  
**Frontend Page:** Dashboard components

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `month` (optional): Format `YYYY-MM`. Returns current month if not provided.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "month": "2025-12",
    "monthlyIncome": 75000,
    "expenses": {
      "needs": 37500,
      "wants": 22500,
      "savings": 15000,
      "total": 75000
    },
    "budgetAllocation": {
      "needs": 37500,
      "wants": 22500,
      "savings": 15000
    },
    "netWorth": {
      "totalAssets": 500000,
      "totalDebts": 200000,
      "netWorth": 300000
    }
  }
}
```

**Budget Formula (50-30-20 Rule):**
- Needs: 50% of monthlyIncome
- Wants: 30% of monthlyIncome
- Savings: 20% of monthlyIncome

**Frontend Usage:**
- Dashboard summary cards
- Budget progress bars
- Financial overview charts
- Month-over-month comparisons

---

## Frontend Integration

### API Configuration
**File:** `client/src/services/api.js`

```javascript
const API_BASE_URL = 'https://finsight-ya2h.onrender.com/api';

// Axios instance with interceptors
// - Automatically adds JWT token to requests
// - Handles 401 errors (auto-logout)
```

---

### Service Layer Architecture

#### Auth Service (`auth.service.js`)
```javascript
authService.register(name, email, password)
authService.login(email, password)
authService.logout()
authService.getToken()
authService.getCurrentUser()
authService.isAuthenticated()
```

#### User Service (`user.service.js`)
```javascript
userService.getProfile()
userService.updateIncome(monthlyIncome)
```

#### Expense Service (`expense.service.js`)
```javascript
expenseService.getExpenses(month)
expenseService.createExpense(expenseData)
expenseService.updateExpense(id, expenseData)
expenseService.deleteExpense(id)
```

#### Finance Service (`finance.service.js`)
```javascript
// Assets
financeService.getAssets()
financeService.createAsset(assetData)
financeService.updateAsset(assetId, assetData)
financeService.deleteAsset(assetId)

// Debts
financeService.getDebts()
financeService.createDebt(debtData)
financeService.updateDebt(debtId, debtData)
financeService.deleteDebt(debtId)
financeService.payEMI(debtId, month)
```

#### Summary Service (`summary.service.js`)
```javascript
summaryService.getSummary(month)
```

---

### Authentication Flow (Frontend)

```
1. User Login/Register
   ↓
2. authService.login() or authService.register()
   ↓
3. Token received from API
   ↓
4. Store in localStorage
   - finsight_token: JWT token
   - finsight_user: User object
   ↓
5. Axios interceptor adds token to all requests
   ↓
6. Protected routes accessible
   ↓
7. On 401 error:
   - Clear localStorage
   - Redirect to /login
```

---

### Data Flow Example

**Loading Dashboard Summary:**

```
1. Component mounts
   ↓
2. summaryService.getSummary('2025-12')
   ↓
3. Axios interceptor adds Authorization header
   ↓
4. API request: GET /api/summary?month=2025-12
   ↓
5. Backend processes request
   ↓
6. Response received
   ↓
7. Component updates state
   ↓
8. UI renders with data
```

---

### Error Handling (Frontend)

**Global Error Interceptor:**
```javascript
// In api.js
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto-logout on authentication failure
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Component-level Error Handling:**
```javascript
try {
  const expenses = await expenseService.getExpenses('2025-12');
  setExpenses(expenses);
} catch (error) {
  console.error('Failed to load expenses:', error);
  // Show error notification to user
}
```

---

### LocalStorage Structure

```javascript
// Token
localStorage.finsight_token = "eyJhbGciOiJIUzI1NiIs..."

// User object
localStorage.finsight_user = {
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "monthlyIncome": 75000,
  "age": 28
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes
- **200:** Success
- **201:** Resource created
- **400:** Bad request / Validation error
- **401:** Unauthorized / Invalid token
- **404:** Resource not found
- **429:** Rate limit exceeded
- **500:** Server error

---

## Rate Limiting

**General API:** 100 requests per 15 minutes per IP  
**Auth Routes:** 15 attempts per 15 minutes per IP

**Frontend Handling:**
- Retry logic for rate-limited requests
- User-friendly error messages
- Temporary disable of submit buttons

---

## Security Best Practices

### Frontend
1. ✅ Token stored in localStorage (not cookies for SPA)
2. ✅ Automatic token injection via Axios interceptor
3. ✅ Auto-logout on 401 errors
4. ✅ Protected routes with AuthContext
5. ✅ Input validation before API calls

### Backend
1. ✅ JWT token expiration (7 days)
2. ✅ CORS configured for production frontend
3. ✅ Rate limiting on all endpoints
4. ✅ Password hashing with bcrypt
5. ✅ Input validation and sanitization

---

## Common Frontend Patterns

### Loading States
```javascript
const [loading, setLoading] = useState(false);
const [expenses, setExpenses] = useState([]);

useEffect(() => {
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await expenseService.getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchExpenses();
}, []);
```

### Form Submission
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await expenseService.createExpense({
      amount,
      category,
      bucket,
      note,
      date
    });
    // Refresh data
    fetchExpenses();
    // Close modal
    onClose();
  } catch (error) {
    console.error('Failed to create expense:', error);
  }
};
```

---

## Testing Endpoints

### Using cURL
```bash
# Login
curl -X POST https://finsight-ya2h.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Expenses (with token)
curl -X GET "https://finsight-ya2h.onrender.com/api/expenses?month=2025-12" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman
1. Set base URL: `https://finsight-ya2h.onrender.com/api`
2. Login to get token
3. Add token to Authorization header for protected routes
4. Test all CRUD operations

---

## Environment Variables

### Frontend (`.env`)
```env
VITE_API_BASE_URL=https://finsight-ya2h.onrender.com/api
```

### Backend (`.env`)
```env
MONGO_URI=<mongodb_connection_string>
JWT_SECRET=<secret_key>
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=4000
```
