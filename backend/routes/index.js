import express from 'express';
import authRoutes from './auth.js';
import studentRoutes from './student.js';
import institutionSupervisorRoutes from './institutionSupervisor.js';
import industrySupervisorRoutes from './industrySupervisor.js';
import hodRoutes from './hod.js';
import siwesCoordinatorRoutes from './siwesCoordinator.js';
import verificationRoutes from './verificationCode.js';
import logbookRoutes from './logbook.js';
import defenseRoutes from './defense.js';
import assignmentRoutes from './assignment.js';
import dashboardRoutes from './dashboard.js';
import reportRoutes from './report.js';

const router = express.Router();

// Mount all route modules
router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/institution-supervisors', institutionSupervisorRoutes);
router.use('/industry-supervisors', industrySupervisorRoutes);
router.use('/hods', hodRoutes);
router.use('/siwes-coordinators', siwesCoordinatorRoutes);
router.use('/verification', verificationRoutes);
router.use('/logbook', logbookRoutes);
router.use('/defense', defenseRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);

export default router;