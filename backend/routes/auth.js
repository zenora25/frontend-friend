import express from "express";
import {
  studentSignup,
  studentLogin,
  roleLogin,
  verifyStudentEmail,
  verifyToken,
  registerRole
} from "../controllers/authcontroller.js";

import protect from "../middleware/authMiddleware.js";   // protect middleware

const router = express.Router();

// -------------------------------
// AUTH ROUTES
// -------------------------------

// Student Registration (requires verification code)
router.post("/student/signup", studentSignup);

// Student Login
router.post("/student/login", studentLogin);

// Role Login (institution supervisor, industry supervisor, HOD, siwes coordinator)
router.post("/role/login", roleLogin);

// Register any role (supervisors, HOD, SIWES Coordinator)
router.post("/role/register", registerRole);

// Verify student email (check verification code)
router.post("/verify-email", verifyStudentEmail);

// Verify Token (Protected Route)
router.get("/verify", protect, verifyToken);

// Add this route
router.get("/profile", protect, getProfile);

// Export router as DEFAULT
export default router;
