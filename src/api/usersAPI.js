import axiosInstance from './axiosInstance';

const API_BASE = '/users';

export const usersAPI = {
  /**
   * Get all users (admin only)
   */
  getAllUsers: () => {
    return axiosInstance.get(API_BASE);
  },

  /**
   * Get user statistics (admin only)
   */
  getStatistics: () => {
    return axiosInstance.get(`${API_BASE}/stats`);
  },

  /**
   * Get current user profile
   */
  getCurrentUser: () => {
    return axiosInstance.get(`${API_BASE}/me`);
  },

  /**
   * Get user by ID
   */
  getUserById: (id) => {
    return axiosInstance.get(`${API_BASE}/${id}`);
  },

  /**
   * Create a new user (admin only)
   */
  createUser: (userData) => {
    return axiosInstance.post(API_BASE, userData);
  },

  /**
   * Update user details
   */
  updateUser: (id, updateData) => {
    return axiosInstance.put(`${API_BASE}/${id}`, updateData);
  },

  /**
   * Change user password
   */
  changePassword: (id, passwordData) => {
    return axiosInstance.post(`${API_BASE}/${id}/change-password`, passwordData);
  },

  /**
   * Delete user (admin only)
   */
  deleteUser: (id) => {
    return axiosInstance.delete(`${API_BASE}/${id}`);
  },

  /**
   * Get worker details with salary information
   */
  getWorkerDetails: (id, month = null) => {
    const params = month ? { month } : {};
    return axiosInstance.get(`${API_BASE}/${id}/details`, { params });
  },

  /**
   * Create salary payment for a worker
   */
  createSalaryPayment: (userId, paymentData) => {
    return axiosInstance.post(`${API_BASE}/${userId}/salary-payments`, paymentData);
  },

  /**
   * Get salary payments for a worker
   */
  getSalaryPayments: (userId, startDate = null, endDate = null) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return axiosInstance.get(`${API_BASE}/${userId}/salary-payments`, { params });
  },

  /**
   * Delete salary payment
   */
  deleteSalaryPayment: (paymentId) => {
    return axiosInstance.delete(`${API_BASE}/salary-payments/${paymentId}`);
  },
};
