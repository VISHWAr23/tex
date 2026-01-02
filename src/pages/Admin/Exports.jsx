import React, { useState, useEffect, useMemo } from 'react';
import {
  getAllExports,
  createExport,
  updateExport,
  deleteExport,
  getExportDescriptions,
  getExportStatistics,
  getCompanies,
} from '../../api/exportsAPI';

/**
 * Exports Component (Admin)
 * Allows admins to manage company export records
 * Follows international standards for date formatting (ISO 8601)
 */
const Exports = () => {
  const [exports, setExports] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedExport, setSelectedExport] = useState(null);
  const [statistics, setStatistics] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    companyName: '',
    date: new Date().toISOString().split('T')[0],
    startDate: '',
    endDate: '',
    filterType: 'date', // 'date' or 'range'
  });

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
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
    fetchCompanies();
    fetchDescriptions();
  }, []);

  // Fetch export data when filters change
  useEffect(() => {
    fetchData();
  }, [filters.companyName, filters.date, filters.startDate, filters.endDate, filters.filterType]);

  const fetchCompanies = async () => {
    try {
      const companiesList = await getCompanies();
      // Extract company names from company objects
      const names = companiesList.map(c => c.name);
      setCompanies(names || []);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const fetchDescriptions = async () => {
    try {
      const data = await getExportDescriptions();
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

      const companyName = filters.companyName || undefined;

      const [exportData, statsData] = await Promise.all([
        getAllExports(companyName, startDate, endDate),
        getExportStatistics(companyName, startDate, endDate),
      ]);

      setExports(exportData || []);
      setStatistics(statsData);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch export data');
      setExports([]);
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

  const handleOpenModal = (exportItem = null) => {
    if (exportItem) {
      setIsEditing(true);
      setSelectedExport(exportItem);
      setFormData({
        companyName: exportItem.company?.name || '',
        date: exportItem.date.split('T')[0],
        quantity: exportItem.quantity.toString(),
        pricePerUnit: exportItem.pricePerUnit.toString(),
        description: exportItem.description?.text || '',
        descriptionId: exportItem.descriptionId,
        updateDescriptionPrice: false,
      });
      setDescriptionSearch(exportItem.description?.text || '');
    } else {
      setIsEditing(false);
      setSelectedExport(null);
      setFormData({
        companyName: '',
        date: new Date().toISOString().split('T')[0],
        quantity: '',
        pricePerUnit: '',
        description: '',
        descriptionId: null,
        updateDescriptionPrice: false,
      });
      setDescriptionSearch('');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      companyName: '',
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
      // Auto-fill price per unit if description has a saved price
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
        companyName: formData.companyName,
        date: formData.date,
        quantity: parseInt(formData.quantity, 10),
        pricePerUnit: parseFloat(formData.pricePerUnit),
        description: formData.description,
        descriptionId: formData.descriptionId,
        updateDescriptionPrice: formData.updateDescriptionPrice,
      };

      if (isEditing) {
        await updateExport(selectedExport.id, payload);
        setSuccess('Export entry updated successfully!');
      } else {
        await createExport(payload);
        setSuccess('Export entry created successfully!');
      }

      handleCloseModal();
      fetchData();
      fetchDescriptions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save export entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (exportId) => {
    if (!window.confirm('Are you sure you want to delete this export entry?')) {
      return;
    }

    try {
      await deleteExport(exportId);
      setSuccess('Export entry deleted successfully!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete export entry');
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

  if (loading && exports.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading export data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Export Management</h1>
          <button onClick={() => handleOpenModal()} className={buttonClasses}>
            + Add Export Entry
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

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold">Total Revenue</h3>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(statistics.summary.totalRevenue)}</p>
              <p className="text-sm text-gray-600 mt-1">{statistics.summary.totalExports} exports</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold">Total Quantity</h3>
              <p className="text-3xl font-bold text-green-600">{statistics.summary.totalQuantity.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">Units exported</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 text-sm font-semibold">Average Price</h3>
              <p className="text-3xl font-bold text-purple-600">{formatCurrency(statistics.summary.averagePrice)}</p>
              <p className="text-sm text-gray-600 mt-1">Per unit</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                value={filters.companyName}
                onChange={(e) =>
                  setFilters({ ...filters, companyName: e.target.value })
                }
                placeholder="Filter by company"
                className={inputClasses}
                list="company-suggestions"
              />
              <datalist id="company-suggestions">
                {companies.map((company, idx) => (
                  <option key={idx} value={company} />
                ))}
              </datalist>
            </div>
          </div>
        </div>

        {/* Export Records Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {exports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {exports.map((exportItem) => (
                    <tr key={exportItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(exportItem.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {exportItem.company?.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {exportItem.description?.text}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {exportItem.quantity.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatCurrency(exportItem.pricePerUnit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {formatCurrency(exportItem.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleOpenModal(exportItem)}
                          className="text-amber-600 hover:text-amber-800 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(exportItem.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-600">
              No export records found. Click "Add Export Entry" to create one.
            </div>
          )}
        </div>
      </div>

      {/* Modal for Create/Edit Export */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {isEditing ? 'Edit Export Entry' : 'Add Export Entry'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  className={inputClasses}
                  placeholder="Enter company/client name"
                  required
                  list="company-list"
                />
                <datalist id="company-list">
                  {companies.map((company, idx) => (
                    <option key={idx} value={company} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={descriptionSearch}
                    onChange={handleDescriptionChange}
                    onFocus={() => setShowDescriptionDropdown(true)}
                    className={inputClasses}
                    placeholder="Type or select description"
                    required
                  />
                  {showDescriptionDropdown && filteredDescriptions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredDescriptions.map((desc) => (
                        <div
                          key={desc.id}
                          onClick={() => handleDescriptionSelect(desc)}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                        >
                          <span>{desc.text}</span>
                          {desc.pricePerUnit && (
                            <span className="text-xs text-blue-600">
                              {formatCurrency(desc.pricePerUnit)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className={inputClasses}
                  placeholder="Enter quantity"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Per Unit *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.pricePerUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerUnit: e.target.value })
                  }
                  className={inputClasses}
                  placeholder="Enter price per unit"
                  required
                />
                <div className="mt-2">
                  <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.updateDescriptionPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, updateDescriptionPrice: e.target.checked })
                      }
                      className="mr-2 rounded"
                    />
                    Save this price with description for future use
                  </label>
                </div>
              </div>

              {formData.quantity && formData.pricePerUnit && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Total Amount:{' '}
                    <span className="font-bold text-blue-600">
                      {formatCurrency(
                        parseFloat(formData.quantity || 0) * parseFloat(formData.pricePerUnit || 0)
                      )}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className={buttonClasses + ' flex-1'}
                  disabled={submitting}
                >
                  {submitting
                    ? 'Saving...'
                    : isEditing
                    ? 'Update Export'
                    : 'Create Export'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
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

export default Exports;
