
import InstitutionSupervisor from "../models/institutionSupervisor.js";
import Student from "../models/student.js";
import Logbook from "../models/Logbook.js";
import Assignment from "../models/Assignment.js";
import { Op } from "sequelize";

// Create Institution Supervisor (Admin/Coordinator)
export const createInstitutionSupervisor = async (req, res) => {
  try {
    const { fullName, email, department, password } = req.body;
    
    if (!fullName || !email || !department || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if email already exists
    const existingSupervisor = await InstitutionSupervisor.findOne({ where: { email } });
    if (existingSupervisor) {
      return res.status(400).json({ error: "Supervisor with this email already exists" });
    }

    const supervisor = await InstitutionSupervisor.create({ fullName, email, department, password });
    
    // Remove password from response
    const supervisorResponse = supervisor.toJSON();
    delete supervisorResponse.password;
    
    res.status(201).json({ 
      message: "Institution Supervisor created successfully", 
      supervisor: supervisorResponse 
    });
  } catch (err) {
    console.error("Create institution supervisor error:", err);
    res.status(500).json({ 
      error: "Failed to create institution supervisor", 
      details: err.message 
    });
  }
};

// Get all institution supervisors
export const getInstitutionSupervisors = async (req, res) => {
  try {
    const { department, page = 1, limit = 20, search } = req.query;
    
    const where = {};
    if (department) {
      where.department = department;
    }
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    
    const { count, rows: supervisors } = await InstitutionSupervisor.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      supervisors,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error("Get institution supervisors error:", err);
    res.status(500).json({ 
      error: "Failed to fetch institution supervisors", 
      details: err.message 
    });
  }
};

// Get institution supervisor by ID
export const getInstitutionSupervisorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const supervisor = await InstitutionSupervisor.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Student,
        as: "AssignedStudents",
        attributes: ['id', 'fullName', 'matricNumber', 'email', 'department', 'companyName', 'progress', 'status'],
        include: [{
          model: Logbook,
          attributes: ['id', 'weekNumber', 'title', 'status', 'createdAt'],
          limit: 5,
          order: [['weekNumber', 'DESC']]
        }]
      }]
    });
    
    if (!supervisor) {
      return res.status(404).json({ error: "Institution Supervisor not found" });
    }
    
    res.json(supervisor);
  } catch (err) {
    console.error("Get institution supervisor by ID error:", err);
    res.status(500).json({ 
      error: "Failed to fetch institution supervisor", 
      details: err.message 
    });
  }
};

