import express from "express";
import {
  getIndustrySupervisorDashboard,
  getAssignedInterns,
  getMyProfile,
  updateIndustrySupervisor,
  reviewLogbook,
  getPendingLogbooks,
  getLogbookStats,
  changePassword,
  getAllIndustrySupervisors
} from "../controllers/industrySupervisorController.js";
import protect from "../middleware/authMiddleware.js";
import { requireIndustrySupervisor } from "../middleware/roleAuth.js";

const router = express.Router();

// Dashboard
router.get("/dashboard/overview", protect, requireIndustrySupervisor, getIndustrySupervisorDashboard);

// Get all industry supervisors (for HOD assignment)
router.get("/", protect, getAllIndustrySupervisors);

// Students (interns)
router.get("/dashboard/students", protect, requireIndustrySupervisor, getAssignedInterns);

// Profile
router.get("/profile", protect, requireIndustrySupervisor, getMyProfile);
router.put("/profile", protect, requireIndustrySupervisor, updateIndustrySupervisor);

// Logbook management
router.get("/logbooks/pending", protect, requireIndustrySupervisor, getPendingLogbooks);
router.get("/logbooks/stats", protect, requireIndustrySupervisor, getLogbookStats);
router.put("/logbooks/:logbookId/review", protect, requireIndustrySupervisor, reviewLogbook);

// Password
router.put("/change-password", protect, requireIndustrySupervisor, changePassword);

export default router;