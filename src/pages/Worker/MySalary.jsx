import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { getMyWork, getWorkStatistics } from '../../api/workAPI';
import { getAttendanceSummary } from '../../api/workAPI';

/**
 * MySalary Component
 * Shows worker's earnings summary based on their daily work
 */
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
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString().split('T')[0];
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString().split('T')[0];
      
      // Last month dates
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        .toISOString().split('T')[0];
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
        .toISOString().split('T')[0];
      
      // Year to date
      const yearStart = new Date(now.getFullYear(), 0, 1)
        .toISOString().split('T')[0];

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
        yearToDateStats.dailyBreakdown.forEach(day => {
          const monthKey = new Date(day.date).toLocaleString('en-IN', { 
            year: 'numeric', 
            month: 'short' 
          });
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { earnings: 0, days: 0, quantity: 0 };
          }
          monthlyData[monthKey].earnings += day._sum.totalAmount || 0;
          monthlyData[monthKey].quantity += day._sum.quantity || 0;
          monthlyData[monthKey].days += 1;
        });
        setMonthlyBreakdown(Object.entries(monthlyData).map(([month, data]) => ({
          month,
          ...data
        })));
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
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-gray-100 p-6 flex items-center justify-center">
            <div className="text-xl text-gray-600">Loading salary data...</div>
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
            <h1 className="text-3xl font-bold mb-6 text-gray-900">My Salary</h1>

            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm mb-2">Current Month</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(currentMonthStats?.summary?.totalEarnings)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {currentMonthStats?.summary?.totalRecords || 0} days worked
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm mb-2">Last Month</h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(lastMonthStats?.summary?.totalEarnings)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {lastMonthStats?.summary?.totalRecords || 0} days worked
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm mb-2">Year to Date</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(yearStats?.summary?.totalEarnings)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {yearStats?.summary?.totalRecords || 0} days worked
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-gray-500 text-sm mb-2">Average per Day</h3>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(currentMonthStats?.summary?.averageEarning)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  This month average
                </p>
              </div>
            </div>

            {/* Attendance & Work Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Attendance Summary */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">This Month's Attendance</h2>
                {attendanceSummary && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {attendanceSummary.summary?.presentDays || 0}
                      </p>
                      <p className="text-xs text-gray-500">Present</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">
                        {attendanceSummary.summary?.absentDays || 0}
                      </p>
                      <p className="text-xs text-gray-500">Absent</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">
                        {attendanceSummary.summary?.halfDays || 0}
                      </p>
                      <p className="text-xs text-gray-500">Half Days</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {attendanceSummary.summary?.leaveDays || 0}
                      </p>
                      <p className="text-xs text-gray-500">Leave</p>
                    </div>
                  </div>
                )}
                {attendanceSummary?.summary && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Attendance Rate</span>
                      <span className="text-xl font-bold text-blue-600">
                        {attendanceSummary.summary.attendanceRate}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Work Statistics */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Work Statistics</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Quantity</span>
                    <span className="font-semibold">
                      {currentMonthStats?.summary?.totalQuantity || 0} units
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average per Unit</span>
                    <span className="font-semibold">
                      {formatCurrency(currentMonthStats?.summary?.averagePricePerUnit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Highest Earning Day</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(currentMonthStats?.summary?.highestEarning)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Lowest Earning Day</span>
                    <span className="font-semibold text-orange-600">
                      {formatCurrency(currentMonthStats?.summary?.lowestEarning)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Breakdown */}
            {monthlyBreakdown.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Monthly Breakdown</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Month
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Days Worked
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Earnings
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {monthlyBreakdown.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {item.month}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {item.days}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">
                            {formatCurrency(item.earnings)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MySalary;
