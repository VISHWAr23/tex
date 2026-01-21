import React, { useState, useEffect } from 'react';
import {
  getSalaryAnalytics,
  getRevenueAnalytics,
  getFinancialOverview,
  getWorkerProductivity,
  getProfitMarginAnalysis,
} from '../../api/analyticsAPI';

const FinancialAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const [financialOverview, setFinancialOverview] = useState(null);
  const [salaryAnalytics, setSalaryAnalytics] = useState(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [productivityData, setProductivityData] = useState([]);
  const [profitMarginData, setProfitMarginData] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');

      const [overviewRes, salaryRes, revenueRes, productivityRes, profitRes] = await Promise.all([
        getFinancialOverview(dateRange.startDate, dateRange.endDate).catch(e => { console.error('Overview error:', e); return {}; }),
        getSalaryAnalytics(dateRange.startDate, dateRange.endDate).catch(e => { console.error('Salary error:', e); return {}; }),
        getRevenueAnalytics(dateRange.startDate, dateRange.endDate).catch(e => { console.error('Revenue error:', e); return {}; }),
        getWorkerProductivity(dateRange.startDate, dateRange.endDate).catch(e => { console.error('Productivity error:', e); return {}; }),
        getProfitMarginAnalysis(dateRange.startDate, dateRange.endDate).catch(e => { console.error('Profit error:', e); return {}; }),
      ]);

      // Handle API responses - properly access the data from each response
      // Financial Overview has: revenue, expenses, profit, profitMargin, roi, ratios, kpis
      const overview = overviewRes || {};
      setFinancialOverview({
        revenue: {
          total: overview.revenue?.total || overview.revenue?.exports || 0,
          count: overview.kpis?.avgDailyOutput || 0,
          average: overview.kpis?.revenuePerWorker || 0,
        },
        expenses: {
          total: overview.expenses?.total || 0,
          workPayments: overview.expenses?.salary || 0,
          business: overview.expenses?.operating || 0,
          home: overview.expenses?.home || 0,
        },
        profit: {
          gross: overview.profit?.gross || 0,
          operating: overview.profit?.operating || 0,
          net: overview.profit?.net || 0,
        },
        profitMargin: overview.profitMargin || 0,
      });
      
      // Salary Analytics has: total { earned, paid, amount, workers }, average, workerBreakdown
      const salary = salaryRes || {};
      setSalaryAnalytics({
        total: {
          amount: salary.total?.earned || salary.total?.amount || 0,
          count: salary.total?.workers || 0,
        },
        average: {
          amount: salary.average?.perWorker || salary.average?.earnedPerWorker || 0,
        },
        workerBreakdown: (salary.workerBreakdown || []).map(w => ({
          workerId: w.id,
          workerName: w.name,
          count: w.workDays || 0,
          totalAmount: w.totalEarned || w.totalSalary || 0,
          avgAmount: w.avgPerDay || 0,
          totalQuantity: w.totalQuantity || 0,
        })),
      });
      
      // Revenue Analytics has: total { amount, quantity, exports, companies }, average, companyBreakdown
      const revenue = revenueRes || {};
      setRevenueAnalytics({
        total: {
          amount: revenue.total?.amount || 0,
          count: revenue.total?.exports || 0,
        },
        average: {
          amount: revenue.average?.revenuePerExport || 0,
        },
        companyBreakdown: (revenue.companyBreakdown || []).map(c => ({
          companyId: c.id,
          companyName: c.name,
          count: c.exportCount || 0,
          totalItems: c.totalQuantity || 0,
          totalAmount: c.totalRevenue || 0,
          avgAmount: c.exportCount ? (c.totalRevenue / c.exportCount) : 0,
        })),
      });
      
      // Worker Productivity has: total { output, workers }, average, topPerformers
      const productivity = productivityRes || {};
      const topPerformers = productivity.topPerformers || [];
      setProductivityData(topPerformers.map(w => ({
        workerId: w.id,
        workerName: w.name,
        workCount: w.workDays || 0,
        totalQuantity: w.totalOutput || 0,
        totalAmount: w.totalEarnings || 0,
        avgAmount: w.workDays ? (w.totalEarnings / w.workDays) : 0,
        productivity: w.productivity || 0,
        efficiency: w.efficiency || 0,
      })));
      
      // Profit Margin has: gross { amount, margin }, operating { amount, margin }, net { amount, margin }
      const profit = profitRes || {};
      setProfitMarginData({
        gross: profit.gross?.margin || 0,
        operating: profit.operating?.margin || 0,
        net: profit.net?.margin || 0,
      });

    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data. Please try again.');
      setFinancialOverview({});
      setSalaryAnalytics({});
      setRevenueAnalytics({});
      setProductivityData([]);
      setProfitMarginData({});
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const setQuickRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setDateRange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
  };

  const setThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    setDateRange({
      startDate: start.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    });
  };

  const setLastMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    setDateRange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'revenue', label: 'Revenue Analysis' },
    { id: 'salary', label: 'Salary Analytics' },
    { id: 'productivity', label: 'Worker Productivity' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-surface-300 border-t-brand-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Financial Analytics</h1>
        <p className="page-subtitle">Comprehensive financial insights and performance metrics</p>
      </div>

      {/* Messages */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Date Range Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setQuickRange(7)} className="btn-ghost btn-sm">
              Last 7 Days
            </button>
            <button onClick={() => setQuickRange(30)} className="btn-ghost btn-sm">
              Last 30 Days
            </button>
            <button onClick={setThisMonth} className="btn-ghost btn-sm">
              This Month
            </button>
            <button onClick={setLastMonth} className="btn-ghost btn-sm">
              Last Month
            </button>
            <button onClick={() => setQuickRange(90)} className="btn-ghost btn-sm">
              Last 90 Days
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="form-group mb-0">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="input"
              />
            </div>
            <span className="text-surface-500">to</span>
            <div className="form-group mb-0">
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-200 overflow-x-auto bg-white">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-button ${activeTab === tab.id ? 'tab-button-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat-card">
              <p className="stat-label">Total Revenue</p>
              <p className="stat-value text-accent-emerald">{formatCurrency(financialOverview?.revenue?.total)}</p>
              <p className="text-xs text-surface-500 mt-1">From exports</p>
            </div>

            <div className="stat-card">
              <p className="stat-label">Total Work Paid</p>
              <p className="stat-value text-accent-amber">{formatCurrency(financialOverview?.expenses?.workPayments)}</p>
              <p className="text-xs text-surface-500 mt-1">Worker earnings</p>
            </div>

            <div className="stat-card">
              <p className="stat-label">Total Expenses</p>
              <p className="stat-value text-accent-rose">{formatCurrency(financialOverview?.expenses?.total)}</p>
              <p className="text-xs text-surface-500 mt-1">All expenses</p>
            </div>

            <div className="stat-card">
              <p className="stat-label">Net Profit</p>
              <p
                className={`stat-value ${
                  (financialOverview?.profit?.net || 0) >= 0 ? 'text-accent-emerald' : 'text-accent-rose'
                }`}
              >
                {formatCurrency(financialOverview?.profit?.net)}
              </p>
              <p className="text-xs text-surface-500 mt-1">Revenue - Expenses - Work</p>
            </div>
          </div>

          {/* Profit Margin Analysis */}
          {profitMarginData && typeof profitMarginData === 'object' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-surface-900 mb-4">Profit Margin Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-surface-50 border border-surface-200">
                  <p className="text-sm text-surface-500">Gross Margin</p>
                  <p className="text-2xl font-bold text-surface-900">
                    {(Number(profitMarginData.gross) || 0).toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 bg-surface-50 border border-surface-200">
                  <p className="text-sm text-surface-500">Operating Margin</p>
                  <p className="text-2xl font-bold text-surface-900">
                    {(Number(profitMarginData.operating) || 0).toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 bg-surface-50 border border-surface-200">
                  <p className="text-sm text-surface-500">Net Profit Margin</p>
                  <p
                    className={`text-2xl font-bold ${
                      (Number(profitMarginData.net) || 0) >= 0 
                        ? 'text-accent-emerald' 
                        : 'text-accent-rose'
                    }`}
                  >
                    {(Number(profitMarginData.net) || 0).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Summary Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-surface-900 mb-4">Revenue Breakdown</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-surface-100">
                  <span className="text-surface-600">Export Revenue</span>
                  <span className="font-semibold text-surface-900">
                    {formatCurrency(financialOverview?.revenue?.total)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-surface-100">
                  <span className="text-surface-600">Export Count</span>
                  <span className="font-semibold text-surface-900">{financialOverview?.revenue?.count || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-surface-600">Avg. per Export</span>
                  <span className="font-semibold text-surface-900">
                    {formatCurrency(financialOverview?.revenue?.average || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-surface-900 mb-4">Expense Breakdown</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-surface-100">
                  <span className="text-surface-600">Worker Payments</span>
                  <span className="font-semibold text-surface-900">
                    {formatCurrency(financialOverview?.expenses?.workPayments)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-surface-100">
                  <span className="text-surface-600">Business Expenses</span>
                  <span className="font-semibold text-surface-900">
                    {formatCurrency(financialOverview?.expenses?.business || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-surface-600">Home Expenses</span>
                  <span className="font-semibold text-surface-900">
                    {formatCurrency(financialOverview?.expenses?.home || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {/* Revenue Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat-card">
              <p className="stat-label">Total Revenue</p>
              <p className="stat-value text-accent-emerald">{formatCurrency(revenueAnalytics?.total?.amount)}</p>
            </div>

            <div className="stat-card">
              <p className="stat-label">Total Exports</p>
              <p className="stat-value text-brand-600">{revenueAnalytics?.total?.count || 0}</p>
            </div>

            <div className="stat-card">
              <p className="stat-label">Average Revenue</p>
              <p className="stat-value text-accent-amber">{formatCurrency(revenueAnalytics?.average?.amount)}</p>
            </div>

            <div className="stat-card">
              <p className="stat-label">Companies</p>
              <p className="stat-value text-accent-violet">{revenueAnalytics?.companyBreakdown?.length || 0}</p>
            </div>
          </div>

          {/* Company Breakdown Table */}
          <div className="table-container">
            <div className="px-6 py-4 border-b border-surface-200">
              <h2 className="text-lg font-semibold text-surface-900">Company Revenue Breakdown</h2>
            </div>

            {revenueAnalytics?.companyBreakdown && revenueAnalytics.companyBreakdown.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Exports</th>
                    <th>Total Items</th>
                    <th>Average Amount</th>
                    <th className="text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueAnalytics.companyBreakdown.map((company) => (
                    <tr key={company.companyId}>
                      <td className="font-medium text-surface-900">{company.companyName}</td>
                      <td>
                        <span className="badge badge-neutral">{company.count}</span>
                      </td>
                      <td className="text-surface-600">{company.totalItems}</td>
                      <td className="text-brand-600">{formatCurrency(company.avgAmount)}</td>
                      <td className="text-right font-semibold text-accent-emerald">
                        {formatCurrency(company.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="empty-state-title">No export data</p>
                <p className="empty-state-text">No exports found for this period</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'salary' && (
        <div className="space-y-6">
          {/* Salary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat-card">
              <p className="stat-label">Total Work Amount</p>
              <p className="stat-value text-brand-600">{formatCurrency(salaryAnalytics?.total?.amount)}</p>
            </div>

            <div className="stat-card">
              <p className="stat-label">Total Work Entries</p>
              <p className="stat-value text-accent-emerald">{salaryAnalytics?.total?.count || 0}</p>
            </div>

            <div className="stat-card">
              <p className="stat-label">Average Amount</p>
              <p className="stat-value text-accent-amber">{formatCurrency(salaryAnalytics?.average?.amount)}</p>
            </div>

            <div className="stat-card">
              <p className="stat-label">Active Workers</p>
              <p className="stat-value text-accent-violet">{salaryAnalytics?.workerBreakdown?.length || 0}</p>
            </div>
          </div>

          {/* Worker Salary Table */}
          <div className="table-container">
            <div className="px-6 py-4 border-b border-surface-200">
              <h2 className="text-lg font-semibold text-surface-900">Worker Salary Summary</h2>
            </div>

            {salaryAnalytics?.workerBreakdown && salaryAnalytics.workerBreakdown.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Work Entries</th>
                    <th>Total Amount</th>
                    <th>Avg Amount</th>
                    <th>Total Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryAnalytics.workerBreakdown.map((worker) => (
                    <tr key={worker.workerId}>
                      <td className="font-medium text-surface-900">{worker.workerName}</td>
                      <td>
                        <span className="badge badge-neutral">{worker.count}</span>
                      </td>
                      <td className="text-accent-emerald">{formatCurrency(worker.totalAmount)}</td>
                      <td className="text-brand-600">{formatCurrency(worker.avgAmount)}</td>
                      <td className="text-surface-600">{worker.totalQuantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="empty-state-title">No salary data</p>
                <p className="empty-state-text">No worker salary data for this period</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'productivity' && (
        <div className="space-y-6">
          {/* Productivity Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="stat-card">
              <p className="stat-label">Top Performers</p>
              <p className="stat-value text-brand-600">{productivityData?.length || 0}</p>
            </div>

            <div className="stat-card">
              <p className="stat-label">Total Work Entries</p>
              <p className="stat-value text-accent-violet">
                {productivityData?.reduce((sum, w) => sum + (w.workCount || 0), 0) || 0}
              </p>
            </div>

            <div className="stat-card">
              <p className="stat-label">Total Output Value</p>
              <p className="stat-value text-accent-emerald">
                {formatCurrency(productivityData?.reduce((sum, w) => sum + (w.totalAmount || 0), 0))}
              </p>
            </div>
          </div>

          {/* Productivity Table */}
          <div className="table-container">
            <div className="px-6 py-4 border-b border-surface-200">
              <h2 className="text-lg font-semibold text-surface-900">Top Worker Productivity</h2>
            </div>

            {productivityData && productivityData.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Worker</th>
                    <th>Work Entries</th>
                    <th>Total Quantity</th>
                    <th>Avg Amount</th>
                    <th className="text-right">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {productivityData.map((worker, index) => (
                    <tr key={worker.workerId}>
                      <td>
                        <span className={`badge ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'badge-neutral'
                        }`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td className="font-medium text-surface-900">{worker.workerName}</td>
                      <td>
                        <span className="badge badge-neutral">{worker.workCount}</span>
                      </td>
                      <td className="text-surface-600">{worker.totalQuantity || 0}</td>
                      <td className="text-brand-600">{formatCurrency(worker.avgAmount)}</td>
                      <td className="text-right font-semibold text-accent-emerald">
                        {formatCurrency(worker.totalAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="empty-state-title">No productivity data</p>
                <p className="empty-state-text">No worker productivity data for this period</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialAnalytics;
