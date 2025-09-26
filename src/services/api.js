// API service for making HTTP requests to the backend
const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authAPI = {
  login: (credentials) => makeAuthenticatedRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  register: (userData) => makeAuthenticatedRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  getMe: () => makeAuthenticatedRequest('/auth/me'),

  updateDetails: (userData) => makeAuthenticatedRequest('/auth/updatedetails', {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),

  updatePassword: (passwordData) => makeAuthenticatedRequest('/auth/updatepassword', {
    method: 'PUT',
    body: JSON.stringify(passwordData),
  }),

  updateNotificationPreferences: (preferences) => makeAuthenticatedRequest('/auth/updatenotifications', {
    method: 'PUT',
    body: JSON.stringify(preferences),
  }),
};

// Policies API
export const policiesAPI = {
  getPolicies: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/policies?${queryString}` : '/policies';
    return makeAuthenticatedRequest(url);
  },

  getPolicy: (id) => makeAuthenticatedRequest(`/policies/${id}`),

  acknowledgePolicy: (policyId) => makeAuthenticatedRequest(`/policies/${policyId}/acknowledge`, {
    method: 'POST',
  }),

  getUserAcknowledgments: () => makeAuthenticatedRequest('/policies/user/acknowledgments'),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/notifications?${queryString}` : '/notifications';
    return makeAuthenticatedRequest(url);
  },

  markAsRead: (id, read = true) => makeAuthenticatedRequest(`/notifications/${id}/read`, {
    method: 'PATCH',
    body: JSON.stringify({ read }),
  }),

  markAllAsRead: () => makeAuthenticatedRequest('/notifications/mark-all-read', {
    method: 'PATCH',
  }),

  deleteNotification: (id) => makeAuthenticatedRequest(`/notifications/${id}`, {
    method: 'DELETE',
  }),

  getStats: () => makeAuthenticatedRequest('/notifications/stats'),
};

// Dashboard API
export const dashboardAPI = {
  getEmployeeDashboard: () => makeAuthenticatedRequest('/dashboard/employee'),
};

// Projects API
export const projectsAPI = {
  getProjects: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return makeAuthenticatedRequest(`/projects?${queryString}`);
  },

  getProject: (id) => makeAuthenticatedRequest(`/projects/${id}`),

  createProject: (projectData) => makeAuthenticatedRequest('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  }),

  updateProject: (id, projectData) => makeAuthenticatedRequest(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData),
  }),

  deleteProject: (id) => makeAuthenticatedRequest(`/projects/${id}`, {
    method: 'DELETE',
  }),
};

// Tasks API
export const tasksAPI = {
  getTasks: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return makeAuthenticatedRequest(`/tasks?${queryString}`);
  },

  getTask: (id) => makeAuthenticatedRequest(`/tasks/${id}`),

  createTask: (taskData) => makeAuthenticatedRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  }),

  updateTask: (id, taskData) => makeAuthenticatedRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  }),

  deleteTask: (id) => makeAuthenticatedRequest(`/tasks/${id}`, {
    method: 'DELETE',
  }),
};

// Users API
export const usersAPI = {
  getUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return makeAuthenticatedRequest(`/users?${queryString}`);
  },

  getUser: (id) => makeAuthenticatedRequest(`/users/${id}`),

  updateUser: (id, userData) => makeAuthenticatedRequest(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),

  deleteUser: (id) => makeAuthenticatedRequest(`/users/${id}`, {
    method: 'DELETE',
  }),
};