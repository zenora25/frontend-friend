import express from "express";
import {
    assignStudentToSupervisor,
    getDepartmentalAssignments,
    getSupervisorStudents
} from "../controllers/assignmentController.js";
import { requireHOD, requireInstitutionSupervisor } from "../middleware/roleAuth.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// HOD routes
router.post("/assign", protect, requireHOD, assignStudentToSupervisor);
router.get("/department", protect, requireHOD, getDepartmentalAssignments);

// Supervisor routes
router.get("/my-students", protect, requireInstitutionSupervisor, getSupervisorStudents);

export default router;