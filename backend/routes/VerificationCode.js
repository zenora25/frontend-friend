import express from "express";
import {
  generateCode,
  verifyCode,
  getCodes,
  getUnusedCodes
} from "../controllers/verificationCodeController.js";
import { requireAdmin, requireCoordinator } from "../middleware/roleAuth.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin/Coordinator routes
router.post("/generate", protect, requireAdmin, generateCode);
router.get("/", protect, requireAdmin, getCodes);
router.get("/unused/:department", protect, requireAdmin, getUnusedCodes);

// Public route (for student verification during registration)
router.post("/verify", verifyCode);

export default router;