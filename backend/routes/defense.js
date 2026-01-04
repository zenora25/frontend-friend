import express from "express";
import {
    scheduleDefense,
    submitGrade,
    getAllDefenses,
    getMyDefense,
    getStudentDefense,
    cancelDefense,
    getDefenseStats,
} from "../controllers/defenseController.js";
import protect from "../middleware/authMiddleware.js";
import {
    requireStudent,
    requireCoordinator,
    requireSupervisor,
    requireHOD,
} from "../middleware/roleAuth.js";

const router = express.Router();

// Student routes
router.get("/my-defense", protect, requireStudent, getMyDefense);
router.get("/student-stats", protect, requireStudent, getDefenseStats);

// Supervisor routes
router.put("/grade/:defenseId", protect, requireSupervisor, submitGrade);

// Coordinator routes
router.post("/schedule", protect, requireCoordinator, scheduleDefense);
router.get("/", protect, requireCoordinator, getAllDefenses);
router.get("/stats", protect, requireCoordinator, getDefenseStats);
router.delete("/:defenseId", protect, requireCoordinator, cancelDefense);

// HOD routes
router.get("/department", protect, requireHOD, getAllDefenses);

// General routes
router.get("/student/:studentId", protect, requireCoordinator, getStudentDefense);

export default router;