import { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import expenseService from "../../services/expense.service";

export default function MonthlyExpenseChart() {
    const [chartData, setChartData] = useState({ categories: [], data: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMonthlyData = async () => {
            try {
                // Get last 6 months of expense data
                const monthsData = [];
                const now = new Date();

                for (let i = 5; i >= 0; i--) {
                    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                    try {
                        const expenses = await expenseService.getExpenses(monthStr);
                        const total = Array.isArray(expenses)
                            ? expenses.reduce((sum, exp) => sum + exp.amount, 0)
                            : 0;

                        monthsData.push({
                            month: date.toLocaleDateString('en-US', { month: 'short' }),
                            total
                        });
                    } catch (err) {
                        // If month has no data, add 0
                        monthsData.push({
                            month: date.toLocaleDateString('en-US', { month: 'short' }),
                            total: 0
                        });
                    }
                }

                setChartData({
                    categories: monthsData.map(m => m.month),
                    data: monthsData.map(m => m.total)
                });
            } catch (err) {
                console.error('Error fetching monthly data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMonthlyData();
    }, []);

    const options = {
        chart: {
            type: 'area',
            height: 350,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        colors: ['#3b82f6'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 90, 100]
            }
        },
        xaxis: {
            categories: chartData.categories,
            labels: {
                style: {
                    colors: '#64748b',
                    fontSize: '12px'
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#64748b',
                    fontSize: '12px'
                },
                formatter: function (value) {
                    return '₹' + Math.round(value).toLocaleString();
                }
            }
        },
        grid: {
            borderColor: '#e2e8f0',
            strokeDashArray: 4
        },
        tooltip: {
            y: {
                formatter: function (value) {
                    return '₹' + Math.round(value).toLocaleString();
                }
            }
        }
    };

    const series = [
        {
            name: 'Monthly Spending',
            data: chartData.data
        }
    ];

    if (loading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                    Monthly Expense Trend
                </h3>
                <div className="flex items-center justify-center h-[350px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                Monthly Expense Trend
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Your spending over the last 6 months
            </p>
            <ReactApexChart
                options={options}
                series={series}
                type="area"
                height={350}
            />
        </div>
    );
}
