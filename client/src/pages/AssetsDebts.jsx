import { useState, useEffect } from 'react';
import PageMeta from '../components/common/PageMeta';
import financeService from '../services/finance.service';
import AssetsSummaryCards from '../components/finance/AssetsSummaryCards';
import AssetsTable from '../components/finance/AssetsTable';
import DebtsSummaryCards from '../components/finance/DebtsSummaryCards';
import DebtsList from '../components/finance/DebtsList';
import AddAssetModal from '../components/finance/AddAssetModal';
import AddDebtModal from '../components/finance/AddDebtModal';
import { formatCurrencyWithSign } from '../utils/currency';

export default function AssetsDebts() {
    const [assets, setAssets] = useState(null);
    const [debts, setDebts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddAsset, setShowAddAsset] = useState(false);
    const [showAddDebt, setShowAddDebt] = useState(false);
    const [editAsset, setEditAsset] = useState(null);
    const [editDebt, setEditDebt] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [assetsData, debtsData] = await Promise.all([
                financeService.getAssets(),
                financeService.getDebts(),
            ]);

            setAssets(assetsData);
            setDebts(debtsData);
        } catch (err) {
            console.error('Error fetching financial data:', err);
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAsset = async (assetData) => {
        await financeService.createAsset(assetData);
        fetchData(); // Refresh data
    };

    const handleCreateDebt = async (debtData) => {
        await financeService.createDebt(debtData);
        fetchData(); // Refresh data
    };

    const handleUpdateAsset = async (assetData) => {
        await financeService.updateAsset(editAsset._id, assetData);
        setEditAsset(null);
        fetchData();
    };

    const handleUpdateDebt = async (debtData) => {
        await financeService.updateDebt(editDebt._id, debtData);
        setEditDebt(null);
        fetchData();
    };

    const handleDeleteAsset = async (assetId) => {
        await financeService.deleteAsset(assetId);
        fetchData();
    };

    const handleDeleteDebt = async (debtId) => {
        await financeService.deleteDebt(debtId);
        fetchData();
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-error-700 bg-error-50 rounded-lg dark:bg-error-500/10 dark:text-error-400">
                <p className="font-semibold">Error loading financial data</p>
                <p className="text-sm mt-1">{error}</p>
            </div>
        );
    }

    // API returns { count, summary, data: [...] }
    // Handle both array and object responses
    let assetsSummary = assets?.summary || null;
    const assetsList = Array.isArray(assets?.data)
        ? assets.data
        : Array.isArray(assets)
            ? assets
            : [];

    let debtsSummary = debts?.summary || null;
    const debtsList = Array.isArray(debts?.data)
        ? debts.data
        : Array.isArray(debts)
            ? debts
            : [];

    // Calculate summaries client-side if not provided by API
    if (!assetsSummary && assetsList.length > 0) {
        const totalAssets = assetsList.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);
        const byType = assetsList.reduce((acc, asset) => {
            const type = asset.type || 'other';
            acc[type] = (acc[type] || 0) + (asset.currentValue || 0);
            return acc;
        }, {});

        assetsSummary = {
            totalAssets,
            byType: {
                cash: byType.cash || 0,
                investment: byType.investment || 0,
                property: byType.property || 0,
                other: byType.other || 0,
            }
        };
    }

    if (!debtsSummary && debtsList.length > 0) {
        const totalRemainingBalance = debtsList.reduce((sum, debt) => sum + (debt.remainingBalance || 0), 0);
        const totalMonthlyEMI = debtsList.reduce((sum, debt) => sum + (debt.monthlyEMI || 0), 0);
        const debtCount = debtsList.filter(d => d.remainingBalance > 0).length;

        debtsSummary = {
            totalRemainingBalance,
            totalMonthlyEMI,
            debtCount
        };
    }

    // Calculate Net Worth
    const totalAssets = assetsSummary?.totalAssets || 0;
    const totalDebts = debtsSummary?.totalRemainingBalance || 0;
    const netWorth = totalAssets - totalDebts;

    console.log('Assets data:', { assetsSummary, assetsList });
    console.log('Debts data:', { debtsSummary, debtsList });
    console.log('Net Worth:', netWorth);

    return (
        <>
            <PageMeta
                title="Assets & Debts | FinSight - Personal Finance Management"
                description="Track your assets and manage debts with FinSight"
            />

            <div className="grid grid-cols-12 gap-4 md:gap-6">
                {/* Net Worth Card */}
                <div className="col-span-12">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">Net Worth</p>
                                <p className={`text-3xl font-bold ${netWorth >= 0 ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'}`}>
                                    {formatCurrencyWithSign(Math.abs(netWorth))}
                                    {netWorth < 0 && ' (Negative)'}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Assets: {formatCurrencyWithSign(totalAssets)} - Debts: {formatCurrencyWithSign(totalDebts)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Assets Section */}
                <div className="col-span-12">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Assets
                        </h2>
                        <button
                            onClick={() => setShowAddAsset(true)}
                            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                        >
                            + Add Asset
                        </button>
                    </div>
                    <AssetsSummaryCards summary={assetsSummary} />
                </div>

                <div className="col-span-12">
                    <AssetsTable
                        assets={assetsList}
                        onEdit={(asset) => setEditAsset(asset)}
                        onDelete={handleDeleteAsset}
                    />
                </div>

                {/* Debts Section */}
                <div className="col-span-12 mt-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Debts
                        </h2>
                        <button
                            onClick={() => setShowAddDebt(true)}
                            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                        >
                            + Add Debt
                        </button>
                    </div>
                    <DebtsSummaryCards summary={debtsSummary} />
                </div>

                <div className="col-span-12">
                    <DebtsList
                        debts={debtsList}
                        onUpdate={fetchData}
                        onEdit={(debt) => setEditDebt(debt)}
                        onDelete={handleDeleteDebt}
                    />
                </div>
            </div>

            {/* Modals */}
            <AddAssetModal
                isOpen={showAddAsset || !!editAsset}
                onClose={() => {
                    setShowAddAsset(false);
                    setEditAsset(null);
                }}
                onSave={editAsset ? handleUpdateAsset : handleCreateAsset}
                asset={editAsset}
            />
            <AddDebtModal
                isOpen={showAddDebt || !!editDebt}
                onClose={() => {
                    setShowAddDebt(false);
                    setEditDebt(null);
                }}
                onSave={editDebt ? handleUpdateDebt : handleCreateDebt}
                debt={editDebt}
            />
        </>
    );
}
