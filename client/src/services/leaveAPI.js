import api from './api';

const leaveAPI = {
  // Apply for leave
  applyLeave: (leaveData) => api.post('/leaves', leaveData),
  
  // Get my leaves
  getMyLeaves: (params = {}) => {
    const query = new URLSearchParams(params);
    return api.get(`/leaves/my-leaves?${query}`);
  },
  
  // Get all leaves (for managers/admins)
  getAllLeaves: (params = {}) => {
    const query = new URLSearchParams(params);
    return api.get(`/leaves?${query}`);
  },
  
  // Update leave status (approve/reject)
  updateLeaveStatus: (leaveId, statusData) => 
    api.put(`/leaves/${leaveId}/status`, statusData),
  
  // Cancel leave
  cancelLeave: (leaveId) => api.put(`/leaves/${leaveId}/cancel`),
  
  // Get leave statistics
  getLeaveStats: (year) => {
    const params = year ? `?year=${year}` : '';
    return api.get(`/leaves/stats${params}`);
  },
  
  // Get leave balance
  getLeaveBalance: (year) => {
    const params = year ? `?year=${year}` : '';
    return api.get(`/leaves/balance${params}`);
  }
};

export default leaveAPI; 