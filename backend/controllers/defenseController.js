import Defense from "../models/Defense.js";
import Student from "../models/student.js";
import SIWESCoordinator from "../models/siwesCoordinator.js";
import HOD from "../models/hod.js";
import Logbook from "../models/logbook.js";
import { sendEmail, emailTemplates } from "../utils/emailService.js";
import { Op } from "sequelize";

// Schedule defense
export const scheduleDefense = async (req, res) => {
  try {
    const coordinatorId = req.user.id;
    const {
      studentId,
      defenseDate,
      defenseTime,
      venue,
      duration = "45 minutes",
      panelMembers = []
    } = req.body;

    if (!studentId || !defenseDate || !defenseTime || !venue) {
      return res.status(400).json({
        error: "Student ID, defense date, time, and venue are required"
      });
    }

    // Check if student exists
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Check if at least some logbooks are approved (relaxed from 13 weeks)
    const logbooks = await Logbook.findAll({
      where: { studentId, status: 'APPROVED' }
    });

    if (logbooks.length === 0) {
      return res.status(400).json({
        error: "At least one week of logbooks must be approved before scheduling defense"
      });
    }

    const approvedWeeks = new Set(logbooks.map(l => l.weekNumber));
    console.log(`Student ${studentId} has ${approvedWeeks.size} weeks approved. Proceeding with defense scheduling.`);

    // Check if student already has a defense scheduled
    const existingDefense = await Defense.findOne({
      where: { studentId, status: "SCHEDULED" }
    });

    if (existingDefense) {
      return res.status(400).json({
        error: "Student already has a scheduled defense",
        existingDefense
      });
    }

    // Create defense
    const defense = await Defense.create({
      studentId,
      defenseDate,
      defenseTime,
      venue,
      duration,
      panelMembers,
      status: "SCHEDULED",
      scheduledBy: coordinatorId
    });

    // Notify student
    await sendEmail({
      to: student.email,
      ...emailTemplates.defenseScheduled(student.fullName, `${defenseDate} at ${defenseTime}`)
    });

    res.status(201).json({
      message: "Defense scheduled successfully",
      defense
    });
  } catch (err) {
    console.error("Schedule defense error:", err);
    res.status(500).json({
      error: "Failed to schedule defense",
      details: err.message
    });
  }
};

// Submit grade
export const submitGrade = async (req, res) => {
  try {
    const { defenseId } = req.params;
    const { score, remarks, verdict } = req.body;

    if (!score || !verdict) {
      return res.status(400).json({
        error: "Score and verdict are required"
      });
    }

    if (!['PASS', 'FAIL'].includes(verdict)) {
      return res.status(400).json({
        error: "Verdict must be either PASS or FAIL"
      });
    }

    if (score < 0 || score > 100) {
      return res.status(400).json({
        error: "Score must be between 0 and 100"
      });
    }

    const defense = await Defense.findByPk(defenseId);
    if (!defense) {
      return res.status(404).json({ error: "Defense not found" });
    }

    if (defense.status !== "SCHEDULED") {
      return res.status(400).json({
        error: "Defense is not in scheduled state"
      });
    }

    // Update defense with grade
    await defense.update({
      score,
      remarks,
      verdict,
      status: "COMPLETED",
      gradedAt: new Date()
    });

    // Update student status if passed
    if (verdict === "PASS") {
      const student = await Student.findByPk(defense.studentId);
      if (student) {
        student.status = "COMPLETED";
        student.progress = 100;
        await student.save();
      }
    }

    res.json({
      message: "Grade submitted successfully",
      defense
    });
  } catch (err) {
    console.error("Submit grade error:", err);
    res.status(500).json({
      error: "Failed to submit grade",
      details: err.message
    });
  }
};

