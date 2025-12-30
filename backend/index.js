import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import sequelize, { connectMYSQL } from "./config/db.js";

// Import existing routes
import studentRoutes from "./routes/student.js";
import authRoutes from "./routes/auth.js";
import logbookRoutes from "./routes/logbook.js";
import letterRoutes from "./routes/letter.js";
import verificationRoutes from "./routes/verificationCode.js";
import institutionSupervisorRoutes from "./routes/institutionSupervisor.js";
import industrySupervisorRoutes from "./routes/industrySupervisor.js";
import hodRoutes from "./routes/hod.js";
import siwesCoordinatorRoutes from "./routes/siwesCoordinator.js";

// Import new routes
import assignmentRoutes from "./routes/assignment.js";
import gradingRoutes from "./routes/grading.js";

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connect DB and sync
connectMYSQL();

sequelize
    .sync({ alter: true })
    .then(() => console.log("✅ All tables synced successfully"))
    .catch((err) => console.error("❌ Sync error:", err.message));

// health check
app.get("/", (req, res) => res.send("🚀 InternTrack backend is running..."));
app.get("/health", (req, res) => res.json({
  status: "healthy",
  timestamp: new Date().toISOString()
}));

// Api routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/logbook", logbookRoutes);
app.use("/api/letters", letterRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/grading", gradingRoutes);

// Role-based routes
app.use("/api/institution-supervisors", institutionSupervisorRoutes);
app.use("/api/industry-supervisors", industrySupervisorRoutes);
app.use("/api/hods", hodRoutes);
app.use("/api/siwes-coordinators", siwesCoordinatorRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    path: req.originalUrl,
    message: "The requested endpoint does not exist"
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});