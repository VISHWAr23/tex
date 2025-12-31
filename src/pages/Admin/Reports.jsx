import React, { useState, useEffect } from 'react';
import { getAllWork, getWorkStatistics, getAllAttendanceStats } from '../../api/workAPI';
import { usersAPI } from '../../api/usersAPI';

/**
 * Reports Component
 * Comprehensive reports for work, attendance, and earnings
 */
const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workReport, setWorkReport] = useState(null);
  const [attendanceReport, setAttendanceReport] = useState(null);
  const [workers, setWorkers] = useState([]);

  // Date range filters
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      startDate: monthStart.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    };
  });

  // Selected worker filter
  const [selectedWorker, setSelectedWorker] = useState('');

  // Report type
  const [reportType, setReportType] = useState('summary'); // summary, detailed, attendance

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [dateRange, selectedWorker]);

  const fetchWorkers = async () => {
    try {
      const response = await usersAPI.getAllUsers();
      const workersList = response.data.filter((u) => u.role === 'WORKER');
      setWorkers(workersList);
    } catch (err) {
      console.error('Failed to fetch workers:', err);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const userId = selectedWorker || undefined;

      const [workStats, attendance] = await Promise.all([
        getWorkStatistics(userId, dateRange.startDate, dateRange.endDate),
        getAllAttendanceStats(dateRange.startDate, dateRange.endDate),
      ]);

      setWorkReport(workStats);
      setAttendanceReport(attendance);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch reports');
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Export report to CSV
  const exportToCSV = () => {
    if (!attendanceReport?.report) return;

    let csvContent = 'Worker Name,Email,Present,Absent,Half Day,Leave,Total Qty,Total Earnings\n';
    
    attendanceReport.report.forEach((item) => {
      csvContent += `"${item.worker.name}","${item.worker.email}",${item.stats.present},${item.stats.absent},${item.stats.halfDay},${item.stats.leave},${item.stats.totalQuantity},${item.stats.totalEarnings}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `work_report_${dateRange.startDate}_${dateRange.endDate}.csv`;
    link.click();
  };

  const inputClasses =
    'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';

  if (loading && !workReport) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                📥 Export CSV
              </button>
            </div>

            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, startDate: e.target.value })
                    }
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, endDate: e.target.value })
                    }
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Worker
                  </label>
                  <select
                    value={selectedWorker}
                    onChange={(e) => setSelectedWorker(e.target.value)}
                    className={inputClasses}
                  >
                    <option value="">All Workers</option>
                    {workers.map((worker) => (
                      <option key={worker.id} value={worker.id}>
                        {worker.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report Type
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className={inputClasses}
                  >
                    <option value="summary">Summary</option>
                    <option value="attendance">Attendance</option>
                    <option value="detailed">Detailed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            {workReport?.summary && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-500 text-sm">Total Work Days</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {workReport.summary.totalRecords}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-500 text-sm">Total Quantity</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {workReport.summary.totalQuantity}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-500 text-sm">Total Payout</h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {formatCurrency(workReport.summary.totalEarnings)}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-500 text-sm">Average per Day</h3>
                  <p className="text-3xl font-bold text-orange-600">
                    {formatCurrency(workReport.summary.averageEarning)}
                  </p>
                </div>
              </div>
            )}

            {/* Report Tables */}
            {reportType === 'attendance' && attendanceReport?.report && (
              <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">Attendance Report</h2>
                  <p className="text-sm text-gray-500">
                    {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Worker
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Present
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Absent
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Half Day
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Leave
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Total Qty
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Total Earnings
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendanceReport.report.map((item) => (
                        <tr key={item.worker.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.worker.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {item.worker.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                              {item.stats.present}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full">
                              {item.stats.absent}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                              {item.stats.halfDay}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                              {item.stats.leave}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-semibold">
                            {item.stats.totalQuantity}
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-green-600">
                            {formatCurrency(item.stats.totalEarnings)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100">
                      <tr>
                        <td className="px-6 py-4 font-bold">Total</td>
                        <td className="px-6 py-4 text-center font-bold">
                          {attendanceReport.report.reduce((sum, i) => sum + i.stats.present, 0)}
                        </td>
                        <td className="px-6 py-4 text-center font-bold">
                          {attendanceReport.report.reduce((sum, i) => sum + i.stats.absent, 0)}
                        </td>
                        <td className="px-6 py-4 text-center font-bold">
                          {attendanceReport.report.reduce((sum, i) => sum + i.stats.halfDay, 0)}
                        </td>
                        <td className="px-6 py-4 text-center font-bold">
                          {attendanceReport.report.reduce((sum, i) => sum + i.stats.leave, 0)}
                        </td>
                        <td className="px-6 py-4 text-center font-bold">
                          {attendanceReport.report.reduce((sum, i) => sum + i.stats.totalQuantity, 0)}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-green-600">
                          {formatCurrency(
                            attendanceReport.report.reduce((sum, i) => sum + i.stats.totalEarnings, 0)
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Worker Breakdown */}
            {(reportType === 'summary' || reportType === 'detailed') && 
             workReport?.workerBreakdown?.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">Worker Performance</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Worker
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Work Days
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Total Quantity
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Total Earnings
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {workReport.workerBreakdown.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            {item.userName}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {item._count}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {item._sum?.quantity || 0}
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-green-600">
                            {formatCurrency(item._sum?.totalAmount || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Daily Breakdown */}
            {reportType === 'detailed' && workReport?.dailyBreakdown?.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">Daily Breakdown</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Entries
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Total Quantity
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Total Payout
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {workReport.dailyBreakdown.map((day, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatDate(day.date)}
                          </td>
                          <td className="px-6 py-4 text-center">{day._count}</td>
                          <td className="px-6 py-4 text-center">
                            {day._sum?.quantity || 0}
                          </td>
                          <td className="px-6 py-4 text-center font-semibold text-green-600">
                            {formatCurrency(day._sum?.totalAmount || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
  );
};

export default Reports;
