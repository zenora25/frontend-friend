import express from "express";
import {
  createLogbook,
  getMyLogbooks,
  getLogbookById,
  updateLogbook,
  getSupervisorLogbooks,
  reviewLogbook,
  getAllLogbooks,
  getStudentLogbook,
  getLogbookStats,
  deleteLogbookImage,
  deleteLogbook  // Make sure this is included
} from "../controllers/logbookcontroller.js";
import protect from "../middleware/authMiddleware.js";
import { uploadMultiple } from "../utils/upload.js"; // Import upload middleware
import { uploadMultiple } from "../utils/upload.js"; // Import upload middleware
import {
  requireStudent,
  requireSupervisor,
  requireAdmin,
  requireCoordinator,
} from "../middleware/roleAuth.js";

const router = express.Router();

// Student routes
router.post("/", protect, requireStudent, uploadMultiple, createLogbook); // Add middleware here
router.get("/my-logbook", protect, requireStudent, getMyLogbooks);
router.get("/stats", protect, requireStudent, getLogbookStats);
router.get("/:id", protect, requireStudent, getLogbookById);
router.put("/:id", protect, requireStudent, uploadMultiple, updateLogbook);
router.delete("/:id", protect, requireStudent, deleteLogbook);
router.delete("/:id/image", protect, requireStudent, deleteLogbookImage);

// Supervisor routes
router.get("/supervisor/assigned", protect, requireSupervisor, getSupervisorLogbooks);
router.put("/review/:logbookId", protect, requireSupervisor, reviewLogbook);
router.get("/supervisor/stats", protect, requireSupervisor, getLogbookStats);

// Admin/HOD/Coordinator routes
router.get("/", protect, requireAdmin, getAllLogbooks);
router.get("/student/:studentId", protect, requireAdmin, getStudentLogbook);

export default router;