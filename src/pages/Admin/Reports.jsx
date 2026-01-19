import React, { useState, useEffect } from 'react';
import { getAllWork, getWorkStatistics, getAllAttendanceStats } from '../../api/workAPI';
import { usersAPI } from '../../api/usersAPI';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workReport, setWorkReport] = useState(null);
  const [attendanceReport, setAttendanceReport] = useState(null);
  const [workers, setWorkers] = useState([]);

  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      startDate: monthStart.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    };
  });

  const [selectedWorker, setSelectedWorker] = useState('');
  const [reportType, setReportType] = useState('summary');

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

  if (loading && !workReport) {
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
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Comprehensive reports for work and attendance</p>
        </div>
        <button onClick={exportToCSV} className="btn-success">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Messages */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="form-group">
            <label className="label">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="input"
            />
          </div>
          <div className="form-group">
            <label className="label">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="input"
            />
          </div>
          <div className="form-group">
            <label className="label">Worker</label>
            <select
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              className="select"
            >
              <option value="">All Workers</option>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="select"
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="stat-label">Total Work Days</p>
            <p className="stat-value text-brand-600">{workReport.summary.totalRecords || 0}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Quantity</p>
            <p className="stat-value text-accent-emerald">{workReport.summary.totalQuantity || 0}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Earnings</p>
            <p className="stat-value text-accent-violet">{formatCurrency(workReport.summary.totalEarnings)}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Avg per Day</p>
            <p className="stat-value text-accent-amber">{formatCurrency(workReport.summary.averageEarning)}</p>
          </div>
        </div>
      )}

      {/* Report Content */}
      {reportType === 'summary' && workReport?.byWorker && (
        <div className="table-container">
          <div className="px-6 py-4 border-b border-surface-200">
            <h2 className="text-lg font-semibold text-surface-900">Worker Summary</h2>
            <p className="text-sm text-surface-500">
              {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
            </p>
          </div>
          {workReport.byWorker.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th className="text-center">Work Days</th>
                  <th className="text-center">Total Qty</th>
                  <th className="text-right">Total Earnings</th>
                  <th className="text-right">Avg/Day</th>
                </tr>
              </thead>
              <tbody>
                {workReport.byWorker.map((item) => (
                  <tr key={item.userId}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-surface-200 flex items-center justify-center text-sm font-semibold text-surface-600">
                          {item.userName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-surface-900">{item.userName}</span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="badge badge-neutral">{item.workDays}</span>
                    </td>
                    <td className="text-center font-medium">{item.totalQuantity}</td>
                    <td className="text-right font-semibold text-accent-emerald">
                      {formatCurrency(item.totalEarnings)}
                    </td>
                    <td className="text-right text-surface-600">
                      {formatCurrency(item.totalEarnings / (item.workDays || 1))}
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
              <p className="empty-state-title">No data available</p>
              <p className="empty-state-text">Try adjusting the date range</p>
            </div>
          )}
        </div>
      )}

      {reportType === 'attendance' && attendanceReport?.report && (
        <div className="table-container">
          <div className="px-6 py-4 border-b border-surface-200">
            <h2 className="text-lg font-semibold text-surface-900">Attendance Report</h2>
            <p className="text-sm text-surface-500">
              {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
            </p>
          </div>
          {attendanceReport.report.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th className="text-center">Present</th>
                  <th className="text-center">Absent</th>
                  <th className="text-center">Half Day</th>
                  <th className="text-center">Leave</th>
                  <th className="text-center">Total Qty</th>
                  <th className="text-right">Total Earnings</th>
                </tr>
              </thead>
              <tbody>
                {attendanceReport.report.map((item) => (
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
                    <td className="text-center font-medium">{item.stats.totalQuantity}</td>
                    <td className="text-right font-semibold text-accent-emerald">
                      {formatCurrency(item.stats.totalEarnings)}
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
              <p className="empty-state-title">No attendance data</p>
              <p className="empty-state-text">Try adjusting the date range</p>
            </div>
          )}
        </div>
      )}

      {reportType === 'detailed' && workReport?.byDate && (
        <div className="table-container">
          <div className="px-6 py-4 border-b border-surface-200">
            <h2 className="text-lg font-semibold text-surface-900">Detailed Daily Report</h2>
            <p className="text-sm text-surface-500">
              {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
            </p>
          </div>
          {workReport.byDate && Object.keys(workReport.byDate).length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th className="text-center">Entries</th>
                  <th className="text-center">Total Qty</th>
                  <th className="text-right">Total Earnings</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(workReport.byDate).map(([date, data]) => (
                  <tr key={date}>
                    <td>
                      <div>
                        <span className="font-medium text-surface-900">{formatDate(date)}</span>
                        <p className="text-xs text-surface-500">
                          {new Date(date).toLocaleDateString('en-IN', { weekday: 'long' })}
                        </p>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="badge badge-neutral">{data.count}</span>
                    </td>
                    <td className="text-center font-medium">{data.totalQuantity}</td>
                    <td className="text-right font-semibold text-accent-emerald">
                      {formatCurrency(data.totalEarnings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="empty-state-title">No detailed data</p>
              <p className="empty-state-text">Try adjusting the date range</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;
