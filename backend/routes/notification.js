import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} from "../controllers/notificationController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.get("/", protect, getNotifications);
router.put("/:notificationId/read", protect, markAsRead);
router.put("/read-all", protect, markAllAsRead);
router.get("/unread-count", protect, getUnreadCount);

export default router;