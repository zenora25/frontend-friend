
import express from "express";
import protect from "../middleware/authMiddleware.js";
import { requireHOD, requireCoordinator } from "../middleware/roleAuth.js";
import {
    createHod,
    getHods,
    getHodById,
    getHODDashboard,
    getDepartmentDefenses,
    getDepartmentalAssignments,
    getSupervisorPerformance,
    assignStudentToSupervisor,
    updateHod,
    changePassword,
    deleteHod,
    getDepartmentStudents
} from "../controllers/hodcontroller.js";

const router = express.Router();

// Public routes (for admin/coordinator to manage HODs)
router.post("/", protect, requireCoordinator, createHod);
router.get("/", protect, requireCoordinator, getHods);
router.get("/:id", protect, requireCoordinator, getHodById);
router.delete("/:id", protect, requireCoordinator, deleteHod);

// Protected HOD routes (requires HOD role)
router.get("/dashboard/overview", protect, requireHOD, getHODDashboard);
router.get("/dashboard/defenses", protect, requireHOD, getDepartmentDefenses);
router.get("/dashboard/assignments", protect, requireHOD, getDepartmentalAssignments);
router.get("/dashboard/supervisors/performance", protect, requireHOD, getSupervisorPerformance);
router.get("/dashboard/students", protect, requireHOD, getDepartmentStudents);

// HOD management routes
router.post("/assign-student", protect, requireHOD, assignStudentToSupervisor);
router.put("/profile", protect, requireHOD, updateHod);
router.put("/change-password", protect, requireHOD, changePassword);

export default router;
