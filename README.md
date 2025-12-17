# FinSight – Personal Finance Management Application

FinSight is a **full-stack personal finance management application** built using the **MERN stack** (MongoDB, Express, React, Node.js), implementing the **50/30/20 budgeting rule**.

This project features a modern React dashboard for tracking expenses, managing budgets, and visualizing financial health, backed by a robust REST API for data management and business logic.

## 📋 Project Overview

FinSight helps users take control of their finances through:
- Real-time expense tracking and categorization
- Automated 50/30/20 budget analysis
- Visual insights into spending patterns
- Assets and debts management
- Financial health monitoring

---

## 🚀 Features

### Frontend Features
- 📊 **Interactive Dashboard** - Real-time budget overview with charts and metrics
- 💰 **Expense Management** - Add, edit, delete, and categorize expenses
- 📈 **Budget Visualization** - Progress bars and charts for 50/30/20 rule tracking
- 🏦 **Assets & Debts** - Comprehensive tracking of assets and liabilities
- 📅 **Expense Timeline** - Calendar view of all transactions
- 👤 **User Profile** - Personal information and monthly income settings
- 🌓 **Dark Mode** - Beautiful dark theme support
- 📱 **Responsive Design** - Optimized for all device sizes

### Backend Features
- 🔐 **JWT Authentication** - Secure user registration and login
- 💾 **MongoDB Database** - Scalable data storage with Mongoose ODM
- 📊 **Budget Analysis** - Automated 50/30/20 rule calculations
- 🎯 **Status Detection** - Track budget health (on_track / warning / off_track)
- 📈 **Financial Insights**:
  - Safe-to-spend calculations
  - Top spending categories
  - Daily average spending
  - Monthly comparisons
  - Expense streak tracking
- 🛡️ **Security** - Password hashing with bcrypt, protected routes
- 🏗️ **Clean Architecture** - MVC pattern with service layer

---

## 🧱 Tech Stack

### Frontend (`/client`)
- **Framework**: React 19
- **Build Tool**: Vite 6
- **Styling**: TailwindCSS 4 + Custom CSS
- **Routing**: React Router v7
- **Charts**: ApexCharts, FullCalendar
- **HTTP Client**: Axios
- **State Management**: React Context API

### Backend (`/server`)
- **Runtime**: Node.js
- **Framework**: Express.js (CommonJS)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + bcryptjs
- **Architecture**: MVC + Service Layer

## 📁 Project Structure

```
finsight/
├── client/              # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React Context providers
│   │   ├── services/    # API service layer
│   │   ├── hooks/       # Custom React hooks
│   │   ├── layout/      # Layout components
│   │   └── utils/       # Utility functions
│   ├── public/          # Static assets
│   └── package.json
├── server/              # Node.js backend API
│   ├── controllers/     # Request handlers
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middleware/      # Auth middleware
│   ├── config/          # Database configuration
│   └── package.json
└── README.md            # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Quick Start

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd finsight
```

#### 2. Setup Backend

```bash
cd server
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start the server
npm start
# Server runs on http://localhost:5000
```

#### 3. Setup Frontend

```bash
cd ../client
npm install

# Start the development server
npm run dev
# Client runs on http://localhost:5173
```

#### 4. Access the Application

Open your browser and navigate to `http://localhost:5173`

### Detailed Setup Instructions

For detailed setup instructions:
- **Frontend**: See [client/README.md](./client/README.md)
- **Backend**: See [server/README.md](./server/README.md)

---

## 📖 Documentation

- **[Server API Documentation](./server/README.md)** - Complete API reference and backend details
- **[Client Documentation](./client/README.md)** - Frontend architecture and component guide

## 🎯 50/30/20 Budgeting Rule

FinSight implements the popular 50/30/20 budgeting framework:

- **50% Needs** 🏠 - Essential expenses (rent, utilities, groceries, insurance)
- **30% Wants** 🎮 - Discretionary spending (entertainment, dining out, hobbies)
- **20% Savings** 💰 - Savings and debt repayment (emergency fund, investments)

### Budget Status Indicators

- **✅ On Track**: All categories within recommended limits
- **⚠️ Warning**: One or more categories approaching limits
- **❌ Off Track**: Significant deviation from budget limits

---

## 🔑 Key Concepts

### Expense Buckets

All expenses are categorized into one of three buckets:
- **Needs**: Groceries, Rent, Utilities, Transportation, Insurance, Healthcare
- **Wants**: Entertainment, Dining Out, Shopping, Hobbies, Subscriptions
- **Savings**: Emergency Fund, Investments, Debt Repayment, Retirement

### Financial Insights

- **Safe to Spend (Advisory)**: Recommended amount available for wants based on 50/30/20 rule
- **Remaining Cash (Reality)**: Actual money left after all expenses
- **Spending Velocity**: Daily spending rate compared to budget
- **Category Analysis**: Top spending categories for better awareness
- **Monthly Trends**: Compare current vs previous month spending

---

## 🛠️ Development

### Running in Development Mode

**Backend (with auto-reload):**
```bash
cd server
npm run dev
```

**Frontend (with hot reload):**
```bash
cd client
npm run dev
```

### Building for Production

**Frontend:**
```bash
cd client
npm run build
# Output: client/dist/
```

**Backend:**
- Set `NODE_ENV=production` in your environment
- Ensure MongoDB connection string points to production database
- Use a process manager like PM2 for production deployment

### Linting

```bash
# Frontend
cd client
npm run lint
```

---

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt (10 salt rounds)
- Protected API routes with auth middleware
- User data isolation (expenses tied to user ID)
- Environment variable configuration for sensitive data
- Input validation on all endpoints

---

## 📊 API Overview

The backend provides a RESTful API with the following main endpoints:

- **Auth**: `/api/auth/register`, `/api/auth/login`
- **User**: `/api/user/me`, `/api/user/income`
- **Expenses**: `/api/expenses` (CRUD operations)
- **Summary**: `/api/summary` (Budget analysis and insights)

See [server/README.md](./server/README.md) for complete API documentation.

---

## 🎨 Frontend Pages

- **Dashboard** (`/`) - Financial overview with budget status and charts
- **Expenses** (`/expenses`) - Complete expense management table
- **Timeline** (`/timeline`) - Calendar view of all expenses
- **Assets & Debts** (`/assets-debts`) - Asset and liability tracking
- **Profile** (`/profile`) - User settings and monthly income

---

## 🚧 Future Enhancements (Out of Scope)

The following features are **NOT** currently implemented:
- AI financial chatbot
- SIP/investment calculators
- Goal planner and tracking
- CSV import/export
- Bank API integrations
- Email/SMS notifications
- Admin panel
- Machine learning predictions
- Refresh token rotation
- Multi-currency support

---
