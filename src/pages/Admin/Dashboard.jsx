import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../../api/usersAPI';
import { getAllWork, getWorkStatistics, getAttendanceByDate } from '../../api/workAPI';
import { getAllExports } from '../../api/exportsAPI';
import { getAllExpenses } from '../../api/financeAPI';

/**
 * Admin Dashboard
 * Shows overview of workers, attendance, and daily work statistics
 */
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
  const [workStats, setWorkStats] = useState(null);

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

      const workerCount = usersRes.data?.byRole?.find(r => r.role === 'WORKER')?.count || 0;
      
      setStats({
        totalWorkers: workerCount,
        todayPresent: attendanceRes?.summary?.present || 0,
        todayEarnings: (todayWorkRes || []).reduce((sum, w) => sum + (w.totalAmount || 0), 0),
        monthlyEarnings: monthStatsRes?.summary?.totalEarnings || 0,
      });

      // Calculate financial metrics
      const exports = exportsRes?.data || [];
      const expenses = expensesRes?.data || [];

      const totalRevenue = exports.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);
      const paidRevenue = exports
        .filter(exp => exp.paymentReceived)
        .reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);
      const pendingRevenue = totalRevenue - paidRevenue;

      const companyExpenses = expenses
        .filter(exp => exp.type === 'COMPANY')
        .reduce((sum, exp) => sum + (exp.amount || 0), 0);
      const exportSentAmount = exports.reduce((sum, exp) => sum + (exp.amountSent || 0), 0);
      const totalExpenses = companyExpenses + exportSentAmount;

      const netProfit = totalRevenue - totalExpenses;

      setFinancialData({
        totalRevenue,
        paidRevenue,
        pendingRevenue,
        totalExpenses,
        netProfit,
      });

      setTodayWork(todayWorkRes || []);
      setTodayAttendance(attendanceRes);
      setWorkStats(monthStatsRes);
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">{formatDate(new Date())}</p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Workers</p>
              <p className="text-3xl font-bold mt-1">{stats.totalWorkers}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
          <Link to="/admin/workers" className="inline-flex items-center gap-1 mt-3 text-sm text-blue-100 hover:text-white transition-colors">
            Manage Workers
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Today's Attendance</p>
              <p className="text-3xl font-bold mt-1">
                {stats.todayPresent} / {stats.totalWorkers}
              </p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <Link to="/admin/attendance" className="inline-flex items-center gap-1 mt-3 text-sm text-emerald-100 hover:text-white transition-colors">
            View Attendance
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-100 text-sm font-medium">Today's Payout</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(stats.todayEarnings)}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <Link to="/admin/daily-work" className="inline-flex items-center gap-1 mt-3 text-sm text-violet-100 hover:text-white transition-colors">
            View Details
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Monthly Payout</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(stats.monthlyEarnings)}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <Link to="/admin/reports" className="inline-flex items-center gap-1 mt-3 text-sm text-amber-100 hover:text-white transition-colors">
            View Reports
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Overview</h2>
        
        {/* Revenue Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold mt-2">{formatCurrency(financialData.totalRevenue)}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Paid Revenue</p>
                <p className="text-3xl font-bold mt-2">{formatCurrency(financialData.paidRevenue)}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Pending Revenue</p>
                <p className="text-3xl font-bold mt-2">{formatCurrency(financialData.pendingRevenue)}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Total Expenses</p>
                <p className="text-3xl font-bold mt-2">{formatCurrency(financialData.totalExpenses)}</p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Net Profit</p>
                <p className={`text-3xl font-bold mt-2 ${financialData.netProfit >= 0 ? 'text-green-300' : 'text-red-200'}`}>
                  {formatCurrency(financialData.netProfit)}
                </p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Profit Margin</p>
                <p className="text-3xl font-bold mt-2">
                  {financialData.totalRevenue > 0 
                    ? `${((financialData.netProfit / financialData.totalRevenue) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </p>
              </div>
              <div className="bg-white/20 rounded-lg p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Link to="/admin/exports" className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-4 text-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Manage Exports</p>
                <p className="text-sm text-indigo-100">Track payments & revenue</p>
              </div>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link to="/admin/finance" className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">View Finances</p>
                <p className="text-sm text-purple-100">Monitor expenses & costs</p>
              </div>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Work Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Today's Work</h2>
            <Link to="/admin/daily-work" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View All
            </Link>
          </div>
          <div className="p-5">
            {todayWork.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {todayWork.slice(0, 5).map((work) => (
                  <div key={work.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{work.user?.name}</p>
                      <p className="text-sm text-gray-500">{work.description?.text}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">
                        {formatCurrency(work.totalAmount)}
                      </p>
                      <p className="text-xs text-gray-400">Qty: {work.quantity}</p>
                    </div>
                  </div>
                ))}
                {todayWork.length > 5 && (
                  <p className="text-sm text-gray-500 text-center pt-2">
                    +{todayWork.length - 5} more entries
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500">No work entries for today</p>
                <Link to="/admin/daily-work" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mt-2 inline-block">
                  Add Work Entry
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex justify-between items-center p-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Today's Attendance</h2>
            <Link to="/admin/attendance" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              Manage
            </Link>
          </div>
          <div className="p-5">
            {todayAttendance?.summary ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-emerald-50 rounded-xl">
                  <p className="text-3xl font-bold text-emerald-600">
                    {todayAttendance.summary.present || 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Present</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <p className="text-3xl font-bold text-red-600">
                    {todayAttendance.summary.absent || 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Absent</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-xl">
                  <p className="text-3xl font-bold text-amber-600">
                    {todayAttendance.summary.halfDay || 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Half Day</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <p className="text-3xl font-bold text-blue-600">
                    {todayAttendance.summary.leave || 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Leave</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">No attendance data for today</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/admin/daily-work"
              className="flex flex-col items-center p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors group"
            >
              <div className="w-12 h-12 bg-indigo-100 group-hover:bg-indigo-200 rounded-full flex items-center justify-center mb-3 transition-colors">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Add Work Entry</span>
            </Link>
            <Link
              to="/admin/attendance"
              className="flex flex-col items-center p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors group"
            >
              <div className="w-12 h-12 bg-emerald-100 group-hover:bg-emerald-200 rounded-full flex items-center justify-center mb-3 transition-colors">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Mark Attendance</span>
            </Link>
            <Link
              to="/admin/workers"
              className="flex flex-col items-center p-4 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors group"
            >
              <div className="w-12 h-12 bg-violet-100 group-hover:bg-violet-200 rounded-full flex items-center justify-center mb-3 transition-colors">
                <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">Add Worker</span>
            </Link>
            <Link
              to="/admin/reports"
              className="flex flex-col items-center p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors group"
            >
              <div className="w-12 h-12 bg-amber-100 group-hover:bg-amber-200 rounded-full flex items-center justify-center mb-3 transition-colors">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">View Reports</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;