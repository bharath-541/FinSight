import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ExpenseTable from "../../components/finance/ExpenseTable";
import ExpenseFormModal from "../../components/finance/ExpenseFormModal";
import expenseService from "../../services/expense.service";

export default function BasicTables() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseService.getExpenses(selectedMonth);
      // data is already the array of expenses from the service
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedMonth]);

  const handleAddExpense = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDeleteExpense = async (id) => {
    try {
      await expenseService.deleteExpense(id);
      await fetchExpenses(); // Refresh list
    } catch (err) {
      console.error('Error deleting expense:', err);
      alert('Failed to delete expense');
    }
  };

  const handleSaveExpense = async (expenseData) => {
    try {
      if (editingExpense) {
        await expenseService.updateExpense(editingExpense._id, expenseData);
      } else {
        await expenseService.createExpense(expenseData);
      }
      setIsModalOpen(false);
      await fetchExpenses(); // Refresh list
    } catch (err) {
      console.error('Error saving expense:', err);
      throw err; // Let modal handle error display
    }
  };

  return (
    <>
      <PageMeta
        title="Expenses | FinSight - Manage Your Spending"
        description="Track and manage all your expenses"
      />
      <PageBreadcrumb pageTitle="Expenses" />

      <div className="space-y-6">
        {/* Header with Add Button and Month Filter */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Expense Tracker
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your expenses by category and bucket
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Month Filter */}
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-11 rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-white/90"
            />

            {/* Add Expense Button */}
            <button
              onClick={handleAddExpense}
              className="inline-flex items-center justify-center sm:justify-start gap-2 h-11 px-6 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors whitespace-nowrap"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Expense
            </button>
          </div>
        </div>

        {/* Expense Table */}
        <ExpenseTable
          expenses={expenses}
          loading={loading}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
        />
      </div>

      {/* Expense Form Modal */}
      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExpense}
        expense={editingExpense}
      />
    </>
  );
}
