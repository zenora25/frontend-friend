// lib/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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

// Response interceptor for error handling
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

export const authAPI = {
  // Student endpoints
  studentSignup: (data: any) => api.post('/auth/student/signup', data),
  studentLogin: (data: any) => api.post('/auth/student/login', data),

  // Role endpoints
  roleLogin: (data: any) => api.post('/auth/role/login', data),
  registerRole: (data: any) => api.post('/auth/role/register', data),

  // Verification
  verifyStudentEmail: (data: any) => api.post('/auth/verify-email', data),

  // Token verification
  verifyToken: () => api.get('/auth/verify'),

  // Profile
  getProfile: () => api.get('/auth/profile'),

  // Check auth
  checkAuth: () => api.get('/auth/check'),
};

export const studentAPI = {
  getAll: () => api.get('/students'),
  getById: (id: string) => api.get(`/students/${id}`),
  update: (id: string, data: any) => api.put(`/students/${id}`, data),
};

export const logbookAPI = {
  getAll: () => api.get('/logbook'),
  getById: (id: string) => api.get(`/logbook/${id}`),
  create: (data: any) => api.post('/logbook', data),
  update: (id: string, data: any) => api.put(`/logbook/${id}`, data),
  delete: (id: string) => api.delete(`/logbook/${id}`),
};

export const verificationAPI = {
  generateCode: (data: any) => api.post('/verification/generate', data),
  getCodes: () => api.get('/verification'),
  deleteCode: (id: string) => api.delete(`/verification/${id}`),
};

export default api;