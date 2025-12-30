import express from "express";
import {
  generateCode,
  verifyCode,
  getCodes,
  getUnusedCodes
} from "../controllers/verificationCodeController.js";
import { requireCoordinator } from "../middleware/roleAuth.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Coordinator-only routes
router.post("/generate", protect, requireCoordinator, generateCode);
router.get("/", protect, requireCoordinator, getCodes);
router.get("/unused/:department", protect, requireCoordinator, getUnusedCodes);

// Public route (for student verification during registration)
router.post("/verify", verifyCode);

export default router;