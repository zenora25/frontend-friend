import Logbook from "../models/logbook.js";
import { sendEmail, emailTemplates } from "../utils/emailService.js";
import Student from "../models/student.js";
import InstitutionSupervisor from "../models/institutionSupervisor.js";

// CREATE logbook entry with validation
export const createLogbookEntry = async (req, res) => {
  try {
    const { weekNumber, activityDescription, images } = req.body;
    const studentId = req.user.id; // From JWT

    // Validate week number (1-13 for SIWES)
    if (weekNumber < 1 || weekNumber > 13) {
      return res.status(400).json({ error: "Week number must be between 1 and 13" });
    }

    // Check if student already submitted for this week
    const existingEntry = await Logbook.findOne({
      where: { studentId, weekNumber }
    });

    if (existingEntry) {
      return res.status(400).json({
        error: "Logbook already submitted for this week",
        existingEntry
      });
    }

    const entry = await Logbook.create({
      studentId,
      weekNumber,
      activityDescription,
      images: images || [],
      status: "PENDING",
    });

    // Get student and supervisor info for notification
    const student = await Student.findByPk(studentId);
    if (student.assignedSupervisor) {
      const supervisor = await InstitutionSupervisor.findByPk(student.assignedSupervisor);
      if (supervisor) {
        // Send email notification (mock for MVP)
        await sendEmail({
          to: supervisor.email,
          ...emailTemplates.logbookSubmitted(student.fullName, supervisor.fullName)
        });
      }
    }

    res.status(201).json({
      message: "Logbook entry created successfully",
      entry,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create logbook entry" });
  }
};

// Supervisor approves/rejects logbook
export const reviewLogbook = async (req, res) => {
  try {
    const { logbookId } = req.params;
    const { status, comment } = req.body;
    const supervisorId = req.user.id;

    const validStatuses = ["APPROVED", "NEEDS_REVIEW"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const logbook = await Logbook.findByPk(logbookId);
    if (!logbook) {
      return res.status(404).json({ error: "Logbook not found" });
    }

    // Check if supervisor is assigned to this student
    const student = await Student.findByPk(logbook.studentId);
    if (student.assignedSupervisor !== supervisorId) {
      return res.status(403).json({
        error: "Not authorized to review this logbook"
      });
    }

    // Update logbook
    logbook.status = status;
    logbook.supervisorComment = comment;
    logbook.signedAt = status === "APPROVED" ? new Date() : null;
    await logbook.save();

    // Notify student
    await sendEmail({
      to: student.email,
      ...emailTemplates.supervisorComment(student.fullName)
    });

    res.json({
      message: `Logbook ${status.toLowerCase()} successfully`,
      logbook,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to review logbook" });
  }
};

// GET all logbook entries
export const getLogbookEntries = async (req, res) => {
  try {
    const entries = await Logbook.findAll({
      order: [['weekNumber', 'ASC']],
    });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch logbook entries" });
  }
};

// GET student logbook by ID
export const getStudentLogbook = async (req, res) => {
  try {
    const { studentId } = req.params;
    const entries = await Logbook.findAll({
      where: { studentId },
      order: [['weekNumber', 'ASC']],
    });

    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch student logbook" });
  }
};

// GET supervisor's assigned students' logbooks
export const getSupervisorLogbooks = async (req, res) => {
  try {
    const supervisorId = req.user.id;

    // Get all students assigned to this supervisor
    const students = await Student.findAll({
      where: { assignedSupervisor: supervisorId },
    });

    const studentIds = students.map(s => s.id);

    const logbooks = await Logbook.findAll({
      where: { studentId: studentIds },
      include: [{
        model: Student,
        attributes: ['id', 'fullName', 'email']
      }],
      order: [['weekNumber', 'ASC']],
    });

    res.json(logbooks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch supervisor logbooks" });
  }
};