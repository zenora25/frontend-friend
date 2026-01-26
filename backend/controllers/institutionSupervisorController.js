// controllers/institutionSupervisorController.js
import InstitutionSupervisor from "../models/institutionSupervisor.js";
import Student from "../models/student.js";
import Logbook from "../models/logbook.js";
import { Op } from "sequelize";

// ============================================
// CREATE INSTITUTION SUPERVISOR (Admin/Coordinator)
// ============================================
export const createInstitutionSupervisor = async (req, res) => {
  try {
    console.log("🆕 Creating institution supervisor...");
    const { fullName, email, department, password, phone } = req.body;

    // Validate required fields
    if (!fullName || !email || !department || !password) {
      console.error(" Missing required fields");
      return res.status(400).json({
        success: false,
        error: "All fields (fullName, email, department, password) are required"
      });
    }

    // Check if email already exists
    console.log(` Checking if email ${email} exists...`);
    const existingSupervisor = await InstitutionSupervisor.findOne({ where: { email } });
    if (existingSupervisor) {
      console.error(` Email ${email} already exists`);
      return res.status(400).json({
        success: false,
        error: "Supervisor with this email already exists"
      });
    }

    console.log(` Creating supervisor for ${fullName} in ${department}`);
    const supervisor = await InstitutionSupervisor.create({
      fullName,
      email,
      department,
      password,
      phone: phone || null
    });

    // Remove password from response
    const supervisorResponse = supervisor.toJSON();
    delete supervisorResponse.password;

    console.log(` Supervisor created successfully with ID: ${supervisor.id}`);
    res.status(201).json({
      success: true,
      message: "Institution Supervisor created successfully",
      supervisor: supervisorResponse
    });
  } catch (err) {
    console.error(" Create institution supervisor error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to create institution supervisor",
      details: err.message,
      code: err.name
    });
  }
};

// ============================================
// GET ALL INSTITUTION SUPERVISORS
// ============================================
export const getInstitutionSupervisors = async (req, res) => {
  try {
    console.log(" Getting institution supervisors...");
    const { department, page = 1, limit = 20, search } = req.query;

    console.log("Query parameters:", { department, page, limit, search });

    const where = {};
    if (department && department !== 'all' && department !== 'undefined') {
      where.department = department;
      console.log(` Filtering by department: ${department}`);
    }

    if (search && search.trim() !== '') {
      const searchTerm = `%${search}%`;
      where[Op.or] = [
        { fullName: { [Op.like]: searchTerm } },
        { email: { [Op.like]: searchTerm } },
        { department: { [Op.like]: searchTerm } }
      ];
      console.log(` Searching for: ${search}`);
    }

    const offset = (page - 1) * limit;
    console.log(` Pagination: page ${page}, limit ${limit}, offset ${offset}`);

    const { count, rows: supervisors } = await InstitutionSupervisor.findAndCountAll({
      where,
      attributes: ['id', 'fullName', 'email', 'department'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0
    });


    console.log(` Found ${count} supervisors, returning ${supervisors.length}`);

    res.json({
      success: true,
      supervisors,
      pagination: {
        total: count,
        page: parseInt(page) || 1,
        pages: Math.ceil(count / (parseInt(limit) || 20)),
        limit: parseInt(limit) || 20
      }
    });
  } catch (err) {
    console.error(" Get institution supervisors error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch institution supervisors",
      details: err.message
    });
  }
};

// ============================================
// GET INSTITUTION SUPERVISOR BY ID
// ============================================
export const getInstitutionSupervisorById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(` Getting institution supervisor with ID: ${id}`);

    const supervisor = await InstitutionSupervisor.findByPk(id, {
      attributes: ['id', 'fullName', 'email', 'department']
    });

    if (!supervisor) {
      console.error(` Supervisor with ID ${id} not found`);
      return res.status(404).json({
        success: false,
        error: "Institution Supervisor not found"
      });
    }

    // Get assigned students separately
    const assignedStudents = await Student.findAll({
      where: { assignedSupervisor: id },
      attributes: ['id', 'fullName', 'matricNumber', 'email', 'department', 'companyName', 'progress', 'status']
    });

    const supervisorData = supervisor.toJSON();
    supervisorData.assignedStudents = assignedStudents;

    console.log(`Found supervisor: ${supervisor.fullName}`);
    res.json({
      success: true,
      supervisor: supervisorData
    });
  } catch (err) {
    console.error(" Get institution supervisor by ID error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch institution supervisor",
      details: err.message
    });
  }
};

