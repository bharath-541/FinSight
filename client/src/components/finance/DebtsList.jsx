import { useState, useEffect } from 'react';
import financeService from '../../services/finance.service';
import { formatCurrencyWithSign } from '../../utils/currency';
import { Modal } from '../ui/modal';

export default function DebtsList({ debts, onUpdate, onEdit, onDelete }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paidThisMonth, setPaidThisMonth] = useState(new Set());
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Check which debts have been paid this month from backend
    useEffect(() => {
        const checkPaidDebts = async () => {
            if (!debts || debts.length === 0) return;

            try {
                const now = new Date();
                const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

                // Fetch expenses for current month
                const expenses = await financeService.getExpenses(currentMonth);
                const expenseArray = Array.isArray(expenses) ? expenses : [];

                // Find which debts have EMI payments this month
                const paidDebtIds = new Set();
                expenseArray.forEach(expense => {
                    if (expense.category === 'EMI') {
                        // Match expense note with debt name
                        debts.forEach(debt => {
                            if (expense.note && expense.note.includes(debt.name)) {
                                paidDebtIds.add(debt._id);
                            }
                        });
                    }
                });

                setPaidThisMonth(paidDebtIds);
            } catch (err) {
                console.error('Error checking paid debts:', err);
            }
        };

        checkPaidDebts();
    }, [debts]);

    if (!debts || debts.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                    Active Debts
                </h3>
                <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">No active debts 🎉</p>
                </div>
            </div>
        );
    }

    const handlePayEMIClick = (debt) => {
        setSelectedDebt(debt);
        setError(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (debtId) => {
        try {
            await onDelete(debtId);
            setDeleteConfirm(null);
            setOpenDropdown(null);
        } catch (err) {
            console.error('Error deleting debt:', err);
            alert(err.response?.data?.message || 'Failed to delete debt');
        }
    };

    const handleConfirmPayment = async () => {
        if (!selectedDebt) return;

        setLoading(true);
        setError(null);

        try {
            // Get current month
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

            const result = await financeService.payEMI(selectedDebt._id, currentMonth);

            setIsModalOpen(false);

            // Mark this debt as paid for current month
            setPaidThisMonth(prev => new Set([...prev, selectedDebt._id]));

            setSelectedDebt(null);

            // Show success toast
            setSuccessMessage(`✅ EMI Payment Successful! Paid ${formatCurrencyWithSign(selectedDebt.monthlyEMI)} for ${selectedDebt.name}. New balance: ${result.debt?.newBalance ? formatCurrencyWithSign(result.debt.newBalance) : 'Updated'}`);
            setShowSuccess(true);

            // Auto-hide after 5 seconds
            setTimeout(() => setShowSuccess(false), 5000);

            // Refresh data
            if (onUpdate) {
                onUpdate();
            }
        } catch (err) {
            console.error('Error paying EMI:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to process EMI payment';

            // Check if it's a duplicate payment error
            if (errorMessage.includes('already paid') || errorMessage.includes('duplicate')) {
                setError('EMI for this month has already been paid.');
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (debt) => {
        const isPaidOff = debt.remainingBalance <= 0;

        if (isPaidOff) {
            return (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400">
                    Paid Off
                </span>
            );
        }

        return (
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400">
                Active
            </span>
        );
    };

    return (
        <>
            {/* Success Toast */}
            {showSuccess && (
                <div className="fixed top-4 right-4 z-50 max-w-md animate-fade-in">
                    <div className="rounded-lg bg-success-50 p-4 shadow-lg dark:bg-success-500/10">
                        <div className="flex items-start">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-success-800 dark:text-success-400">
                                    {successMessage}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowSuccess(false)}
                                className="ml-3 text-success-600 hover:text-success-800 dark:text-success-400 dark:hover:text-success-300"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Active Debts
                    </h3>
                </div>

                <div className="space-y-4 p-6 pt-0">
                    {debts.map((debt) => {
                        const isPaidOff = debt.remainingBalance <= 0;

                        return (
                            <div
                                key={debt._id}
                                className="rounded-lg border border-gray-200 p-4 dark:border-gray-800"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
                                                {debt.name}
                                            </h4>
                                            {getStatusBadge(debt)}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-3 md:grid-cols-4">
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                    Remaining Balance
                                                </p>
                                                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                                                    {formatCurrencyWithSign(debt.remainingBalance)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                    Interest Rate
                                                </p>
                                                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                                                    {debt.interestRate}% p.a.
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                    Monthly EMI
                                                </p>
                                                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                                                    {formatCurrencyWithSign(debt.monthlyEMI)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                    Original Principal
                                                </p>
                                                <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                                                    {formatCurrencyWithSign(debt.principal)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ml-4 flex items-center gap-4">
                                        {/* Edit/Delete Buttons */}
                                        <button
                                            onClick={() => onEdit(debt)}
                                            className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(debt._id)}
                                            className="text-sm font-medium text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300"
                                        >
                                            Delete
                                        </button>

                                        {/* Pay EMI Button */}
                                        {!isPaidOff && (
                                            <button
                                                onClick={() => handlePayEMIClick(debt)}
                                                disabled={paidThisMonth.has(debt._id)}
                                                className={`rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${paidThisMonth.has(debt._id)
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-brand-500 hover:bg-brand-600'
                                                    }`}
                                            >
                                                {paidThisMonth.has(debt._id) ? 'Paid This Month' : 'Pay EMI'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* EMI Payment Confirmation Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-6 max-w-md mx-auto">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                        Confirm EMI Payment
                    </h3>

                    <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                        <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                            This will record an EMI payment for:
                        </p>
                        <p className="mb-1 text-base font-semibold text-gray-800 dark:text-white/90">
                            {selectedDebt?.name}
                        </p>
                        <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                            {formatCurrencyWithSign(selectedDebt?.monthlyEMI)}
                        </p>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Month: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-700 dark:bg-error-500/10 dark:text-error-400">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            disabled={loading}
                            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmPayment}
                            disabled={loading}
                            className="flex-1 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Confirm Payment'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
                <div className="p-6 max-w-md mx-auto">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                        Delete Debt?
                    </h3>
                    <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete this debt? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setDeleteConfirm(null)}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleDelete(deleteConfirm)}
                            className="flex-1 rounded-lg bg-error-500 px-4 py-2 text-sm font-medium text-white hover:bg-error-600"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
