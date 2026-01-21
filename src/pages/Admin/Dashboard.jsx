import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../../api/usersAPI';
import { getAllWork, getWorkStatistics, getAttendanceByDate } from '../../api/workAPI';
import { getAllExports } from '../../api/exportsAPI';
import { getAllExpenses } from '../../api/financeAPI';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkers: 0,
    todayPresent: 0,
    todayEarnings: 0,
    monthlyEarnings: 0,
  });
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    paidRevenue: 0,
    pendingRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
  });
  const [todayWork, setTodayWork] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const monthStart = new Date(new Date().setDate(1)).toISOString().split('T')[0];

      const [usersRes, todayWorkRes, attendanceRes, monthStatsRes, exportsRes, expensesRes] = await Promise.all([
        usersAPI.getStatistics(),
        getAllWork(null, today, today),
        getAttendanceByDate(today),
        getWorkStatistics(null, monthStart, today),
        getAllExports(),
        getAllExpenses(),
      ]);

      // Get worker count from statistics response
      const statsData = usersRes?.data || usersRes || {};
      const byRole = statsData.byRole || [];
      const workerCount = byRole.find(r => r.role === 'WORKER')?.count || 0;
      
      // Get attendance data - properly access the response
      const attendData = attendanceRes || {};
      const todayPresentCount = attendData.summary?.present || 0;
      
      // Get today's work earnings
      const todayWorkList = Array.isArray(todayWorkRes) ? todayWorkRes : [];
      const todayEarningsSum = todayWorkList.reduce((sum, w) => sum + (Number(w.totalAmount) || 0), 0);
      
      // Get monthly earnings from statistics response
      const monthStats = monthStatsRes || {};
      const monthlyEarningsSum = monthStats.summary?.totalEarnings || 0;

      setStats({
        totalWorkers: workerCount,
        todayPresent: todayPresentCount,
        todayEarnings: todayEarningsSum,
        monthlyEarnings: Number(monthlyEarningsSum) || 0,
      });

      // Process exports and expenses data
      const exportsData = exportsRes?.data || exportsRes || [];
      const exportsList = Array.isArray(exportsData) ? exportsData : [];
      
      const expensesData = expensesRes?.data || expensesRes || [];
      const expensesList = Array.isArray(expensesData) ? expensesData : [];

      const totalRevenue = exportsList.reduce((sum, exp) => sum + (Number(exp.totalAmount) || 0), 0);
      const paidRevenue = exportsList
        .filter(exp => exp.paymentReceived)
        .reduce((sum, exp) => sum + (Number(exp.totalAmount) || 0), 0);
      const pendingRevenue = totalRevenue - paidRevenue;

      const companyExpenses = expensesList
        .filter(exp => exp.type === 'COMPANY')
        .reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
      const totalExpenses = companyExpenses;

      const netProfit = totalRevenue - totalExpenses - Number(monthlyEarningsSum || 0);

      setFinancialData({
        totalRevenue,
        paidRevenue,
        pendingRevenue,
        totalExpenses,
        netProfit,
      });

      setTodayWork(todayWorkList);
      setTodayAttendance(attendData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-surface-300 border-t-brand-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">{formatDate(new Date())}</p>
      </div>
      
      {/* Primary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-900 p-6 border border-surface-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-surface-400 uppercase tracking-wide">Workers</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.totalWorkers}</p>
            </div>
            <div className="p-2 bg-brand-600/20">
              <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <Link to="/admin/workers" className="inline-flex items-center gap-1 mt-4 text-sm text-brand-400 hover:text-brand-300 transition-colors">
            Manage Workers
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="bg-surface-900 p-6 border border-surface-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-surface-400 uppercase tracking-wide">Today's Attendance</p>
              <p className="text-3xl font-bold text-white mt-2">
                {stats.todayPresent}<span className="text-lg text-surface-500">/{stats.totalWorkers}</span>
              </p>
            </div>
            <div className="p-2 bg-accent-emerald/20">
              <svg className="w-6 h-6 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <Link to="/admin/attendance" className="inline-flex items-center gap-1 mt-4 text-sm text-accent-emerald hover:text-emerald-400 transition-colors">
            View Attendance
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="bg-surface-900 p-6 border border-surface-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-surface-400 uppercase tracking-wide">Today's Payout</p>
              <p className="text-3xl font-bold text-white mt-2">{formatCurrency(stats.todayEarnings)}</p>
            </div>
            <div className="p-2 bg-accent-violet/20">
              <svg className="w-6 h-6 text-accent-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <Link to="/admin/daily-work" className="inline-flex items-center gap-1 mt-4 text-sm text-accent-violet hover:text-violet-400 transition-colors">
            View Details
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="bg-surface-900 p-6 border border-surface-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-surface-400 uppercase tracking-wide">Monthly Payout</p>
              <p className="text-3xl font-bold text-white mt-2">{formatCurrency(stats.monthlyEarnings)}</p>
            </div>
            <div className="p-2 bg-accent-amber/20">
              <svg className="w-6 h-6 text-accent-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <Link to="/admin/reports" className="inline-flex items-center gap-1 mt-4 text-sm text-accent-amber hover:text-amber-400 transition-colors">
            View Reports
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Financial Overview */}
      <div>
        <h2 className="text-lg font-semibold text-surface-900 mb-4">Financial Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="stat-card">
            <p className="stat-label">Total Revenue</p>
            <p className="stat-value text-accent-emerald">{formatCurrency(financialData.totalRevenue)}</p>
          </div>

          <div className="stat-card">
            <p className="stat-label">Paid Revenue</p>
            <p className="stat-value">{formatCurrency(financialData.paidRevenue)}</p>
          </div>

          <div className="stat-card">
            <p className="stat-label">Pending</p>
            <p className="stat-value text-accent-amber">{formatCurrency(financialData.pendingRevenue)}</p>
          </div>

          <div className="stat-card">
            <p className="stat-label">Expenses</p>
            <p className="stat-value text-accent-rose">{formatCurrency(financialData.totalExpenses)}</p>
          </div>

          <div className="stat-card">
            <p className="stat-label">Net Profit</p>
            <p className={`stat-value ${financialData.netProfit >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
              {formatCurrency(financialData.netProfit)}
            </p>
          </div>

          <div className="stat-card">
            <p className="stat-label">Profit Margin</p>
            <p className="stat-value">
              {financialData.totalRevenue > 0 
                ? `${((financialData.netProfit / financialData.totalRevenue) * 100).toFixed(1)}%`
                : '0%'
              }
            </p>
          </div>
        </div>

        {/* Action Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Link to="/admin/exports" className="bg-brand-600 p-4 text-white hover:bg-brand-700 transition-colors flex items-center justify-between group">
            <div>
              <p className="font-semibold">Manage Exports</p>
              <p className="text-sm text-brand-200 mt-0.5">Track payments & revenue</p>
            </div>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link to="/admin/finance" className="bg-surface-900 p-4 text-white hover:bg-surface-800 transition-colors flex items-center justify-between group border border-surface-800">
            <div>
              <p className="font-semibold">View Finances</p>
              <p className="text-sm text-surface-400 mt-0.5">Monitor expenses & costs</p>
            </div>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Work Summary */}
        <div className="card">
          <div className="flex justify-between items-center card-header">
            <h2 className="text-lg font-semibold text-surface-900">Today's Work</h2>
            <Link to="/admin/daily-work" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              View All
            </Link>
          </div>
          <div className="card-body">
            {todayWork.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {todayWork.slice(0, 5).map((work) => (
                  <div key={work.id} className="flex justify-between items-center p-3 bg-surface-50 hover:bg-surface-100 transition-colors">
                    <div>
                      <p className="font-medium text-surface-900">{work.user?.name}</p>
                      <p className="text-sm text-surface-500">{work.description?.text}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-accent-emerald">
                        {formatCurrency(work.totalAmount)}
                      </p>
                      <p className="text-xs text-surface-400">Qty: {work.quantity}</p>
                    </div>
                  </div>
                ))}
                {todayWork.length > 5 && (
                  <p className="text-sm text-surface-500 text-center pt-2">
                    +{todayWork.length - 5} more entries
                  </p>
                )}
              </div>
            ) : (
              <div className="empty-state py-12">
                <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="empty-state-title">No work entries for today</p>
                <Link to="/admin/daily-work" className="btn-primary btn-sm mt-4">
                  Add Work Entry
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Overview */}
        <div className="card">
          <div className="flex justify-between items-center card-header">
            <h2 className="text-lg font-semibold text-surface-900">Today's Attendance</h2>
            <Link to="/admin/attendance" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
              Manage
            </Link>
          </div>
          <div className="card-body">
            {todayAttendance?.summary ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-emerald-50 border border-emerald-100">
                  <p className="text-3xl font-bold text-accent-emerald">
                    {todayAttendance.summary.present || 0}
                  </p>
                  <p className="text-sm text-surface-600 mt-1">Present</p>
                </div>
                <div className="text-center p-4 bg-red-50 border border-red-100">
                  <p className="text-3xl font-bold text-accent-rose">
                    {todayAttendance.summary.absent || 0}
                  </p>
                  <p className="text-sm text-surface-600 mt-1">Absent</p>
                </div>
                <div className="text-center p-4 bg-amber-50 border border-amber-100">
                  <p className="text-3xl font-bold text-accent-amber">
                    {todayAttendance.summary.halfDay || 0}
                  </p>
                  <p className="text-sm text-surface-600 mt-1">Half Day</p>
                </div>
                <div className="text-center p-4 bg-brand-50 border border-brand-100">
                  <p className="text-3xl font-bold text-brand-600">
                    {todayAttendance.summary.leave || 0}
                  </p>
                  <p className="text-sm text-surface-600 mt-1">Leave</p>
                </div>
              </div>
            ) : (
              <div className="empty-state py-12">
                <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="empty-state-title">No attendance data for today</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-surface-900">Quick Actions</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/admin/daily-work"
              className="flex flex-col items-center p-5 bg-surface-50 border border-surface-200 hover:bg-surface-100 hover:border-surface-300 transition-all group"
            >
              <div className="w-12 h-12 bg-brand-100 flex items-center justify-center mb-3 group-hover:bg-brand-200 transition-colors">
                <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-surface-700">Add Work Entry</span>
            </Link>
            <Link
              to="/admin/attendance"
              className="flex flex-col items-center p-5 bg-surface-50 border border-surface-200 hover:bg-surface-100 hover:border-surface-300 transition-all group"
            >
              <div className="w-12 h-12 bg-emerald-100 flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
                <svg className="w-6 h-6 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-surface-700">Mark Attendance</span>
            </Link>
            <Link
              to="/admin/workers"
              className="flex flex-col items-center p-5 bg-surface-50 border border-surface-200 hover:bg-surface-100 hover:border-surface-300 transition-all group"
            >
              <div className="w-12 h-12 bg-violet-100 flex items-center justify-center mb-3 group-hover:bg-violet-200 transition-colors">
                <svg className="w-6 h-6 text-accent-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-surface-700">Add Worker</span>
            </Link>
            <Link
              to="/admin/reports"
              className="flex flex-col items-center p-5 bg-surface-50 border border-surface-200 hover:bg-surface-100 hover:border-surface-300 transition-all group"
            >
              <div className="w-12 h-12 bg-amber-100 flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
                <svg className="w-6 h-6 text-accent-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-surface-700">View Reports</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
