// api.ts - InternTrack API Client
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

// Helper function to map frontend role to backend role
const mapRoleToBackend = (role: string): string => {
  const roleMap: Record<string, string> = {
    'student': 'student',
    'institutionSupervisor': 'institutionSupervisor',
    'industrySupervisor': 'industrySupervisor',
    'hod': 'hod',
    'siwesCoordinator': 'siwesCoordinator',
    'coordinator': 'siwesCoordinator',
  };
  return roleMap[role] || role;
};

// =========================
// AUTH API
// =========================
export const authAPI = {
  studentSignup: (data: {
    fullName: string;
    email: string;
    verificationCode: string;
    password: string;
    matricNumber: string;
    department: string;
    companyName: string;
    companyAddress: string;
  }) => api.post('/auth/student/signup', data),

  studentLogin: (data: { email: string; password: string }) =>
      api.post('/auth/student/login', data),

  roleLogin: (data: { email: string; password: string; role: string }) => {
    const backendRole = mapRoleToBackend(data.role);
    console.log('Role login - Frontend role:', data.role, 'Backend role:', backendRole);
    return api.post('/auth/role/login', {
      email: data.email,
      password: data.password,
      role: backendRole
    });
  },

  registerRole: (data: {
    fullName: string;
    email: string;
    password: string;
    role: string;
    department: string;
  }) => {
    const backendRole = mapRoleToBackend(data.role);
    return api.post('/auth/role/register', {
      ...data,
      role: backendRole
    });
  },

  verifyEmail: (data: { email: string; code: string }) =>
      api.post('/verification/verify', {
        email: data.email,
        code: data.code.toUpperCase()
      }),

  verifyToken: () => api.get('/auth/verify'),

  getProfile: () => api.get('/auth/profile'),

  checkAuth: () => api.get('/auth/check'),
};

// =========================
// VERIFICATION CODE API
// =========================
export const verificationAPI = {
  generateCode: (data: { email: string; department: string }) =>
      api.post('/verification/generate', data),

  getCodes: (params?: {
    page?: number;
    limit?: number;
    isUsed?: boolean;
    department?: string;
  }) => api.get('/verification', { params }),

  getUnusedCodes: (department: string) =>
      api.get(`/verification/unused/${department}`),

  deleteCode: (id: string) => api.delete(`/verification/${id}`),

  verifyCode: (data: { email: string; code: string }) => {
    console.log('🔵 Verification API - Email:', data.email);
    console.log('🔵 Verification API - Code:', data.code);

    const payload = {
      email: data.email,
      code: data.code.toUpperCase()
    };

    console.log('🔵 Verification API - Final payload:', payload);
    console.log('🔵 Verification API - URL:', `${API_BASE_URL}/verification/verify`);

    return api.post('/verification/verify', payload);
  },

  bulkGenerateCodes: (data: { emails: string[]; department: string }) =>
      api.post('/verification/bulk-generate', data),
};

// =========================
// DASHBOARD API
// =========================
export const dashboardAPI = {
  getStudentDashboard: () => api.get('/dashboard/student'),
  getSupervisorDashboard: () => api.get('/dashboard/supervisor'),
  getHODDashboard: () => api.get('/dashboard/hod'),
  getCoordinatorDashboard: () => api.get('/dashboard/coordinator'),
  getSystemStats: () => api.get('/dashboard/system-stats'),
};

// =========================
// STUDENT API
// =========================
export const studentAPI = {
  getAll: (params?: { page?: number; limit?: number; department?: string }) =>
      api.get('/students', { params }),

  getById: (id: string) => api.get(`/students/${id}`),

  update: (id: string, data: {
    phone?: string;
    profileImage?: string;
    companyName?: string;
    companyAddress?: string;
  }) => api.put(`/students/${id}`, data),

  getProfile: () => api.get('/students/profile'),

  getDashboardStats: () => api.get('/dashboard/student'),

  updateProgress: (id: string, progress: number) =>
      api.put(`/students/${id}/progress`, { progress }),
};

