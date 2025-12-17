import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import expenseService from "../services/expense.service";
import { formatCurrencyWithSign } from '../utils/currency';

export default function Calendar() {
  const [expenses, setExpenses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayExpenses, setDayExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Fetch expenses for current month
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await expenseService.getExpenses(currentMonth);
        setExpenses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching expenses:', err);
      }
    };
    fetchExpenses();
  }, [currentMonth]);

  // Group expenses by date and calculate daily totals
  const getDailyTotals = () => {
    const dailyTotals = {};
    expenses.forEach(expense => {
      const date = new Date(expense.date).toISOString().split('T')[0];
      if (!dailyTotals[date]) {
        dailyTotals[date] = { total: 0, count: 0, expenses: [] };
      }
      dailyTotals[date].total += expense.amount;
      dailyTotals[date].count += 1;
      dailyTotals[date].expenses.push(expense);
    });
    return dailyTotals;
  };

  // Convert to FullCalendar events format
  const dailyTotals = getDailyTotals();
  const calendarEvents = Object.entries(dailyTotals).map(([date, data]) => {
    // Determine color based on spending amount
    let backgroundColor, borderColor;
    if (data.total < 1000) {
      backgroundColor = '#10b981'; // green
      borderColor = '#059669';
    } else if (data.total < 5000) {
      backgroundColor = '#f59e0b'; // yellow
      borderColor = '#d97706';
    } else {
      backgroundColor = '#ef4444'; // red
      borderColor = '#dc2626';
    }

    return {
      title: `${formatCurrencyWithSign(data.total)} (${data.count})`,
      start: date,
      backgroundColor,
      borderColor,
      extendedProps: {
        expenses: data.expenses,
        total: data.total,
        count: data.count
      }
    };
  });

  const handleDateClick = (info) => {
    const clickedDate = info.dateStr;
    const dateData = dailyTotals[clickedDate];

    if (dateData) {
      setSelectedDate(clickedDate);
      setDayExpenses(dateData.expenses);
      setIsModalOpen(true);
    }
  };

  const handleEventClick = (info) => {
    const event = info.event;
    setSelectedDate(event.startStr);
    setDayExpenses(event.extendedProps.expenses);
    setIsModalOpen(true);
  };

  const handleMonthChange = (info) => {
    const date = info.view.currentStart;
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(month);
  };

  const getBucketColor = (bucket) => {
    const colors = {
      needs: 'text-blue-700 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400',
      wants: 'text-yellow-700 bg-yellow-50 dark:bg-yellow-500/10 dark:text-yellow-400',
      savings: 'text-green-700 bg-green-50 dark:bg-green-500/10 dark:text-green-400',
    };
    return colors[bucket] || colors.needs;
  };

  return (
    <>
      <PageMeta
        title="Expense Timeline | FinSight - Track Your Daily Spending"
        description="Visual calendar view of your daily expenses"
      />
      <PageBreadcrumb pageTitle="Expense Timeline" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Daily Expense Tracker
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Click on any day to view detailed expenses
          </p>
        </div>

        {/* Color Legend */}
        <div className="mb-4 flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">&lt; ₹1,000</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">₹1,000 - ₹5,000</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">&gt; ₹5,000</span>
          </div>
        </div>

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek"
          }}
          events={calendarEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          datesSet={handleMonthChange}
          height="auto"
          eventDisplay="block"
        />
      </div>

      {/* Modal for Day Expenses */}
      {isModalOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Expenses for {new Date(selectedDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <span className="inline-block">{dayExpenses.length} {dayExpenses.length === 1 ? 'expense' : 'expenses'}</span>
                  <span className="inline-block"> • </span>
                  <span className="inline-block">Total: {formatCurrencyWithSign(dayExpenses.reduce((sum, exp) => sum + exp.amount, 0))}</span>
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <div className="space-y-3">
                {dayExpenses.map((expense) => (
                  <div
                    key={expense._id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-800 dark:text-white/90">
                            {expense.category}
                          </h4>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getBucketColor(expense.bucket)}`}>
                            {expense.bucket}
                          </span>
                        </div>
                        {expense.note && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {expense.note}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
                          {formatCurrencyWithSign(expense.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
