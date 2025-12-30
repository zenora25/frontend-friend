// src/lib/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
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

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  // Student registration
  studentSignup: (data: {
    fullName: string;
    email: string;
    verificationCode: string;
    password: string;
  }) => api.post('/auth/student/signup', data),

  // Student login
  studentLogin: (data: { email: string; password: string }) =>
    api.post('/auth/student/login', data),

  // Role login (supervisors, HOD, coordinator)
  roleLogin: (data: { email: string; password: string; role: string }) =>
    api.post('/auth/role/login', data),

  // Register role (for supervisors, HOD, coordinator)
  registerRole: (data: {
    fullName: string;
    email: string;
    password: string;
    role: string;
  }) => api.post('/auth/role/register', data),

  // Verify student email with code
  verifyStudentEmail: (data: { email: string; code: string }) =>
    api.post('/auth/verify-email', data),

  // Verify token (protected route)
  verifyToken: () => api.get('/auth/verify'),

  // Get current user profile
  getProfile: () => api.get('/auth/profile'),
};

// Logbook API endpoints
export const logbookAPI = {
  submit: (data: any) => api.post('/logbook', data),
  getAll: () => api.get('/logbook'),
  getMine: () => api.get('/logbook/me'),
  getById: (id: string) => api.get(`/logbook/${id}`),
  update: (id: string, data: any) => api.put(`/logbook/${id}`, data),
  delete: (id: string) => api.delete(`/logbook/${id}`),
};

// Defense API endpoints
export const defenseAPI = {
  submit: (data: any) => api.post('/defense', data),
  getAll: () => api.get('/defense'),
  getMine: () => api.get('/defense/me'),
  schedule: (id: string, data: any) => api.post(`/defense/${id}/schedule`, data),
  grade: (id: string, data: any) => api.post(`/defense/${id}/grade`, data),
};

// Student API endpoints
export const studentAPI = {
  getAll: () => api.get('/students'),
  getById: (id: string) => api.get(`/students/${id}`),
  update: (id: string, data: any) => api.put(`/students/${id}`, data),
};

export default api;