import { useState, useEffect } from "react";
import summaryService from "../../services/summary.service";
import PageMeta from "../../components/common/PageMeta";
import EmptyState from "../../components/common/EmptyState";

// Import finance components
import FinancialMetrics from "../../components/finance/FinancialMetrics";
import MonthlyExpenseChart from "../../components/finance/MonthlyExpenseChart";
import BudgetProgress from "../../components/finance/BudgetProgress";
import SpendingVelocityChart from "../../components/finance/SpendingVelocityChart";
import RecentExpenses from "../../components/finance/RecentExpenses";

// Import icons
import {
  ShootingStarIcon,
  AlertIcon
} from "../../icons";

export default function Home() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setIsFirstTimeUser(false);
        // Get current month in YYYY-MM format
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const data = await summaryService.getSummary(currentMonth);
        setSummary(data);
      } catch (err) {
        console.error('Error fetching summary:', err);

        // Check if this is a first-time user (no income set)
        if (err.response?.status === 400 &&
          err.response?.data?.message?.includes('monthly income')) {
          setIsFirstTimeUser(true);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (isFirstTimeUser) {
    return (
      <>
        <PageMeta
          title="Welcome to FinSight | Get Started"
          description="Set up your financial profile to start tracking your expenses"
        />
        <EmptyState
          icon={ShootingStarIcon}
          title="Welcome to FinSight! 🎉"
          description="Let's get you started on your financial journey. To begin tracking your finances, you'll need to set up your profile with your monthly income, add some expenses, and optionally manage your assets and debts."
          actionText="Set Up Monthly Income"
          actionLink="/profile"
          secondaryActions={[
            { text: "Add Your First Expense", link: "/expenses" },
            { text: "Manage Assets & Debts", link: "/assets-debts" }
          ]}
        />
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageMeta
          title="Error | FinSight"
          description="An error occurred while loading your financial data"
        />
        <EmptyState
          icon={AlertIcon}
          title="Something went wrong"
          description={error}
          actionText="Try Again"
          actionOnClick={() => window.location.reload()}
        />
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Financial Overview | FinSight - Personal Finance Management"
        description="Track your expenses and manage your budget with the 50/30/20 rule"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Financial Metrics Cards */}
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <FinancialMetrics summary={summary} />
          <MonthlyExpenseChart />
        </div>

        {/* Budget Progress (50/30/20) */}
        <div className="col-span-12 xl:col-span-5">
          <BudgetProgress summary={summary} />
        </div>

        {/* Spending Velocity */}
        <div className="col-span-12">
          <SpendingVelocityChart />
        </div>

        {/* Recent Expenses */}
        <div className="col-span-12">
          <RecentExpenses />
        </div>
      </div>
    </>
  );
}
