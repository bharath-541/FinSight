import { MoneyBagIcon, ArrowUpIcon, ArrowDownIcon } from "../../icons";
import { formatCurrencyWithSign } from '../../utils/currency';

export default function AssetsSummaryCards({ summary }) {
    if (!summary) {
        return (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
                        <div className="h-24"></div>
                    </div>
                ))}
            </div>
        );
    }

    const { totalAssets = 0, byType = {} } = summary;
    const { cash = 0, investment = 0, property = 0, other = 0 } = byType;

    const metrics = [
        {
            label: 'Total Assets',
            value: totalAssets,
            icon: <MoneyBagIcon className="fill-brand-500" />,
            bgColor: 'bg-brand-50 dark:bg-brand-500/10',
        },
        {
            label: 'Cash',
            value: cash,
            icon: <MoneyBagIcon className="fill-success-500" />,
            bgColor: 'bg-success-50 dark:bg-success-500/10',
        },
        {
            label: 'Investments',
            value: investment,
            icon: <ArrowUpIcon className="fill-blue-500" />,
            bgColor: 'bg-blue-50 dark:bg-blue-500/10',
        },
        {
            label: 'Property / Other',
            value: property + other,
            icon: <MoneyBagIcon className="fill-purple-500" />,
            bgColor: 'bg-purple-50 dark:bg-purple-500/10',
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {metrics.map((metric, index) => (
                <div
                    key={index}
                    className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]"
                >
                    <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${metric.bgColor}`}>
                        {metric.icon}
                    </div>
                    <p className="mb-1 text-sm text-gray-500 dark:text-gray-400 truncate">{metric.label}</p>
                    <p className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white/90 truncate" title={formatCurrencyWithSign(metric.value)}>
                        {formatCurrencyWithSign(metric.value)}
                    </p>
                </div>
            ))}
        </div>
    );
}