// Get all defenses
export const getAllDefenses = async (req, res) => {
  try {
    const { page = 1, limit = 20, department, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }

    const include = [{
      model: Student,
      as: 'student',
      attributes: ['id', 'fullName', 'matricNumber', 'email', 'department']
    }];

    if (department) {
      include[0].where = { department };
    }

    const { count, rows: defenses } = await Defense.findAndCountAll({
      where,
      include,
      order: [['defenseDate', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      defenses,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error("Get all defenses error:", err);
    res.status(500).json({
      error: "Failed to fetch defenses",
      details: err.message
    });
  }
};

// Get my defense (student)
export const getMyDefense = async (req, res) => {
  try {
    const studentId = req.user.id;

    const defense = await Defense.findOne({
      where: { studentId },
      include: [{
        model: Student,
        as: 'student',
        attributes: ['id', 'fullName', 'matricNumber', 'email', 'department']
      }]
    });

    if (!defense) {
      return res.status(404).json({ error: "No defense scheduled" });
    }

    res.json(defense);
  } catch (err) {
    console.error("Get my defense error:", err);
    res.status(500).json({
      error: "Failed to fetch defense",
      details: err.message
    });
  }
};

// Get student defense
export const getStudentDefense = async (req, res) => {
  try {
    const { studentId } = req.params;

    const defense = await Defense.findOne({
      where: { studentId },
      include: [{
        model: Student,
        as: 'student',
        attributes: ['id', 'fullName', 'matricNumber', 'email', 'department']
      }]
    });

    if (!defense) {
      return res.status(404).json({ error: "No defense scheduled for this student" });
    }

    res.json(defense);
  } catch (err) {
    console.error("Get student defense error:", err);
    res.status(500).json({
      error: "Failed to fetch student defense",
      details: err.message
    });
  }
};

// Cancel defense
export const cancelDefense = async (req, res) => {
  try {
    const { defenseId } = req.params;

    const defense = await Defense.findByPk(defenseId);
    if (!defense) {
      return res.status(404).json({ error: "Defense not found" });
    }

    if (defense.status !== "SCHEDULED") {
      return res.status(400).json({
        error: "Only scheduled defenses can be cancelled"
      });
    }

    await defense.update({
      status: "CANCELLED",
      cancelledAt: new Date()
    });

    res.json({
      message: "Defense cancelled successfully"
    });
  } catch (err) {
    console.error("Cancel defense error:", err);
    res.status(500).json({
      error: "Failed to cancel defense",
      details: err.message
    });
  }
};

// Get defense stats
export const getDefenseStats = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    let stats = {};

    if (userRole === 'student') {
      const defense = await Defense.findOne({
        where: { studentId: userId }
      });

      stats = {
        hasDefense: !!defense,
        defenseStatus: defense ? defense.status : null,
        defenseDate: defense ? defense.defenseDate : null
      };
    } else if (userRole === 'siwesCoordinator') {
      const totalDefenses = await Defense.count();
      const scheduledDefenses = await Defense.count({ where: { status: "SCHEDULED" } });
      const completedDefenses = await Defense.count({ where: { status: "COMPLETED" } });
      const cancelledDefenses = await Defense.count({ where: { status: "CANCELLED" } });

      // Upcoming defenses
      const upcomingDefenses = await Defense.findAll({
        where: {
          status: "SCHEDULED",
          defenseDate: { [Op.gte]: new Date() }
        },
        include: [{
          model: Student,
          as: 'student',
          attributes: ['fullName', 'matricNumber', 'department']
        }],
        order: [['defenseDate', 'ASC']],
        limit: 10
      });

      stats = {
        totalDefenses,
        scheduledDefenses,
        completedDefenses,
        cancelledDefenses,
        upcomingDefenses
      };
    } else if (userRole === 'hod') {
      const hod = await HOD.findByPk(userId);
      if (!hod) {
        return res.status(404).json({ error: "HOD not found" });
      }

      const totalDefenses = await Defense.count({
        include: [{
          model: Student,
          as: 'student',
          where: { department: hod.department }
        }]
      });

      const scheduledDefenses = await Defense.count({
        where: { status: "SCHEDULED" },
        include: [{
          model: Student,
          as: 'student',
          where: { department: hod.department }
        }]
      });

      const completedDefenses = await Defense.count({
        where: { status: "COMPLETED" },
        include: [{
          model: Student,
          as: 'student',
          where: { department: hod.department }
        }]
      });

      stats = {
        totalDefenses,
        scheduledDefenses,
        completedDefenses,
        department: hod.department
      };
    }

    res.json(stats);
  } catch (err) {
    console.error("Get defense stats error:", err);
    res.status(500).json({
      error: "Failed to fetch defense statistics",
      details: err.message
    });
  }
};

export default {
  scheduleDefense,
  submitGrade,
  getAllDefenses,
  getMyDefense,
  getStudentDefense,
  cancelDefense,
  getDefenseStats
};