// ============================================
// GET SUPERVISOR DASHBOARD (FIXED - NO ASSOCIATIONS)
// ============================================
// ============================================
// GET SUPERVISOR DASHBOARD (DEBUG VERSION)
// ============================================
export const getSupervisorDashboard = async (req, res) => {
  try {
    console.log(" === GET SUPERVISOR DASHBOARD STARTED ===");

    if (!req.user || !req.user.id) {
      console.error(" No user in request");
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const supervisorId = req.user.id;
    console.log(` Supervisor ID: ${supervisorId}`);

    // LOGIC STEP 1: Get Supervisor
    let supervisor;
    try {
      supervisor = await InstitutionSupervisor.findByPk(supervisorId, {
        attributes: ['id', 'fullName', 'email', 'department']
      });
      if (!supervisor) {
        console.error(` Supervisor ${supervisorId} not found`);
        return res.status(404).json({ success: false, error: "Supervisor not found" });
      }
      console.log(` Supervisor found: ${supervisor.fullName}`);
    } catch (e) {
      console.error(" Error fetching supervisor:", e);
      throw e;
    }

    // LOGIC STEP 2: Get Assigned Students
    let assignedStudents = [];
    try {
      assignedStudents = await Student.findAll({
        where: { assignedSupervisor: supervisorId },
        attributes: ['id', 'fullName', 'matricNumber', 'email', 'department', 'companyName', 'progress', 'status', 'companyAddress', 'createdAt', 'updatedAt'],
        order: [['createdAt', 'DESC']]
      });
      console.log(`📊 Found ${assignedStudents.length} assigned students`);
    } catch (e) {
      console.error(" Error fetching students:", e);
      throw e;
    }

    // LOGIC STEP 3: Get Logbooks
    let allLogbooks = [];
    let pendingLogbooks = [];
    const studentIds = assignedStudents.map(student => student.id);

    if (studentIds.length > 0) {
      try {
        allLogbooks = await Logbook.findAll({
          where: { studentId: studentIds },
          attributes: ['id', 'weekNumber', 'title', 'status', 'createdAt', 'updatedAt', 'studentId'],
          order: [['createdAt', 'DESC']],
          limit: 100
        });

        pendingLogbooks = await Logbook.findAll({
          where: {
            studentId: studentIds,
            status: "PENDING"
          },
          attributes: ['id', 'weekNumber', 'title', 'status', 'createdAt', 'studentId'],
          order: [['createdAt', 'DESC']],
          limit: 10
        });
        console.log(` Found ${allLogbooks.length} total logbooks and ${pendingLogbooks.length} pending logbooks`);
      } catch (e) {
        console.error(" Error fetching logbooks:", e);
        throw e;
      }
    }

    // LOGIC STEP 4: Calculate Stats
    // Basic counts
    const totalStudents = assignedStudents.length;
    const activeStudents = assignedStudents.filter(s => s.status === "ACTIVE" || !s.status).length;
    const completedStudents = assignedStudents.filter(s => s.status === "COMPLETED").length;

    const totalLogbooks = allLogbooks.length;
    const pendingLogbooksCount = allLogbooks.filter(l => l.status === "PENDING").length;
    const approvedLogbooks = allLogbooks.filter(l => l.status === "APPROVED").length;
    const revisionLogbooks = allLogbooks.filter(l => l.status === "REVISION").length;

    // Response time
    let avgResponseTime = 0;
    try {
      const approvedLogbooksWithTime = allLogbooks.filter(l => l.status === "APPROVED" && l.createdAt && l.updatedAt);
      if (approvedLogbooksWithTime.length > 0) {
        const totalResponseTime = approvedLogbooksWithTime.reduce((sum, logbook) => {
          const submissionTime = new Date(logbook.createdAt);
          const approvalTime = new Date(logbook.updatedAt);
          const diffTime = Math.abs(approvalTime - submissionTime);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return sum + diffDays;
        }, 0);
        avgResponseTime = totalResponseTime / approvedLogbooksWithTime.length;
      }
    } catch (e) {
      console.error(" Error calculating response time:", e);
    }

    // LOGIC STEP 5: Prepare Student Progress
    let studentProgress = [];
    try {
      studentProgress = await Promise.all(
        assignedStudents.map(async (student) => {
          const studentLogbooks = allLogbooks.filter(l => l.studentId === student.id);
          const recentLogbook = studentLogbooks[0];

          return {
            id: student.id,
            name: student.fullName,
            matricNumber: student.matricNumber,
            company: student.companyName || 'Not assigned',
            progress: student.progress || 0,
            status: student.status || "ACTIVE",
            lastActivity: recentLogbook ?
              new Date(recentLogbook.createdAt).toLocaleDateString() :
              new Date(student.updatedAt).toLocaleDateString(),
            pendingLogbooks: studentLogbooks.filter(l => l.status === "PENDING").length,
            totalLogbooks: studentLogbooks.length
          };
        })
      );
    } catch (e) {
      console.error(" Error logging student progress:", e);
    }

    // LOGIC STEP 6: Prepare Recent Submissions
    let recentLogbookSubmissions = [];
    try {
      // Fetch student info manually to avoid association issues if any
      recentLogbookSubmissions = await Promise.all(pendingLogbooks.map(async (logbook) => {
        const student = await Student.findByPk(logbook.studentId);
        return {
          id: logbook.id,
          studentId: logbook.studentId,
          studentName: student ? student.fullName : 'Unknown',
          studentMatric: student ? student.matricNumber : 'N/A',
          weekNumber: logbook.weekNumber,
          title: logbook.title,
          submittedAt: new Date(logbook.createdAt).toLocaleString(),
          status: logbook.status,
          daysPending: Math.floor((new Date() - new Date(logbook.createdAt)) / (1000 * 60 * 60 * 24))
        };
      }));
    } catch (e) {
      console.error(" Error preparing recent submissions:", e);
    }

    // Final calculations
    const responseEfficiency = Math.max(0, Math.min(100, 100 - (avgResponseTime * 10)));
    const reviewCompleteness = totalLogbooks > 0
      ? Math.round(((approvedLogbooks + revisionLogbooks) / totalLogbooks) * 100)
      : 0;
    const engagementLevel = totalStudents > 0
      ? Math.round((activeStudents / totalStudents) * 100)
      : 0;

    console.log(" Dashboard data prepared successfully");

    res.json({
      success: true,
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
        pendingLogbooks: pendingLogbooksCount,
        approvedLogbooks,
        revisionLogbooks,
        approvalRate: totalLogbooks > 0 ? Math.round((approvedLogbooks / totalLogbooks) * 100) : 0,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        completionRate: totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0,
        recentSubmissions: recentLogbookSubmissions.length
      },
      studentProgress,
      recentLogbookSubmissions,
      performanceMetrics: {
        responseEfficiency,
        reviewCompleteness,
        studentSatisfaction: totalLogbooks > 0 ? Math.round(90 - (avgResponseTime * 2)) : 0,
        engagementLevel,
        overallScore: Math.round((responseEfficiency + reviewCompleteness + engagementLevel) / 3)
      },
      quickActions: {
        pendingReviews: pendingLogbooksCount,
        studentsNeedingAttention: studentProgress.filter(s => s.progress < 50 || s.pendingLogbooks > 2).length,
        upcomingDeadlines: 0
      }
    });

  } catch (err) {
    console.error(" TOP LEVEL Get supervisor dashboard error:", err);
    console.error("Stack:", err.stack);

    res.status(500).json({
      success: false,
      error: "Failed to fetch supervisor dashboard",
      details: err.message
    });
  }
};

