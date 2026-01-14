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

  verifyToken: () => api.get('/auth/verify'),

  getProfile: () => api.get('/auth/profile'),

  updateProfile: (data: any) => api.put('/auth/profile', data),

  checkAuth: () => api.get('/auth/check'),
};

// =========================
// INSTITUTION SUPERVISOR API (COMPREHENSIVE)
// =========================
export const institutionSupervisorAPI = {
  // Dashboard
  getDashboard: () => api.get('/institution-supervisors/dashboard/overview'),

  // Students
  getAssignedStudents: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => api.get('/institution-supervisors/dashboard/students', { params }),

  // Statistics
  getStats: () => api.get('/institution-supervisors/dashboard/stats'),

  // Pending Logbooks
  getPendingLogbooks: (params?: {
    page?: number;
    limit?: number;
  }) => api.get('/institution-supervisors/dashboard/pending-logbooks', { params }),

  // Profile Management
  updateProfile: (data: {
    fullName?: string;
    department?: string;
    phone?: string;
    profileImage?: string;
  }) => api.put('/institution-supervisors/profile/update', data),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => api.put('/institution-supervisors/profile/change-password', data),

  // Logbook Review
  reviewLogbook: (logbookId: string, data: {
    status: 'APPROVED' | 'REVISION';
    comment?: string;
  }) => api.put(`/logbook/review/${logbookId}`, data),

  // Student Details
  getStudentDetails: (studentId: string) => api.get(`/students/${studentId}`),

  // Logbook Management
  getStudentLogbooks: (studentId: string) => api.get(`/logbook/student/${studentId}`),

  // Analytics
  getPerformanceAnalytics: () => api.get('/dashboard/supervisor'),
};

// =========================
// HOD API (COMPREHENSIVE)
// =========================
export const hodAPI = {
  // Dashboard
  getDashboard: () => api.get('/hods/dashboard/overview'),

  // Students
  getDepartmentStudents: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => api.get('/hods/dashboard/students', { params }),

  // Assignments
  getDepartmentAssignments: (params?: {
    page?: number;
    limit?: number;
  }) => api.get('/hods/dashboard/assignments', { params }),

  assignStudentToSupervisor: (data: {
    studentId: string;
    institutionSupervisorId: string;
  }) => api.post('/hods/assign-student', data),

  // Defenses
  getDepartmentDefenses: (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => api.get('/hods/dashboard/defenses', { params }),

  // Supervisors
  getSupervisorPerformance: () => api.get('/hods/dashboard/supervisors/performance'),

  // Profile Management
  updateProfile: (data: {
    fullName?: string;
    department?: string;
    phone?: string;
    profileImage?: string;
  }) => api.put('/hods/profile', data),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => api.put('/hods/change-password', data),

  // Student Management
  getStudentDetails: (studentId: string) => api.get(`/students/${studentId}`),

  updateStudentProgress: (studentId: string, progress: number) =>
    api.put(`/students/${studentId}/progress`, { progress }),

  // Supervisor Management
  getDepartmentSupervisors: () => api.get('/institution-supervisors?department=specific'),

  // Analytics
  getDepartmentAnalytics: () => api.get('/dashboard/hod'),

  // Reports
  generateDepartmentReport: (department: string) =>
    api.get(`/reports/department/${department}`),
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
// STUDENT API
// =========================
export const studentAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    department?: string;
    status?: string;
    search?: string;
  }) => api.get('/students', { params }),

  getById: (id: string) => api.get(`/students/${id}`),

  update: (id: string, data: {
    phone?: string;
    profileImage?: string;
    companyName?: string;
    companyAddress?: string;
    progress?: number;
    status?: string;
  }) => api.put(`/students/${id}`, data),

  getProfile: () => api.get('/students/profile'),

  getDashboardStats: () => api.get('/dashboard/student'),

  updateProgress: (id: string, progress: number) =>
    api.put(`/students/${id}/progress`, { progress }),

  getStudentLogbooks: (studentId: string) =>
    api.get(`/logbook/student/${studentId}`),

  getStudentDefense: (studentId: string) =>
    api.get(`/defense/student/${studentId}`),
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
    email?: string;
  }) => api.get('/verification', { params }),

  getUnusedCodes: (department: string) =>
    api.get(`/verification/unused/${department}`),

  deleteCode: (id: string) => api.delete(`/verification/${id}`),

  verifyCode: (data: { email: string; code: string }) => {
    const payload = {
      email: data.email.trim().toLowerCase(),
      code: data.code.trim().toUpperCase()
    };
    return api.post('/verification/verify', payload);
  },

  bulkGenerateCodes: (data: { emails: string[]; department: string }) =>
    api.post('/verification/bulk-generate', data),
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

  getAllAssignments: (params?: {
    page?: number;
    limit?: number;
    department?: string;
    status?: string;
  }) => api.get('/assignments', { params }),
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
    studentId?: string;
  }) => api.get('/logbook', { params }),

  getStudentLogbook: (studentId: string) =>
    api.get(`/logbook/student/${studentId}`),

  getDepartmentLogbooks: (params?: {
    page?: number;
    limit?: number;
    department?: string;
    status?: string;
  }) => api.get('/logbook/department', { params }),
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

export default api;
