import { useState, useEffect } from "react";
import { Modal } from "../ui/modal";

const CATEGORIES = [
    "Groceries",
    "Rent",
    "Utilities",
    "Transportation",
    "Healthcare",
    "Insurance",
    "Entertainment",
    "Dining Out",
    "Shopping",
    "Education",
    "Savings",
    "Investment",
    "Debt Payment",
    "Other"
];

const BUCKETS = [
    { value: "needs", label: "Needs (50%)", description: "Essential expenses" },
    { value: "wants", label: "Wants (30%)", description: "Non-essential spending" },
    { value: "savings", label: "Savings (20%)", description: "Savings & investments" }
];

export default function ExpenseFormModal({ isOpen, onClose, onSave, expense }) {
    const [formData, setFormData] = useState({
        amount: "",
        category: "",
        bucket: "needs",
        note: "",
        date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD
    });
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    // Populate form when editing
    useEffect(() => {
        if (expense) {
            setFormData({
                amount: expense.amount.toString(),
                category: expense.category,
                bucket: expense.bucket,
                note: expense.note || "",
                date: new Date(expense.date).toISOString().split('T')[0]
            });
        } else {
            // Reset form for new expense
            setFormData({
                amount: "",
                category: "",
                bucket: "needs",
                note: "",
                date: new Date().toISOString().split('T')[0]
            });
        }
        setError("");
    }, [expense, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            setError("Please enter a valid amount");
            return;
        }
        if (!formData.category) {
            setError("Please select a category");
            return;
        }
        if (!formData.date) {
            setError("Please select a date");
            return;
        }

        try {
            setSaving(true);
            await onSave({
                amount: parseFloat(formData.amount),
                category: formData.category,
                bucket: formData.bucket,
                note: formData.note,
                date: formData.date
            });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save expense");
            setSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="relative w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl dark:bg-gray-900">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                        {expense ? 'Edit Expense' : 'Add New Expense'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {expense ? "Update your expense details" : "Track a new expense"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-error-700 bg-error-50 rounded-lg dark:bg-error-500/10 dark:text-error-400">
                            {error}
                        </div>
                    )}

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Amount <span className="text-error-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                                ₹
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.amount}
                                onChange={(e) => handleInputChange("amount", e.target.value)}
                                className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category <span className="text-error-500">*</span>
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => handleInputChange("category", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                            required
                        >
                            <option value="">Select a category</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Bucket */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Bucket <span className="text-error-500">*</span>
                        </label>
                        <div className="space-y-1.5">
                            {BUCKETS.map(bucket => (
                                <label
                                    key={bucket.value}
                                    className={`flex items-center px-3 py-2 rounded-lg border-2 cursor-pointer transition-all ${formData.bucket === bucket.value
                                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="bucket"
                                        value={bucket.value}
                                        checked={formData.bucket === bucket.value}
                                        onChange={(e) => handleInputChange("bucket", e.target.value)}
                                        className="text-brand-600 focus:ring-brand-500"
                                    />
                                    <div className="ml-3 flex-1">
                                        <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {bucket.label}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                            {bucket.description}
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Date <span className="text-error-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleInputChange("date", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                            required
                        />
                    </div>

                    {/* Note (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Note (optional)
                        </label>
                        <textarea
                            value={formData.note}
                            onChange={(e) => handleInputChange("note", e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all resize-none"
                            placeholder="Add any additional details..."
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : expense ? "Update" : "Add Expense"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
