import axios from 'axios';

// Determine if we're in development mode
const isDevelopment = import.meta.env.DEV && import.meta.env.MODE !== 'production';

// API URL configuration - use localhost for development, your Hostinger backend for production
const API_URL = isDevelopment 
  ? 'http://localhost:8080/api' 
  : (import.meta.env.VITE_API_URL || 'https://crm-backend-o36v.onrender.com/api');

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token might be expired or invalid
      const token = localStorage.getItem('token');
      if (token) {
        // Clear invalid token
        localStorage.removeItem('token');
        // Optionally redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/me', userData),
  updateProfilePicture: (formData) => api.put('/auth/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getUsers: (role) => api.get(`/auth/users${role ? `?role=${role}` : ''}`),
  createUser: (userData) => api.post('/auth/users', userData),
  updateUser: (userId, userData) => api.put(`/auth/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/auth/users/${userId}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyOTP: (data) => api.post('/auth/verifyOtp', data),
  resetPassword: (data) => api.post('/auth/reset_password', data)
};

// Leads API
export const leadsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add date filters to params
    if (filters.month) params.append('month', filters.month);
    if (filters.year) params.append('year', filters.year);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const url = queryString ? `/leads?${queryString}` : '/leads';
    
    return api.get(url);
  },
  getById: (id) => api.get(`/leads/${id}`),
  create: (leadData) => api.post('/leads', leadData),
  update: (id, leadData) => api.put(`/leads/${id}`, leadData),
  updateFeedback: (id, feedback) => api.put(`/leads/${id}/feedback`, { feedback }),
  delete: (id) => api.delete(`/leads/${id}`),
  getAssigned: (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add date filters to params
    if (filters.month) params.append('month', filters.month);
    if (filters.year) params.append('year', filters.year);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const url = queryString ? `/leads/assigned?${queryString}` : '/leads/assigned';
    
    return api.get(url);
  },
  getRepeatCustomers: () => api.get('/leads/repeat-customers'),
  import: (leadsData) => api.post('/leads/import', { leads: leadsData }),
  importLeads: (leadsData) => api.post('/leads/import', { leads: leadsData }),
  importCSV: (formData) => api.post('/leads/import-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// Sales API
export const salesAPI = {
  getAll: async () => {
    try {
      console.log('Fetching all sales...');
      const response = await api.get('/sales');
      console.log('Sales API response:', response.data);
      return response;
    } catch (error) {
      console.error('Error fetching sales:', error.response?.data || error.message);
      throw error;
    }
  },
  getAllForced: async () => {
    try {
      console.log('Fetching all sales (forced)...');
      const response = await api.get('/sales?full=true&nocache=' + new Date().getTime());
      console.log('Forced sales API response:', response.data);
      return response;
    } catch (error) {
      console.error('Error fetching sales (forced):', error.response?.data || error.message);
      throw error;
    }
  },
  getById: (id) => api.get(`/sales/${id}`),
  create: (saleData) => {
    // Set isLeadPersonSale to true if leadPerson is specified
    if (saleData.leadPerson) {
      saleData.isLeadPersonSale = true;
    }
    return api.post('/sales', saleData);
  },
  update: (id, saleData) => api.put(`/sales/${id}`, saleData),
  delete: (id) => api.delete(`/sales/${id}`),
  getCount: () => api.get('/sales/count'),
  import: (salesData) => api.post('/sales/import', { sales: salesData }),
  importSales: (salesData) => api.post('/sales/import', { sales: salesData }),
  
  // Reports API
  getCourseAnalysis: (period = 'monthly') => api.get(`/sales/reports/course-analysis?period=${period}`),
  getRevenueAnalysis: (period = '1month') => api.get(`/sales/reports/revenue-analysis?period=${period}`),
  getTopCourses: (period = 'all', limit = 10) => api.get(`/sales/reports/top-courses?period=${period}&limit=${limit}`),
  getStatusAnalysis: (period = '1month', status = null) => {
    const url = status 
      ? `/sales/reports/status-analysis?period=${period}&status=${status}`
      : `/sales/reports/status-analysis?period=${period}`;
    return api.get(url);
  },
  
  // Lead sales specific endpoints
  getLeadSales: (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to params
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const queryString = params.toString();
    const url = queryString ? `/lead-sales?${queryString}` : '/lead-sales';
    
    return api.get(url);
  },
  
  createLeadSale: (saleData, leadPersonId) => {
    return api.post('/lead-sales', { ...saleData, leadPerson: leadPersonId });
  }
};

// Lead Person Sales API
export const leadPersonSalesAPI = {
  getAll: () => api.get('/lead-person-sales'),
  getById: (id) => api.get(`/lead-person-sales/${id}`),
  create: (saleData) => api.post('/lead-person-sales', saleData),
  update: (id, saleData) => api.put(`/lead-person-sales/${id}`, saleData),
  delete: (id) => api.delete(`/lead-person-sales/${id}`),
};

// Tasks API
export const tasksAPI = {
  getAll: () => api.get('/tasks'),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (taskData) => api.post('/tasks', taskData),
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  delete: (id) => api.delete(`/tasks/${id}`),
  markCompleted: (id, completed) => api.put(`/tasks/${id}`, { completed }),
};

// Currency API
export const currencyAPI = {
  getRates: () => api.get('/currency/rates'),
  getRate: (from, to) => api.get(`/currency/rate?from=${from}&to=${to}`),
};

// Prospects API
export const prospectsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to params
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    const queryString = params.toString();
    const url = queryString ? `/prospects?${queryString}` : '/prospects';
    
    return api.get(url);
  },
  getById: (id) => api.get(`/prospects/${id}`),
  create: (prospectData) => api.post('/prospects', prospectData),
  update: (id, prospectData) => api.put(`/prospects/${id}`, prospectData),
  delete: (id) => api.delete(`/prospects/${id}`),
  getStats: () => api.get('/prospects/stats'),
  convertToLead: (id) => api.post(`/prospects/${id}/convert`),
};

// Activity API
export const activityAPI = {
  startSession: () => api.post('/activity/start-session'),
  endSession: (duration) => api.post('/activity/end-session', { duration }),
  trackActivity: (duration, isActive = true) => api.post('/activity/track', { duration, isActive }),
  getMyActivity: (date = null, startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const url = queryString ? `/activity/my-activity?${queryString}` : '/activity/my-activity';
    
    return api.get(url);
  },
  getAllUsersActivity: (date = null, startDate = null, endDate = null) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const queryString = params.toString();
    const url = queryString ? `/activity/all-users?${queryString}` : '/activity/all-users';
    
    return api.get(url);
  },
  getStatistics: (days = 7) => api.get(`/activity/statistics?days=${days}`),
};

// Invoice API
export const invoiceAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    
    // Add filters to params
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.clientEmail) params.append('clientEmail', filters.clientEmail);
    if (filters.invoiceNumber) params.append('invoiceNumber', filters.invoiceNumber);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const queryString = params.toString();
    const url = queryString ? `/invoices?${queryString}` : '/invoices';
    
    return api.get(url);
  },
  getById: (id) => api.get(`/invoices/${id}`),
  create: (invoiceData) => api.post('/invoices', invoiceData),
  update: (id, invoiceData) => api.put(`/invoices/${id}`, invoiceData),
  delete: (id) => api.delete(`/invoices/${id}`),
  generatePDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
  downloadPDF: (id) => api.get(`/invoices/${id}/download`, { responseType: 'blob' }),
  recordPayment: (id, paymentData) => api.post(`/invoices/${id}/payment`, paymentData),
  getStats: (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const url = queryString ? `/invoices/stats?${queryString}` : '/invoices/stats';
    
    return api.get(url);
  }
};

// Payroll API
export const payrollAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.month) queryParams.append('month', params.month);
    if (params.year) queryParams.append('year', params.year);
    if (params.employeeId) queryParams.append('employeeId', params.employeeId);
    const queryString = queryParams.toString();
    return api.get(`/payroll${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => api.get(`/payroll/${id}`),
  generate: (payrollData) => api.post('/payroll/generate', payrollData),
  update: (id, payrollData) => api.put(`/payroll/${id}`, payrollData),
  delete: (id) => api.delete(`/payroll/${id}`),
  approve: (id) => api.put(`/payroll/${id}/approve`),
  generateSalarySlip: (id) => api.get(`/payroll/${id}/salary-slip`, {
    responseType: 'blob',
    headers: {
      'Accept': 'application/pdf'
    }
  }),
  downloadSalarySlip: (id) => api.get(`/payroll/${id}/download`, {
    responseType: 'blob',
    headers: {
      'Accept': 'application/pdf'
    }
  })
};

export const attendanceAPI = {
  getTodayAttendance: () => api.get('/attendance/today'),
  checkIn: (data) => api.post('/attendance/checkin', data),
  checkOut: (data) => api.put('/attendance/checkout', data),
  getHistory: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/attendance/history${queryString ? `?${queryString}` : ''}`);
  },
  getSummary: (month, year) => api.get(`/attendance/summary/${month}/${year}`)
};

export const leaveAPI = {
  getMyLeaves: () => api.get('/leaves/my-leaves'),
  getLeaveBalance: () => api.get('/leaves/balance'),
  createLeave: (leaveData) => api.post('/leaves', leaveData),
  updateLeave: (id, leaveData) => api.put(`/leaves/${id}`, leaveData),
  deleteLeave: (id) => api.delete(`/leaves/${id}`),
  approveLeave: (id) => api.put(`/leaves/${id}/approve`),
  rejectLeave: (id, reason) => api.put(`/leaves/${id}/reject`, { reason })
};

export default api;