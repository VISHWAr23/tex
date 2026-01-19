import React, { useState, useEffect, useMemo } from 'react';
import {
  getAllWork,
  createWork,
  updateWork,
  deleteWork,
  getWorkDescriptions,
  createWorkDescription,
  getWorkStatistics,
} from '../../api/workAPI';
import { usersAPI } from '../../api/usersAPI';

const DailyWork = () => {
  const [works, setWorks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);
  const [statistics, setStatistics] = useState(null);

  const [filters, setFilters] = useState({
    userId: '',
    date: new Date().toISOString().split('T')[0],
    startDate: '',
    endDate: '',
    filterType: 'date',
  });

  const [formData, setFormData] = useState({
    userId: '',
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    pricePerUnit: '',
    description: '',
    descriptionId: null,
    updateDescriptionPrice: false,
  });

  const [descriptionSearch, setDescriptionSearch] = useState('');
  const [showDescriptionDropdown, setShowDescriptionDropdown] = useState(false);

  useEffect(() => {
    fetchWorkers();
    fetchDescriptions();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters.userId, filters.date, filters.startDate, filters.endDate, filters.filterType]);

  const fetchWorkers = async () => {
    try {
      const response = await usersAPI.getAllUsers();
      const workersList = response.data.filter((u) => u.role === 'WORKER');
      setWorkers(workersList);
    } catch (err) {
      console.error('Failed to fetch workers:', err);
    }
  };

  const fetchDescriptions = async () => {
    try {
      const data = await getWorkDescriptions();
      setDescriptions(data || []);
    } catch (err) {
      console.error('Failed to fetch descriptions:', err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      let startDate, endDate;

      if (filters.filterType === 'date') {
        startDate = filters.date;
        endDate = filters.date;
      } else {
        startDate = filters.startDate;
        endDate = filters.endDate;
      }

      const userId = filters.userId || undefined;

      const [workData, statsData] = await Promise.all([
        getAllWork(userId, startDate, endDate),
        getWorkStatistics(userId, startDate, endDate),
      ]);

      setWorks(workData || []);
      setStatistics(statsData);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch work data');
      setWorks([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredDescriptions = useMemo(() => {
    if (!descriptionSearch.trim()) return descriptions;
    const search = descriptionSearch.toLowerCase();
    return descriptions.filter((d) => d.text.toLowerCase().includes(search));
  }, [descriptions, descriptionSearch]);

  const handleOpenModal = (work = null) => {
    if (work) {
      setIsEditing(true);
      setSelectedWork(work);
      setFormData({
        userId: work.userId.toString(),
        date: work.date.split('T')[0],
        quantity: work.quantity.toString(),
        pricePerUnit: work.pricePerUnit.toString(),
        description: work.description?.text || '',
        descriptionId: work.descriptionId,
        updateDescriptionPrice: false,
      });
      setDescriptionSearch(work.description?.text || '');
    } else {
      setIsEditing(false);
      setSelectedWork(null);
      setFormData({
        userId: '',
        date: new Date().toISOString().split('T')[0],
        quantity: '',
        pricePerUnit: '',
        description: '',
        descriptionId: null,
      });
      setDescriptionSearch('');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      userId: '',
      date: new Date().toISOString().split('T')[0],
      quantity: '',
      pricePerUnit: '',
      description: '',
      descriptionId: null,
      updateDescriptionPrice: false,
    });
    setDescriptionSearch('');
    setShowDescriptionDropdown(false);
  };

  const handleDescriptionSelect = (desc) => {
    setFormData({
      ...formData,
      description: desc.text,
      descriptionId: desc.id,
      pricePerUnit: desc.pricePerUnit ? desc.pricePerUnit.toString() : formData.pricePerUnit,
    });
    setDescriptionSearch(desc.text);
    setShowDescriptionDropdown(false);
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescriptionSearch(value);
    setFormData({
      ...formData,
      description: value,
      descriptionId: null,
    });
    setShowDescriptionDropdown(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        date: formData.date,
        quantity: parseInt(formData.quantity, 10),
        pricePerUnit: parseFloat(formData.pricePerUnit),
        description: formData.description,
        descriptionId: formData.descriptionId,
        updateDescriptionPrice: formData.updateDescriptionPrice,
      };

      if (!formData.descriptionId && formData.description) {
        try {
          const newDesc = await createWorkDescription(formData.description, formData.pricePerUnit);
          payload.descriptionId = newDesc.id;
          fetchDescriptions();
        } catch (descErr) {
          console.log('Description creation skipped:', descErr);
        }
      }

      if (isEditing) {
        await updateWork(selectedWork.id, payload);
        setSuccess('Work entry updated successfully!');
      } else {
        await createWork({ ...payload, userId: parseInt(formData.userId, 10) });
        setSuccess('Work entry created successfully!');
      }

      handleCloseModal();
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save work entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (workId) => {
    if (!window.confirm('Are you sure you want to delete this work entry?')) {
      return;
    }

    try {
      await deleteWork(workId);
      setSuccess('Work entry deleted successfully!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete work entry');
    }
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && works.length === 0) {
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
          <h1 className="page-title">Daily Work Management</h1>
          <p className="page-subtitle">Track and manage all work entries</p>
        </div>
        <button onClick={() => handleOpenModal()} className="action-button">
          <svg className="action-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Work Entry</span>
        </button>
      </div>

      {/* Messages */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="form-group">
            <label className="label">Filter Type</label>
            <select
              value={filters.filterType}
              onChange={(e) => setFilters({ ...filters, filterType: e.target.value })}
              className="select"
            >
              <option value="date">Single Date</option>
              <option value="range">Date Range</option>
            </select>
          </div>

          {filters.filterType === 'date' ? (
            <div className="form-group">
              <label className="label">Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                className="input"
              />
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="label">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="label">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="input"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="label">Worker</label>
            <select
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
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
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="stat-label">Total Entries</p>
            <p className="stat-value text-brand-600">{statistics.summary?.totalRecords || 0}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Quantity</p>
            <p className="stat-value text-accent-emerald">{statistics.summary?.totalQuantity || 0}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Payout</p>
            <p className="stat-value text-accent-violet">{formatCurrency(statistics.summary?.totalEarnings || 0)}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Avg per Entry</p>
            <p className="stat-value text-accent-amber">{formatCurrency(statistics.summary?.averageEarning || 0)}</p>
          </div>
        </div>
      )}

      {/* Work Table */}
      <div className="table-container">
        {works.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Worker</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Price/Unit</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {works.map((work) => (
                <tr key={work.id}>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-medium text-surface-900">{formatDate(work.date)}</span>
                      <span className="text-xs text-surface-500">
                        {new Date(work.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                      </span>
                    </div>
                  </td>
                  <td className="font-medium">{work.user?.name || '-'}</td>
                  <td className="max-w-xs truncate">{work.description?.text || '-'}</td>
                  <td>
                    <span className="badge badge-neutral">{work.quantity}</span>
                  </td>
                  <td>{formatCurrency(work.pricePerUnit)}</td>
                  <td>
                    <span className="font-semibold text-accent-emerald">{formatCurrency(work.totalAmount)}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleOpenModal(work)} className="btn-ghost btn-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(work.id)} className="btn-ghost btn-sm text-accent-rose hover:bg-red-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
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
            <p className="empty-state-title">No work entries found</p>
            <p className="empty-state-text">Try changing the filters or add a new entry</p>
            <button onClick={() => handleOpenModal()} className="btn-primary mt-4">
              Add Entry
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{isEditing ? 'Edit Work Entry' : 'Add Work Entry'}</h2>
              <button onClick={handleCloseModal} className="btn-ghost btn-icon">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                {!isEditing && (
                  <div className="form-group">
                    <label className="label">Worker *</label>
                    <select
                      value={formData.userId}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                      className="select"
                      required
                    >
                      <option value="">Select Worker</option>
                      {workers.map((worker) => (
                        <option key={worker.id} value={worker.id}>
                          {worker.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="label">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input"
                    required
                    disabled={isEditing}
                  />
                </div>

                <div className="form-group relative">
                  <label className="label">Work Description *</label>
                  <input
                    type="text"
                    value={descriptionSearch}
                    onChange={handleDescriptionChange}
                    onFocus={() => setShowDescriptionDropdown(true)}
                    placeholder="Type or select description..."
                    className="input"
                    required
                  />
                  {showDescriptionDropdown && filteredDescriptions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-surface-200 shadow-medium max-h-60 overflow-y-auto">
                      {filteredDescriptions.map((desc) => (
                        <div
                          key={desc.id}
                          onClick={() => handleDescriptionSelect(desc)}
                          className="px-4 py-3 cursor-pointer flex justify-between items-center hover:bg-surface-50 transition border-b border-surface-100 last:border-b-0"
                        >
                          <p className="text-sm text-surface-800 font-medium truncate">{desc.text}</p>
                          {desc.pricePerUnit ? (
                            <span className="text-sm font-semibold text-brand-600 whitespace-nowrap ml-2">
                              ₹{desc.pricePerUnit.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-xs text-surface-400 whitespace-nowrap ml-2">No price</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="mt-1 text-xs text-surface-500">Type to search or select from list</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="label">Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="input"
                      placeholder="Enter quantity"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="label">Price/Unit (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.pricePerUnit}
                      onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                      className="input"
                      placeholder="Enter price"
                      required
                    />
                  </div>
                </div>

                {formData.quantity && formData.pricePerUnit && (
                  <div className="p-4 bg-accent-emerald/10 border border-accent-emerald/20">
                    <p className="text-sm text-surface-600">Total Amount</p>
                    <p className="text-2xl font-bold text-accent-emerald">
                      {formatCurrency(parseFloat(formData.quantity || 0) * parseFloat(formData.pricePerUnit || 0))}
                    </p>
                  </div>
                )}

                {formData.descriptionId && (
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.updateDescriptionPrice}
                      onChange={(e) => setFormData({ ...formData, updateDescriptionPrice: e.target.checked })}
                      className="w-4 h-4 accent-brand-600"
                    />
                    <span className="text-surface-700">Update description price to ₹{formData.pricePerUnit}</span>
                  </label>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="modal-btn-cancel">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="modal-btn-submit">
                  {submitting ? 'Saving...' : isEditing ? 'Update Entry' : 'Create Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyWork;
