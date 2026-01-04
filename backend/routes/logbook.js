import express from "express";
import {
  createLogbook,
  getMyLogbooks,
  getLogbookById,
  updateLogbook,
  deleteLogbook,
  getSupervisorLogbooks,
  reviewLogbook,
  getAllLogbooks,
  getStudentLogbook,
  getLogbookStats,
} from "../controllers/logbookController.js";
import protect from "../middleware/authMiddleware.js";
import {
  requireStudent,
  requireSupervisor,
  requireAdmin,
  requireCoordinator,
} from "../middleware/roleAuth.js";

const router = express.Router();

// Student routes
router.post("/", protect, requireStudent, createLogbook);
router.get("/my-logbook", protect, requireStudent, getMyLogbooks);
router.get("/stats", protect, requireStudent, getLogbookStats);
router.get("/:id", protect, requireStudent, getLogbookById);
router.put("/:id", protect, requireStudent, updateLogbook);
router.delete("/:id", protect, requireStudent, deleteLogbook);

// Supervisor routes
router.get("/supervisor/assigned", protect, requireSupervisor, getSupervisorLogbooks);
router.put("/review/:logbookId", protect, requireSupervisor, reviewLogbook);
router.get("/supervisor/stats", protect, requireSupervisor, getLogbookStats);

// Admin/HOD/Coordinator routes
router.get("/", protect, requireAdmin, getAllLogbooks);
router.get("/student/:studentId", protect, requireAdmin, getStudentLogbook);

export default router;