// ============================================
// GET SUPERVISOR'S ASSIGNED STUDENTS (FIXED)
// ============================================
export const getAssignedStudents = async (req, res) => {
  try {
    const supervisorId = req.user.id;
    console.log(` Getting assigned students for supervisor: ${supervisorId}`);

    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    const where = { assignedSupervisor: supervisorId };

    if (status && status !== 'all' && status !== 'undefined') {
      where.status = status;
      console.log(` Filtering by status: ${status}`);
    }

    if (search && search.trim() !== '') {
      const searchTerm = `%${search}%`;
      where[Op.or] = [
        { fullName: { [Op.like]: searchTerm } },
        { matricNumber: { [Op.like]: searchTerm } },
        { email: { [Op.like]: searchTerm } },
        { companyName: { [Op.like]: searchTerm } }
      ];
      console.log(`🔍 Searching for: ${search}`);
    }

    console.log(` Pagination: page ${page}, limit ${limit}, offset ${offset}`);

    const { count, rows: students } = await Student.findAndCountAll({
      where,
      attributes: ['id', 'fullName', 'matricNumber', 'email', 'department', 'companyName', 'progress', 'status'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0
    });


    // Get logbooks for each student separately
    const studentsWithLogbooks = await Promise.all(
      students.map(async (student) => {
        const logbooks = await Logbook.findAll({
          where: { studentId: student.id },
          attributes: ['id', 'weekNumber', 'title', 'status', 'createdAt'],
          limit: 5,
          order: [['weekNumber', 'DESC']]
        });

        // Get supervisor info
        const supervisor = await InstitutionSupervisor.findByPk(student.assignedSupervisor, {
          attributes: ['id', 'fullName', 'email']
        });

        const studentData = student.toJSON();
        studentData.Logbooks = logbooks;
        studentData.Supervisor = supervisor;

        return studentData;
      })
    );

    console.log(` Found ${count} students, returning ${studentsWithLogbooks.length}`);

    res.json({
      success: true,
      students: studentsWithLogbooks,
      pagination: {
        total: count,
        page: parseInt(page) || 1,
        pages: Math.ceil(count / (parseInt(limit) || 20)),
        limit: parseInt(limit) || 20
      },
      filters: {
        status: status || 'all',
        search: search || ''
      }
    });

  } catch (err) {
    console.error(" Get assigned students error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch assigned students",
      details: err.message
    });
  }
};

