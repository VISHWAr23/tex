import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersAPI } from '../../api/usersAPI';
import { getAllWork } from '../../api/workAPI';

const WorkerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [workerDetails, setWorkerDetails] = useState(null);
  const [workEntries, setWorkEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  useEffect(() => {
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(monthStr);
  }, []);

  useEffect(() => {
    if (selectedMonth) {
      fetchWorkerDetails();
    }
  }, [id, selectedMonth]);

  const fetchWorkerDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const [detailsResponse, workResponse] = await Promise.all([
        usersAPI.getWorkerDetails(id, selectedMonth),
        getAllWork(id, startDateStr, endDateStr),
      ]);

      setWorkerDetails(detailsResponse.data);
      setWorkEntries(workResponse || []);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch worker details';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPaymentModal = () => {
    setPaymentForm({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
    });
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentForm({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
    });
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const payload = {
        amount: parseFloat(paymentForm.amount),
        date: paymentForm.date,
        note: paymentForm.note || null,
      };

      await usersAPI.createSalaryPayment(id, payload);
      setSuccess('Salary payment recorded successfully!');
      handleClosePaymentModal();
      fetchWorkerDetails();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to record payment';
      setError(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) {
      return;
    }

    try {
      await usersAPI.deleteSalaryPayment(paymentId);
      setSuccess('Payment deleted successfully!');
      fetchWorkerDetails();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete payment';
      setError(message);
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
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-surface-300 border-t-brand-600 animate-spin"></div>
      </div>
    );
  }

  if (!workerDetails) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-accent-rose">Worker not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/workers')} className="btn-ghost">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <div className="page-header">
            <h1 className="page-title">{workerDetails.name}</h1>
            <p className="page-subtitle">{workerDetails.email}</p>
          </div>
        </div>
        <button onClick={handleOpenPaymentModal} className="btn-primary">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
          Record Payment
        </button>
      </div>

      {/* Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Month Selector */}
      <div className="card">
        <div className="form-group mb-0">
          <label className="label">Select Month</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input max-w-xs"
          />
        </div>
      </div>

      {/* Worker Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="stat-label">Earned from Work</p>
          <p className="stat-value text-brand-600">{formatCurrency(workerDetails.totalWorkAmount)}</p>
          <p className="text-xs text-surface-500 mt-1">{workerDetails.totalWorkEntries} entries</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">Total Paid</p>
          <p className="stat-value text-accent-emerald">{formatCurrency(workerDetails.totalPaidThisMonth)}</p>
          <p className="text-xs text-surface-500 mt-1">{workerDetails.salaryPayments?.length || 0} payments</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">Pending Payment</p>
          <p
            className={`stat-value ${
              workerDetails.totalWorkAmount - workerDetails.totalPaidThisMonth >= 0
                ? 'text-accent-amber'
                : 'text-accent-emerald'
            }`}
          >
            {formatCurrency(workerDetails.totalWorkAmount - workerDetails.totalPaidThisMonth)}
          </p>
          <p className="text-xs text-surface-500 mt-1">Earned - Paid</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">Monthly Salary</p>
          <p className="stat-value text-accent-violet">{formatCurrency(workerDetails.monthlySalary)}</p>
          <p className="text-xs text-surface-500 mt-1">{workerDetails.monthlySalary ? 'Fixed salary' : 'Work-based'}</p>
        </div>
      </div>

      {/* Worker Information */}
      <div className="card">
        <h2 className="text-lg font-semibold text-surface-900 mb-4">Worker Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-surface-500">Email</p>
            <p className="font-medium text-surface-900">{workerDetails.email}</p>
          </div>
          <div>
            <p className="text-sm text-surface-500">Role</p>
            <span className="badge badge-primary">{workerDetails.role}</span>
          </div>
          <div>
            <p className="text-sm text-surface-500">Member Since</p>
            <p className="font-medium text-surface-900">{formatDate(workerDetails.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Work Entries Table */}
      <div className="table-container">
        <div className="px-6 py-4 border-b border-surface-200">
          <h2 className="text-lg font-semibold text-surface-900">Work Entries</h2>
          <p className="text-sm text-surface-500">
            Showing work for{' '}
            {new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {workEntries && workEntries.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Price/Unit</th>
                <th className="text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {workEntries.map((work) => (
                <tr key={work.id}>
                  <td className="font-medium text-surface-900">{formatDate(work.date)}</td>
                  <td className="text-surface-600">{work.description?.text || '-'}</td>
                  <td>
                    <span className="badge badge-neutral">{work.quantity}</span>
                  </td>
                  <td>{formatCurrency(work.pricePerUnit)}</td>
                  <td className="text-right font-semibold text-brand-600">{formatCurrency(work.totalAmount)}</td>
                </tr>
              ))}
              <tr className="bg-surface-50 font-semibold">
                <td colSpan="4" className="text-right text-surface-900">
                  Total Earned:
                </td>
                <td className="text-right font-bold text-brand-600">
                  {formatCurrency(workEntries.reduce((sum, work) => sum + work.totalAmount, 0))}
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="empty-state-title">No work entries</p>
            <p className="empty-state-text">No work entries for this month</p>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="table-container">
        <div className="px-6 py-4 border-b border-surface-200">
          <h2 className="text-lg font-semibold text-surface-900">Payment History</h2>
          <p className="text-sm text-surface-500">
            Showing payments for{' '}
            {new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        {workerDetails.salaryPayments && workerDetails.salaryPayments.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workerDetails.salaryPayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="font-medium text-surface-900">{formatDate(payment.date)}</td>
                  <td className="font-semibold text-accent-emerald">{formatCurrency(payment.amount)}</td>
                  <td className="text-surface-600">{payment.note || '-'}</td>
                  <td>
                    <button
                      onClick={() => handleDeletePayment(payment.id)}
                      className="btn-ghost btn-sm text-accent-rose hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="empty-state-title">No payments recorded</p>
            <p className="empty-state-text">No payments for this month</p>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={handleClosePaymentModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Record Salary Payment</h2>
              <button onClick={handleClosePaymentModal} className="btn-ghost btn-icon">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitPayment}>
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label className="label">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="input"
                    placeholder="Enter payment amount"
                    required
                  />
                  <div className="mt-3 p-3 bg-surface-50 border border-surface-200 text-sm space-y-1">
                    <p className="text-surface-600">
                      Earned from work:{' '}
                      <span className="font-semibold text-brand-600">{formatCurrency(workerDetails.totalWorkAmount)}</span>
                    </p>
                    <p className="text-surface-600">
                      Already paid:{' '}
                      <span className="font-semibold text-accent-emerald">
                        {formatCurrency(workerDetails.totalPaidThisMonth)}
                      </span>
                    </p>
                    <p className="font-semibold text-surface-900">
                      Pending:{' '}
                      <span className="text-accent-amber">
                        {formatCurrency(workerDetails.totalWorkAmount - workerDetails.totalPaidThisMonth)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Date *</label>
                  <input
                    type="date"
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">Note (Optional)</label>
                  <textarea
                    value={paymentForm.note}
                    onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                    className="input resize-none"
                    rows="3"
                    placeholder="Add any notes about this payment..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleClosePaymentModal} className="modal-btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="modal-btn-submit">
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDetail;
