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

// =========================
// AUTH API
// =========================
export const authAPI = {
  // Student endpoints
  studentSignup: (data: Record<string, any>) => 
    api.post('/auth/student/signup', data),
  
  studentLogin: (data: { email: string; password: string }) => 
    api.post('/auth/student/login', data),

  // Role endpoints (institution supervisor, industry supervisor, HOD, coordinator)
  roleLogin: (data: { email: string; password: string; role: string }) => 
    api.post('/auth/role/login', data),
  
  registerRole: (data: Record<string, any>) => 
    api.post('/auth/role/register', data),

  // Verification
  verifyStudentEmail: (data: Record<string, any>) => 
    api.post('/auth/verify-email', data),

  // Token verification (protected)
  verifyToken: () => api.get('/auth/verify'),

  // Get user profile (protected)
  getProfile: () => api.get('/auth/profile'),

  // Check auth status
  checkAuth: () => api.get('/auth/check'),
};

// =========================
// STUDENT API
// =========================
export const studentAPI = {
  getAll: () => api.get('/students'),
  getById: (id: string) => api.get(`/students/${id}`),
  update: (id: string, data: {
    organization?: string;
    department?: string;
    phone?: string;
  }) => api.put(`/students/${id}`, data),
  getProfile: () => api.get('/students/profile'),
  getDashboardStats: () => api.get('/students/dashboard'),
};

// =========================
// LOGBOOK API
// =========================
export const logbookAPI = {
  // Student routes
  create: (data: {
    weekNumber: number;
    startDate: string;
    endDate: string;
    title: string;
    mondayActivities?: string;
    tuesdayActivities?: string;
    wednesdayActivities?: string;
    thursdayActivities?: string;
    fridayActivities?: string;
    weekSummary: string;
    challengesFaced?: string;
    lessonsLearned?: string;
    skillsAcquired?: string;
  }) => api.post('/logbook', data),
  
  getMyLogbook: () => api.get('/logbook/my-logbook'),
  getById: (id: string) => api.get(`/logbook/${id}`),
  update: (id: string, data: Partial<{
    title: string;
    mondayActivities: string;
    tuesdayActivities: string;
    wednesdayActivities: string;
    thursdayActivities: string;
    fridayActivities: string;
    weekSummary: string;
    challengesFaced: string;
    lessonsLearned: string;
    skillsAcquired: string;
  }>) => api.put(`/logbook/${id}`, data),
  delete: (id: string) => api.delete(`/logbook/${id}`),

  // Supervisor routes
  getSupervisorLogbooks: () => api.get('/logbook/supervisor'),
  reviewLogbook: (logbookId: string, data: { 
    status: 'APPROVED' | 'NEEDS_REVIEW'; 
    comment?: string 
  }) => api.put(`/logbook/review/${logbookId}`, data),

  // General routes
  getAll: () => api.get('/logbook'),
  getStudentLogbook: (studentId: string) => api.get(`/logbook/student/${studentId}`),
};

// =========================
// VERIFICATION CODE API
// =========================
export const verificationAPI = {
  // Coordinator routes
  generateCode: (data: { department: string }) => 
    api.post('/verification/generate', data),
  getCodes: () => api.get('/verification'),
  getUnusedCodes: (department: string) => 
    api.get(`/verification/unused/${department}`),
  deleteCode: (id: string) => api.delete(`/verification/${id}`),
  
  // Public route (for student registration)
  verifyCode: (data: { code: string }) => 
    api.post('/verification/verify', data),
};

// =========================
// ASSIGNMENT API
// =========================
export const assignmentAPI = {
  // HOD routes
  assignStudentToSupervisor: (data: { 
    studentId: string; 
    supervisorId: string 
  }) => api.post('/assignments/assign', data),
  
  getDepartmentalAssignments: () => api.get('/assignments/department'),

  // Supervisor routes
  getSupervisorStudents: () => api.get('/assignments/my-students'),
};

// =========================
// GRADING/DEFENSE API
// =========================
export const gradingAPI = {
  // Coordinator routes
  scheduleDefense: (data: {
    studentId: string;
    defenseDate: string;
    assessor: string;
    venue?: string;
    time?: string;
  }) => api.post('/grading/schedule', data),
  
  submitGrade: (data: {
    studentId: string;
    score: number;
    remarks?: string;
  }) => api.post('/grading/submit', data),
  
  getAllDefenses: () => api.get('/grading/all'),

  // Student routes
  getMyDefense: () => api.get('/grading/my-defense'),

  // General routes
  getStudentDefense: (studentId: string) => 
    api.get(`/grading/student/${studentId}`),
};

// =========================
// LETTER API
// =========================
export const letterAPI = {
  uploadLetter: (data: { 
    studentId: string; 
    fileUrl: string 
  }) => api.post('/letters', data),
  
  getStudentLetters: (studentId: string) => 
    api.get(`/letters/student/${studentId}`),
  
  getAllLetters: () => api.get('/letters'),
};

// =========================
// INSTITUTION SUPERVISOR API
// =========================
export const institutionSupervisorAPI = {
  getAll: () => api.get('/institution-supervisors'),
  getById: (id: string) => api.get(`/institution-supervisors/${id}`),
  update: (id: string, data: {
    firstName?: string;
    lastName?: string;
    department?: string;
  }) => api.put(`/institution-supervisors/${id}`, data),
  getAssignedStudents: () => api.get('/institution-supervisors/students'),
  getDashboardStats: () => api.get('/institution-supervisors/dashboard'),
};

// =========================
// INDUSTRY SUPERVISOR API
// =========================
export const industrySupervisorAPI = {
  getAll: () => api.get('/industry-supervisors'),
  getById: (id: string) => api.get(`/industry-supervisors/${id}`),
  update: (id: string, data: {
    firstName?: string;
    lastName?: string;
    organization?: string;
  }) => api.put(`/industry-supervisors/${id}`, data),
  getAssignedInterns: () => api.get('/industry-supervisors/interns'),
  getDashboardStats: () => api.get('/industry-supervisors/dashboard'),
};

// =========================
// HOD API
// =========================
export const hodAPI = {
  getAll: () => api.get('/hods'),
  getById: (id: string) => api.get(`/hods/${id}`),
  update: (id: string, data: {
    firstName?: string;
    lastName?: string;
    department?: string;
  }) => api.put(`/hods/${id}`, data),
  getDepartmentStats: () => api.get('/hods/department/stats'),
  getSupervisorPerformance: () => api.get('/hods/supervisors/performance'),
  getDashboardStats: () => api.get('/hods/dashboard'),
};

// =========================
// SIWES COORDINATOR API
// =========================
export const coordinatorAPI = {
  getAll: () => api.get('/siwes-coordinators'),
  getById: (id: string) => api.get(`/siwes-coordinators/${id}`),
  update: (id: string, data: {
    firstName?: string;
    lastName?: string;
  }) => api.put(`/siwes-coordinators/${id}`, data),
  getAllStudents: () => api.get('/siwes-coordinators/students'),
  getDashboardStats: () => api.get('/siwes-coordinators/dashboard'),
  getVerificationCodes: () => api.get('/siwes-coordinators/verification-codes'),
};

export default api;