// =========================
// LOGBOOK API
// =========================
export const logbookAPI = {
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

  getLogbookStats: () => api.get('/logbook/stats'),

  getSupervisorLogbooks: (params?: { status?: string }) =>
      api.get('/logbook/supervisor/assigned', { params }),

  reviewLogbook: (logbookId: string, data: {
    status: 'APPROVED' | 'REVISION';
    comment?: string;
    isIndustrySupervisor?: boolean;
  }) => api.put(`/logbook/review/${logbookId}`, data),

  getSupervisorStats: () => api.get('/logbook/supervisor/stats'),

  getAll: (params?: {
    page?: number;
    limit?: number;
    department?: string;
    status?: string;
  }) => api.get('/logbook', { params }),

  getStudentLogbook: (studentId: string) =>
      api.get(`/logbook/student/${studentId}`),
};

// =========================
// ASSIGNMENT API
// =========================
export const assignmentAPI = {
  assignStudentToSupervisor: (data: {
    studentId: string;
    institutionSupervisorId?: string;
    industrySupervisorId?: string;
  }) => api.post('/assignments/assign', data),

  getDepartmentalAssignments: () => api.get('/assignments/department'),

  removeAssignment: (assignmentId: string) => api.delete(`/assignments/${assignmentId}`),

  getSupervisorStudents: () => api.get('/assignments/my-students'),

  getAllAssignments: (params?: { page?: number; limit?: number; department?: string }) =>
      api.get('/assignments', { params }),
};

// =========================
// DEFENSE API
// =========================
export const defenseAPI = {
  getMyDefense: () => api.get('/defense/my-defense'),
  getStudentDefenseStats: () => api.get('/defense/student-stats'),

  submitGrade: (defenseId: string, data: {
    score: number;
    remarks?: string;
    verdict: 'PASS' | 'FAIL';
  }) => api.put(`/defense/grade/${defenseId}`, data),

  scheduleDefense: (data: {
    studentId: string;
    defenseDate: string;
    defenseTime: string;
    venue: string;
    duration?: string;
    panelMembers?: string[];
  }) => api.post('/defense/schedule', data),

  getAllDefenses: (params?: {
    page?: number;
    limit?: number;
    department?: string;
    status?: string;
  }) => api.get('/defense', { params }),

  getDefenseStats: () => api.get('/defense/stats'),

  cancelDefense: (defenseId: string) => api.delete(`/defense/${defenseId}`),

  getDepartmentDefenses: () => api.get('/defense/department'),

  getStudentDefense: (studentId: string) => api.get(`/defense/student/${studentId}`),
};

// =========================
// LETTER API
// =========================
export const letterAPI = {
  uploadLetter: (data: {
    studentId: string;
    fileUrl: string;
    letterType: 'ACCEPTANCE' | 'COMPLETION' | 'RECOMMENDATION';
  }) => api.post('/letters', data),

  getStudentLetters: (studentId: string) => api.get(`/letters/student/${studentId}`),

  getAllLetters: (params?: { page?: number; limit?: number }) => api.get('/letters', { params }),

  deleteLetter: (letterId: string) => api.delete(`/letters/${letterId}`),
};

// =========================
// INSTITUTION SUPERVISOR API
// =========================
export const institutionSupervisorAPI = {
  getAll: (params?: { page?: number; limit?: number; department?: string }) =>
      api.get('/institution-supervisors', { params }),

  getById: (id: string) => api.get(`/institution-supervisors/${id}`),

  update: (id: string, data: {
    fullName?: string;
    department?: string;
    phone?: string;
    profileImage?: string;
  }) => api.put(`/institution-supervisors/${id}`, data),

  getAssignedStudents: () => api.get('/assignments/my-students'),

  getDashboardStats: () => api.get('/dashboard/supervisor'),

  getSupervisorStats: () => api.get('/logbook/supervisor/stats'),
};

