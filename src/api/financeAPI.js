import axiosInstance from './axiosInstance';

/**
 * Finance API Service
 * Handles all expense-related API calls
 * Supports both COMPANY and HOME expense types
 */

// ============== COMPANY EXPENSES ==============

/**
 * Create a company expense
 */
export const createCompanyExpense = async (data) => {
  const response = await axiosInstance.post('/finance/company', data);
  return response.data;
};

/**
 * Get all company expenses
 */
export const getCompanyExpenses = async (startDate, endDate, category) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (category) params.append('category', category);

  const response = await axiosInstance.get(`/finance/company?${params}`);
  return response.data;
};

/**
 * Get company expense statistics
 */
export const getCompanyStatistics = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await axiosInstance.get(`/finance/company/statistics?${params}`);
  return response.data;
};

/**
 * Get company expense categories
 */
export const getCompanyCategories = async () => {
  const response = await axiosInstance.get('/finance/company/categories');
  return response.data;
};

// ============== HOME EXPENSES ==============

/**
 * Create a home expense
 */
export const createHomeExpense = async (data) => {
  const response = await axiosInstance.post('/finance/home', data);
  return response.data;
};

/**
 * Get all home expenses
 */
export const getHomeExpenses = async (startDate, endDate, category) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (category) params.append('category', category);

  const response = await axiosInstance.get(`/finance/home?${params}`);
  return response.data;
};

/**
 * Get home expense statistics
 */
export const getHomeStatistics = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await axiosInstance.get(`/finance/home/statistics?${params}`);
  return response.data;
};

/**
 * Get home expense categories
 */
export const getHomeCategories = async () => {
  const response = await axiosInstance.get('/finance/home/categories');
  return response.data;
};

// ============== GENERAL ENDPOINTS ==============

/**
 * Get all expenses
 */
export const getAllExpenses = async (startDate, endDate, type, category) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (type) params.append('type', type);
  if (category) params.append('category', category);

  const response = await axiosInstance.get(`/finance?${params}`);
  return response.data;
};

/**
 * Get overall statistics
 */
export const getOverallStatistics = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await axiosInstance.get(`/finance/statistics?${params}`);
  return response.data;
};

/**
 * Get expense by ID
 */
export const getExpenseById = async (id) => {
  const response = await axiosInstance.get(`/finance/${id}`);
  return response.data;
};

/**
 * Update expense
 */
export const updateExpense = async (id, data) => {
  const response = await axiosInstance.put(`/finance/${id}`, data);
  return response.data;
};

/**
 * Delete expense
 */
export const deleteExpense = async (id) => {
  const response = await axiosInstance.delete(`/finance/${id}`);
  return response.data;
};

/**
 * Get all categories
 */
export const getAllCategories = async () => {
  const response = await axiosInstance.get('/finance/categories');
  return response.data;
};
