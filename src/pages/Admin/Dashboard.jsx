import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { usersAPI } from '../../api/usersAPI';
import { getAllWork, getWorkStatistics, getAttendanceByDate } from '../../api/workAPI';

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

      const [usersRes, todayWorkRes, attendanceRes, monthStatsRes] = await Promise.all([
        usersAPI.getStatistics(),
        getAllWork(null, today, today),
        getAttendanceByDate(today),
        getWorkStatistics(null, monthStart, today),
      ]);

      const workerCount = usersRes.data?.byRole?.find(r => r.role === 'WORKER')?.count || 0;
      
      setStats({
        totalWorkers: workerCount,
        todayPresent: attendanceRes?.summary?.present || 0,
        todayEarnings: (todayWorkRes || []).reduce((sum, w) => sum + (w.totalAmount || 0), 0),
        monthlyEarnings: monthStatsRes?.summary?.totalEarnings || 0,
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
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-gray-100 p-6 flex items-center justify-center">
            <div className="text-xl text-gray-600">Loading dashboard...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-500">{formatDate(new Date())}</p>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm">Total Workers</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.totalWorkers}</p>
                <Link to="/admin/workers" className="text-xs text-blue-500 hover:underline">
                  Manage Workers →
                </Link>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm">Today's Attendance</h3>
                <p className="text-3xl font-bold text-green-600">
                  {stats.todayPresent} / {stats.totalWorkers}
                </p>
                <Link to="/admin/attendance" className="text-xs text-blue-500 hover:underline">
                  View Attendance →
                </Link>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm">Today's Payout</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {formatCurrency(stats.todayEarnings)}
                </p>
                <Link to="/admin/daily-work" className="text-xs text-blue-500 hover:underline">
                  View Details →
                </Link>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm">Monthly Payout</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {formatCurrency(stats.monthlyEarnings)}
                </p>
                <Link to="/admin/reports" className="text-xs text-blue-500 hover:underline">
                  View Reports →
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Work Summary */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Today's Work</h2>
                  <Link to="/admin/daily-work" className="text-sm text-blue-600 hover:underline">
                    View All
                  </Link>
                </div>
                {todayWork.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {todayWork.slice(0, 5).map((work) => (
                      <div key={work.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{work.user?.name}</p>
                          <p className="text-sm text-gray-500">{work.description?.text}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {formatCurrency(work.totalAmount)}
                          </p>
                          <p className="text-xs text-gray-400">Qty: {work.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {todayWork.length > 5 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{todayWork.length - 5} more entries
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No work entries for today</p>
                    <Link to="/admin/daily-work" className="text-blue-600 hover:underline text-sm">
                      Add Work Entry
                    </Link>
                  </div>
                )}
              </div>

              {/* Attendance Overview */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Today's Attendance</h2>
                  <Link to="/admin/attendance" className="text-sm text-blue-600 hover:underline">
                    Manage
                  </Link>
                </div>
                {todayAttendance?.summary ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-3xl font-bold text-green-600">
                        {todayAttendance.summary.present || 0}
                      </p>
                      <p className="text-sm text-gray-500">Present</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-3xl font-bold text-red-600">
                        {todayAttendance.summary.absent || 0}
                      </p>
                      <p className="text-sm text-gray-500">Absent</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-3xl font-bold text-yellow-600">
                        {todayAttendance.summary.halfDay || 0}
                      </p>
                      <p className="text-sm text-gray-500">Half Day</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-3xl font-bold text-blue-600">
                        {todayAttendance.summary.leave || 0}
                      </p>
                      <p className="text-sm text-gray-500">Leave</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No attendance data for today</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                  to="/admin/daily-work"
                  className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                >
                  <span className="text-2xl mb-2">📝</span>
                  <span className="text-sm font-medium text-gray-700">Add Work Entry</span>
                </Link>
                <Link
                  to="/admin/attendance"
                  className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
                >
                  <span className="text-2xl mb-2">✅</span>
                  <span className="text-sm font-medium text-gray-700">Mark Attendance</span>
                </Link>
                <Link
                  to="/admin/workers"
                  className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                >
                  <span className="text-2xl mb-2">👥</span>
                  <span className="text-sm font-medium text-gray-700">Add Worker</span>
                </Link>
                <Link
                  to="/admin/reports"
                  className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition"
                >
                  <span className="text-2xl mb-2">📊</span>
                  <span className="text-sm font-medium text-gray-700">View Reports</span>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;