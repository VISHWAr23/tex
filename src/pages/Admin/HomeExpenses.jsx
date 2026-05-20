import { useState, useEffect, useCallback } from 'react';
import {
  getHomeExpenses,
  getHomeStatistics,
  getHomeCategories,
  createHomeExpense,
  getHomeIncomes,
  getHomeIncomeStatistics,
  getHomeIncomeCategories,
  createHomeIncome,
  updateExpense,
  deleteExpense,
} from '../../api/financeAPI';

const EXPENSE_CATEGORIES = [
  'Groceries',
  'Rent',
  'Utilities',
  'Food',
  'Healthcare',
  'Education',
  'Entertainment',
  'Shopping',
  'Transportation',
  'Personal Care',
  'Other',
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Rental',
  'Interest',
  'Gift',
  'Refund',
  'Other',
];

export default function HomeExpenses() {
  const [activeTab, setActiveTab] = useState('expense');
  const [entries, setEntries] = useState([]);
  const [expenseStats, setExpenseStats] = useState(null);
  const [incomeStats, setIncomeStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('expense'); // 'expense' or 'income'
  const [editingEntry, setEditingEntry] = useState(null);
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
      // Always fetch both stats for the summary cards
      const [expStatsData, incStatsData] = await Promise.all([
        getHomeStatistics(startDate, endDate),
        getHomeIncomeStatistics(startDate, endDate),
      ]);
      setExpenseStats(expStatsData);
      setIncomeStats(incStatsData);

      // Fetch entries and categories for the active tab
      if (activeTab === 'expense') {
        const [entriesData, categoriesData] = await Promise.all([
          getHomeExpenses(startDate, endDate, filterCategory),
          getHomeCategories(),
        ]);
        setEntries(entriesData);
        setCategories(categoriesData);
      } else {
        const [entriesData, categoriesData] = await Promise.all([
          getHomeIncomes(startDate, endDate, filterCategory),
          getHomeIncomeCategories(),
        ]);
        setEntries(entriesData);
        setCategories(categoriesData);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, filterCategory, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (type, entry = null) => {
    setModalType(type);
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        category: entry.category,
        amount: entry.amount.toString(),
        date: entry.date.split('T')[0],
        note: entry.note || '',
      });
    } else {
      setEditingEntry(null);
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
    setEditingEntry(null);
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
        type: modalType === 'income' ? 'HOME_INCOME' : 'HOME',
        category: formData.category,
        amount: parseFloat(formData.amount),
        date: formData.date,
        note: formData.note || undefined,
      };

      if (editingEntry) {
        await updateExpense(editingEntry.id, payload);
        setSuccess(`${modalType === 'income' ? 'Income' : 'Expense'} updated successfully!`);
      } else {
        if (modalType === 'income') {
          await createHomeIncome(payload);
          setSuccess('Income added successfully!');
        } else {
          await createHomeExpense(payload);
          setSuccess('Expense added successfully!');
        }
      }

      closeModal();
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || `Failed to save ${modalType}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      setDeleteConfirm(null);
      setSuccess(`${activeTab === 'income' ? 'Income' : 'Expense'} deleted successfully!`);
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete entry');
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

  // Computed values
  const totalIncome = incomeStats?.summary?.totalAmount || 0;
  const totalExpenses = expenseStats?.summary?.totalAmount || 0;
  const netBalance = totalIncome - totalExpenses;
  const totalRecords =
    (expenseStats?.summary?.totalRecords || 0) +
    (incomeStats?.summary?.totalRecords || 0);

  const currentCategories =
    activeTab === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  if (loading && entries.length === 0 && !expenseStats && !incomeStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-surface-300 border-t-accent-rose animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="page-header">
          <h1 className="page-title">Home Finance</h1>
          <p className="page-subtitle">Track and manage your household income & expenses</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal('income')}
            className="action-button action-button-success"
          >
            <svg className="action-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Income</span>
          </button>
          <button
            onClick={() => openModal('expense')}
            className="action-button action-button-danger"
          >
            <svg className="action-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income Card */}
        <div className="bg-surface-900 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
            <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-surface-400 text-sm font-medium">Total Income</p>
              <p className="text-2xl font-bold text-accent-emerald mt-1">
                {formatCurrency(totalIncome)}
              </p>
              <p className="text-surface-500 text-xs mt-1">
                {incomeStats?.summary?.totalRecords || 0} entries
              </p>
            </div>
            <div className="w-12 h-12 bg-accent-emerald flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="bg-surface-900 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
            <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-surface-400 text-sm font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-accent-rose mt-1">
                {formatCurrency(totalExpenses)}
              </p>
              <p className="text-surface-500 text-xs mt-1">
                {expenseStats?.summary?.totalRecords || 0} entries
              </p>
            </div>
            <div className="w-12 h-12 bg-accent-rose flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Net Balance Card */}
        <div className="bg-surface-900 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
            <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 4h16v2H4zm0 4h10v2H4zm0 4h16v2H4zm0 4h10v2H4z" />
            </svg>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-surface-400 text-sm font-medium">Net Balance</p>
              <p className={`text-2xl font-bold mt-1 ${netBalance >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
              </p>
              <p className="text-surface-500 text-xs mt-1">
                {netBalance >= 0 ? 'Surplus' : 'Deficit'}
              </p>
            </div>
            <div className={`w-12 h-12 flex items-center justify-center ${netBalance >= 0 ? 'bg-accent-emerald' : 'bg-accent-rose'}`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Records Card */}
        <div className="bg-surface-900 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
            <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-surface-400 text-sm font-medium">Total Records</p>
              <p className="text-2xl font-bold text-white mt-1">{totalRecords}</p>
              <p className="text-surface-500 text-xs mt-1">
                All transactions
              </p>
            </div>
            <div className="w-12 h-12 bg-accent-cyan flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-surface-200">
        <div className="flex gap-0">
          <button
            onClick={() => { setActiveTab('expense'); setFilterCategory(''); }}
            className={`tab-button ${activeTab === 'expense' ? 'tab-button-active' : ''}`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
              Expenses
              {expenseStats?.summary?.totalRecords > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-accent-rose/10 text-accent-rose rounded-full">
                  {expenseStats.summary.totalRecords}
                </span>
              )}
            </span>
          </button>
          <button
            onClick={() => { setActiveTab('income'); setFilterCategory(''); }}
            className={`tab-button ${activeTab === 'income' ? 'tab-button-active' : ''}`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
              Income
              {incomeStats?.summary?.totalRecords > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-accent-emerald/10 text-accent-emerald rounded-full">
                  {incomeStats.summary.totalRecords}
                </span>
              )}
            </span>
          </button>
        </div>
      </div>

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
              {[...new Set([...currentCategories, ...categories])].map((cat) => (
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

      {/* Entries Table */}
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
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state py-12">
                    <svg className="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {activeTab === 'income' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      )}
                    </svg>
                    <p className="empty-state-title">
                      No {activeTab === 'income' ? 'income' : 'expenses'} found
                    </p>
                    <p className="empty-state-text">
                      Add your first {activeTab === 'income' ? 'income entry' : 'home expense'}
                    </p>
                    <button
                      onClick={() => openModal(activeTab)}
                      className={`btn-primary mt-4 ${activeTab === 'income' ? 'bg-accent-emerald hover:bg-emerald-700' : 'bg-accent-rose hover:bg-red-700'}`}
                    >
                      Add {activeTab === 'income' ? 'Income' : 'Expense'}
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id}>
                  <td className="font-medium text-surface-900">{formatDate(entry.date)}</td>
                  <td>
                    <span
                      className={`badge ${
                        activeTab === 'income'
                          ? 'bg-accent-emerald/10 text-accent-emerald'
                          : 'bg-accent-rose/10 text-accent-rose'
                      }`}
                    >
                      {entry.category}
                    </span>
                  </td>
                  <td className="max-w-xs truncate text-surface-600">{entry.note || '-'}</td>
                  <td className={`text-right font-semibold ${activeTab === 'income' ? 'text-accent-emerald' : 'text-surface-900'}`}>
                    {activeTab === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openModal(activeTab, entry)} className="btn-ghost btn-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(entry.id)}
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

      {/* Category Breakdown */}
      {((activeTab === 'expense' && expenseStats?.byCategory?.length > 0) ||
        (activeTab === 'income' && incomeStats?.byCategory?.length > 0)) && (
        <div className="card">
          <h3 className="text-lg font-semibold text-surface-900 mb-4">
            {activeTab === 'income' ? 'Income' : 'Expense'} by Category
          </h3>
          <div className="space-y-3">
            {(activeTab === 'expense' ? expenseStats : incomeStats)?.byCategory?.map((cat) => {
              const stats = activeTab === 'expense' ? expenseStats : incomeStats;
              const total = stats?.summary?.totalAmount || 1;
              const percentage = ((cat.total / total) * 100).toFixed(1);
              return (
                <div key={cat.category} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-surface-700 truncate">
                    {cat.category}
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-surface-100 h-2 overflow-hidden" style={{ borderRadius: '2px' }}>
                      <div
                        className={`h-full transition-all duration-500 ${activeTab === 'income' ? 'bg-accent-emerald' : 'bg-accent-rose'}`}
                        style={{ width: `${percentage}%`, borderRadius: '2px' }}
                      />
                    </div>
                  </div>
                  <div className="w-20 text-sm font-semibold text-surface-900 text-right">
                    {formatCurrency(cat.total)}
                  </div>
                  <div className="w-14 text-xs text-surface-500 text-right">
                    {percentage}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingEntry
                  ? `Edit ${modalType === 'income' ? 'Income' : 'Expense'}`
                  : `Add New ${modalType === 'income' ? 'Income' : 'Expense'}`}
              </h2>
              <button onClick={closeModal} className="btn-ghost btn-icon">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Type indicator */}
            <div className={`px-6 py-2 text-xs font-semibold uppercase tracking-wider ${
              modalType === 'income'
                ? 'bg-accent-emerald/10 text-accent-emerald'
                : 'bg-accent-rose/10 text-accent-rose'
            }`}>
              {modalType === 'income' ? '↑ Income Entry' : '↓ Expense Entry'}
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
                    {(modalType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
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
                <button
                  type="submit"
                  disabled={submitting}
                  className="modal-btn-submit"
                  style={
                    modalType === 'income'
                      ? { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }
                      : undefined
                  }
                >
                  {submitting
                    ? 'Saving...'
                    : editingEntry
                    ? 'Update'
                    : `Add ${modalType === 'income' ? 'Income' : 'Expense'}`}
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
              <h3 className="text-lg font-semibold text-surface-900 mb-2">
                Delete {activeTab === 'income' ? 'Income' : 'Expense'}
              </h3>
              <p className="text-surface-500 mb-6">
                Are you sure you want to delete this {activeTab === 'income' ? 'income entry' : 'expense'}? This action cannot be undone.
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
