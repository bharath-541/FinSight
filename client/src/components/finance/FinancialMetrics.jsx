import { DollarLineIcon, ArrowUpIcon, ArrowDownIcon } from "../../icons";
import { formatCurrencyWithSign, formatSignedCurrency } from '../../utils/currency';
export default function FinancialMetrics({ summary }) {
    if (!summary) {
        return (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
                        <div className="h-24"></div>
                    </div>
                ))}
            </div>
        );
    }

    const { budget, insights } = summary || {};
    const { income = 0, totalSpent = 0, status } = budget || {};
    const { remainingCash: backendRemainingCash } = insights || {};

    // Use backend remainingCash if available, otherwise calculate it
    const remainingCash = backendRemainingCash !== undefined
        ? backendRemainingCash
        : income - totalSpent;

    // Determine label and styling based on remaining cash
    const getRemainingBalanceLabel = () => {
        if (remainingCash > 0) return 'Available balance';
        if (remainingCash === 0) return 'Break-even';
        return 'Overspent this month';
    };

    const getRemainingBalanceColor = () => {
        if (remainingCash > 0) return 'text-success-700 dark:text-success-400';
        if (remainingCash === 0) return 'text-gray-700 dark:text-gray-400';
        return 'text-error-700 dark:text-error-400';
    };

    const getRemainingBalanceIconColor = () => {
        if (remainingCash > 0) return 'fill-success-500';
        if (remainingCash === 0) return 'fill-gray-500';
        return 'fill-error-500';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'on_track':
                return 'text-success-600 bg-success-50 dark:bg-success-500/10 dark:text-success-400';
            case 'warning':
                return 'text-warning-600 bg-warning-50 dark:bg-warning-500/10 dark:text-warning-400';
            case 'off_track':
                return 'text-error-600 bg-error-50 dark:bg-error-500/10 dark:text-error-400';
            default:
                return 'text-gray-600 bg-gray-50 dark:bg-gray-500/10 dark:text-gray-400';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'on_track':
                return '✓ On Track';
            case 'warning':
                return '⚠ Warning';
            case 'off_track':
                return '✗ Off Track';
            default:
                return 'Unknown';
        }
    };

    const metrics = [
        {
            title: "Monthly Income",
            value: formatCurrencyWithSign(income),
            icon: (
                <svg className="size-10 fill-brand-500" viewBox="0 0 24 24">
                    <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
            ),
            trend: null,
        },
        {
            title: "Total Spent",
            value: formatCurrencyWithSign(totalSpent),
            icon: (
                <svg className="size-10 fill-error-500" viewBox="0 0 24 24">
                    <path d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9-1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-6v11c0 1.1-.9 2-2 2H4v-2h17V7h2z" />
                </svg>
            ),
            trend: null,
        },
        {
            title: "Remaining Balance",
            value: formatSignedCurrency(remainingCash),
            valueColor: getRemainingBalanceColor(),
            helperText: "Income − Total Spent",
            icon: (
                <svg className={`size-10 ${getRemainingBalanceIconColor()}`} viewBox="0 0 24 24">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                </svg>
            ),
            badge: getRemainingBalanceLabel(),
            badgeColor: remainingCash > 0
                ? 'text-success-600 bg-success-50 dark:bg-success-500/10 dark:text-success-400'
                : remainingCash === 0
                    ? 'text-gray-600 bg-gray-50 dark:bg-gray-500/10 dark:text-gray-400'
                    : 'text-error-600 bg-error-50 dark:bg-error-500/10 dark:text-error-400',
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {metrics.map((metric, index) => (
                <div
                    key={index}
                    className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] hover:shadow-lg transition-shadow"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {metric.title}
                            </p>
                            <h3 className={`mt-2 text-2xl font-semibold ${metric.valueColor || 'text-gray-800 dark:text-white/90'}`}>
                                {metric.value}
                            </h3>
                            {metric.helperText && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {metric.helperText}
                                </p>
                            )}
                            {metric.badge && (
                                <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${metric.badgeColor}`}>
                                    {metric.badge}
                                </span>
                            )}
                        </div>
                        <div className="ml-4">
                            {metric.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