// ============================================
// GET SUPERVISOR PERFORMANCE STATS (FIXED)
// ============================================
export const getSupervisorStats = async (req, res) => {
  try {
    const supervisorId = req.user.id;
    console.log(` Getting performance stats for supervisor: ${supervisorId}`);

    // Get supervisor details
    const supervisor = await InstitutionSupervisor.findByPk(supervisorId, {
      attributes: ['id', 'fullName', 'email', 'department']
    });

    if (!supervisor) {
      console.error(` Supervisor ${supervisorId} not found`);
      return res.status(404).json({
        success: false,
        error: "Supervisor not found"
      });
    }

    // Get assigned students
    const assignedStudents = await Student.findAll({
      where: { assignedSupervisor: supervisorId },
      attributes: ['id', 'fullName', 'progress', 'status']
    });

    const studentIds = assignedStudents.map(student => student.id);

    // Get all logbooks for assigned students
    const allLogbooks = studentIds.length > 0 ? await Logbook.findAll({
      where: { studentId: studentIds },
      attributes: ['id', 'status', 'createdAt', 'updatedAt']
    }) : [];

    // Calculate statistics
    const totalLogbooks = allLogbooks.length;
    const pendingLogbooks = allLogbooks.filter(logbook =>
      logbook.status === "PENDING"
    ).length;
    const approvedLogbooks = allLogbooks.filter(logbook =>
      logbook.status === "APPROVED"
    ).length;
    const revisionLogbooks = allLogbooks.filter(logbook =>
      logbook.status === "REVISION"
    ).length;

    // Calculate response time
    let avgResponseTime = 0;
    let minResponseTime = 0;
    let maxResponseTime = 0;

    const approvedLogbooksWithTime = allLogbooks.filter(logbook =>
      logbook.status === "APPROVED" && logbook.createdAt && logbook.updatedAt
    );

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
      ? Math.round(assignedStudents.reduce((sum, student) =>
        sum + (student.progress || 0), 0) / assignedStudents.length)
      : 0;

    const studentsOnTrack = assignedStudents.filter(student =>
      (student.progress || 0) >= 70
    ).length;

    const studentsBehind = assignedStudents.filter(student =>
      (student.progress || 0) < 50
    ).length;

    console.log(` Performance stats calculated for ${supervisor.fullName}`);

    res.json({
      success: true,
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
        approvalRate: totalLogbooks > 0 ?
          Math.round((approvedLogbooks / totalLogbooks) * 100) : 0,
        reviewRate: totalLogbooks > 0 ?
          Math.round(((approvedLogbooks + revisionLogbooks) / totalLogbooks) * 100) : 0
      },
      responseTime: {
        average: Math.round(avgResponseTime * 10) / 10,
        minimum: Math.round(minResponseTime * 10) / 10,
        maximum: Math.round(maxResponseTime * 10) / 10,
        recentApprovals,
        pendingFromLastWeek,
        efficiency: Math.max(0, Math.min(100, 100 - (avgResponseTime * 5)))
      },
      studentProgress: {
        average: avgStudentProgress,
        totalStudents: assignedStudents.length,
        onTrack: studentsOnTrack,
        behind: studentsBehind,
        onTrackPercentage: assignedStudents.length > 0 ?
          Math.round((studentsOnTrack / assignedStudents.length) * 100) : 0
      },
      performanceScore: {
        overall: Math.min(100,
          (totalLogbooks > 0 ? ((approvedLogbooks + revisionLogbooks) / totalLogbooks) * 40 : 0) + // Review completion
          Math.max(0, 100 - (avgResponseTime * 5)) * 0.3 + // Response time (max 30 points)
          (avgStudentProgress / 100) * 30 // Student progress (max 30 points)
        ),
        reviewEfficiency: totalLogbooks > 0 ?
          Math.round(((approvedLogbooks + revisionLogbooks) / totalLogbooks) * 100) : 0,
        responseEfficiency: Math.max(0, 100 - (avgResponseTime * 5)),
        studentSupport: (avgStudentProgress / 100) * 100
      },
      timeline: {
        lastWeek: {
          approvals: recentApprovals,
          newSubmissions: pendingFromLastWeek
        },
        currentMonth: {
          approvals: allLogbooks.filter(logbook =>
            logbook.status === "APPROVED" &&
            new Date(logbook.updatedAt).getMonth() === today.getMonth()
          ).length
        }
      }
    });

  } catch (err) {
    console.error(" Get supervisor stats error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch supervisor statistics",
      details: err.message
    });
  }
};

