import axiosInstance from './axiosInstance';

/**
 * Exports API Service
 * Handles all API calls for export tracking
 * Uses shared WorkDescription model from work module
 * International Standard: ISO 8601 date format (YYYY-MM-DD)
 */

// ============== WORK DESCRIPTIONS (SHARED) ==============

/**
 * Get all work descriptions (shared with Work module)
 */
export const getExportDescriptions = async () => {
  try {
    const response = await axiosInstance.get('/exports/descriptions');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ============== EXPORT RECORDS ==============

/**
 * Create new export entry
 */
export const createExport = async (exportData) => {
  try {
    const response = await axiosInstance.post('/exports', exportData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get all exports with optional filters
 */
export const getAllExports = async (companyName, startDate, endDate, description) => {
  try {
    let url = '/exports';
    const params = [];
    if (companyName) params.push(`companyName=${companyName}`);
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (description) params.push(`description=${description}`);
    if (params.length > 0) url += '?' + params.join('&');

    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get export by ID
 */
export const getExportById = async (id) => {
  try {
    const response = await axiosInstance.get(`/exports/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Update export entry
 */
export const updateExport = async (id, exportData) => {
  try {
    const response = await axiosInstance.put(`/exports/${id}`, exportData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete export entry
 */
export const deleteExport = async (id) => {
  try {
    const response = await axiosInstance.delete(`/exports/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get export statistics
 */
export const getExportStatistics = async (companyName, startDate, endDate) => {
  try {
    let url = '/exports/statistics';
    const params = [];
    if (companyName) params.push(`companyName=${companyName}`);
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length > 0) url += '?' + params.join('&');

    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get unique company names
 */
export const getCompanies = async () => {
  try {
    const response = await axiosInstance.get('/exports/companies');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