// Get supervisor dashboard
export const getSupervisorDashboard = async (req, res) => {
  try {
    const supervisorId = req.user.id;
    
    const supervisor = await InstitutionSupervisor.findByPk(supervisorId, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Student,
        as: "AssignedStudents",
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
      return res.status(404).json({ error: "Supervisor not found" });
    }
    
    const assignedStudents = supervisor.AssignedStudents || [];
    const studentIds = assignedStudents.map(student => student.id);
    
    // Calculate statistics
    const totalStudents = assignedStudents.length;
    const activeStudents = assignedStudents.filter(student => student.status === "ACTIVE").length;
    const completedStudents = assignedStudents.filter(student => student.status === "COMPLETED").length;
    
    // Get logbook statistics
    const studentLogbooks = assignedStudents.flatMap(student => student.Logbooks || []);
    const totalLogbooks = studentLogbooks.length;
    const pendingLogbooks = studentLogbooks.filter(logbook => logbook.status === "PENDING").length;
    const approvedLogbooks = studentLogbooks.filter(logbook => logbook.status === "APPROVED").length;
    const revisionLogbooks = studentLogbooks.filter(logbook => logbook.status === "REVISION").length;
    
    // Get recent activities (logbooks needing review)
    const recentPendingLogbooks = await Logbook.findAll({
      where: {
        studentId: studentIds,
        status: "PENDING"
      },
      include: [{
        model: Student,
        attributes: ['id', 'fullName', 'matricNumber', 'department']
      }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    // Calculate average response time
    const approvedLogbooksWithTime = studentLogbooks.filter(logbook => 
      logbook.status === "APPROVED" && logbook.createdAt && logbook.updatedAt
    );
    
    let avgResponseTime = 0;
    if (approvedLogbooksWithTime.length > 0) {
      const totalResponseTime = approvedLogbooksWithTime.reduce((sum, logbook) => {
        const submissionTime = new Date(logbook.createdAt);
        const approvalTime = new Date(logbook.updatedAt);
        const responseTime = (approvalTime - submissionTime) / (1000 * 60 * 60 * 24); // in days
        return sum + responseTime;
      }, 0);
      avgResponseTime = totalResponseTime / approvedLogbooksWithTime.length;
    }
    
    // Student progress overview
    const studentProgress = assignedStudents.map(student => ({
      id: student.id,
      name: student.fullName,
      matricNumber: student.matricNumber,
      company: student.companyName,
      progress: student.progress,
      status: student.status,
      lastActivity: student.Logbooks && student.Logbooks.length > 0 
        ? student.Logbooks[0].createdAt 
        : student.updatedAt,
      pendingLogbooks: (student.Logbooks || []).filter(logbook => logbook.status === "PENDING").length
    }));
    
    // Recent logbook submissions
    const recentLogbookSubmissions = recentPendingLogbooks.map(logbook => ({
      id: logbook.id,
      studentId: logbook.studentId,
      studentName: logbook.Student.fullName,
      studentMatric: logbook.Student.matricNumber,
      weekNumber: logbook.weekNumber,
      title: logbook.title,
      submittedAt: logbook.createdAt,
      status: logbook.status
    }));
    
    res.json({
      supervisor: {
        id: supervisor.id,
        fullName: supervisor.fullName,
        email: supervisor.email,
        department: supervisor.department
      },
      stats: {
        totalStudents,
        activeStudents,
        completedStudents,
        totalLogbooks,
        pendingLogbooks,
        approvedLogbooks,
        revisionLogbooks,
        approvalRate: totalLogbooks > 0 ? Math.round((approvedLogbooks / totalLogbooks) * 100) : 0,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        completionRate: totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0
      },
      studentProgress,
      recentLogbookSubmissions,
      performanceMetrics: {
        responseEfficiency: Math.max(0, 100 - (avgResponseTime * 10)), // Lower response time = higher efficiency
        reviewCompleteness: totalLogbooks > 0 ? Math.round(((approvedLogbooks + revisionLogbooks) / totalLogbooks) * 100) : 0,
        studentSatisfaction: 85, // Placeholder - could be calculated from student feedback
        engagementLevel: activeStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0
      }
    });
    
  } catch (err) {
    console.error("Get supervisor dashboard error:", err);
    res.status(500).json({ 
      error: "Failed to fetch supervisor dashboard", 
      details: err.message 
    });
  }
};

// Get supervisor's assigned students
export const getAssignedStudents = async (req, res) => {
  try {
    const supervisorId = req.user.id;
    
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;
    
    const where = { assignedSupervisor: supervisorId };
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
    
    const { count, rows: students } = await Student.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Logbook,
          attributes: ['id', 'weekNumber', 'title', 'status', 'createdAt'],
          limit: 5,
          order: [['weekNumber', 'DESC']]
        },
        {
          model: InstitutionSupervisor,
          as: 'Supervisor',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: InstitutionSupervisor,
          as: 'IndustrySupervisor',
          attributes: ['id', 'fullName', 'email', 'companyName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      students,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
    
  } catch (err) {
    console.error("Get assigned students error:", err);
    res.status(500).json({ 
      error: "Failed to fetch assigned students", 
      details: err.message 
    });
  }
};

// Get supervisor performance stats
export const getSupervisorStats = async (req, res) => {
  try {
    const supervisorId = req.user.id;
    
    // Get supervisor with assigned students
    const supervisor = await InstitutionSupervisor.findByPk(supervisorId, {
      include: [{
        model: Student,
        as: "AssignedStudents",
        include: [Logbook]
      }]
    });
    
    if (!supervisor) {
      return res.status(404).json({ error: "Supervisor not found" });
    }
    
    const assignedStudents = supervisor.AssignedStudents || [];
    const studentIds = assignedStudents.map(student => student.id);
    
    // Get all logbooks for assigned students
    const allLogbooks = await Logbook.findAll({
      where: { studentId: studentIds }
    });
    
    // Calculate statistics
    const totalLogbooks = allLogbooks.length;
    const pendingLogbooks = allLogbooks.filter(logbook => logbook.status === "PENDING").length;
    const approvedLogbooks = allLogbooks.filter(logbook => logbook.status === "APPROVED").length;
    const revisionLogbooks = allLogbooks.filter(logbook => logbook.status === "REVISION").length;
    
    // Calculate response time
    const approvedLogbooksWithTime = allLogbooks.filter(logbook => 
      logbook.status === "APPROVED" && logbook.createdAt && logbook.updatedAt
    );
    
    let avgResponseTime = 0;
    let minResponseTime = 0;
    let maxResponseTime = 0;
    
    if (approvedLogbooksWithTime.length > 0) {
      const responseTimes = approvedLogbooksWithTime.map(logbook => {
        const submissionTime = new Date(logbook.createdAt);
        const approvalTime = new Date(logbook.updatedAt);
        return (approvalTime - submissionTime) / (1000 * 60 * 60 * 24); // in days
      });
      
      avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      minResponseTime = Math.min(...responseTimes);
      maxResponseTime = Math.max(...responseTimes);
    }
    
    // Calculate weekly review rate
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentApprovals = allLogbooks.filter(logbook => 
      logbook.status === "APPROVED" && new Date(logbook.updatedAt) >= lastWeek
    ).length;
    
    const pendingFromLastWeek = allLogbooks.filter(logbook => 
      logbook.status === "PENDING" && new Date(logbook.createdAt) >= lastWeek
    ).length;
    
    // Student progress statistics
    const avgStudentProgress = assignedStudents.length > 0
      ? Math.round(assignedStudents.reduce((sum, student) => sum + student.progress, 0) / assignedStudents.length)
      : 0;
    
    const studentsOnTrack = assignedStudents.filter(student => student.progress >= 70).length;
    const studentsBehind = assignedStudents.filter(student => student.progress < 50).length;
    
    res.json({
      supervisor: {
        id: supervisor.id,
        fullName: supervisor.fullName,
        email: supervisor.email,
        department: supervisor.department
      },
      logbookStats: {
        total: totalLogbooks,
        pending: pendingLogbooks,
        approved: approvedLogbooks,
        revision: revisionLogbooks,
        approvalRate: totalLogbooks > 0 ? Math.round((approvedLogbooks / totalLogbooks) * 100) : 0,
        reviewRate: totalLogbooks > 0 ? Math.round(((approvedLogbooks + revisionLogbooks) / totalLogbooks) * 100) : 0
      },
      responseTime: {
        average: Math.round(avgResponseTime * 10) / 10,
        minimum: Math.round(minResponseTime * 10) / 10,
        maximum: Math.round(maxResponseTime * 10) / 10,
        recentApprovals,
        pendingFromLastWeek
      },
      studentProgress: {
        average: avgStudentProgress,
        totalStudents: assignedStudents.length,
        onTrack: studentsOnTrack,
        behind: studentsBehind,
        onTrackPercentage: assignedStudents.length > 0 ? Math.round((studentsOnTrack / assignedStudents.length) * 100) : 0
      },
      performanceScore: {
        overall: Math.min(100, 
          (totalLogbooks > 0 ? ((approvedLogbooks + revisionLogbooks) / totalLogbooks) * 40 : 0) + // Review completion
          Math.max(0, 100 - (avgResponseTime * 5)) * 30 + // Response time (max 30 points)
          (avgStudentProgress / 100) * 30 // Student progress (max 30 points)
        ),
        reviewEfficiency: totalLogbooks > 0 ? Math.round(((approvedLogbooks + revisionLogbooks) / totalLogbooks) * 100) : 0,
        responseEfficiency: Math.max(0, 100 - (avgResponseTime * 5)),
        studentSupport: (avgStudentProgress / 100) * 100
      }
    });
    
  } catch (err) {
    console.error("Get supervisor stats error:", err);
    res.status(500).json({ 
      error: "Failed to fetch supervisor statistics", 
      details: err.message 
    });
  }
};

// Get logbooks pending review
export const getPendingLogbooks = async (req, res) => {
  try {
    const supervisorId = req.user.id;
    
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    // Get assigned student IDs
    const assignedStudents = await Student.findAll({
      where: { assignedSupervisor: supervisorId },
      attributes: ['id']
    });
    
    const studentIds = assignedStudents.map(student => student.id);
    
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
        attributes: ['id', 'fullName', 'matricNumber', 'email', 'department', 'companyName']
      }],
      order: [['createdAt', 'ASC']], // Oldest first
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

// Update supervisor profile
export const updateInstitutionSupervisor = async (req, res) => {
  try {
    const supervisorId = req.user.id;
    const { fullName, department, phone, profileImage } = req.body;
    
    const supervisor = await InstitutionSupervisor.findByPk(supervisorId);
    if (!supervisor) {
      return res.status(404).json({ error: "Supervisor not found" });
    }
    
    // Update fields
    if (fullName) supervisor.fullName = fullName;
    if (department) supervisor.department = department;
    if (phone !== undefined) supervisor.phone = phone;
    if (profileImage !== undefined) supervisor.profileImage = profileImage;
    
    await supervisor.save();
    
    // Remove password from response
    const supervisorResponse = supervisor.toJSON();
    delete supervisorResponse.password;
    
    res.json({
      message: "Supervisor profile updated successfully",
      supervisor: supervisorResponse
    });
    
  } catch (err) {
    console.error("Update institution supervisor error:", err);
    res.status(500).json({ 
      error: "Failed to update supervisor profile", 
      details: err.message 
    });
  }
};

// Change supervisor password
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
    
    const supervisor = await InstitutionSupervisor.findByPk(supervisorId);
    if (!supervisor) {
      return res.status(404).json({ error: "Supervisor not found" });
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

// Delete institution supervisor (Admin only)
export const deleteInstitutionSupervisor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const supervisor = await InstitutionSupervisor.findByPk(id);
    if (!supervisor) {
      return res.status(404).json({ error: "Institution Supervisor not found" });
    }
    
    // Check if supervisor has assigned students
    const assignedStudents = await Student.count({
      where: { assignedSupervisor: id }
    });
    
    if (assignedStudents > 0) {
      return res.status(400).json({
        error: "Cannot delete supervisor with assigned students",
        assignedStudents
      });
    }
    
    await supervisor.destroy();
    
    res.json({
      message: "Institution Supervisor deleted successfully"
    });
    
  } catch (err) {
    console.error("Delete institution supervisor error:", err);
    res.status(500).json({ 
      error: "Failed to delete institution supervisor", 
      details: err.message 
    });
  }
};

export default {
  createInstitutionSupervisor,
  getInstitutionSupervisors,
  getInstitutionSupervisorById,
  getSupervisorDashboard,
  getAssignedStudents,
  getSupervisorStats,
  getPendingLogbooks,
  updateInstitutionSupervisor,
  changePassword,
  deleteInstitutionSupervisor
};