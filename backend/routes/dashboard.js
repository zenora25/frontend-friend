import express from "express";
import {
    getStudentDashboard,
    getSupervisorDashboard,
    getHODDashboard,
    getCoordinatorDashboard,
    getSystemStats,
} from "../controllers/dashboardController.js";
import protect from "../middleware/authMiddleware.js";
import {
    requireStudent,
    requireSupervisor,
    requireHOD,
    requireCoordinator,
    requireAdmin,
} from "../middleware/roleAuth.js";

const router = express.Router();

// Role-specific dashboard routes
router.get("/student", protect, requireStudent, getStudentDashboard);
router.get("/supervisor", protect, requireSupervisor, getSupervisorDashboard);
router.get("/hod", protect, requireHOD, getHODDashboard);
router.get("/coordinator", protect, requireCoordinator, getCoordinatorDashboard);

// System stats (Admin/Coordinator)
router.get("/system-stats", protect, requireCoordinator, getSystemStats);

export default router;