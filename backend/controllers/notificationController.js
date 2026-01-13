// Simple in-memory notification system (in production, use database)
let notifications = [];

// Get notifications for user
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const offset = (page - 1) * limit;

    // Filter notifications for user
    let userNotifications = notifications.filter(n => 
      n.userId === userId || n.role === req.user.role
    );

    if (unreadOnly) {
      userNotifications = userNotifications.filter(n => !n.read);
    }

    // Sort by date (newest first)
    userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const paginatedNotifications = userNotifications.slice(offset, offset + parseInt(limit));

    res.json({
      notifications: paginatedNotifications,
      pagination: {
        total: userNotifications.length,
        page: parseInt(page),
        pages: Math.ceil(userNotifications.length / limit),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({
      error: "Failed to fetch notifications",
      details: err.message
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    notification.read = true;
    notification.readAt = new Date();

    res.json({
      message: "Notification marked as read",
      notification
    });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({
      error: "Failed to mark notification as read",
      details: err.message
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    notifications = notifications.map(n => {
      if ((n.userId === userId || n.role === req.user.role) && !n.read) {
        return {
          ...n,
          read: true,
          readAt: new Date()
        };
      }
      return n;
    });

    res.json({
      message: "All notifications marked as read"
    });
  } catch (err) {
    console.error("Mark all as read error:", err);
    res.status(500).json({
      error: "Failed to mark all notifications as read",
      details: err.message
    });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = notifications.filter(n => 
      (n.userId === userId || n.role === req.user.role) && !n.read
    ).length;

    res.json({ unreadCount });
  } catch (err) {
    console.error("Get unread count error:", err);
    res.status(500).json({
      error: "Failed to get unread count",
      details: err.message
    });
  }
};

// Helper function to add notification (for other controllers to use)
export const addNotification = (data) => {
  const notification = {
    id: Date.now().toString(),
    ...data,
    read: false,
    createdAt: new Date()
  };
  notifications.push(notification);
  return notification;
};

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  addNotification
};