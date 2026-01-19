import axiosInstance from './axiosInstance';

/**
 * Analytics API Service
 * Handles all analytics and reporting-related API calls
 * Follows international standards for financial reporting
 */

/**
 * Get comprehensive salary analytics
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {number} workerId - Optional worker ID for individual analysis
 * @returns {Promise<Object>} Analytics data
 */
export const getSalaryAnalytics = async (startDate, endDate, workerId) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (workerId) params.append('workerId', workerId);

  const queryString = params.toString();
  const response = await axiosInstance.get(`/analytics/salary${queryString ? '?' + queryString : ''}`);
  return response.data;
};

/**
 * Get revenue analytics from exports
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {number} companyId - Optional company ID for individual analysis
 * @returns {Promise<Object>} Revenue analytics data
 */
export const getRevenueAnalytics = async (startDate, endDate, companyId) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (companyId) params.append('companyId', companyId);

  const queryString = params.toString();
  const response = await axiosInstance.get(`/analytics/revenue${queryString ? '?' + queryString : ''}`);
  return response.data;
};

/**
 * Get comprehensive financial overview
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Object>} Financial overview data
 */
export const getFinancialOverview = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString();
  const response = await axiosInstance.get(`/analytics/financial-overview${queryString ? '?' + queryString : ''}`);
  return response.data;
};

/**
 * Get worker productivity analytics
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Object>} Worker productivity data
 */
export const getWorkerProductivity = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString();
  const response = await axiosInstance.get(`/analytics/worker-productivity${queryString ? '?' + queryString : ''}`);
  return response.data;
};

/**
 * Get profit margin analysis
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Object>} Profit margin data
 */
export const getProfitMarginAnalysis = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString();
  const response = await axiosInstance.get(`/analytics/profit-margin${queryString ? '?' + queryString : ''}`);
  return response.data;
};

/**
 * Export analytics report as Excel
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {string} reportType - Type of report (salary, revenue, financial-overview, etc.)
 * @returns {Promise<Blob>} Excel file blob
 */
export const exportAnalyticsReport = async (startDate, endDate, reportType) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  params.append('reportType', reportType);

  const response = await axiosInstance.get(`/analytics/export?${params.toString()}`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Get worker salary breakdown by date range
 * @param {number} workerId - Worker ID
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Object>} Worker salary breakdown
 */
export const getWorkerSalaryBreakdown = async (workerId, startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString();
  const response = await axiosInstance.get(`/analytics/worker/${workerId}/salary${queryString ? '?' + queryString : ''}`);
  return response.data;
};