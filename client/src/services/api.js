import axios from 'axios';

// Determine if we're in development mode
const isDevelopment = import.meta.env.DEV;

// API URL configuration - use localhost for development, Render for production
const API_URL = isDevelopment ? 'http://localhost:8080' : (import.meta.env.VITE_API_URL || 'https://crm-backend-o36v.onrender.com');

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
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

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/me', userData),
  uploadProfilePicture: (formData) => api.post('/auth/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  // Forgot Password Functions
  sendOTP: (email) => api.post('/auth/sendOTPToEmail', { email }),
  verifyOTP: (data) => api.post('/auth/verifyOtp', data),
  resetPassword: (data) => api.post('/auth/reset_password', data),
  getUsers: (role = null) => {
    const url = role ? `/auth/users?role=${role}` : '/auth/users';
    return api.get(url);
  },
  createUser: (userData) => api.post('/auth/users', userData),
  updateUser: (id, userData) => api.put(`/auth/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
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
  getAll: () => api.get('/sales'),
  getAllForced: () => api.get('/sales?full=true'),
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

// Gemini API
export const geminiAPI = {
  generateContent: (prompt) => api.post('/gemini/generate', { prompt }),
  generateContentWithImage: (prompt, imageData) => api.post('/gemini/generate-with-image', { prompt, imageData }),
  chatWithGemini: (messages) => api.post('/gemini/chat', { messages }),
};

export default api;