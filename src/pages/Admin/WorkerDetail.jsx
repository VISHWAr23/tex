import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersAPI } from '../../api/usersAPI';
import { getAllWork } from '../../api/workAPI';

/**
 * Worker Detail Component
 * Displays full worker information including salary tracking and payment history
 * Follows international standards for date and currency formatting
 */
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
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  useEffect(() => {
    // Set current month as default
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
      
      // Get month start and end dates
      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      // Fetch worker details and work entries in parallel
      const [detailsResponse, workResponse] = await Promise.all([
        usersAPI.getWorkerDetails(id, selectedMonth),
        getAllWork(id, startDateStr, endDateStr)
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

  // Format currency in Indian Rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const inputClasses = 'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
  const buttonClasses = 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading worker details...</div>
      </div>
    );
  }

  if (!workerDetails) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-red-600">Worker not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/workers')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Workers
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{workerDetails.name}</h1>
        </div>
        <button onClick={handleOpenPaymentModal} className={buttonClasses}>
          + Record Payment
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Month Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Month
        </label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className={inputClasses + ' max-w-xs'}
        />
      </div>

      {/* Worker Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Earned from Work</h3>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(workerDetails.totalWorkAmount)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {workerDetails.totalWorkEntries} entries
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Total Paid</h3>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(workerDetails.totalPaidThisMonth)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {workerDetails.salaryPayments?.length || 0} payments
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Pending Payment</h3>
          <p className={`text-3xl font-bold ${
            (workerDetails.totalWorkAmount - workerDetails.totalPaidThisMonth) >= 0 ? 'text-orange-600' : 'text-green-600'
          }`}>
            {formatCurrency(workerDetails.totalWorkAmount - workerDetails.totalPaidThisMonth)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Earned - Paid
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-600 text-sm font-semibold mb-2">Monthly Salary</h3>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(workerDetails.monthlySalary)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {workerDetails.monthlySalary ? 'Fixed salary' : 'Work-based'}
          </p>
        </div>
      </div>

      {/* Worker Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Worker Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{workerDetails.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Role</p>
            <p className="font-medium capitalize">{workerDetails.role}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Member Since</p>
            <p className="font-medium">{formatDate(workerDetails.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Work Entries Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Work Entries</h2>
          <p className="text-sm text-gray-600 mt-1">
            Showing work for {new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        {workEntries && workEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price/Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workEntries.map((work) => (
                  <tr key={work.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(work.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {work.description?.text || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {work.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatCurrency(work.pricePerUnit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {formatCurrency(work.totalAmount)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan="4" className="px-6 py-4 text-right text-sm text-gray-900">
                    Total Earned:
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                    {formatCurrency(workEntries.reduce((sum, work) => sum + work.totalAmount, 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-600">
            No work entries for this month
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
          <p className="text-sm text-gray-600 mt-1">
            Showing payments for {new Date(selectedMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        {workerDetails.salaryPayments && workerDetails.salaryPayments.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workerDetails.salaryPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(payment.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {payment.note || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDeletePayment(payment.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6 text-center text-gray-600">
            No payments recorded for this month
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Record Salary Payment</h2>
            
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className={inputClasses}
                  placeholder="Enter payment amount"
                  required
                />
                <div className="text-xs text-gray-600 mt-2 space-y-1">
                  <p>Earned from work: <span className="font-semibold text-blue-600">{formatCurrency(workerDetails.totalWorkAmount)}</span></p>
                  <p>Already paid: <span className="font-semibold text-green-600">{formatCurrency(workerDetails.totalPaidThisMonth)}</span></p>
                  <p className="font-semibold">Pending: <span className="text-orange-600">{formatCurrency(workerDetails.totalWorkAmount - workerDetails.totalPaidThisMonth)}</span></p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={paymentForm.date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                  className={inputClasses}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (Optional)
                </label>
                <textarea
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                  className={inputClasses}
                  rows="3"
                  placeholder="Add any notes about this payment..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className={buttonClasses + ' flex-1'}>
                  Record Payment
                </button>
                <button
                  type="button"
                  onClick={handleClosePaymentModal}
                  className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                >
                  Cancel
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
