import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMyWork, getWorkStatistics } from '../../api/workAPI';

const MyWork = () => {
  const { user } = useAuth();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statistics, setStatistics] = useState(null);
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchData();
  }, [filterMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [year, month] = filterMonth.split('-');
      const startDate = `${year}-${month}-01`;
      const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];

      const [workData, statsData] = await Promise.all([
        getMyWork(startDate, endDate),
        getWorkStatistics(null, startDate, endDate),
      ]);

      setWorks(workData || []);
      setStatistics(statsData);
    } catch (err) {
      const message = err.message || err.error || 'Failed to fetch work data';
      setError(Array.isArray(message) ? message.join(', ') : message);
      setWorks([]);
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
      weekday: 'short',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-emerald-100 text-accent-emerald';
      case 'ABSENT':
        return 'bg-rose-100 text-accent-rose';
      case 'HALF_DAY':
        return 'bg-amber-100 text-accent-amber';
      case 'LEAVE':
        return 'bg-blue-100 text-brand-600';
      default:
        return 'bg-surface-100 text-surface-600';
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">My Work History</h1>
          <p className="page-subtitle">View your daily work entries and earnings</p>
        </div>
        <div className="form-group mb-0">
          <label className="label">Filter by Month</label>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="input"
          />
        </div>
      </div>

      {/* Messages */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="stat-label">Days Worked</p>
            <p className="stat-value text-brand-600">{statistics.summary?.totalRecords || 0}</p>
            <p className="text-xs text-surface-500 mt-1">Work entries</p>
          </div>

          <div className="stat-card">
            <p className="stat-label">Total Units</p>
            <p className="stat-value text-accent-violet">{statistics.summary?.totalQuantity || 0}</p>
            <p className="text-xs text-surface-500 mt-1">Completed</p>
          </div>

          <div className="stat-card">
            <p className="stat-label">Total Earnings</p>
            <p className="stat-value text-accent-emerald">{formatCurrency(statistics.summary?.totalEarnings || 0)}</p>
            <p className="text-xs text-surface-500 mt-1">This month</p>
          </div>

          <div className="stat-card">
            <p className="stat-label">Avg per Day</p>
            <p className="stat-value text-accent-amber">{formatCurrency(statistics.summary?.averageEarning || 0)}</p>
            <p className="text-xs text-surface-500 mt-1">Daily average</p>
          </div>
        </div>
      )}

      {/* Work Entries Table */}
      <div className="table-container">
        <div className="px-6 py-4 border-b border-surface-200">
          <h2 className="text-lg font-semibold text-surface-900">Work Entries</h2>
          <p className="text-sm text-surface-500">
            Showing work for{' '}
            {new Date(filterMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {works.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {works.map((work) => (
                <tr key={work.id}>
                  <td className="font-medium text-surface-900">{formatDate(work.date)}</td>
                  <td className="text-surface-600 max-w-xs">
                    <span className="truncate block" title={work.description?.text}>
                      {work.description?.text || '-'}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{work.quantity}</span>
                  </td>
                  <td>{formatCurrency(work.pricePerUnit)}</td>
                  <td className="font-semibold text-accent-emerald">{formatCurrency(work.totalAmount)}</td>
                  <td>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium ${getStatusBadge(work.attendance?.status)}`}>
                      {work.attendance?.status?.replace('_', ' ') || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
              {statistics?.summary?.totalEarnings && (
                <tr className="bg-surface-50 font-semibold">
                  <td colSpan="4" className="text-right text-surface-900">
                    Total Earnings:
                  </td>
                  <td colSpan="2" className="font-bold text-accent-emerald">
                    {formatCurrency(statistics.summary.totalEarnings)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="empty-state-title">No work entries</p>
            <p className="empty-state-text">
              No work entries found for{' '}
              {new Date(filterMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="card bg-surface-50 border border-surface-200">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-surface-900">Information</h3>
            <p className="text-sm text-surface-600 mt-1">
              Work entries are managed by the administrator. If you have any questions about your work records, please
              contact your supervisor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyWork;