// ============================================
// GET LOGBOOKS PENDING REVIEW (FIXED)
// ============================================
export const getPendingLogbooks = async (req, res) => {
  try {
    const supervisorId = req.user.id;
    console.log(` Getting pending logbooks for supervisor: ${supervisorId}`);

    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get assigned student IDs
    const assignedStudents = await Student.findAll({
      where: { assignedSupervisor: supervisorId },
      attributes: ['id']
    });

    const studentIds = assignedStudents.map(student => student.id);
    console.log(` Found ${studentIds.length} student IDs`);

    if (studentIds.length === 0) {
      console.log(" No assigned students found");
      return res.json({
        success: true,
        logbooks: [],
        pagination: {
          total: 0,
          page: parseInt(page) || 1,
          pages: 0,
          limit: parseInt(limit) || 20
        }
      });
    }

    const { count, rows: logbooks } = await Logbook.findAndCountAll({
      where: {
        studentId: studentIds,
        status: "PENDING"
      },
      order: [['createdAt', 'ASC']], // Oldest first
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0
    });

    // Get student info for each logbook
    const logbooksWithStudents = await Promise.all(
      logbooks.map(async (logbook) => {
        const student = await Student.findByPk(logbook.studentId, {
          attributes: ['id', 'fullName', 'matricNumber', 'email', 'department', 'companyName']
        });

        return {
          ...logbook.toJSON(),
          student: student || null
        };
      })
    );

    console.log(` Found ${count} pending logbooks`);

    // Calculate summary
    const summary = logbooksWithStudents.reduce((acc, logbook) => {
      const studentName = logbook.student?.fullName || 'Unknown';
      acc[studentName] = (acc[studentName] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      logbooks: logbooksWithStudents,
      pagination: {
        total: count,
        page: parseInt(page) || 1,
        pages: Math.ceil(count / (parseInt(limit) || 20)),
        limit: parseInt(limit) || 20
      },
      summary: {
        totalPending: count,
        byStudent: summary
      }
    });

  } catch (err) {
    console.error(" Get pending logbooks error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch pending logbooks",
      details: err.message
    });
  }
};

