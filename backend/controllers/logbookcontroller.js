import Logbook from "../models/logbook.js";
import Student from "../models/student.js";
import InstitutionSupervisor from "../models/institutionSupervisor.js";
import IndustrySupervisor from "../models/industrySupervisor.js";
import { Op } from "sequelize";

// CREATE logbook entry (Student)
export const createLogbook = async (req, res) => {
  try {
    const {
      weekNumber,
      startDate,
      endDate,
      title,
      mondayActivities,
      tuesdayActivities,
      wednesdayActivities,
      thursdayActivities,
      fridayActivities,
      weekSummary,
      challengesFaced,
      lessonsLearned,
      skillsAcquired,
    } = req.body;

    const studentId = req.user.id;

    // Validate required fields
    if (!weekNumber || !startDate || !endDate || !title || !weekSummary) {
      return res.status(400).json({
        error: "Week number, dates, title, and summary are required",
      });
    }

    // Check if logbook for this week already exists
    const existingLogbook = await Logbook.findOne({
      where: {
        studentId,
        weekNumber,
      },
    });

    if (existingLogbook) {
      return res.status(400).json({
        error: "Logbook entry for this week already exists",
      });
    }

    const logbook = await Logbook.create({
      studentId,
      weekNumber,
      startDate,
      endDate,
      title,
      mondayActivities,
      tuesdayActivities,
      wednesdayActivities,
      thursdayActivities,
      fridayActivities,
      weekSummary,
      challengesFaced,
      lessonsLearned,
      skillsAcquired,
      status: "PENDING",
    });

    // Update student progress
    const student = await Student.findByPk(studentId);
    const totalWeeks = 24; // Assuming 24-week SIWES program
    const completedWeeks = await Logbook.count({
      where: { studentId, status: "APPROVED" },
    });
    const progress = Math.round((completedWeeks / totalWeeks) * 100);

    student.progress = progress;
    await student.save();

    res.status(201).json({
      message: "Logbook entry created successfully",
      logbook,
    });
  } catch (err) {
    console.error("Create logbook error:", err);
    res.status(500).json({
      error: "Failed to create logbook entry",
      details: err.message,
    });
  }
};

// GET all student's logbooks
export const getMyLogbooks = async (req, res) => {
  try {
    const studentId = req.user.id;

    const logbooks = await Logbook.findAll({
      where: { studentId },
      order: [["weekNumber", "DESC"]],
    });

    res.json(logbooks);
  } catch (err) {
    console.error("Get my logbooks error:", err);
    res.status(500).json({
      error: "Failed to fetch logbooks",
      details: err.message,
    });
  }
};

// GET single logbook by ID
export const getLogbookById = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    const logbook = await Logbook.findOne({
      where: { id, studentId },
      include: [
        {
          model: Student,
          attributes: ["id", "fullName", "matricNumber", "department"],
        },
      ],
    });

    if (!logbook) {
      return res.status(404).json({ error: "Logbook not found" });
    }

    res.json(logbook);
  } catch (err) {
    console.error("Get logbook error:", err);
    res.status(500).json({
      error: "Failed to fetch logbook",
      details: err.message,
    });
  }
};

// UPDATE logbook (Student)
export const updateLogbook = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    const logbook = await Logbook.findOne({
      where: { id, studentId, status: "PENDING" },
    });

    if (!logbook) {
      return res.status(404).json({
        error: "Logbook not found or already reviewed",
      });
    }

    const updatedData = req.body;
    await logbook.update(updatedData);

    res.json({
      message: "Logbook updated successfully",
      logbook,
    });
  } catch (err) {
    console.error("Update logbook error:", err);
    res.status(500).json({
      error: "Failed to update logbook",
      details: err.message,
    });
  }
};

// DELETE logbook (Student)
export const deleteLogbook = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    const logbook = await Logbook.findOne({
      where: { id, studentId, status: "PENDING" },
    });

    if (!logbook) {
      return res.status(404).json({
        error: "Logbook not found or cannot be deleted",
      });
    }

    await logbook.destroy();

    res.json({
      message: "Logbook deleted successfully",
    });
  } catch (err) {
    console.error("Delete logbook error:", err);
    res.status(500).json({
      error: "Failed to delete logbook",
      details: err.message,
    });
  }
};

// GET supervisor's assigned students' logbooks
export const getSupervisorLogbooks = async (req, res) => {
  try {
    const supervisorId = req.user.id;
    const { status } = req.query;

    // Get supervisor's assigned students
    const supervisor = await InstitutionSupervisor.findByPk(supervisorId, {
      include: [
        {
          model: Student,
          as: "AssignedStudents",
          include: [
            {
              model: Logbook,
              where: status ? { status } : undefined,
            },
          ],
        },
      ],
    });

    if (!supervisor) {
      return res.status(404).json({ error: "Supervisor not found" });
    }

    const logbooks = supervisor.AssignedStudents.flatMap(
        (student) => student.Logbooks
    );

    res.json(logbooks);
  } catch (err) {
    console.error("Get supervisor logbooks error:", err);
    res.status(500).json({
      error: "Failed to fetch supervisor logbooks",
      details: err.message,
    });
  }
};

