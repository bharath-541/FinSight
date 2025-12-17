import { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import expenseService from "../../services/expense.service";

export default function SpendingVelocityChart() {
    const [dailyData, setDailyData] = useState({ dates: [], amounts: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDailySpending = async () => {
            try {
                const now = new Date();
                const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

                const expenses = await expenseService.getExpenses(currentMonth);
                const expenseArray = Array.isArray(expenses) ? expenses : [];

                if (expenseArray.length === 0) {
                    setLoading(false);
                    return;
                }

                // Group expenses by day
                const dailyTotals = {};
                expenseArray.forEach(expense => {
                    const date = new Date(expense.date);
                    const day = date.getDate();

                    if (!dailyTotals[day]) {
                        dailyTotals[day] = 0;
                    }
                    dailyTotals[day] += expense.amount;
                });

                // Get all days of current month
                const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                const dates = [];
                const amounts = [];

                for (let day = 1; day <= daysInMonth; day++) {
                    dates.push(day.toString());
                    amounts.push(dailyTotals[day] || 0);
                }

                setDailyData({ dates, amounts });
            } catch (err) {
                console.error('Error fetching daily spending:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDailySpending();
    }, []);

    const isMobile = window.innerWidth < 640;

    const options = {
        chart: {
            type: 'bar',
            height: isMobile ? 280 : 350,
            toolbar: {
                show: false
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800
            }
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: isMobile ? '90%' : '80%',
                distributed: false,
                dataLabels: {
                    position: 'top'
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        colors: ['#3b82f6'],
        xaxis: {
            categories: dailyData.dates,
            labels: {
                style: {
                    colors: '#64748b',
                    fontSize: isMobile ? '9px' : '11px'
                },
                rotate: isMobile ? -90 : -45,
                rotateAlways: false,
                showDuplicates: false,
                hideOverlappingLabels: true,
                formatter: function (value, timestamp, opts) {
                    if (isMobile && opts && opts.dataPointIndex !== undefined) {
                        const index = opts.dataPointIndex;
                        return index % 3 === 0 ? value : '';
                    }
                    return value;
                }
            },
            tickPlacement: 'on',
            title: {
                text: 'Day of Month',
                style: {
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: 500
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
            },
            title: {
                text: 'Amount Spent',
                style: {
                    color: '#64748b',
                    fontSize: '12px',
                    fontWeight: 500
                }
            }
        },
        grid: {
            borderColor: '#e2e8f0',
            strokeDashArray: 4,
            xaxis: {
                lines: {
                    show: true
                }
            }
        },
        tooltip: {
            y: {
                formatter: function (value) {
                    return '₹' + Math.round(value).toLocaleString();
                }
            },
            x: {
                formatter: function (value) {
                    const now = new Date();
                    const month = now.toLocaleDateString('en-US', { month: 'short' });
                    return `${month} ${value}`;
                }
            }
        },
        states: {
            hover: {
                filter: {
                    type: 'darken',
                    value: 0.15
                }
            }
        }
    };

    const series = [
        {
            name: 'Daily Spending',
            data: dailyData.amounts
        }
    ];

    if (loading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                    Daily Spending Pattern
                </h3>
                <div className="flex items-center justify-center h-[350px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                </div>
            </div>
        );
    }

    const totalSpent = dailyData.amounts.reduce((sum, amt) => sum + amt, 0);
    const daysWithSpending = dailyData.amounts.filter(amt => amt > 0).length;
    const avgPerDay = daysWithSpending > 0 ? totalSpent / daysWithSpending : 0;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white/90">
                        Daily Spending Pattern
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Your spending for each day this month
                    </p>
                </div>
                {daysWithSpending > 0 && (
                    <div className="flex items-center gap-2 bg-brand-50 dark:bg-brand-500/10 px-3 py-2 rounded-lg sm:bg-transparent sm:p-0 sm:flex-col sm:items-end sm:gap-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex-1 sm:flex-none">Avg per day</p>
                        <p className="text-base sm:text-sm font-semibold text-brand-600 dark:text-brand-400">
                            ₹{Math.round(avgPerDay).toLocaleString()}
                        </p>
                    </div>
                )}
            </div>

            {dailyData.amounts.length === 0 || totalSpent === 0 ? (
                <div className="flex items-center justify-center h-[350px] text-gray-400">
                    <p>No expense data for current month</p>
                </div>
            ) : (
                <ReactApexChart
                    options={options}
                    series={series}
                    type="bar"
                    height={isMobile ? 280 : 350}
                />
            )}
        </div>
    );
}
