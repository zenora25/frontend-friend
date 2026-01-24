import express from "express";
import protect from "../middleware/authMiddleware.js";
import { requireAdmin, requireCoordinator, requireInstitutionSupervisor } from "../middleware/roleAuth.js";
import {
  createInstitutionSupervisor,
  getInstitutionSupervisors,
  getInstitutionSupervisorById,
  getSupervisorDashboard,
  getAssignedStudents,
  getSupervisorStats,
  getPendingLogbooks,
  updateInstitutionSupervisor,
  changePassword,
  deleteInstitutionSupervisor,
  testAuth
} from "../controllers/institutionSupervisorController.js";

const router = express.Router();

// Test endpoint (for debugging)
router.get("/test-auth", protect, requireInstitutionSupervisor, testAuth);

// Public routes (for admin/coordinator to manage supervisors)
router.post("/", protect, requireCoordinator, createInstitutionSupervisor);
router.get("/", protect, requireAdmin, getInstitutionSupervisors);
router.get("/:id", protect, requireCoordinator, getInstitutionSupervisorById);
router.delete("/:id", protect, requireCoordinator, deleteInstitutionSupervisor);

// Protected Institution Supervisor routes
router.get("/dashboard/overview", protect, requireInstitutionSupervisor, getSupervisorDashboard);
router.get("/dashboard/students", protect, requireInstitutionSupervisor, getAssignedStudents);
router.get("/dashboard/stats", protect, requireInstitutionSupervisor, getSupervisorStats);
router.get("/dashboard/pending-logbooks", protect, requireInstitutionSupervisor, getPendingLogbooks);

// Supervisor management routes
router.put("/profile/update", protect, requireInstitutionSupervisor, updateInstitutionSupervisor);
router.put("/profile/change-password", protect, requireInstitutionSupervisor, changePassword);

export default router;