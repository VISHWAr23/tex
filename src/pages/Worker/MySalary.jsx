import React, { useState, useEffect } from 'react';
import { getWorkStatistics, getAttendanceSummary } from '../../api/workAPI';

const MySalary = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentMonthStats, setCurrentMonthStats] = useState(null);
  const [lastMonthStats, setLastMonthStats] = useState(null);
  const [yearStats, setYearStats] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const now = new Date();

      // Current month dates
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      // Last month dates
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

      // Year to date
      const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];

      const [currentStats, lastStats, yearToDateStats, attendance] = await Promise.all([
        getWorkStatistics(null, currentMonthStart, currentMonthEnd),
        getWorkStatistics(null, lastMonthStart, lastMonthEnd),
        getWorkStatistics(null, yearStart, currentMonthEnd),
        getAttendanceSummary(currentMonthStart, currentMonthEnd),
      ]);

      setCurrentMonthStats(currentStats);
      setLastMonthStats(lastStats);
      setYearStats(yearToDateStats);
      setAttendanceSummary(attendance);

      // Generate monthly breakdown from work data
      if (yearToDateStats?.dailyBreakdown) {
        const monthlyData = {};
        yearToDateStats.dailyBreakdown.forEach((day) => {
          const monthKey = new Date(day.date).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
          });
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { earnings: 0, days: 0, quantity: 0 };
          }
          monthlyData[monthKey].earnings += day._sum.totalAmount || 0;
          monthlyData[monthKey].quantity += day._sum.quantity || 0;
          monthlyData[monthKey].days += 1;
        });
        setMonthlyBreakdown(
          Object.entries(monthlyData).map(([month, data]) => ({
            month,
            ...data,
          }))
        );
      }

      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch salary data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

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
        <h1 className="page-title">My Salary</h1>
        <p className="page-subtitle">View your earnings and payment summary</p>
      </div>

      {/* Messages */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="stat-label">Current Month</p>
          <p className="stat-value text-brand-600">{formatCurrency(currentMonthStats?.summary?.totalEarnings)}</p>
          <p className="text-xs text-surface-500 mt-1">{currentMonthStats?.summary?.totalRecords || 0} days worked</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">Last Month</p>
          <p className="stat-value text-accent-emerald">{formatCurrency(lastMonthStats?.summary?.totalEarnings)}</p>
          <p className="text-xs text-surface-500 mt-1">{lastMonthStats?.summary?.totalRecords || 0} days worked</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">Year to Date</p>
          <p className="stat-value text-accent-violet">{formatCurrency(yearStats?.summary?.totalEarnings)}</p>
          <p className="text-xs text-surface-500 mt-1">{yearStats?.summary?.totalRecords || 0} days worked</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">Avg per Day</p>
          <p className="stat-value text-accent-amber">{formatCurrency(currentMonthStats?.summary?.averageEarning)}</p>
          <p className="text-xs text-surface-500 mt-1">This month average</p>
        </div>
      </div>

      {/* Attendance & Work Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Summary */}
        <div className="card">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">This Month's Attendance</h2>
          {attendanceSummary && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 border border-emerald-100">
                  <p className="text-2xl font-bold text-accent-emerald">{attendanceSummary.summary?.presentDays || 0}</p>
                  <p className="text-xs text-surface-500">Present</p>
                </div>
                <div className="p-4 bg-rose-50 border border-rose-100">
                  <p className="text-2xl font-bold text-accent-rose">{attendanceSummary.summary?.absentDays || 0}</p>
                  <p className="text-xs text-surface-500">Absent</p>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-100">
                  <p className="text-2xl font-bold text-accent-amber">{attendanceSummary.summary?.halfDays || 0}</p>
                  <p className="text-xs text-surface-500">Half Days</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-100">
                  <p className="text-2xl font-bold text-brand-600">{attendanceSummary.summary?.leaveDays || 0}</p>
                  <p className="text-xs text-surface-500">Leave</p>
                </div>
              </div>
              {attendanceSummary?.summary && (
                <div className="mt-4 pt-4 border-t border-surface-200">
                  <div className="flex justify-between items-center">
                    <span className="text-surface-600">Attendance Rate</span>
                    <span className="text-xl font-bold text-brand-600">{attendanceSummary.summary.attendanceRate}%</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Work Statistics */}
        <div className="card">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Work Statistics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-surface-100">
              <span className="text-surface-600">Total Quantity</span>
              <span className="font-semibold text-surface-900">{currentMonthStats?.summary?.totalQuantity || 0} units</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-surface-100">
              <span className="text-surface-600">Average per Unit</span>
              <span className="font-semibold text-surface-900">
                {formatCurrency(currentMonthStats?.summary?.averagePricePerUnit)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-surface-100">
              <span className="text-surface-600">Highest Earning Day</span>
              <span className="font-semibold text-accent-emerald">
                {formatCurrency(currentMonthStats?.summary?.highestEarning)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-surface-600">Lowest Earning Day</span>
              <span className="font-semibold text-accent-amber">
                {formatCurrency(currentMonthStats?.summary?.lowestEarning)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      {monthlyBreakdown.length > 0 && (
        <div className="table-container">
          <div className="px-6 py-4 border-b border-surface-200">
            <h2 className="text-lg font-semibold text-surface-900">Monthly Breakdown</h2>
            <p className="text-sm text-surface-500">Your earnings by month this year</p>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Days Worked</th>
                <th>Total Quantity</th>
                <th className="text-right">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {monthlyBreakdown.map((item, index) => (
                <tr key={index}>
                  <td className="font-medium text-surface-900">{item.month}</td>
                  <td>
                    <span className="badge badge-neutral">{item.days}</span>
                  </td>
                  <td className="text-surface-600">{item.quantity} units</td>
                  <td className="text-right font-semibold text-accent-emerald">{formatCurrency(item.earnings)}</td>
                </tr>
              ))}
              {monthlyBreakdown.length > 0 && (
                <tr className="bg-surface-50 font-semibold">
                  <td className="text-surface-900">Total</td>
                  <td>
                    <span className="badge badge-primary">
                      {monthlyBreakdown.reduce((sum, item) => sum + item.days, 0)}
                    </span>
                  </td>
                  <td className="text-surface-600">
                    {monthlyBreakdown.reduce((sum, item) => sum + item.quantity, 0)} units
                  </td>
                  <td className="text-right font-bold text-accent-emerald">
                    {formatCurrency(monthlyBreakdown.reduce((sum, item) => sum + item.earnings, 0))}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MySalary;
