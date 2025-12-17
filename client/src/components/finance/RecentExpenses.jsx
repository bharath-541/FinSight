import { useState, useEffect } from "react";
import expenseService from "../../services/expense.service";
import { formatCurrencyWithSign } from '../../utils/currency';

export default function RecentExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const data = await expenseService.getExpenses();
                // Get only the 5 most recent - data is already an array
                const recent = Array.isArray(data) ? data.slice(0, 5) : [];
                setExpenses(recent);
            } catch (err) {
                console.error('Error fetching expenses:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();
    }, []);

    const getBucketBadge = (bucket) => {
        const styles = {
            needs: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
            wants: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400',
            savings: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
        };
        return styles[bucket] || styles.needs;
    };

    if (loading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
                <div className="h-[300px]"></div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="px-5 pt-5 pb-6 sm:px-6 sm:pt-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Recent Expenses
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Your latest transactions
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800">
                                <th className="pb-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                                <th className="pb-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Category</th>
                                <th className="pb-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Bucket</th>
                                <th className="pb-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-8 text-center text-gray-500 dark:text-gray-400">
                                        No expenses yet. Start tracking your spending!
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((expense) => (
                                    <tr key={expense._id} className="border-b border-gray-100 dark:border-gray-800">
                                        <td className="py-4 text-sm text-gray-700 dark:text-gray-300">
                                            {new Date(expense.date).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </td>
                                        <td className="py-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                                    {expense.category}
                                                </p>
                                                {expense.note && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {expense.note}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getBucketBadge(expense.bucket)}`}>
                                                {expense.bucket}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right text-sm font-semibold text-gray-800 dark:text-white/90">
                                            {formatCurrencyWithSign(expense.amount)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {expenses.length > 0 && (
                    <div className="mt-4 text-center">
                        <a
                            href="/expenses"
                            className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 font-medium"
                        >
                            View all expenses →
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
