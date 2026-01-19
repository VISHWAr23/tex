import React, { useState, useEffect } from 'react';
import {
  getAttendanceByDate,
  getAttendanceSummary,
  getAllAttendanceStats,
  updateAttendanceStatus,
} from '../../api/workAPI';
import { usersAPI } from '../../api/usersAPI';

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewMode, setViewMode] = useState('daily');

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchWorkers();
  }, []);

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

  const getWorkersWithoutAttendance = () => {
    if (!attendanceData?.records || !workers.length) return [];
    const recordedUserIds = attendanceData.records.map((r) => r.userId);
    return workers.filter((w) => !recordedUserIds.includes(w.id));
  };

  const statusConfig = {
    PRESENT: { bg: 'bg-accent-emerald/10', text: 'text-accent-emerald', label: 'Present' },
    ABSENT: { bg: 'bg-accent-rose/10', text: 'text-accent-rose', label: 'Absent' },
    HALF_DAY: { bg: 'bg-accent-amber/10', text: 'text-accent-amber', label: 'Half Day' },
    LEAVE: { bg: 'bg-brand-100', text: 'text-brand-600', label: 'Leave' },
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

  if (loading && !attendanceData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-surface-300 border-t-brand-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Attendance Management</h1>
          <p className="page-subtitle">Track and manage worker attendance</p>
        </div>
        <div className="flex gap-2 bg-surface-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-4 py-2 font-medium text-sm rounded-md transition-all ${
              viewMode === 'daily'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            Daily View
          </button>
          <button
            onClick={() => setViewMode('summary')}
            className={`px-4 py-2 font-medium text-sm rounded-md transition-all ${
              viewMode === 'summary'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-surface-600 hover:text-surface-900'
            }`}
          >
            Summary
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Filters */}
      <div className="card">
        {viewMode === 'daily' ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="form-group mb-0">
              <label className="label">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input"
              />
            </div>
            <div className="flex items-center gap-2 mt-6 sm:mt-0">
              <span className="text-surface-600">{formatDate(selectedDate)}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group mb-0">
              <label className="label">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="input"
              />
            </div>
            <div className="form-group mb-0">
              <label className="label">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Daily View */}
      {viewMode === 'daily' && attendanceData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat-card">
              <p className="stat-label">Present</p>
              <p className="stat-value text-accent-emerald">{attendanceData.summary?.present || 0}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Absent</p>
              <p className="stat-value text-accent-rose">{attendanceData.summary?.absent || 0}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Half Day</p>
              <p className="stat-value text-accent-amber">{attendanceData.summary?.halfDay || 0}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Leave</p>
              <p className="stat-value text-brand-600">{attendanceData.summary?.leave || 0}</p>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="table-container">
            <div className="px-6 py-4 border-b border-surface-200">
              <h2 className="text-lg font-semibold text-surface-900">
                Attendance for {formatDate(selectedDate)}
              </h2>
            </div>
            {attendanceData.records?.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Status</th>
                    <th>Work Done</th>
                    <th>Earnings</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.records.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-surface-200 flex items-center justify-center text-sm font-semibold text-surface-600">
                            {record.user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-surface-900">{record.user?.name}</p>
                            <p className="text-xs text-surface-500">{record.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${statusConfig[record.status].bg} ${statusConfig[record.status].text}`}>
                          {statusConfig[record.status].label}
                        </span>
                      </td>
                      <td>
                        {record.work ? (
                          <div>
                            <p className="text-sm text-surface-900">{record.work.description?.text || '-'}</p>
                            <p className="text-xs text-surface-500">Qty: {record.work.quantity}</p>
                          </div>
                        ) : (
                          <span className="text-surface-400">No work recorded</span>
                        )}
                      </td>
                      <td>
                        {record.work ? (
                          <span className="font-semibold text-accent-emerald">
                            {formatCurrency(record.work.totalAmount)}
                          </span>
                        ) : (
                          <span className="text-surface-400">-</span>
                        )}
                      </td>
                      <td>
                        <select
                          value={record.status}
                          onChange={(e) => handleStatusChange(record.userId, e.target.value)}
                          className="select text-sm py-1.5"
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
              <div className="empty-state">
                <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="empty-state-title">No attendance records</p>
                <p className="empty-state-text">No records for this date</p>
              </div>
            )}
          </div>

          {/* Workers without attendance */}
          {getWorkersWithoutAttendance().length > 0 && (
            <div className="table-container">
              <div className="px-6 py-4 border-b border-surface-200">
                <h2 className="text-lg font-semibold text-accent-rose">Workers Without Attendance</h2>
                <p className="text-sm text-surface-500">
                  These workers haven't submitted work for {formatDate(selectedDate)}
                </p>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Mark Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {getWorkersWithoutAttendance().map((worker) => (
                    <tr key={worker.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-surface-200 flex items-center justify-center text-sm font-semibold text-surface-600">
                            {worker.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-surface-900">{worker.name}</p>
                            <p className="text-xs text-surface-500">{worker.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusChange(worker.id, 'ABSENT')}
                            className="btn-sm bg-accent-rose/10 text-accent-rose hover:bg-accent-rose/20"
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => handleStatusChange(worker.id, 'LEAVE')}
                            className="btn-sm bg-brand-100 text-brand-600 hover:bg-brand-200"
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
          )}
        </>
      )}

      {/* Summary View */}
      {viewMode === 'summary' && attendanceData && (
        <div className="table-container">
          <div className="px-6 py-4 border-b border-surface-200">
            <h2 className="text-lg font-semibold text-surface-900">
              Attendance Summary: {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
            </h2>
          </div>
          {attendanceData.report?.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th className="text-center">Present</th>
                  <th className="text-center">Absent</th>
                  <th className="text-center">Half Day</th>
                  <th className="text-center">Leave</th>
                  <th className="text-center">Total Qty</th>
                  <th className="text-center">Total Earnings</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.report.map((item) => (
                  <tr key={item.worker.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-surface-200 flex items-center justify-center text-sm font-semibold text-surface-600">
                          {item.worker.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-surface-900">{item.worker.name}</p>
                          <p className="text-xs text-surface-500">{item.worker.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-accent-emerald/10 text-accent-emerald">{item.stats.present}</span>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-accent-rose/10 text-accent-rose">{item.stats.absent}</span>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-accent-amber/10 text-accent-amber">{item.stats.halfDay}</span>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-brand-100 text-brand-600">{item.stats.leave}</span>
                    </td>
                    <td className="text-center font-semibold text-surface-900">{item.stats.totalQuantity}</td>
                    <td className="text-center font-semibold text-accent-emerald">
                      {formatCurrency(item.stats.totalEarnings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="empty-state-title">No attendance data</p>
              <p className="empty-state-text">No data for the selected period</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Attendance;
