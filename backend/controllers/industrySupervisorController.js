import IndustrySupervisor from "../models/industrySupervisor.js";
import Student from "../models/student.js";
import Logbook from "../models/logbook.js";
import Assignment from "../models/Assignment.js";
import InstitutionSupervisor from "../models/institutionSupervisor.js"; // Added import
import { Op } from "sequelize";

// Get industry supervisor dashboard
export const getIndustrySupervisorDashboard = async (req, res) => {
  try {
    const supervisorId = req.user.id;

    const supervisor = await IndustrySupervisor.findByPk(supervisorId, {
      attributes: ['id', 'fullName', 'email', 'companyName'],
      include: [{
        model: Student,
        as: "AssignedInterns",
        attributes: ['id', 'fullName', 'matricNumber', 'email', 'department', 'companyName', 'progress', 'status', 'companyAddress'],
        include: [{
          model: Logbook,
          attributes: ['id', 'weekNumber', 'title', 'status', 'createdAt', 'updatedAt'],
          limit: 3,
          order: [['weekNumber', 'DESC']]
        }]
      }]
    });

    if (!supervisor) {
      return res.status(404).json({ error: "Industry Supervisor not found" });
    }

    const assignedInterns = supervisor.AssignedInterns || [];
    const studentIds = assignedInterns.map(student => student.id);

    // Calculate statistics
    const totalInterns = assignedInterns.length;
    const activeInterns = assignedInterns.filter(intern => intern.status === "ACTIVE").length;
    const completedInterns = assignedInterns.filter(intern => intern.status === "COMPLETED").length;

    // Get logbook statistics
    const studentLogbooks = assignedInterns.flatMap(student => student.Logbooks || []);
    const totalLogbooks = studentLogbooks.length;
    const pendingLogbooks = studentLogbooks.filter(logbook => logbook.status === "PENDING").length;
    const approvedLogbooks = studentLogbooks.filter(logbook => logbook.status === "APPROVED").length;
    const revisionLogbooks = studentLogbooks.filter(logbook => logbook.status === "REVISION").length;

    // Get recent activities
    const recentPendingLogbooks = await Logbook.findAll({
      where: {
        studentId: studentIds,
        status: "PENDING"
      },
      include: [{
        model: Student,
        as: 'student',
        attributes: ['id', 'fullName', 'matricNumber', 'department']
      }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Intern progress overview
    const internProgress = assignedInterns.map(intern => ({
      id: intern.id,
      name: intern.fullName,
      matricNumber: intern.matricNumber,
      university: intern.department,
      progress: intern.progress,
      status: intern.status,
      lastActivity: intern.Logbooks && intern.Logbooks.length > 0
        ? intern.Logbooks[0].createdAt
        : intern.updatedAt,
      pendingLogbooks: (intern.Logbooks || []).filter(logbook => logbook.status === "PENDING").length
    }));

    res.json({
      supervisor: {
        id: supervisor.id,
        fullName: supervisor.fullName,
        email: supervisor.email,
        companyName: supervisor.companyName
      },
      stats: {
        totalInterns,
        activeInterns,
        completedInterns,
        totalLogbooks,
        pendingLogbooks,
        approvedLogbooks,
        revisionLogbooks,
        reviewRate: totalLogbooks > 0 ? Math.round((approvedLogbooks / totalLogbooks) * 100) : 0,
        completionRate: totalInterns > 0 ? Math.round((completedInterns / totalInterns) * 100) : 0
      },
      internProgress,
      recentActivities: recentPendingLogbooks.map(logbook => ({
        id: logbook.id,
        studentId: logbook.studentId,
        studentName: logbook.student ? logbook.student.fullName : 'Unknown',
        studentMatric: logbook.student ? logbook.student.matricNumber : 'N/A',
        weekNumber: logbook.weekNumber,
        title: logbook.title,
        submittedAt: logbook.createdAt,
        status: logbook.status
      }))
    });

  } catch (err) {
    console.error("Get industry supervisor dashboard error:", err);
    res.status(500).json({
      error: "Failed to fetch industry supervisor dashboard",
      details: err.message
    });
  }
};

// Get assigned interns
export const getAssignedInterns = async (req, res) => {
  try {
    const supervisorId = req.user.id;

    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    const where = { assignedIndustrySupervisor: supervisorId };
    if (status) {
      where.status = status;
    }
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { matricNumber: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { companyName: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: interns } = await Student.findAndCountAll({
      where,
      attributes: ['id', 'fullName', 'matricNumber', 'email', 'department', 'companyName', 'progress', 'status', 'companyAddress', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0
    });

    // Fetch logbooks and supervisor info manually for each intern
    const internsWithDetails = await Promise.all(
      interns.map(async (intern) => {
        const logbooks = await Logbook.findAll({
          where: { studentId: intern.id },
          attributes: ['id', 'weekNumber', 'title', 'status', 'createdAt'],
          limit: 5,
          order: [['weekNumber', 'DESC']]
        });

        const instSupervisor = await InstitutionSupervisor.findByPk(intern.assignedSupervisor, {
          attributes: ['id', 'fullName', 'email']
        });

        const indSupervisor = await IndustrySupervisor.findByPk(intern.assignedIndustrySupervisor, {
          attributes: ['id', 'fullName', 'email', 'companyName']
        });

        const internData = intern.toJSON();
        internData.Logbooks = logbooks;
        internData.Supervisor = instSupervisor;
        internData.IndustrySupervisor = indSupervisor;

        return internData;
      })
    );

    res.json({
      success: true,
      interns: internsWithDetails,
      pagination: {
        total: count,
        page: parseInt(page) || 1,
        pages: Math.ceil(count / (parseInt(limit) || 20)),
        limit: parseInt(limit) || 20
      }
    });

  } catch (err) {
    console.error("Get assigned interns error:", err);
    res.status(500).json({
      error: "Failed to fetch assigned interns",
      details: err.message
    });
  }
};

// Review logbook (industry supervisor)
export const reviewLogbook = async (req, res) => {
  try {
    const { logbookId } = req.params;
    const { status, comment } = req.body;
    const supervisorId = req.user.id;

    if (!status || !comment) {
      return res.status(400).json({
        error: "Status and comment are required"
      });
    }

    if (!['APPROVED', 'REVISION'].includes(status)) {
      return res.status(400).json({
        error: "Status must be either APPROVED or REVISION"
      });
    }

    const logbook = await Logbook.findOne({
      where: { id: logbookId },
      include: [{
        model: Student,
        as: 'student',
        where: { assignedIndustrySupervisor: supervisorId }
      }]
    });

    if (!logbook) {
      return res.status(404).json({
        error: "Logbook not found or not assigned to you"
      });
    }

    if (!logbook || logbook.status !== 'PENDING') {
      return res.status(400).json({
        error: "Logbook has already been reviewed or not found"
      });
    }

    // Update logbook with industry supervisor review
    await logbook.update({
      status: status, // Overall status
      industryStatus: status, // Industry specific status
      industryComment: comment, // Matching model field name
      industryReviewedAt: new Date()
    });

    res.json({
      message: "Logbook reviewed successfully",
      logbook: {
        id: logbook.id,
        status: logbook.status,
        industryStatus: logbook.industryStatus,
        industryComment: logbook.industryComment,
        updatedAt: logbook.updatedAt
      }
    });

  } catch (err) {
    console.error("Review logbook error:", err);
    res.status(500).json({
      error: "Failed to review logbook",
      details: err.message
    });
  }
};

// Get pending logbooks for industry supervisor
export const getPendingLogbooks = async (req, res) => {
  try {
    const supervisorId = req.user.id;

    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get assigned intern IDs
    const assignedInterns = await Student.findAll({
      where: { assignedIndustrySupervisor: supervisorId },
      attributes: ['id']
    });

    const studentIds = assignedInterns.map(student => student.id);

    if (studentIds.length === 0) {
      return res.json({
        logbooks: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          pages: 0,
          limit: parseInt(limit)
        }
      });
    }

    const { count, rows: logbooks } = await Logbook.findAndCountAll({
      where: {
        studentId: studentIds,
        status: "PENDING"
      },
      include: [{
        model: Student,
        as: 'student',
        attributes: ['id', 'fullName', 'matricNumber', 'email', 'department', 'companyName']
      }],
      order: [['createdAt', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      logbooks,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });

  } catch (err) {
    console.error("Get pending logbooks error:", err);
    res.status(500).json({
      error: "Failed to fetch pending logbooks",
      details: err.message
    });
  }
};

// Update industry supervisor profile
export const updateIndustrySupervisor = async (req, res) => {
  try {
    const supervisorId = req.user.id;
    const { fullName, phone, profileImage } = req.body;

    const supervisor = await IndustrySupervisor.findByPk(supervisorId, {
      attributes: ['id', 'fullName', 'email', 'companyName', 'phone', 'profileImage', 'position', 'department']
    });
    if (!supervisor) {
      return res.status(404).json({ error: "Industry Supervisor not found" });
    }

    // Update fields
    if (fullName) supervisor.fullName = fullName;
    if (phone !== undefined) supervisor.phone = phone;
    if (profileImage !== undefined) supervisor.profileImage = profileImage;

    await supervisor.save();

    // Remove password from response
    const supervisorResponse = supervisor.toJSON();
    delete supervisorResponse.password;

    res.json({
      message: "Industry Supervisor profile updated successfully",
      supervisor: supervisorResponse
    });

  } catch (err) {
    console.error("Update industry supervisor error:", err);
    res.status(500).json({
      error: "Failed to update industry supervisor profile",
      details: err.message
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const supervisorId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters long"
      });
    }

    const supervisor = await IndustrySupervisor.findByPk(supervisorId);
    if (!supervisor) {
      return res.status(404).json({ error: "Industry Supervisor not found" });
    }

    // Verify current password
    const isValidPassword = await supervisor.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Current password is incorrect"
      });
    }

    // Update password
    supervisor.password = newPassword;
    await supervisor.save();

    res.json({
      message: "Password changed successfully"
    });

  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({
      error: "Failed to change password",
      details: err.message
    });
  }
};

// Get industry supervisor profile (NEW FUNCTION)
export const getMyProfile = async (req, res) => {
  try {
    const supervisorId = req.user.id;

    const supervisor = await IndustrySupervisor.findByPk(supervisorId, {
      attributes: ['id', 'fullName', 'email', 'companyName', 'phone', 'profileImage', 'position', 'department']
    });

    if (!supervisor) {
      return res.status(404).json({ error: "Industry Supervisor not found" });
    }

    res.json({
      supervisor,
      message: "Profile fetched successfully"
    });

  } catch (err) {
    console.error("Get my profile error:", err);
    res.status(500).json({
      error: "Failed to fetch profile",
      details: err.message
    });
  }
};

// Get industry supervisor logbook statistics (NEW FUNCTION)
export const getLogbookStats = async (req, res) => {
  try {
    const supervisorId = req.user.id;

    // Get assigned intern IDs
    const assignedInterns = await Student.findAll({
      where: { assignedIndustrySupervisor: supervisorId },
      attributes: ['id']
    });

    const studentIds = assignedInterns.map(student => student.id);

    if (studentIds.length === 0) {
      return res.json({
        totalLogbooks: 0,
        pendingLogbooks: 0,
        approvedLogbooks: 0,
        revisionLogbooks: 0,
        reviewedThisWeek: 0
      });
    }

    // Get all logbooks for assigned interns
    const allLogbooks = await Logbook.findAll({
      where: { studentId: studentIds }
    });

    // Get logbooks reviewed this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const reviewedThisWeek = await Logbook.count({
      where: {
        studentId: studentIds,
        status: "APPROVED",
        updatedAt: { [Op.gte]: oneWeekAgo }
      }
    });

    // Calculate statistics
    const totalLogbooks = allLogbooks.length;
    const pendingLogbooks = allLogbooks.filter(logbook => logbook.status === "PENDING").length;
    const approvedLogbooks = allLogbooks.filter(logbook => logbook.status === "APPROVED").length;
    const revisionLogbooks = allLogbooks.filter(logbook => logbook.status === "REVISION").length;

    res.json({
      totalLogbooks,
      pendingLogbooks,
      approvedLogbooks,
      revisionLogbooks,
      reviewedThisWeek,
      reviewRate: totalLogbooks > 0 ? Math.round((approvedLogbooks / totalLogbooks) * 100) : 0
    });

  } catch (err) {
    console.error("Get logbook stats error:", err);
    res.status(500).json({
      error: "Failed to fetch logbook statistics",
      details: err.message
    });
  }
};

// REMOVE THIS DEFAULT EXPORT AT THE BOTTOM
// export default {
//   getIndustrySupervisorDashboard,
//   getAssignedInterns,
//   reviewLogbook,
//   getPendingLogbooks,
//   updateIndustrySupervisor,
//   changePassword
// };