// =========================
// INDUSTRY SUPERVISOR API
// =========================
export const industrySupervisorAPI = {
  getAll: (params?: { page?: number; limit?: number; companyName?: string }) =>
      api.get('/industry-supervisors', { params }),

  getById: (id: string) => api.get(`/industry-supervisors/${id}`),

  update: (id: string, data: {
    fullName?: string;
    companyName?: string;
    phone?: string;
    email?: string;
    profileImage?: string;
  }) => api.put(`/industry-supervisors/${id}`, data),

  getAssignedInterns: () => api.get('/assignments/my-students'),

  getDashboardStats: () => api.get('/dashboard/supervisor'),
};

// =========================
// HOD API
// =========================
export const hodAPI = {
  getAll: (params?: { page?: number; limit?: number }) =>
      api.get('/hods', { params }),

  getById: (id: string) => api.get(`/hods/${id}`),

  update: (id: string, data: {
    fullName?: string;
    department?: string;
    phone?: string;
    profileImage?: string;
  }) => api.put(`/hods/${id}`, data),

  getDepartmentStats: () => api.get('/dashboard/hod'),

  getSupervisorPerformance: () => api.get('/dashboard/hod'),

  getDashboardStats: () => api.get('/dashboard/hod'),

  getDepartmentalAssignments: () => api.get('/assignments/department'),

  getDepartmentDefenses: () => api.get('/defense/department'),
};

// =========================
// SIWES COORDINATOR API
// =========================
export const coordinatorAPI = {
  getAll: (params?: { page?: number; limit?: number }) =>
      api.get('/siwes-coordinators', { params }),

  getById: (id: string) => api.get(`/siwes-coordinators/${id}`),

  update: (id: string, data: {
    fullName?: string;
    phone?: string;
    profileImage?: string;
  }) => api.put(`/siwes-coordinators/${id}`, data),

  getAllStudents: (params?: { page?: number; limit?: number; department?: string }) =>
      api.get('/students', { params }),

  getDashboardStats: () => api.get('/dashboard/coordinator'),

  getVerificationCodes: (params?: {
    page?: number;
    limit?: number;
    isUsed?: boolean;
    department?: string;
  }) => api.get('/verification', { params }),

  getSystemStats: () => api.get('/dashboard/system-stats'),

  getAllDefenses: (params?: {
    page?: number;
    limit?: number;
    department?: string;
    status?: string;
  }) => api.get('/defense', { params }),

  getAllAssignments: (params?: { page?: number; limit?: number; department?: string }) =>
      api.get('/assignments', { params }),
};

// =========================
// PROFILE API
// =========================
export const profileAPI = {
  updateProfile: (data: {
    fullName?: string;
    phone?: string;
    profileImage?: string;
    companyName?: string;
    companyAddress?: string;
  }) => api.put('/profile', data),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => api.put('/profile/password', data),

  uploadProfileImage: (formData: FormData) => api.post('/profile/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// =========================
// NOTIFICATION API
// =========================
export const notificationAPI = {
  getNotifications: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
      api.get('/notifications', { params }),

  markAsRead: (notificationId: string) => api.put(`/notifications/${notificationId}/read`),

  markAllAsRead: () => api.put('/notifications/read-all'),

  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// =========================
// REPORT API
// =========================
export const reportAPI = {
  generateStudentReport: (studentId: string) => api.get(`/reports/student/${studentId}`),

  generateDepartmentReport: (department: string) => api.get(`/reports/department/${department}`),

  generateSupervisorReport: (supervisorId: string) => api.get(`/reports/supervisor/${supervisorId}`),

  generateDefenseReport: (params?: { startDate?: string; endDate?: string; department?: string }) =>
      api.get('/reports/defense', { params }),

  generateLogbookReport: (params?: { startDate?: string; endDate?: string; department?: string }) =>
      api.get('/reports/logbook', { params }),
};

export default api;