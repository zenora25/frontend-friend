import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token added to request');
    } else {
      console.log('⚠️ No token found in localStorage');
    }
    
    // Log request data for debugging (excluding passwords)
    if (config.data && config.method !== 'get') {
      const safeData = { ...config.data };
      if (safeData.password) safeData.password = '***HIDDEN***';
      if (safeData.currentPassword) safeData.currentPassword = '***HIDDEN***';
      if (safeData.newPassword) safeData.newPassword = '***HIDDEN***';
      console.log('📦 Request data:', safeData);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    console.log('📥 Response data:', response.data);
    return response;
  },
  async (error) => {
    console.error('❌ Response error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // If we have a toast hook, we could use it here
    // For now, we'll just log errors and handle redirects
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.error('🔒 401 Unauthorized - Token invalid or expired');
          // Clear local storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/login')) {
            setTimeout(() => {
              window.location.href = '/login?session=expired';
            }, 1000);
          }
          break;
          
        case 403:
          console.error('🚫 403 Forbidden - Insufficient permissions');
          // Get current user role
          const userStr = localStorage.getItem('user');
          const user = userStr ? JSON.parse(userStr) : null;
          
          // Redirect to appropriate dashboard
          if (user?.role) {
            setTimeout(() => {
              const dashboardPath = getDashboardPath(user.role);
              if (window.location.pathname !== dashboardPath) {
                window.location.href = dashboardPath;
              }
            }, 1500);
          }
          break;
          
        case 404:
          console.error('🔍 404 Not Found');
          break;
          
        case 500:
          console.error('💥 500 Internal Server Error');
          // Could show a toast notification here
          break;
          
        default:
          console.error(`❌ HTTP Error ${status}`);
      }
    } else if (error.request) {
      console.error('🌐 Network Error - No response received:', error.request);
      // Could show a network error toast
    } else {
      console.error('🚨 Request Error:', error.message);
    }

    // Return a consistent error format
    return Promise.reject({
      success: false,
      error: error.response?.data?.error || error.message || 'Request failed',
      details: error.response?.data?.details,
      status: error.response?.status
    });
  }
);

// Helper function to get dashboard path based on role
const getDashboardPath = (role: string): string => {
  switch (role) {
    case 'student':
      return '/dashboard/overview';
    case 'institutionSupervisor':
      return '/dashboard/supervisor-dashboard';
    case 'industrySupervisor':
      return '/dashboard/industry-dashboard';
    case 'hod':
      return '/dashboard/hod-dashboard';
    case 'siwesCoordinator':
      return '/dashboard/coordinator-dashboard';
    default:
      return '/dashboard';
  }
};

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
    console.log('🔐 Role login - Frontend role:', data.role, 'Backend role:', backendRole);
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
  
  // Test endpoints
  testAuth: () => api.get('/auth/test'),
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
  
  // Test endpoint
  testAuth: () => api.get('/institution-supervisors/test-auth'),
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
  getDepartmentSupervisors: (department?: string) => 
    api.get(`/institution-supervisors${department ? `?department=${department}` : ''}`),

  // Analytics
  getDepartmentAnalytics: () => api.get('/dashboard/hod'),

  // Reports
  generateDepartmentReport: (department: string) =>
    api.get(`/reports/department/${department}`),
  
  // Test endpoint
  testAuth: () => api.get('/hods/test-auth'),
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
  
  // Test endpoint
  testAuth: () => api.get('/students/test-auth'),
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
    console.log('🔐 Verifying code with payload:', payload);
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

// =========================
// COORDINATOR API
// =========================
export const coordinatorAPI = {
  getVerificationCodes: (params: any) => verificationAPI.getCodes(params),
  bulkGenerateCodes: (data: any) => verificationAPI.bulkGenerateCodes(data),
  deleteVerificationCode: (id: string) => verificationAPI.deleteCode(id),
  
  // Test endpoint
  testAuth: () => api.get('/coordinators/test-auth'),
};

// =========================
// INDUSTRY SUPERVISOR API
// =========================
export const industrySupervisorAPI = {
  getDashboard: () => api.get('/industry-supervisors/dashboard/overview'),
  
  getAssignedStudents: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => api.get('/industry-supervisors/dashboard/students', { params }),
  
  getPendingLogbooks: (params?: {
    page?: number;
    limit?: number;
  }) => api.get('/industry-supervisors/dashboard/pending-logbooks', { params }),
  
  // Test endpoint
  testAuth: () => api.get('/industry-supervisors/test-auth'),
};

// =========================
// TEST API (For debugging)
// =========================
export const testAPI = {
  // Test authentication for different roles
  testInstitutionSupervisorAuth: () => api.get('/institution-supervisors/test-auth'),
  testHODAuth: () => api.get('/hods/test-auth'),
  testCoordinatorAuth: () => api.get('/coordinators/test-auth'),
  testStudentAuth: () => api.get('/students/test-auth'),
  testIndustrySupervisorAuth: () => api.get('/industry-supervisors/test-auth'),
  
  // Test endpoint that doesn't require auth
  testPublicEndpoint: () => api.get('/public/test'),
};

// =========================
// SUPERVISORS API (for HOD to get supervisors)
// =========================
export const supervisorsAPI = {
  getAll: (department?: string) => api.get(`/institution-supervisors${department ? `?department=${department}` : ''}`),
};

export default api;