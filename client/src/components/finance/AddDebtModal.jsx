import { useState, useEffect } from "react";

export default function AddDebtModal({ isOpen, onClose, onSave, debt }) {
    const [formData, setFormData] = useState({
        name: "",
        principal: "",
        remainingBalance: "",
        interestRate: "",
        monthlyEMI: "",
        description: ""
    });
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    // Populate form when editing or reset when adding
    useEffect(() => {
        if (isOpen) {
            if (debt) {
                // Editing existing debt
                setFormData({
                    name: debt.name,
                    principal: debt.principal.toString(),
                    remainingBalance: debt.remainingBalance.toString(),
                    interestRate: debt.interestRate.toString(),
                    monthlyEMI: debt.monthlyEMI.toString(),
                    description: debt.description || ""
                });
            } else {
                // Adding new debt
                setFormData({
                    name: "",
                    principal: "",
                    remainingBalance: "",
                    interestRate: "",
                    monthlyEMI: "",
                    description: ""
                });
            }
            setError("");
        }
    }, [isOpen, debt]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!formData.name || formData.name.trim().length === 0) {
            setError("Please enter a debt name");
            return;
        }
        if (formData.name.length > 100) {
            setError("Debt name must be less than 100 characters");
            return;
        }
        if (!formData.principal || parseFloat(formData.principal) <= 0) {
            setError("Please enter a valid principal amount");
            return;
        }
        if (!formData.remainingBalance || parseFloat(formData.remainingBalance) < 0) {
            setError("Please enter a valid remaining balance");
            return;
        }
        if (parseFloat(formData.remainingBalance) > parseFloat(formData.principal)) {
            setError("Remaining balance cannot be greater than principal");
            return;
        }
        if (!formData.interestRate || parseFloat(formData.interestRate) < 0 || parseFloat(formData.interestRate) > 100) {
            setError("Please enter a valid interest rate (0-100%)");
            return;
        }
        if (!formData.monthlyEMI || parseFloat(formData.monthlyEMI) <= 0) {
            setError("Please enter a valid monthly EMI amount");
            return;
        }

        try {
            setSaving(true);

            // Round amounts to whole rupees
            const debtData = {
                name: formData.name.trim(),
                principal: Math.round(parseFloat(formData.principal)),
                remainingBalance: Math.round(parseFloat(formData.remainingBalance)),
                interestRate: parseFloat(formData.interestRate),
                monthlyEMI: Math.round(parseFloat(formData.monthlyEMI)),
                description: formData.description.trim() || undefined
            };

            await onSave(debtData);
            onClose();
        } catch (err) {
            console.error("Error saving debt:", err);
            setError(err.response?.data?.message || "Failed to save debt");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-999999 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30"
                onClick={() => !saving && onClose()}
            ></div>

            {/* Modal - Scrollable for small screens */}
            <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                        {debt ? 'Edit Debt' : 'Add New Debt'}
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Debt Name */}
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Debt Name <span className="text-error-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Home Loan, Car Loan"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            disabled={saving}
                        />
                    </div>

                    {/* Principal Amount */}
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Original Principal (₹) <span className="text-error-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.principal}
                            onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                            placeholder="3500000"
                            min="0"
                            step="1"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            disabled={saving}
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">The total loan amount you borrowed</p>
                    </div>

                    {/* Remaining Balance */}
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Remaining Balance (₹) <span className="text-error-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.remainingBalance}
                            onChange={(e) => setFormData({ ...formData, remainingBalance: e.target.value })}
                            placeholder="2800000"
                            min="0"
                            step="1"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            disabled={saving}
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">How much you still owe</p>
                    </div>

                    {/* Interest Rate */}
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Interest Rate (% per annum) <span className="text-error-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.interestRate}
                            onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                            placeholder="8.5"
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            disabled={saving}
                        />
                    </div>

                    {/* Monthly EMI */}
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Monthly EMI (₹) <span className="text-error-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.monthlyEMI}
                            onChange={(e) => setFormData({ ...formData, monthlyEMI: e.target.value })}
                            placeholder="35000"
                            min="0"
                            step="1"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            disabled={saving}
                        />
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description (Optional)
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Additional notes about this debt..."
                            rows="3"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            disabled={saving}
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-700 dark:bg-error-500/10 dark:text-error-400">
                            {error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                        >
                            {saving ? "Saving..." : (debt ? "Update Debt" : "Add Debt")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
