import { useState, useEffect } from "react";

const ASSET_TYPES = [
    { value: "cash", label: "Cash" },
    { value: "investment", label: "Investment" },
    { value: "property", label: "Property" },
    { value: "other", label: "Other" }
];

export default function AddAssetModal({ isOpen, onClose, onSave, asset }) {
    const [formData, setFormData] = useState({
        name: "",
        type: "cash",
        currentValue: "",
        description: ""
    });
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    // Populate form when editing or reset when adding
    useEffect(() => {
        if (isOpen) {
            if (asset) {
                // Editing existing asset
                setFormData({
                    name: asset.name,
                    type: asset.type,
                    currentValue: asset.currentValue.toString(),
                    description: asset.description || ""
                });
            } else {
                // Adding new asset
                setFormData({
                    name: "",
                    type: "cash",
                    currentValue: "",
                    description: ""
                });
            }
            setError("");
        }
    }, [isOpen, asset]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (!formData.name || formData.name.trim().length === 0) {
            setError("Please enter an asset name");
            return;
        }
        if (formData.name.length > 100) {
            setError("Asset name must be less than 100 characters");
            return;
        }
        if (!formData.currentValue || parseFloat(formData.currentValue) <= 0) {
            setError("Please enter a valid amount greater than 0");
            return;
        }

        try {
            setSaving(true);

            // Round to whole rupees
            const assetData = {
                name: formData.name.trim(),
                type: formData.type,
                currentValue: Math.round(parseFloat(formData.currentValue)),
                description: formData.description.trim() || undefined
            };

            await onSave(assetData);
            onClose();
        } catch (err) {
            console.error("Error saving asset:", err);
            setError(err.response?.data?.message || "Failed to save asset");
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

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                        {asset ? 'Edit Asset' : 'Add New Asset'}
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
                    {/* Asset Name */}
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Asset Name <span className="text-error-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Savings Account, Apartment"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            disabled={saving}
                        />
                    </div>

                    {/* Asset Type */}
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Type <span className="text-error-500">*</span>
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            disabled={saving}
                        >
                            {ASSET_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Current Value */}
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Current Value (₹) <span className="text-error-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.currentValue}
                            onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                            placeholder="150000"
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
                            placeholder="Additional notes about this asset..."
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
                            {saving ? "Saving..." : (asset ? "Update Asset" : "Add Asset")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