// ============================================
// UPDATE SUPERVISOR PROFILE
// ============================================
export const updateInstitutionSupervisor = async (req, res) => {
  try {
    const supervisorId = req.user.id;
    console.log(` Updating profile for supervisor: ${supervisorId}`);

    const { fullName, department, phone, profileImage } = req.body;
    console.log("Update data:", { fullName, department, phone, profileImage: profileImage ? 'provided' : 'not provided' });

    const supervisor = await InstitutionSupervisor.findByPk(supervisorId);
    if (!supervisor) {
      console.error(` Supervisor ${supervisorId} not found`);
      return res.status(404).json({
        success: false,
        error: "Supervisor not found"
      });
    }

    // Update fields
    const updates = {};
    if (fullName && fullName !== supervisor.fullName) {
      updates.fullName = fullName;
    }
    if (department && department !== supervisor.department) {
      updates.department = department;
    }
    if (phone !== undefined && phone !== supervisor.phone) {
      updates.phone = phone;
    }
    if (profileImage !== undefined && profileImage !== supervisor.profileImage) {
      updates.profileImage = profileImage;
    }

    // Check if any updates were provided
    if (Object.keys(updates).length === 0) {
      console.log(" No updates provided");
      const supervisorResponse = supervisor.toJSON();
      delete supervisorResponse.password;

      return res.json({
        success: true,
        message: "No changes detected",
        supervisor: supervisorResponse
      });
    }

    // Apply updates
    Object.assign(supervisor, updates);
    await supervisor.save();

    // Remove password from response
    const supervisorResponse = supervisor.toJSON();
    delete supervisorResponse.password;

    console.log(` Profile updated successfully for ${supervisor.fullName}`);
    res.json({
      success: true,
      message: "Supervisor profile updated successfully",
      supervisor: supervisorResponse,
      updates: Object.keys(updates)
    });

  } catch (err) {
    console.error(" Update institution supervisor error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update supervisor profile",
      details: err.message
    });
  }
};

// ============================================
// CHANGE SUPERVISOR PASSWORD
// ============================================
export const changePassword = async (req, res) => {
  try {
    const supervisorId = req.user.id;
    console.log(` Changing password for supervisor: ${supervisorId}`);

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      console.error(" Missing password fields");
      return res.status(400).json({
        success: false,
        error: "Current password and new password are required"
      });
    }

    if (newPassword.length < 6) {
      console.error(" New password too short");
      return res.status(400).json({
        success: false,
        error: "New password must be at least 6 characters long"
      });
    }

    const supervisor = await InstitutionSupervisor.findByPk(supervisorId);
    if (!supervisor) {
      console.error(` Supervisor ${supervisorId} not found`);
      return res.status(404).json({
        success: false,
        error: "Supervisor not found"
      });
    }

    // Verify current password
    console.log(" Verifying current password...");
    const isValidPassword = await supervisor.comparePassword(currentPassword);
    if (!isValidPassword) {
      console.error(" Current password is incorrect");
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect"
      });
    }

    // Update password
    console.log(" Current password verified, updating to new password...");
    supervisor.password = newPassword;
    await supervisor.save();

    console.log(" Password changed successfully");
    res.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (err) {
    console.error(" Change password error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to change password",
      details: err.message
    });
  }
};

// ============================================
// DELETE INSTITUTION SUPERVISOR (Admin only)
// ============================================
export const deleteInstitutionSupervisor = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(` Deleting institution supervisor with ID: ${id}`);

    const supervisor = await InstitutionSupervisor.findByPk(id);
    if (!supervisor) {
      console.error(` Supervisor ${id} not found`);
      return res.status(404).json({
        success: false,
        error: "Institution Supervisor not found"
      });
    }

    // Check if supervisor has assigned students
    const assignedStudents = await Student.count({
      where: { assignedSupervisor: id }
    });

    if (assignedStudents > 0) {
      console.error(` Supervisor has ${assignedStudents} assigned students`);
      return res.status(400).json({
        success: false,
        error: "Cannot delete supervisor with assigned students",
        assignedStudents,
        suggestion: "Reassign students to another supervisor before deletion"
      });
    }

    // Record supervisor info before deletion
    const supervisorInfo = {
      id: supervisor.id,
      name: supervisor.fullName,
      email: supervisor.email,
      department: supervisor.department
    };

    await supervisor.destroy();

    console.log(` Supervisor deleted: ${supervisorInfo.name}`);
    res.json({
      success: true,
      message: "Institution Supervisor deleted successfully",
      deletedSupervisor: supervisorInfo,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error(" Delete institution supervisor error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete institution supervisor",
      details: err.message
    });
  }
};

