import express from "express";
import {
    scheduleDefense,
    submitGrade,
    getStudentDefenseInfo,
    getAllDefenses
} from "../controllers/gradingController.js";
import { requireCoordinator, requireStudent } from "../middleware/roleAuth.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Coordinator routes
router.post("/schedule", protect, requireCoordinator, scheduleDefense);
router.post("/submit", protect, requireCoordinator, submitGrade);
router.get("/all", protect, requireCoordinator, getAllDefenses);

// Student routes
router.get("/my-defense", protect, requireStudent, getStudentDefenseInfo);

// General route (for coordinators and students)
router.get("/student/:studentId", protect, getStudentDefenseInfo);

export default router;