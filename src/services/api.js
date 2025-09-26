import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Admin API endpoints
export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  getStats: (period = '7d') => api.get(`/admin/stats?period=${period}`),

  // User Management
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  createUser: (userData) => api.post('/admin/users', userData),
  updateUser: (id, userData) => api.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  deactivateUser: (id, reason) => api.put(`/admin/users/${id}/deactivate`, { reason }),
  reactivateUser: (id) => api.put(`/admin/users/${id}/reactivate`),
  bulkRoleAssignment: (data) => api.put('/admin/users/bulk/role-assignment', data),

  // Employee Management
  getEmployees: (params = {}) => api.get('/admin/employees', { params }),
  getEmployee: (id) => api.get(`/admin/employees/${id}`),
  createEmployee: (employeeData) => api.post('/admin/employees', employeeData),
  updateEmployee: (id, employeeData) => api.put(`/admin/employees/${id}`, employeeData),
  deleteEmployee: (id) => api.delete(`/admin/employees/${id}`),
  activateEmployee: (id) => api.put(`/admin/employees/${id}/activate`),
  deactivateEmployee: (id, reason) => api.put(`/admin/employees/${id}/deactivate`, { reason }),
  bulkEmployeeAction: (data) => api.post('/admin/employees/bulk', data),
  exportEmployees: (params = {}) => api.get('/admin/employees/export', { params }),

  // Policy Management
  getPolicies: (params = {}) => api.get('/admin/policies', { params }),
  getPolicy: (id) => api.get(`/admin/policies/${id}`),
  createPolicy: (policyData) => api.post('/admin/policies', policyData),
  updatePolicy: (id, policyData) => api.put(`/admin/policies/${id}`, policyData),
  deletePolicy: (id) => api.delete(`/admin/policies/${id}`),
  publishPolicy: (id) => api.put(`/admin/policies/${id}/publish`),
  archivePolicy: (id) => api.put(`/admin/policies/${id}/archive`),
  uploadPolicyFile: (id, formData) => {
    return api.post(`/admin/policies/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getPolicyAcknowledgments: (id, params = {}) => 
    api.get(`/admin/policies/${id}/acknowledgments`, { params }),

  // Audit Logs
  getAuditLogs: (params = {}) => api.get('/admin/audit-logs', { params }),
  getAuditLog: (id) => api.get(`/admin/audit-logs/${id}`),
  exportAuditLogs: (params = {}) => api.get('/admin/audit-logs/export', { params }),
  getAuditStats: (period = '30d') => api.get(`/admin/audit-logs/stats?period=${period}`),
  getUserActivityTimeline: (userId, params = {}) => 
    api.get(`/admin/audit-logs/user/${userId}/timeline`, { params }),
  cleanupAuditLogs: (olderThanDays) => 
    api.delete('/admin/audit-logs/cleanup', { data: { olderThanDays } }),

  // Content Management
  getContent: (params = {}) => api.get('/admin/content', { params }),
  getContentItem: (id) => api.get(`/admin/content/${id}`),
  createContent: (contentData) => api.post('/admin/content', contentData),
  updateContent: (id, contentData) => api.put(`/admin/content/${id}`, contentData),
  deleteContent: (id) => api.delete(`/admin/content/${id}`),

  // Quiz Management
  getQuizzes: (params = {}) => api.get('/admin/quizzes', { params }),
  getQuiz: (id) => api.get(`/admin/quizzes/${id}`),
  createQuiz: (quizData) => api.post('/admin/quizzes', quizData),
  updateQuiz: (id, quizData) => api.put(`/admin/quizzes/${id}`, quizData),
  deleteQuiz: (id) => api.delete(`/admin/quizzes/${id}`),

  // Phishing Simulation
  getPhishingCampaigns: (params = {}) => api.get('/admin/phishing', { params }),
  getPhishingCampaign: (id) => api.get(`/admin/phishing/${id}`),
  createPhishingCampaign: (campaignData) => api.post('/admin/phishing', campaignData),
  updatePhishingCampaign: (id, campaignData) => api.put(`/admin/phishing/${id}`, campaignData),
  deletePhishingCampaign: (id) => api.delete(`/admin/phishing/${id}`),
};

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  logout: () => api.post('/auth/logout'),
};

// General API
export const generalAPI = {
  getProjects: (params = {}) => api.get('/projects', { params }),
  getTasks: (params = {}) => api.get('/tasks', { params }),
  getDashboard: () => api.get('/dashboard'),
};

export default api;