// ============================================
// TEST AUTH ENDPOINT (For debugging)
// ============================================
export const testAuth = async (req, res) => {
  try {
    console.log(" Test Auth Endpoint");
    console.log("Request user:", req.user);

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: "No user in request"
      });
    }

    // Get supervisor from database
    const supervisor = await InstitutionSupervisor.findByPk(req.user.id, {
      attributes: ['id', 'fullName', 'email', 'department', 'phone', 'profileImage']
    });

    if (!supervisor) {
      return res.status(404).json({
        success: false,
        error: "Supervisor not found in database"
      });
    }

    // Count assigned students
    const assignedStudentsCount = await Student.count({
      where: { assignedSupervisor: supervisor.id }
    });

    res.json({
      success: true,
      message: "Authentication test successful",
      user: req.user,
      supervisor: supervisor,
      stats: {
        assignedStudents: assignedStudentsCount
      },
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error(" Test auth error:", err);
    res.status(500).json({
      success: false,
      error: "Test endpoint failed",
      details: err.message
    });
  }
};

// ============================================
// SIMPLE DASHBOARD TEST (Alternative endpoint)
// ============================================
export const getSimpleDashboard = async (req, res) => {
  try {
    console.log(" Simple Dashboard Test");

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: "Authentication required"
      });
    }

    const supervisorId = req.user.id;

    // Get supervisor
    const supervisor = await InstitutionSupervisor.findByPk(supervisorId, {
      attributes: ['id', 'fullName', 'email', 'department']
    });

    if (!supervisor) {
      return res.status(404).json({
        success: false,
        error: "Supervisor not found"
      });
    }

    // Count assigned students
    const studentCount = await Student.count({
      where: { assignedSupervisor: supervisorId }
    });

    // Count logbooks
    const logbookCount = await Logbook.count();

    res.json({
      success: true,
      message: "Simple dashboard loaded",
      supervisor: supervisor,
      stats: {
        assignedStudents: studentCount,
        totalLogbooks: logbookCount
      }
    });

  } catch (err) {
    console.error(" Simple dashboard error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to load simple dashboard",
      details: err.message
    });
  }
};

// ============================================
// DATABASE TEST ENDPOINT
// ============================================
export const testDatabase = async (req, res) => {
  try {
    console.log(" Database Test Endpoint");

    // Test 1: Supervisor count
    const supervisorCount = await InstitutionSupervisor.count();

    // Test 2: Student count
    const studentCount = await Student.count();

    // Test 3: Logbook count
    const logbookCount = await Logbook.count();

    // Test 4: Current supervisor
    const currentSupervisor = await InstitutionSupervisor.findByPk(req.user.id, {
      attributes: ['id', 'fullName', 'email', 'department']
    });

    // Test 5: Assigned students count
    const assignedStudentsCount = await Student.count({
      where: { assignedSupervisor: req.user.id }
    });

    res.json({
      success: true,
      message: "Database test completed",
      results: {
        supervisorCount,
        studentCount,
        logbookCount,
        currentSupervisor: currentSupervisor ? {
          id: currentSupervisor.id,
          name: currentSupervisor.fullName
        } : null,
        assignedStudentsCount
      }
    });

  } catch (err) {
    console.error(" Database test error:", err);
    res.status(500).json({
      success: false,
      error: "Database test failed",
      details: err.message
    });
  }
};

// ============================================
// EXPORT ALL FUNCTIONS
// ============================================
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
  deleteInstitutionSupervisor,
  testAuth,
  getSimpleDashboard,
  testDatabase
};