// REVIEW logbook (Supervisor)
export const reviewLogbook = async (req, res) => {
  try {
    const { logbookId } = req.params;
    const supervisorId = req.user.id;
    const { status, comment, isIndustrySupervisor = false } = req.body;

    // Validate status
    const validStatuses = ["APPROVED", "REVISION"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Get logbook with student info
    const logbook = await Logbook.findByPk(logbookId, {
      include: [
        {
          model: Student,
          attributes: ["id", "assignedSupervisor", "assignedIndustrySupervisor"],
        },
      ],
    });

    if (!logbook) {
      return res.status(404).json({ error: "Logbook not found" });
    }

    // Check if supervisor is authorized
    if (isIndustrySupervisor) {
      if (logbook.Student.assignedIndustrySupervisor !== supervisorId) {
        return res.status(403).json({
          error: "Not authorized to review this logbook",
        });
      }
      logbook.industrySupervisorComment = comment;
    } else {
      if (logbook.Student.assignedSupervisor !== supervisorId) {
        return res.status(403).json({
          error: "Not authorized to review this logbook",
        });
      }
      logbook.supervisorComment = comment;
    }

    // Update status
    logbook.status = status;
    await logbook.save();

    res.json({
      message: `Logbook ${status.toLowerCase()} successfully`,
      logbook,
    });
  } catch (err) {
    console.error("Review logbook error:", err);
    res.status(500).json({
      error: "Failed to review logbook",
      details: err.message,
    });
  }
};

// GET all logbooks (Admin/HOD/Coordinator)
export const getAllLogbooks = async (req, res) => {
  try {
    const { department, status, page = 1, limit = 20 } = req.query;

    const where = {};
    const include = [
      {
        model: Student,
        attributes: ["id", "fullName", "matricNumber", "department"],
        where: department ? { department } : undefined,
      },
    ];

    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const { count, rows: logbooks } = await Logbook.findAndCountAll({
      where,
      include,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      logbooks,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error("Get all logbooks error:", err);
    res.status(500).json({
      error: "Failed to fetch logbooks",
      details: err.message,
    });
  }
};

// GET student logbook by student ID (Supervisor/Admin)
export const getStudentLogbook = async (req, res) => {
  try {
    const { studentId } = req.params;

    const logbooks = await Logbook.findAll({
      where: { studentId },
      order: [["weekNumber", "ASC"]],
      include: [
        {
          model: Student,
          attributes: ["id", "fullName", "matricNumber", "department"],
        },
      ],
    });

    res.json(logbooks);
  } catch (err) {
    console.error("Get student logbook error:", err);
    res.status(500).json({
      error: "Failed to fetch student logbook",
      details: err.message,
    });
  }
};

// GET logbook statistics
export const getLogbookStats = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    let stats = {};

    if (userRole === "student") {
      const studentId = userId;
      const totalEntries = await Logbook.count({ where: { studentId } });
      const approvedEntries = await Logbook.count({
        where: { studentId, status: "APPROVED" },
      });
      const pendingEntries = await Logbook.count({
        where: { studentId, status: "PENDING" },
      });
      const revisionEntries = await Logbook.count({
        where: { studentId, status: "REVISION" },
      });

      stats = {
        totalEntries,
        approvedEntries,
        pendingEntries,
        revisionEntries,
        completionRate: totalEntries > 0 ? Math.round((approvedEntries / totalEntries) * 100) : 0,
      };
    } else if (userRole === "institutionSupervisor" || userRole === "industrySupervisor") {
      const supervisorId = userId;
      const supervisorModel = userRole === "institutionSupervisor" ? InstitutionSupervisor : IndustrySupervisor;

      const supervisor = await supervisorModel.findByPk(supervisorId, {
        include: [
          {
            model: Student,
            as: userRole === "institutionSupervisor" ? "AssignedStudents" : "IndustryStudents",
            include: [Logbook],
          },
        ],
      });

      if (supervisor) {
        const students = supervisor[userRole === "institutionSupervisor" ? "AssignedStudents" : "IndustryStudents"];
        const allLogbooks = students.flatMap((student) => student.Logbooks);

        const totalEntries = allLogbooks.length;
        const pendingReviews = allLogbooks.filter((logbook) => logbook.status === "PENDING").length;
        const reviewedThisWeek = allLogbooks.filter(
            (logbook) =>
                logbook.status === "APPROVED" &&
                new Date(logbook.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;

        stats = {
          totalEntries,
          pendingReviews,
          reviewedThisWeek,
          assignedStudents: students.length,
        };
      }
    }

    res.json(stats);
  } catch (err) {
    console.error("Get logbook stats error:", err);
    res.status(500).json({
      error: "Failed to fetch logbook statistics",
      details: err.message,
    });
  }
};

// export {
//   createLogbook,
//   getMyLogbooks,
//   getLogbookById,
//   updateLogbook,
//   deleteLogbook,
//   getSupervisorLogbooks,
//   reviewLogbook,
//   getAllLogbooks,
//   getStudentLogbook,
//   getLogbookStats,
// };