import { useState, useEffect } from "react";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import userService from "../services/user.service";
import { useAuth } from "../context/AuthContext";

export default function UserProfiles() {
  const { user: authUser } = useAuth();
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile();
        console.log('Profile API Response:', data); // Debug log

        // Handle different possible response structures
        let income = 0;
        if (data.user?.monthlyIncome !== undefined) {
          income = data.user.monthlyIncome;
        } else if (data.monthlyIncome !== undefined) {
          income = data.monthlyIncome;
        }

        console.log('Extracted income:', income); // Debug log
        setMonthlyIncome(income.toString());
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateIncome = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const incomeValue = parseFloat(monthlyIncome);
    if (isNaN(incomeValue) || incomeValue < 0) {
      setError("Please enter a valid income amount");
      return;
    }

    try {
      setSaving(true);
      await userService.updateIncome(incomeValue);
      setSuccess("Monthly income updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update income");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Profile & Income | FinSight - Personal Finance Management"
        description="Manage your profile and set your monthly income"
      />
      <PageBreadcrumb pageTitle="Profile & Income" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
            Profile Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Name
              </label>
              <p className="text-base text-gray-800 dark:text-white/90">
                {authUser?.name || "User"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Email
              </label>
              <p className="text-base text-gray-800 dark:text-white/90">
                {authUser?.email || "email@example.com"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Account Status
              </label>
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Income Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
            Monthly Income
          </h3>

          <form onSubmit={handleUpdateIncome} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-error-700 bg-error-50 rounded-lg dark:bg-error-500/10 dark:text-error-400">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 text-sm text-success-700 bg-success-50 rounded-lg dark:bg-success-500/10 dark:text-success-400">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Set Your Monthly Income
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                This is used to calculate your 50/30/20 budget breakdown
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-lg">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 text-lg rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
                50/30/20 Budget Rule
              </h4>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                <li>• 50% for Needs (₹{((parseFloat(monthlyIncome) || 0) * 0.5).toLocaleString('en-IN')})</li>
                <li>• 30% for Wants (₹{((parseFloat(monthlyIncome) || 0) * 0.3).toLocaleString('en-IN')})</li>
                <li>• 20% for Savings (₹{((parseFloat(monthlyIncome) || 0) * 0.2).toLocaleString('en-IN')})</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving}
            >
              {saving ? "Updating..." : "Update Income"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
