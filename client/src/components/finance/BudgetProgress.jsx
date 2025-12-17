import Chart from "react-apexcharts";
import { useState } from "react";
import { formatCurrencyWithSign } from '../../utils/currency';
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";

export default function BudgetProgress({ summary }) {
    const [isOpen, setIsOpen] = useState(false);

    function toggleDropdown() {
        setIsOpen(!isOpen);
    }

    function closeDropdown() {
        setIsOpen(false);
    }

    if (!summary) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/[0.03] animate-pulse">
                <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
                    <div className="h-[400px]"></div>
                </div>
            </div>
        );
    }

    const { budget } = summary || {};
    const { needs = {}, wants = {}, savings = {}, status } = budget || {};

    // Calculate overall budget usage percentage
    const totalBudgetUsed = (needs.percentage || 0) + (wants.percentage || 0) + (savings.percentage || 0);
    const overallPercentage = Math.min(totalBudgetUsed, 100);

    const budgetBreakdown = [
        {
            name: "Needs",
            target: 50,
            amount: needs.amount || 0,
            percentage: needs.percentage || 0,
            color: (needs.percentage || 0) > 50 ? 'text-error-500' : 'text-success-500'
        },
        {
            name: "Wants",
            target: 30,
            amount: wants.amount || 0,
            percentage: wants.percentage || 0,
            color: (wants.percentage || 0) > 30 ? 'text-error-500' : 'text-success-500'
        },
        {
            name: "Savings",
            target: 20,
            amount: savings.amount || 0,
            percentage: savings.percentage || 0,
            color: (savings.percentage || 0) < 20 ? 'text-error-500' : 'text-success-500'
        }
    ];

    const series = [overallPercentage];
    const options = {
        colors: ["#465FFF"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "radialBar",
            height: 280,
            sparkline: {
                enabled: true,
            },
        },
        plotOptions: {
            radialBar: {
                startAngle: -85,
                endAngle: 85,
                hollow: {
                    size: "80%",
                },
                track: {
                    background: "#E4E7EC",
                    strokeWidth: "97%",
                    margin: 5,
                },
                dataLabels: {
                    name: {
                        show: false,
                    },
                    value: {
                        fontSize: "32px",
                        fontWeight: "600",
                        offsetY: -35,
                        color: "#1D2939",
                        formatter: function (val) {
                            return val.toFixed(1) + "%";
                        },
                    },
                },
            },
        },
        fill: {
            type: "solid",
            colors: ["#465FFF"],
        },
        stroke: {
            lineCap: "round",
        },
        labels: ["Budget Used"],
    };

    const getStatusBadge = () => {
        if (status === 'on_track') {
            return (
                <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-success-50 px-3 py-1 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
                    ✓ On Track
                </span>
            );
        } else if (status === 'warning') {
            return (
                <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-warning-50 px-3 py-1 text-xs font-medium text-warning-600 dark:bg-warning-500/15 dark:text-warning-500">
                    ⚠ Warning
                </span>
            );
        } else {
            return (
                <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[95%] rounded-full bg-error-50 px-3 py-1 text-xs font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500">
                    ✗ Off Track
                </span>
            );
        }
    };

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white/90 mb-1 sm:mb-2">
                Budget Progress
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
                50/30/20 Rule tracking
            </p>

            {/* Radial Progress Chart */}
            <div className="mb-4 sm:mb-6">
                <div className="relative">
                    <Chart
                        options={options}
                        series={series}
                        type="radialBar"
                        height={window.innerWidth < 640 ? 220 : 280}
                    />
                    {getStatusBadge()}
                </div>
                <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-4">
                    {status === 'on_track'
                        ? "Great job! You're managing your budget well."
                        : status === 'warning'
                            ? "Watch your spending in some categories."
                            : "You're over budget. Consider reducing expenses."}
                </p>
            </div>

            {/* Budget Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {budgetBreakdown.map((bucket) => (
                    <div key={bucket.name} className="text-center p-3 bg-gray-50 dark:bg-white/[0.02] rounded-lg sm:bg-transparent sm:p-0 sm:rounded-none">
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1">
                            {bucket.name} ({bucket.target}%)
                        </p>
                        <p className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white/90">
                            {formatCurrencyWithSign(bucket.amount)}
                        </p>
                        <p className={`text-xs sm:text-sm font-medium ${bucket.color}`}>
                            {bucket.percentage.toFixed(1)}%
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
