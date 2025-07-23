import api from './api';

export const leaveAPI = {
  // Get my leaves
  getMyLeaves: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/leaves/my-leaves${queryString ? `?${queryString}` : ''}`);
  },

  // Get leave balance
  getLeaveBalance: () => api.get('/leaves/balance'),

  // Apply for leave
  createLeave: (leaveData) => {
    // Ensure dates are in ISO format
    const formattedData = {
      ...leaveData,
      startDate: new Date(leaveData.startDate).toISOString(),
      endDate: new Date(leaveData.endDate || leaveData.startDate).toISOString()
    };
    return api.post('/leaves', formattedData);
  },

  // Update leave
  updateLeave: (id, leaveData) => api.put(`/leaves/${id}`, leaveData),

  // Delete leave
  deleteLeave: (id) => api.delete(`/leaves/${id}`),

  // Get all leaves (admin/manager)
  getAllLeaves: () => api.get('/leaves'),

  // Approve leave
  approveLeave: (id) => api.put(`/leaves/${id}/approve`),

  // Reject leave
  rejectLeave: (id, reason) => api.put(`/leaves/${id}/reject`, { reason })
};

export default leaveAPI; 