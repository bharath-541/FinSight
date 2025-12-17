import { useState } from 'react';
import { formatCurrencyWithSign } from '../../utils/currency';
import { Modal } from '../ui/modal';

export default function AssetsTable({ assets, onEdit, onDelete }) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const handleDelete = async (assetId) => {
        await onDelete(assetId);
        setDeleteConfirm(null);
    };

    if (!assets || assets.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                    Assets List
                </h3>
                <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">No assets added yet</p>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getTypeLabel = (type) => {
        const labels = {
            cash: 'Cash',
            investment: 'Investment',
            property: 'Property',
            other: 'Other'
        };
        return labels[type] || type;
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                    Assets List
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-t border-gray-200 dark:border-gray-800">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                Type
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                                Current Value
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                Last Updated
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((asset, index) => (
                            <tr
                                key={asset._id}
                                className={`border-t border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02] ${index === assets.length - 1 ? '' : ''
                                    }`}
                            >
                                <td className="px-6 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                                    {asset.name}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                        {getTypeLabel(asset.type)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-semibold text-gray-800 dark:text-white/90">
                                    {formatCurrencyWithSign(asset.currentValue)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(asset.updatedAt)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <button
                                            onClick={() => onEdit(asset)}
                                            className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(asset._id)}
                                            className="text-sm font-medium text-error-600 hover:text-error-700 dark:text-error-400 dark:hover:text-error-300"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
                <div className="p-6 max-w-md mx-auto">
                    <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                        Delete Asset?
                    </h3>
                    <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                        Are you sure you want to delete this asset? This action cannot be undone.
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
        </div>
    );
}
