import express from "express";
import {
  createLogbookEntry,
  getLogbookEntries,
  getStudentLogbook,
  reviewLogbook,
  getSupervisorLogbooks
} from "../controllers/logbookcontroller.js";
import { requireRole, requireStudent, requireInstitutionSupervisor } from "../middleware/roleAuth.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Student routes
router.post("/", protect, requireStudent, createLogbookEntry);
router.get("/my-logbook", protect, requireStudent, (req, res) => {
  // Redirect to student's own logbook
  return getStudentLogbook(req, res);
});

// Supervisor routes
router.get("/supervisor", protect, requireInstitutionSupervisor, getSupervisorLogbooks);
router.put("/review/:logbookId", protect, requireInstitutionSupervisor, reviewLogbook);

// General routes (protected)
router.get("/", protect, getLogbookEntries);
router.get("/student/:studentId", protect, getStudentLogbook);

export default router;