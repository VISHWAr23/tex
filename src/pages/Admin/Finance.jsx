import { useState, useEffect, useCallback } from 'react';
import {
  getCompanyExpenses,
  getCompanyStatistics,
  getCompanyCategories,
  createCompanyExpense,
  updateExpense,
  deleteExpense,
} from '../../api/financeAPI';

const EXPENSE_CATEGORIES = [
  'Rent',
  'Utilities',
  'Salaries',
  'Equipment',
  'Supplies',
  'Transportation',
  'Marketing',
  'Insurance',
  'Maintenance',
  'Other',
];

export default function Finance() {
  const [expenses, setExpenses] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [expensesData, statsData, categoriesData] = await Promise.all([
        getCompanyExpenses(startDate, endDate, filterCategory),
        getCompanyStatistics(startDate, endDate),
        getCompanyCategories(),
      ]);
      setExpenses(expensesData);
      setStatistics(statsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, filterCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        category: expense.category,
        amount: expense.amount.toString(),
        date: expense.date.split('T')[0],
        note: expense.note || '',
      });
    } else {
      setEditingExpense(null);
      setFormData({
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        note: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
    setFormData({
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      note: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        type: 'COMPANY',
        category: formData.category,
        amount: parseFloat(formData.amount),
        date: formData.date,
        note: formData.note || undefined,
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, payload);
        setSuccess('Expense updated successfully!');
      } else {
        await createCompanyExpense(payload);
        setSuccess('Expense created successfully!');
      }

      closeModal();
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      setDeleteConfirm(null);
      setSuccess('Expense deleted successfully!');
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setFilterCategory('');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading && expenses.length === 0) {
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
          <h1 className="page-title">Company Finance</h1>
          <p className="page-subtitle">Track and manage business expenses</p>
        </div>
        <button onClick={() => openModal()} className="action-button">
          <svg className="action-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Expense</span>
        </button>
      </div>

      {/* Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-surface-400 text-sm font-medium">Total Expenses</p>
                <p className="text-2xl font-bold text-white mt-1">{formatCurrency(statistics.total || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-brand-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-surface-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-surface-400 text-sm font-medium">Total Records</p>
                <p className="text-2xl font-bold text-white mt-1">{statistics.count || 0}</p>
              </div>
              <div className="w-12 h-12 bg-accent-emerald flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-surface-900 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-surface-400 text-sm font-medium">Categories Used</p>
                <p className="text-2xl font-bold text-white mt-1">{categories.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-accent-amber flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="label">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex-1">
            <label className="label">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex-1">
            <label className="label">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="select"
            >
              <option value="">All Categories</option>
              {[...new Set([...EXPENSE_CATEGORIES, ...categories])].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={clearFilters} className="btn-ghost">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Note</th>
              <th className="text-right">Amount</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state py-12">
                    <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="empty-state-title">No expenses found</p>
                    <p className="empty-state-text">Add your first expense to get started</p>
                    <button onClick={() => openModal()} className="btn-primary mt-4">
                      Add Expense
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="font-medium text-surface-900">{formatDate(expense.date)}</td>
                  <td>
                    <span className="badge badge-primary">{expense.category}</span>
                  </td>
                  <td className="max-w-xs truncate text-surface-600">{expense.note || '-'}</td>
                  <td className="text-right font-semibold text-surface-900">{formatCurrency(expense.amount)}</td>
                  <td>
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openModal(expense)} className="btn-ghost btn-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(expense.id)}
                        className="btn-ghost btn-sm text-accent-rose hover:bg-red-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
              <button onClick={closeModal} className="btn-ghost btn-icon">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label className="label">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="select"
                  >
                    <option value="">Select category</option>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">Amount (₹) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="Enter amount"
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label className="label">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label className="label">Note</label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Add a note (optional)"
                    className="input resize-none"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="modal-btn-cancel">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="modal-btn-submit">
                  {submitting ? 'Saving...' : editingExpense ? 'Update' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-accent-rose/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-accent-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-surface-900 mb-2">Delete Expense</h3>
              <p className="text-surface-500 mb-6">
                Are you sure you want to delete this expense? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-outline">
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 btn-danger">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
