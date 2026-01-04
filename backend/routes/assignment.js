import express from "express";
import {
    assignStudentToSupervisor,
    getDepartmentalAssignments,
    getSupervisorStudents,
    getAllAssignments,
    removeAssignment,
} from "../controllers/assignmentController.js";
import protect from "../middleware/authMiddleware.js";
import {
    requireHOD,
    requireSupervisor,
    requireCoordinator,
} from "../middleware/roleAuth.js";

const router = express.Router();

// HOD routes
router.post("/assign", protect, requireHOD, assignStudentToSupervisor);
router.get("/department", protect, requireHOD, getDepartmentalAssignments);
router.delete("/:assignmentId", protect, requireHOD, removeAssignment);

// Supervisor routes
router.get("/my-students", protect, requireSupervisor, getSupervisorStudents);

// Coordinator routes
router.get("/", protect, requireCoordinator, getAllAssignments);

export default router;