import { useState, useEffect } from "react";
import summaryService from "../../services/summary.service";
import PageMeta from "../../components/common/PageMeta";

// Import finance components
import FinancialMetrics from "../../components/finance/FinancialMetrics";
import MonthlyExpenseChart from "../../components/finance/MonthlyExpenseChart";
import BudgetProgress from "../../components/finance/BudgetProgress";
import SpendingVelocityChart from "../../components/finance/SpendingVelocityChart";
import RecentExpenses from "../../components/finance/RecentExpenses";

export default function Home() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        // Get current month in YYYY-MM format
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const data = await summaryService.getSummary(currentMonth);
        setSummary(data);
      } catch (err) {
        console.error('Error fetching summary:', err);
        setError(err.message);
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

  if (error) {
    return (
      <div className="p-4 text-error-700 bg-error-50 rounded-lg dark:bg-error-500/10 dark:text-error-400">
        <p className="font-semibold">Error loading financial data</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
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
