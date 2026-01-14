import express from 'express';
import {
  getStudentDashboard,
  getSupervisorDashboard,
  getHODDashboard,
  getCoordinatorDashboard,
  getSystemStats
} from '../controllers/dashboardController.js';
import protect from '../middleware/authMiddleware.js';
import {
  requireStudent,
  requireSupervisor,
  requireHOD,
  requireCoordinator,
  requireAdmin
} from '../middleware/roleAuth.js';

const router = express.Router();

// Student dashboard
router.get('/student', protect, requireStudent, getStudentDashboard);

// Supervisor dashboard (both institution and industry)
router.get('/supervisor', protect, requireSupervisor, getSupervisorDashboard);

// HOD dashboard
router.get('/hod', protect, requireHOD, getHODDashboard);

// Coordinator dashboard
router.get('/coordinator', protect, requireCoordinator, getCoordinatorDashboard);

// System stats (admin/coordinator)
router.get('/system-stats', protect, requireCoordinator, getSystemStats);

export default router;