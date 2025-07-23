import api from './api';

export const employeeAPI = {
  // Employee operations
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  create: (employeeData) => api.post('/employees', employeeData),
  update: (id, employeeData) => api.put(`/employees/${id}`, employeeData),
  delete: (id) => api.delete(`/employees/${id}`),

  // Department and Role operations
  getDepartments: () => api.get('/employees/departments'),
  getRoles: () => api.get('/employees/roles'),

  // Document operations
  uploadDocument: (id, documentType, file) => {
    const formData = new FormData();
    formData.append('document', file);
    return api.post(`/employees/${id}/documents/${documentType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getDocument: (filename) => api.get(`/employees/documents/${filename}`, {
    responseType: 'blob'
  }),
};

export default employeeAPI; 