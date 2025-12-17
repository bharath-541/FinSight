# FinSight Client

A modern, feature-rich personal finance management dashboard built with React, Vite, and TailwindCSS. FinSight helps users track expenses, manage budgets using the 50/30/20 rule, monitor assets and debts, and visualize their financial health.

## ✨ Features

- **📊 Financial Dashboard**: Real-time overview of budget status, spending trends, and financial metrics
- **💰 Expense Tracking**: Add, edit, and categorize expenses into Needs, Wants, and Savings buckets
- **📈 Budget Visualization**: Interactive charts showing spending patterns and 50/30/20 budget progress
- **🏦 Assets & Debts Management**: Track assets (savings, investments) and debts with detailed management
- **📅 Expense Timeline**: Calendar view of all expenses with FullCalendar integration
- **👤 User Profile**: Manage personal information and monthly income settings
- **🌓 Dark Mode**: Beautiful dark theme support
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices

## 🚀 Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 6
- **Styling**: TailwindCSS 4 + Custom CSS
- **Routing**: React Router v7
- **Charts**: ApexCharts + React ApexCharts
- **Calendar**: FullCalendar
- **HTTP Client**: Axios
- **State Management**: React Context API (AuthContext, FinanceContext)
- **Linting**: ESLint 9

## 📁 Project Structure

```
client/
├── public/              # Static assets (images, icons, favicon)
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── finance/     # Financial components (expense forms, tables, charts)
│   │   ├── charts/      # Chart components
│   │   ├── auth/        # Authentication components
│   │   ├── common/      # Common UI elements (buttons, inputs, modals)
│   │   ├── header/      # Header and navigation
│   │   └── ui/          # UI components (alerts, badges, cards, tables)
│   ├── pages/           # Page components
│   │   ├── Dashboard/   # Dashboard home page
│   │   ├── AuthPages/   # Login and signup pages
│   │   ├── AssetsDebts.jsx  # Assets & debts management
│   │   ├── Calendar.jsx     # Expense timeline calendar
│   │   ├── UserProfiles.jsx # User profile and settings
│   │   └── Tables/      # Expense tables
│   ├── context/         # React Context providers
│   │   ├── AuthContext.jsx    # Authentication state
│   │   └── FinanceContext.jsx # Financial data state
│   ├── services/        # API service modules
│   │   ├── api.js       # Axios instance
│   │   ├── authService.js     # Auth API calls
│   │   ├── expenseService.js  # Expense API calls
│   │   └── userService.js     # User API calls
│   ├── hooks/           # Custom React hooks
│   ├── layout/          # Layout components (AppLayout, DefaultLayout)
│   ├── icons/           # SVG icon components
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main app component with routes
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles and Tailwind configuration
├── index.html           # HTML entry point
├── vite.config.js       # Vite configuration
├── package.json         # Dependencies and scripts
└── eslint.config.js     # ESLint configuration
```

## 🛠️ Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Setup Steps

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint** (if needed)
   
   The API base URL is hardcoded in `src/services/api.js`. If you need to change it from the production URL to localhost:
   
   ```javascript
   // src/services/api.js
   const API_BASE_URL = 'http://localhost:5000/api'; // For local development
   // const API_BASE_URL = 'https://finsight-ya2h.onrender.com/api'; // Production
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173` (default Vite port)

## 📜 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (outputs to `dist/`)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## 🧩 Key Components

### Finance Components (`src/components/finance/`)

- **ExpenseFormModal**: Modal for adding/editing expenses
- **ExpenseTable**: Table displaying all expenses with edit/delete actions
- **BudgetProgress**: 50/30/20 budget progress visualization
- **FinancialMetrics**: Key financial metrics cards
- **MonthlyExpenseChart**: Bar chart showing monthly spending trends
- **SpendingVelocityChart**: Line chart tracking spending pace
- **RecentExpenses**: List of recent expense entries
- **AssetsTable**: Table for managing assets
- **DebtsList**: List view for managing debts
- **AddAssetModal**: Modal for adding new assets
- **AddDebtModal**: Modal for adding new debts

### Pages (`src/pages/`)

- **Dashboard/Home**: Main dashboard with budget overview, charts, and recent expenses
- **Tables/BasicTables**: Complete expense management with table view
- **Calendar**: Timeline view of expenses using FullCalendar
- **AssetsDebts**: Comprehensive assets and debts management
- **UserProfiles**: User profile with income settings and personal information
- **AuthPages**: Login and signup pages

## 🔐 Authentication

The client uses JWT-based authentication:
- Login/signup forms in `src/pages/AuthPages/`
- AuthContext provides authentication state throughout the app
- ProtectedRoute component guards authenticated routes
- Token stored in localStorage and sent with API requests

## 🎨 Styling

- **TailwindCSS 4**: Primary styling framework with custom configuration
- **Custom CSS**: Additional styles in `src/index.css` for animations, transitions, and custom components
- **Responsive Design**: Mobile-first approach with breakpoints for tablet and desktop
- **Dark Mode**: Full dark mode support with smooth transitions

## 🔗 Backend Integration

The client communicates with the FinSight backend API. Make sure the server is running before using the client application.

**Default API URL**: `http://localhost:5000/api`

See the [server README](../server/README.md) for backend setup instructions.

## 📦 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory. You can serve this with any static file server.

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

See [LICENSE.md](./LICENSE.md)

## 🤝 Contributing

This is an academic project for personal finance management. Feel free to fork and modify for your own use.

---

**Note**: FinSight implements the 50/30/20 budgeting rule:
- **50%** for Needs (essential expenses)
- **30%** for Wants (discretionary spending)
- **20%** for Savings (savings and debt repayment)
