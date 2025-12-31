import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import {
  getAttendanceByDate,
  getAttendanceSummary,
  getAllAttendanceStats,
  updateAttendanceStatus,
} from '../../api/workAPI';
import { usersAPI } from '../../api/usersAPI';

/**
 * Attendance Component (Admin)
 * Allows admins to view and manage worker attendance
 * Attendance is auto-generated when workers submit daily work
 */
const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // View mode: 'daily' or 'summary'
  const [viewMode, setViewMode] = useState('daily');

  // Filters
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Fetch initial data
  useEffect(() => {
    fetchWorkers();
  }, []);

  // Fetch attendance when date/view changes
  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, dateRange, viewMode]);

  const fetchWorkers = async () => {
    try {
      const response = await usersAPI.getAllUsers();
      const workersList = response.data.filter((u) => u.role === 'WORKER');
      setWorkers(workersList);
    } catch (err) {
      console.error('Failed to fetch workers:', err);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      let data;

      if (viewMode === 'daily') {
        data = await getAttendanceByDate(selectedDate);
      } else {
        data = await getAllAttendanceStats(dateRange.startDate, dateRange.endDate);
      }

      setAttendanceData(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch attendance data');
      setAttendanceData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      setError('');
      await updateAttendanceStatus(selectedDate, userId, newStatus);
      setSuccess('Attendance updated successfully!');
      fetchAttendance();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update attendance');
    }
  };

  // Get workers without attendance for the selected date
  const getWorkersWithoutAttendance = () => {
    if (!attendanceData?.records || !workers.length) return [];
    const recordedUserIds = attendanceData.records.map((r) => r.userId);
    return workers.filter((w) => !recordedUserIds.includes(w.id));
  };

  const statusColors = {
    PRESENT: 'bg-green-100 text-green-800',
    ABSENT: 'bg-red-100 text-red-800',
    HALF_DAY: 'bg-yellow-100 text-yellow-800',
    LEAVE: 'bg-blue-100 text-blue-800',
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const inputClasses =
    'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';

  if (loading && !attendanceData) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-gray-100 p-6 flex items-center justify-center">
            <div className="text-xl text-gray-600">Loading attendance data...</div>
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('daily')}
                  className={`px-4 py-2 rounded-lg transition ${
                    viewMode === 'daily'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Daily View
                </button>
                <button
                  onClick={() => setViewMode('summary')}
                  className={`px-4 py-2 rounded-lg transition ${
                    viewMode === 'summary'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Summary Report
                </button>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              {viewMode === 'daily' ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <label className="font-medium text-gray-700">Select Date:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={`${inputClasses} max-w-xs`}
                  />
                  <span className="text-gray-500">{formatDate(selectedDate)}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                </div>
              )}
            </div>

            {/* Daily View */}
            {viewMode === 'daily' && attendanceData && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-lg shadow p-4 text-center">
                    <p className="text-gray-500 text-sm">Present</p>
                    <p className="text-2xl font-bold text-green-600">
                      {attendanceData.summary?.present || 0}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 text-center">
                    <p className="text-gray-500 text-sm">Absent</p>
                    <p className="text-2xl font-bold text-red-600">
                      {attendanceData.summary?.absent || 0}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 text-center">
                    <p className="text-gray-500 text-sm">Half Day</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {attendanceData.summary?.halfDay || 0}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-4 text-center">
                    <p className="text-gray-500 text-sm">Leave</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {attendanceData.summary?.leave || 0}
                    </p>
                  </div>
                </div>

                {/* Attendance Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">
                      Attendance for {formatDate(selectedDate)}
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    {attendanceData.records?.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Worker
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Work Done
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Earnings
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {attendanceData.records.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {record.user?.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {record.user?.email}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-3 py-1 text-sm rounded-full ${
                                    statusColors[record.status]
                                  }`}
                                >
                                  {record.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {record.work ? (
                                  <div>
                                    <p className="text-sm text-gray-900">
                                      {record.work.description?.text || '-'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Qty: {record.work.quantity}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">No work recorded</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {record.work ? (
                                  <span className="font-semibold text-green-600">
                                    {formatCurrency(record.work.totalAmount)}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                  value={record.status}
                                  onChange={(e) =>
                                    handleStatusChange(record.userId, e.target.value)
                                  }
                                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="PRESENT">Present</option>
                                  <option value="ABSENT">Absent</option>
                                  <option value="HALF_DAY">Half Day</option>
                                  <option value="LEAVE">Leave</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No attendance records for this date
                      </div>
                    )}
                  </div>
                </div>

                {/* Workers without attendance */}
                {getWorkersWithoutAttendance().length > 0 && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-red-600">
                        Workers Without Attendance
                      </h2>
                      <p className="text-sm text-gray-500">
                        These workers haven't submitted work for {formatDate(selectedDate)}
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Worker
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Mark Attendance
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {getWorkersWithoutAttendance().map((worker) => (
                            <tr key={worker.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {worker.name}
                                  </p>
                                  <p className="text-sm text-gray-500">{worker.email}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleStatusChange(worker.id, 'ABSENT')}
                                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                  >
                                    Absent
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(worker.id, 'LEAVE')}
                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                  >
                                    Leave
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Summary View */}
            {viewMode === 'summary' && attendanceData && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">
                    Attendance Summary: {formatDate(dateRange.startDate)} -{' '}
                    {formatDate(dateRange.endDate)}
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  {attendanceData.report?.length > 0 ? (
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
                        {attendanceData.report.map((item) => (
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
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                {item.stats.present}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                                {item.stats.absent}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                {item.stats.halfDay}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
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
                    </table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No attendance data for the selected period
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Attendance;
