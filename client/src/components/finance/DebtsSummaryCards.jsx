import { MoneyBagIcon, ArrowDownIcon } from "../../icons";
import { formatCurrencyWithSign } from '../../utils/currency';

export default function DebtsSummaryCards({ summary }) {
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

    const {
        totalRemainingBalance = 0,
        totalMonthlyEMI = 0,
        debtCount = 0,
    } = summary;

    const metrics = [
        {
            label: 'Total Remaining Balance',
            value: totalRemainingBalance,
            icon: <ArrowDownIcon className="fill-error-500" />,
            bgColor: 'bg-error-50 dark:bg-error-500/10',
        },
        {
            label: 'Total Monthly EMI',
            value: totalMonthlyEMI,
            icon: <MoneyBagIcon className="fill-warning-500" />,
            bgColor: 'bg-warning-50 dark:bg-warning-500/10',
        },
        {
            label: 'Active Debts',
            value: debtCount,
            icon: <MoneyBagIcon className="fill-gray-500" />,
            bgColor: 'bg-gray-100 dark:bg-gray-800',
            isCount: true,
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
            {metrics.map((metric, index) => (
                <div
                    key={index}
                    className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]"
                >
                    <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${metric.bgColor}`}>
                        {metric.icon}
                    </div>
                    <p className="mb-1 text-sm text-gray-500 dark:text-gray-400 truncate">{metric.label}</p>
                    <p className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white/90 truncate" title={metric.isCount ? metric.value : formatCurrencyWithSign(metric.value)}>
                        {metric.isCount ? metric.value : formatCurrencyWithSign(metric.value)}
                    </p>
                </div>
            ))}
        </div>
    );
}
