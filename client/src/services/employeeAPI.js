import api from './api';

const employeeAPI = {
  // Employee CRUD operations
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  create: (formData) => api.post('/employees', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  update: (id, formData) => api.put(`/employees/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  delete: (id) => api.delete(`/employees/${id}`),

  // Department operations
  getDepartments: () => api.get('/employees/departments'),
  createDepartment: (data) => api.post('/employees/departments', data),

  // Role operations
  getRoles: () => api.get('/employees/roles'),
  createRole: (data) => api.post('/employees/roles', data),

  // Conversion operations
  convertUsers: () => api.post('/employees/convert-users'),
};

export default employeeAPI; 