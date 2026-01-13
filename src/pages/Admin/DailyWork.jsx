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

/**
 * DailyWork Component (Admin)
 * Allows admins to view, add, and manage all workers' daily work entries
 * Follows international standards for date formatting (ISO 8601)
 */
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

  // Filters
  const [filters, setFilters] = useState({
    userId: '',
    date: new Date().toISOString().split('T')[0],
    startDate: '',
    endDate: '',
    filterType: 'date', // 'date' or 'range'
  });

  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    date: new Date().toISOString().split('T')[0],
    quantity: '',
    pricePerUnit: '',
    description: '',
    descriptionId: null,
    updateDescriptionPrice: false, // Save price to description
  });

  // Description search/filter state
  const [descriptionSearch, setDescriptionSearch] = useState('');
  const [showDescriptionDropdown, setShowDescriptionDropdown] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchWorkers();
    fetchDescriptions();
  }, []);

  // Fetch work data when filters change
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

  // Filtered descriptions based on search
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
    console.log('Selected description:', desc);
    setFormData({
      ...formData,
      description: desc.text,
      descriptionId: desc.id,
      // Auto-fill price per unit if description has a saved price
      pricePerUnit: desc.pricePerUnit ? desc.pricePerUnit.toString() : formData.pricePerUnit,
    });
    console.log('Updated pricePerUnit:', desc.pricePerUnit ? desc.pricePerUnit.toString() : formData.pricePerUnit);
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

      // If new description, create it first
      if (!formData.descriptionId && formData.description) {
        try {
          const newDesc = await createWorkDescription(
            formData.description,
            formData.pricePerUnit // Pass the price per unit
          );
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
        // For admin creating work for a user, we need to handle this differently
        // The backend should support admin creating work for any user
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const inputClasses =
    'w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500';
  const buttonClasses =
    'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50';

  if (loading && works.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading work data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 xs:gap-4 mb-6">
              <h1 className="text-2xl xs:text-3xl font-bold text-gray-900">Daily Work Management</h1>
              <button onClick={() => handleOpenModal()} className={buttonClasses + ' whitespace-nowrap text-sm xs:text-base'}>
                + Add Work Entry
              </button>
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
            <div className="bg-white rounded-lg shadow p-3 xs:p-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1">
                    Filter Type
                  </label>
                  <select
                    value={filters.filterType}
                    onChange={(e) =>
                      setFilters({ ...filters, filterType: e.target.value })
                    }
                    className={inputClasses}
                  >
                    <option value="date">Single Date</option>
                    <option value="range">Date Range</option>
                  </select>
                </div>

                {filters.filterType === 'date' ? (
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={filters.date}
                      onChange={(e) =>
                        setFilters({ ...filters, date: e.target.value })
                      }
                      className={inputClasses}
                    />
                  </div>
                ) : (
                  <>
                    <div className="sm:col-span-1 lg:col-span-1">
                      <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) =>
                          setFilters({ ...filters, startDate: e.target.value })
                        }
                        className={inputClasses}
                      />
                    </div>
                    <div className="sm:col-span-1 lg:col-span-1">
                      <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) =>
                          setFilters({ ...filters, endDate: e.target.value })
                        }
                        className={inputClasses}
                      />
                    </div>
                  </>
                )}

                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1">
                    Worker
                  </label>
                  <select
                    value={filters.userId}
                    onChange={(e) =>
                      setFilters({ ...filters, userId: e.target.value })
                    }
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
              </div>
            </div>

            {/* Statistics Cards */}
            {statistics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 text-sm font-semibold">Total Entries</h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {statistics.summary?.totalRecords || 0}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 text-sm font-semibold">Total Quantity</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {statistics.summary?.totalQuantity || 0}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 text-sm font-semibold">Total Payout</h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {formatCurrency(statistics.summary?.totalEarnings || 0)}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-600 text-sm font-semibold">Avg per Entry</h3>
                  <p className="text-3xl font-bold text-orange-600">
                    {formatCurrency(statistics.summary?.averageEarning || 0)}
                  </p>
                </div>
              </div>
            )}

            {/* Work List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto -mx-4 xs:mx-0">
                {works.length > 0 ? (
                  <table className="min-w-full divide-y divide-gray-200 text-xs xs:text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Worker
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
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attendance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {works.map((work) => (
                        <tr key={work.id} className="hover:bg-gray-50">
                          <td className="px-3 xs:px-6 py-2 xs:py-4 whitespace-nowrap text-gray-900">
                            {formatDate(work.date)}
                          </td>
                          <td className="px-3 xs:px-6 py-2 xs:py-4 whitespace-nowrap text-gray-900">
                            {work.user?.name || '-'}
                          </td>
                          <td className="px-3 xs:px-6 py-2 xs:py-4 text-gray-900 max-w-xs truncate">
                            {work.description?.text || '-'}
                          </td>
                          <td className="px-3 xs:px-6 py-2 xs:py-4 whitespace-nowrap text-gray-900">
                            {work.quantity}
                          </td>
                          <td className="px-3 xs:px-6 py-2 xs:py-4 whitespace-nowrap text-gray-900">
                            {formatCurrency(work.pricePerUnit)}
                          </td>
                          <td className="px-3 xs:px-6 py-2 xs:py-4 whitespace-nowrap font-semibold text-green-600">
                            {formatCurrency(work.totalAmount)}
                          </td>
                          <td className="px-3 xs:px-6 py-2 xs:py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                work.attendance?.status === 'PRESENT'
                                  ? 'bg-green-100 text-green-800'
                                  : work.attendance?.status === 'HALF_DAY'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : work.attendance?.status === 'LEAVE'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {work.attendance?.status || 'N/A'}
                            </span>
                          </td>
                          <td className="px-3 xs:px-6 py-2 xs:py-4 whitespace-nowrap text-xs xs:text-sm space-x-1 xs:space-x-2">
                            <button
                              onClick={() => handleOpenModal(work)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(work.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No work entries found</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Try changing the filters or add a new entry
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal */}
            {showModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[95vh] xs:max-h-[90vh] overflow-y-auto">
                  <div className="p-4 xs:p-6">
                    <h2 className="text-xl xs:text-2xl font-bold mb-4 xs:mb-6">
                      {isEditing ? 'Edit Work Entry' : 'Add Work Entry'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-3 xs:space-y-4">
                      {/* Worker Selection */}
                      {!isEditing && (
                        <div className="mb-3 xs:mb-4">
                          <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
                            Worker *
                          </label>
                          <select
                            value={formData.userId}
                            onChange={(e) =>
                              setFormData({ ...formData, userId: e.target.value })
                            }
                            className={inputClasses}
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

                      {/* Date */}
                      <div className="mb-3 xs:mb-4">
                        <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
                          Date *
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                          }
                          className={inputClasses}
                          required
                          disabled={isEditing}
                        />
                      </div>

                      {/* Description with Autocomplete */}
                      <div className="mb-3 xs:mb-4 relative">
                        <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
                          Work Description *
                        </label>
                        <input
                          type="text"
                          value={descriptionSearch}
                          onChange={handleDescriptionChange}
                          onFocus={() => setShowDescriptionDropdown(true)}
                          placeholder="Type or select description..."
                          className={inputClasses}
                          required
                        />
                        {showDescriptionDropdown && filteredDescriptions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {filteredDescriptions.map((desc, index) => (
                              <div
                                key={desc.id}
                                onClick={() => handleDescriptionSelect(desc)}
                                className={`px-4 py-3 cursor-pointer flex justify-between items-center hover:bg-blue-100 transition ${
                                  index !== filteredDescriptions.length - 1 ? 'border-b border-gray-100' : ''
                                }`}
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-800 font-medium truncate">
                                    {desc.text}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                  {desc.pricePerUnit ? (
                                    <span className="text-sm font-semibold text-blue-600 whitespace-nowrap">
                                      ₹{desc.pricePerUnit.toFixed(2)}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                      No price
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Type to search or select from list below
                        </p>
                      </div>

                      {/* Quantity */}
                      <div className="mb-3 xs:mb-4">
                        <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
                          Quantity (Units) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.quantity}
                          onChange={(e) =>
                            setFormData({ ...formData, quantity: e.target.value })
                          }
                          className={inputClasses}
                          placeholder="Enter quantity"
                          required
                        />
                      </div>

                      {/* Price per Unit */}
                      <div className="mb-3 xs:mb-4">
                        <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
                          Price per Unit (₹) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={formData.pricePerUnit}
                          onChange={(e) =>
                            setFormData({ ...formData, pricePerUnit: e.target.value })
                          }
                          className={inputClasses}
                          placeholder="Enter price per unit"
                          required
                        />
                      </div>

                      {/* Total Preview */}
                      {formData.quantity && formData.pricePerUnit && (
                        <div className="mb-4 xs:mb-6 p-3 xs:p-4 bg-green-50 rounded-lg">
                          <p className="text-xs xs:text-sm text-gray-600">Total Amount</p>
                          <p className="text-xl xs:text-2xl font-bold text-green-600">
                            {formatCurrency(
                              parseFloat(formData.quantity || 0) *
                                parseFloat(formData.pricePerUnit || 0)
                            )}
                          </p>
                        </div>
                      )}

                      {/* Save Price to Description */}
                      {formData.descriptionId && (
                        <div className="mb-4">
                          <label className="flex items-center text-xs xs:text-sm">
                            <input
                              type="checkbox"
                              checked={formData.updateDescriptionPrice}
                              onChange={(e) =>
                                setFormData({ ...formData, updateDescriptionPrice: e.target.checked })
                              }
                              className="w-4 h-4 mr-2 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-700">Update description price (₹{formData.pricePerUnit})</span>
                          </label>
                        </div>
                      )}

                      {/* Buttons */}
                      <div className="flex gap-2 xs:gap-3 pt-3 xs:pt-4">
                        <button
                          type="button"
                          onClick={handleCloseModal}
                          className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-xs xs:text-base"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className={`flex-1 ${buttonClasses} text-xs xs:text-base`}
                        >
                          {submitting
                            ? 'Saving...'
                            : isEditing
                            ? 'Update Entry'
                            : 'Create Entry'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
  );
};

export default DailyWork;
