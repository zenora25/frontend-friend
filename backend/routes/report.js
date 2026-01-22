import express from "express";
import protect from "../middleware/authMiddleware.js";
import { requireHOD, requireCoordinator } from "../middleware/roleAuth.js";
import { generateStudentReport, generateDepartmentReport } from "../controllers/reportController.js";

const router = express.Router();

router.get("/student/:studentId", protect, generateStudentReport);
router.get("/department/:department", protect, requireHOD, generateDepartmentReport);

export default router;
