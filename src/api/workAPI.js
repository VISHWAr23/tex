import axiosInstance from './axiosInstance';

/**
 * Work API Service
 * Handles all API calls for work tracking and attendance
 * International Standard: ISO 8601 date format (YYYY-MM-DD)
 */

// ============== WORK DESCRIPTIONS ==============

/**
 * Get all work descriptions for dropdown
 */
export const getWorkDescriptions = async () => {
  try {
    const response = await axiosInstance.get('/work/descriptions');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Create new work description
 * Called when worker types new description not in dropdown
 */
export const createWorkDescription = async (text) => {
  try {
    const response = await axiosInstance.post('/work/descriptions', { text });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ============== WORK RECORDS ==============

/**
 * Create new work entry
 * Called when worker submits daily work in evening
 */
export const createWork = async (workData) => {
  try {
    const response = await axiosInstance.post('/work', workData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get work for specific date and user
 * Used to check if work already exists and for daily view
 */
export const getWorkByUserAndDate = async (userId, date) => {
  try {
    const response = await axiosInstance.get(`/work/user/${userId}/date/${date}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // No work record for this date
    }
    throw error.response?.data || error.message;
  }
};

/**
 * Get worker's own work history
 * Optional: startDate, endDate (YYYY-MM-DD)
 */
export const getMyWork = async (startDate, endDate) => {
  try {
    let url = '/work/my-work';
    const params = [];
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
 * Get specific work record by ID
 */
export const getWorkById = async (workId) => {
  try {
    const response = await axiosInstance.get(`/work/${workId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get all work records (Admin only)
 * Optional: userId, startDate, endDate
 */
export const getAllWork = async (userId, startDate, endDate) => {
  try {
    let url = '/work';
    const params = [];
    if (userId) params.push(`userId=${userId}`);
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
 * Update work record
 */
export const updateWork = async (workId, updateData) => {
  try {
    const response = await axiosInstance.put(`/work/${workId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Delete work record
 */
export const deleteWork = async (workId) => {
  try {
    const response = await axiosInstance.delete(`/work/${workId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get work statistics
 * Shows total records, earnings, averages
 * Optional: userId (admin), startDate, endDate
 */
export const getWorkStatistics = async (userId, startDate, endDate) => {
  try {
    let url = '/work/statistics';
    const params = [];
    if (userId) params.push(`userId=${userId}`);
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length > 0) url += '?' + params.join('&');

    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ============== ATTENDANCE ==============

/**
 * Get attendance for specific date
 */
export const getAttendance = async (date, userId) => {
  try {
    let url = `/attendance/${date}`;
    if (userId) url += `?userId=${userId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error.response?.data || error.message;
  }
};

/**
 * Get attendance for date range
 */
export const getAttendanceRange = async (startDate, endDate, userId) => {
  try {
    let url = `/attendance/range/${startDate}/${endDate}`;
    if (userId) url += `?userId=${userId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get attendance summary with statistics
 */
export const getAttendanceSummary = async (startDate, endDate, userId) => {
  try {
    let url = `/attendance/summary/${startDate}/${endDate}`;
    if (userId) url += `?userId=${userId}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get all attendance for specific date (Admin Report)
 */
export const getAttendanceByDate = async (date) => {
  try {
    const response = await axiosInstance.get(`/attendance/by-date/${date}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Get complete attendance report for all workers
 * Admin only
 */
export const getAllAttendanceStats = async (startDate, endDate) => {
  try {
    const response = await axiosInstance.get(
      `/attendance/report/all/${startDate}/${endDate}`,
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

/**
 * Manually update attendance status
 * Admin only - mark leave, half-day, absent, etc.
 */
export const updateAttendanceStatus = async (date, userId, status) => {
  try {
    const response = await axiosInstance.put(`/attendance/${date}/status`, {
      userId,
      status,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
