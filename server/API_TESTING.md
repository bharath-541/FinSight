# FinSight API Testing Guide

Quick reference for testing the FinSight API endpoints.

## Setup

1. Ensure MongoDB is running
2. Copy `.env.example` to `.env` and configure
3. Start server: `npm start`
4. Server runs on: `http://localhost:5000`

## Test Flow

### 1. Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "secure123"
  }'
```

**Response**: Returns token and user data

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "secure123"
  }'
```

**Save the token** from response for subsequent requests.

### 3. Set Monthly Income

```bash
curl -X PUT http://localhost:5000/api/user/income \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "monthlyIncome": 5000
  }'
```

### 4. Get User Profile

```bash
curl -X GET http://localhost:5000/api/user/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Create Expenses

**Needs expense:**
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "amount": 1200,
    "category": "Rent",
    "bucket": "needs",
    "note": "Monthly rent payment"
  }'
```

**Wants expense:**
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "amount": 50,
    "category": "Dining",
    "bucket": "wants",
    "note": "Dinner with friends"
  }'
```

**Savings:**
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "amount": 1000,
    "category": "Emergency Fund",
    "bucket": "savings",
    "note": "Monthly savings transfer"
  }'
```

### 6. Get All Expenses

```bash
curl -X GET http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 7. Get Expenses for Specific Month

```bash
curl -X GET "http://localhost:5000/api/expenses?month=2025-12" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 8. Update an Expense

```bash
curl -X PUT http://localhost:5000/api/expenses/EXPENSE_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "amount": 1250,
    "note": "Updated rent amount"
  }'
```

### 9. Delete an Expense

```bash
curl -X DELETE http://localhost:5000/api/expenses/EXPENSE_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 10. Get Budget Summary

```bash
curl -X GET "http://localhost:5000/api/summary?month=2025-12" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Expected Summary Response

```json
{
  "success": true,
  "data": {
    "month": "2025-12",
    "budget": {
      "income": 5000,
      "totalSpent": 2250,
      "needs": {
        "amount": 1200,
        "percentage": 24,
        "limit": 2500
      },
      "wants": {
        "amount": 50,
        "percentage": 1,
        "limit": 1500
      },
      "savings": {
        "amount": 1000,
        "percentage": 20,
        "target": 1000
      },
      "status": "on_track",
      "warnings": null
    },
    "insights": {
      "safeToSpend": 2800,
      "topCategories": [
        { "category": "Rent", "amount": 1200 },
        { "category": "Emergency Fund", "amount": 1000 },
        { "category": "Dining", "amount": 50 }
      ],
      "dailyAverage": 72.58,
      "monthlyComparison": {
        "currentMonth": 2250,
        "previousMonth": 0,
        "changePercentage": 0
      },
      "expenseStreak": 15
    }
  }
}
```

## Status Indicators

- **on_track**: All spending within 50/30/20 limits
- **warning**: One or more categories slightly over/under
- **off_track**: Significant deviation from budget targets

## Common Test Scenarios

### Scenario 1: On Track Budget
- Income: $5000
- Needs: $2400 (48%)
- Wants: $1450 (29%)
- Savings: $1000 (20%)
- **Status**: on_track

### Scenario 2: Warning Status
- Income: $5000
- Needs: $2600 (52%)
- Wants: $1600 (32%)
- Savings: $800 (16%)
- **Status**: warning

### Scenario 3: Off Track
- Income: $5000
- Needs: $3100 (62%)
- Wants: $2100 (42%)
- Savings: $400 (8%)
- **Status**: off_track

## Postman Collection

Import the following into Postman:

**Base URL**: `http://localhost:5000`

**Environment Variables**:
- `baseUrl`: http://localhost:5000
- `token`: (set after login)

**Headers** (for protected routes):
- `Authorization`: Bearer {{token}}
- `Content-Type`: application/json

## Health Check

```bash
curl http://localhost:5000/health
```

Returns server status and timestamp.

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common status codes:
- 400: Bad request (validation)
- 401: Unauthorized (invalid/missing token)
- 404: Resource not found
- 500: Server error

## Tips

1. **Token expiry**: Tokens expire after 7 days (configurable via JWT_EXPIRES_IN)
2. **Month format**: Always use YYYY-MM format
3. **Buckets**: Must be lowercase: needs, wants, or savings
4. **Income**: Must be set before getting summary
5. **Date**: Optional in expenses, defaults to current date

## MongoDB Direct Queries

If you need to check database directly:

```bash
# Connect to MongoDB
mongosh finsight

# View users
db.users.find()

# View expenses
db.expenses.find()

# Clear all data (for testing)
db.users.deleteMany({})
db.expenses.deleteMany({})
```
