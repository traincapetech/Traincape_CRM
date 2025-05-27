import axios from 'axios';

// Determine if we're in development mode (Vite exposes import.meta.env)
const isDevelopment = import.meta.env.DEV;

// Get the API URL from environment if available, otherwise use default
const envApiUrl = import.meta.env.VITE_API_URL;

// Use localhost in development and production URL in production
const API_URL = isDevelopment 
  ? 'http://localhost:8080' 
  : (envApiUrl || 'https://crm-backend-o36v.onrender.com');

console.log('API Service Configuration:');
console.log(`- Environment: ${isDevelopment ? 'Development' : 'Production'}`);
console.log(`- API URL: ${API_URL}`);
console.log(`- import.meta.env.DEV: ${import.meta.env.DEV}`);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Setting auth header:', `Bearer ${token.substring(0, 15)}...`);
    } else {
      console.log('No token found in localStorage');
    }
    
    // Log API request details for debugging
    const url = config.baseURL + config.url;
    console.log(`API Request: ${config.method.toUpperCase()} ${url}`);
    if (config.data) {
      console.log('Request payload:', config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config.url,
        method: error.config.method
      });

      // If unauthorized, clear token (possibly expired)
      if (error.response.status === 401) {
        console.log('Unauthorized response detected - checking token');
        const token = localStorage.getItem('token');
        if (token) {
          // Token exists but server rejected it - might be expired or invalid
          console.log('Token exists but rejected - might be expired or invalid');
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API services
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  getCurrentUser: () => api.get('/api/auth/me'),
  getUsers: (role) => api.get(`/api/auth/users${role ? `?role=${role}` : ''}`),
  updateUser: (id, userData) => api.put(`/api/auth/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/api/auth/users/${id}`),
  updateProfilePicture: (profilePicture) => api.put('/api/auth/profile-picture', { profilePicture }),
  sendOTP: (email) => api.post('/api/auth/sendOTPToEmail', { email }),
  verifyOTP: (data) => api.post('/api/auth/verifyOtp', data),
  resetPassword: (data) => api.post('/api/auth/reset_password', data)
};

// Leads API services with additional debugging
export const leadsAPI = {
  getAll: () => {
    console.log('Calling leadsAPI.getAll()');
    return api.get('/api/leads');
  },
  getById: (id) => {
    console.log(`Calling leadsAPI.getById(${id})`);
    return api.get(`/api/leads/${id}`);
  },
  create: (leadData) => {
    console.log('Calling leadsAPI.create() with data:', leadData);
    // Ensure all required fields are present
    const requiredFields = ['NAME', 'COURSE', 'CODE', 'NUMBER', 'COUNTRY', 'SALE PERSON'];
    const missingFields = requiredFields.filter(field => !leadData[field]);
    
    if (missingFields.length > 0) {
      console.error('API Service - Missing required fields:', missingFields);
      console.error('Lead data received:', leadData);
      // Continue anyway, let the server handle the error
    }
    
    return api.post('/api/leads', leadData);
  },
  update: (id, leadData) => {
    console.log(`Calling leadsAPI.update(${id}) with data:`, leadData);
    return api.put(`/api/leads/${id}`, leadData);
  },
  delete: (id) => api.delete(`/api/leads/${id}`),
  getAssigned: () => api.get('/api/leads/assigned'),
  getAllCustomers: () => api.get('/api/leads/customers'),
  updateFeedback: (id, feedback) => api.put(`/api/leads/${id}/feedback`, { feedback }),
  importLeads: (data) => api.post('/api/leads/import', data),
  getRepeatCustomers: () => {
    console.log('Calling leadsAPI.getRepeatCustomers()');
    return api.get('/api/leads/repeat-customers');
  }
};

// Sales API services
export const salesAPI = {
  getAll: () => api.get('/api/sales'),
  getAllForced: () => api.get(`/api/sales?nocache=${new Date().getTime()}&full=true`),
  getById: (id) => api.get(`/api/sales/${id}`),
  create: (saleData) => {
    // Ensure isLeadPersonSale is set if a leadPerson is specified
    if (saleData.leadPerson && !saleData.hasOwnProperty('isLeadPersonSale')) {
      console.log('Setting isLeadPersonSale to true because leadPerson is specified');
      saleData.isLeadPersonSale = true;
    }
    return api.post('/api/sales', saleData);
  },
  createReferenceSale: (saleData) => api.post('/api/sales', { 
    ...saleData, 
    source: 'Reference',
    isLeadPersonSale: saleData.leadPerson ? true : false
  }),
  createLeadPersonSale: (saleData) => api.post('/api/sales', { ...saleData, isLeadPersonSale: true }),
  update: (id, saleData) => api.put(`/api/sales/${id}`, saleData),
  delete: (id) => api.delete(`/api/sales/${id}`),
  updateToken: (id, token) => api.put(`/api/sales/${id}/token`, { token }),
  updatePending: (id, pending) => api.put(`/api/sales/${id}/pending`, { pending }),
  importSales: (data) => api.post('/api/sales/import', data),
  getLeadSheet: (filters = {}) => {
    console.log('Using new lead-sales endpoint with filters:', filters);
    return api.get('/api/lead-sales', { params: filters });
  },
  // New method to create a sale assigned to a specific lead person
  createSaleWithLeadPerson: (saleData, leadPersonId) => {
    console.log(`Creating sale assigned to lead person: ${leadPersonId}`);
    return api.post('/api/sales', { 
      ...saleData, 
      leadPerson: leadPersonId,
      isLeadPersonSale: true // Always set to true to ensure it appears in lead person's dashboard
    });
  }
};

// Lead Person Sales API services
export const leadPersonSalesAPI = {
  getAll: () => api.get('/api/lead-person-sales'),
  getById: (id) => api.get(`/api/lead-person-sales/${id}`),
  create: (saleData) => api.post('/api/lead-person-sales', saleData),
  update: (id, saleData) => api.put(`/api/lead-person-sales/${id}`, saleData),
  delete: (id) => api.delete(`/api/lead-person-sales/${id}`)
};

// Currency API services
export const currencyAPI = {
  getRates: () => api.get('/api/currency/rates'),
};

// Tasks API services
export const taskAPI = {
  getAll: () => api.get('/api/tasks'),
  getById: (id) => api.get(`/api/tasks/${id}`),
  create: (taskData) => api.post('/api/tasks', taskData),
  update: (id, taskData) => api.put(`/api/tasks/${id}`, taskData),
  delete: (id) => api.delete(`/api/tasks/${id}`),
  updateStatus: (id, completed) => api.put(`/api/tasks/${id}`, { completed })
};

export default api;