import HOD from "../models/hod.js";
import Student from "../models/student.js";
import InstitutionSupervisor from "../models/institutionSupervisor.js";
import Logbook from "../models/Logbook.js";
import Defense from "../models/Defense.js";
import Assignment from "../models/Assignment.js";
import IndustrySupervisor from "../models/industrySupervisor.js"; // Add this
import { Op } from "sequelize";

// Add this at the top after imports
import sequelize from "../config/db.js";
const { Sequelize } = sequelize;

// Create HOD (Admin/Coordinator)
export const createHod = async (req, res) => {
    try {
        const { fullName, email, department, password } = req.body;

        if (!fullName || !email || !department || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if email already exists
        const existingHod = await HOD.findOne({ where: { email } });
        if (existingHod) {
            return res.status(400).json({ error: "HOD with this email already exists" });
        }

        const hod = await HOD.create({ fullName, email, department, password });

        // Remove password from response
        const hodResponse = hod.toJSON();
        delete hodResponse.password;

        res.status(201).json({
            message: "HOD created successfully",
            hod: hodResponse
        });
    } catch (err) {
        console.error("Create HOD error:", err);
        res.status(500).json({
            error: "Failed to create HOD",
            details: err.message
        });
    }
};

// Get all HODs
export const getHods = async (req, res) => {
    try {
        const hods = await HOD.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        res.json(hods);
    } catch (err) {
        console.error("Get HODs error:", err);
        res.status(500).json({
            error: "Failed to fetch HODs",
            details: err.message
        });
    }
};

// Get HOD by ID
export const getHodById = async (req, res) => {
    try {
        const { id } = req.params;

        const hod = await HOD.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        if (!hod) {
            return res.status(404).json({ error: "HOD not found" });
        }

        res.json(hod);
    } catch (err) {
        console.error("Get HOD by ID error:", err);
        res.status(500).json({
            error: "Failed to fetch HOD",
            details: err.message
        });
    }
};

// Get HOD dashboard
export const getHODDashboard = async (req, res) => {
    try {
        const hodId = req.user.id;

        const hod = await HOD.findByPk(hodId, {
            attributes: { exclude: ['password'] }
        });

        if (!hod) {
            return res.status(404).json({ error: "HOD not found" });
        }

        // Department statistics
        const totalStudents = await Student.count({
            where: { department: hod.department }
        });

        const activeStudents = await Student.count({
            where: {
                department: hod.department,
                status: "ACTIVE"
            }
        });

        const completedStudents = await Student.count({
            where: {
                department: hod.department,
                status: "COMPLETED"
            }
        });

        const institutionSupervisors = await InstitutionSupervisor.count({
            where: { department: hod.department }
        });

        // Logbook statistics
        const departmentStudents = await Student.findAll({
            where: { department: hod.department },
            attributes: ['id']
        });

        const studentIds = departmentStudents.map(student => student.id);

        const totalLogbooks = await Logbook.count({
            where: { studentId: studentIds }
        });

        const pendingLogbooks = await Logbook.count({
            where: {
                studentId: studentIds,
                status: "PENDING"
            }
        });

        const approvedLogbooks = await Logbook.count({
            where: {
                studentId: studentIds,
                status: "APPROVED"
            }
        });

        // Defense statistics
        const totalDefenses = await Defense.count({
            include: [{
                model: Student,
                where: { department: hod.department }
            }]
        });

        const scheduledDefenses = await Defense.count({
            where: { status: "SCHEDULED" },
            include: [{
                model: Student,
                where: { department: hod.department }
            }]
        });

        // Student progress average
        const avgProgressResult = await Student.findOne({
            where: { department: hod.department },
            attributes: [
                [Sequelize.fn('AVG', Sequelize.col('progress')), 'avgProgress']
            ]
        });

        const avgProgress = avgProgressResult?.dataValues?.avgProgress || 0;

        // Recent activities (logbooks and defenses)
        const recentLogbooks = await Logbook.findAll({
            include: [{
                model: Student,
                where: { department: hod.department },
                attributes: ['fullName', 'matricNumber']
            }],
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        const upcomingDefenses = await Defense.findAll({
            where: {
                status: "SCHEDULED",
                defenseDate: { [Op.gte]: new Date() }
            },
            include: [{
                model: Student,
                where: { department: hod.department },
                attributes: ['fullName', 'matricNumber', 'department']
            }],
            order: [['defenseDate', 'ASC']],
            limit: 5
        });

        // Supervisor performance
        const supervisors = await InstitutionSupervisor.findAll({
            where: { department: hod.department },
            include: [{
                model: Student,
                as: "AssignedStudents",
                include: [Logbook]
            }]
        });

        const supervisorPerformance = supervisors.map(supervisor => {
            const assignedStudents = supervisor.AssignedStudents || [];
            const studentIds = assignedStudents.map(student => student.id);

            const totalStudentLogbooks = assignedStudents.flatMap(student => student.Logbooks || []);
            const reviewedLogbooks = totalStudentLogbooks.filter(logbook =>
                logbook.status === "APPROVED" || logbook.status === "REVISION"
            );
            const pendingLogbooks = totalStudentLogbooks.filter(logbook =>
                logbook.status === "PENDING"
            );

            const reviewRate = totalStudentLogbooks.length > 0
                ? Math.round((reviewedLogbooks.length / totalStudentLogbooks.length) * 100)
                : 0;

            return {
                id: supervisor.id,
                name: supervisor.fullName,
                email: supervisor.email,
                studentsAssigned: assignedStudents.length,
                logbooksReviewed: reviewedLogbooks.length,
                logbooksPending: pendingLogbooks.length,
                reviewRate: reviewRate
            };
        });

        res.json({
            hod: {
                id: hod.id,
                fullName: hod.fullName,
                email: hod.email,
                department: hod.department
            },
            stats: {
                totalStudents,
                activeStudents,
                completedStudents,
                institutionSupervisors,
                totalLogbooks,
                pendingLogbooks,
                approvedLogbooks,
                totalDefenses,
                scheduledDefenses,
                avgProgress: Math.round(avgProgress),
                completionRate: totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0,
                approvalRate: totalLogbooks > 0 ? Math.round((approvedLogbooks / totalLogbooks) * 100) : 0
            },
            recentActivities: {
                logbooks: recentLogbooks.map(logbook => ({
                    id: logbook.id,
                    studentName: logbook.Student.fullName,
                    studentMatric: logbook.Student.matricNumber,
                    weekNumber: logbook.weekNumber,
                    title: logbook.title,
                    status: logbook.status,
                    submittedAt: logbook.createdAt
                })),
                upcomingDefenses: upcomingDefenses.map(defense => ({
                    id: defense.id,
                    studentName: defense.Student.fullName,
                    studentMatric: defense.Student.matricNumber,
                    defenseDate: defense.defenseDate,
                    defenseTime: defense.defenseTime,
                    venue: defense.venue
                }))
            },
            supervisorPerformance,
            departmentProgress: {
                current: avgProgress,
                target: 100,
                remaining: 100 - avgProgress
            }
        });

    } catch (err) {
        console.error("Get HOD dashboard error:", err);
        res.status(500).json({
            error: "Failed to fetch HOD dashboard",
            details: err.message
        });
    }
};

// Get department defenses
export const getDepartmentDefenses = async (req, res) => {
    try {
        const hodId = req.user.id;

        const hod = await HOD.findByPk(hodId);
        if (!hod) {
            return res.status(404).json({ error: "HOD not found" });
        }

        const { status, page = 1, limit = 20 } = req.query;

        const where = {};
        if (status) {
            where.status = status;
        }

        const offset = (page - 1) * limit;

        const { count, rows: defenses } = await Defense.findAndCountAll({
            where,
            include: [{
                model: Student,
                where: { department: hod.department },
                attributes: ['id', 'fullName', 'matricNumber', 'email', 'department', 'progress']
            }],
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
            },
            department: hod.department
        });

    } catch (err) {
        console.error("Get department defenses error:", err);
        res.status(500).json({
            error: "Failed to fetch department defenses",
            details: err.message
        });
    }
};

// Get department assignments
export const getDepartmentalAssignments = async (req, res) => {
    try {
        const hodId = req.user.id;

        const hod = await HOD.findByPk(hodId);
        if (!hod) {
            return res.status(404).json({ error: "HOD not found" });
        }

        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows: assignments } = await Assignment.findAndCountAll({
            include: [
                {
                    model: Student,
                    where: { department: hod.department },
                    attributes: ['id', 'fullName', 'matricNumber', 'email', 'department', 'companyName', 'progress']
                },
                {
                    model: InstitutionSupervisor,
                    as: 'institutionSupervisor',
                    attributes: ['id', 'fullName', 'email', 'department']
                },
                {
                    model: InstitutionSupervisor,
                    as: 'assignedByHOD',
                    attributes: ['id', 'fullName', 'email']
                },
                {
                    model: IndustrySupervisor,
                    as: 'industrySupervisor',
                    attributes: ['id', 'fullName', 'email', 'companyName']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            assignments,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit),
                limit: parseInt(limit)
            },
            department: hod.department
        });

    } catch (err) {
        console.error("Get department assignments error:", err);
        res.status(500).json({
            error: "Failed to fetch department assignments",
            details: err.message
        });
    }
};

// Get supervisor performance
export const getSupervisorPerformance = async (req, res) => {
    try {
        const hodId = req.user.id;

        const hod = await HOD.findByPk(hodId);
        if (!hod) {
            return res.status(404).json({ error: "HOD not found" });
        }

        const supervisors = await InstitutionSupervisor.findAll({
            where: { department: hod.department },
            include: [{
                model: Student,
                as: "AssignedStudents",
                include: [Logbook]
            }]
        });

        const performanceData = supervisors.map(supervisor => {
            const assignedStudents = supervisor.AssignedStudents || [];
            const studentIds = assignedStudents.map(student => student.id);

            const totalStudentLogbooks = assignedStudents.flatMap(student => student.Logbooks || []);
            const approvedLogbooks = totalStudentLogbooks.filter(logbook =>
                logbook.status === "APPROVED"
            );
            const pendingLogbooks = totalStudentLogbooks.filter(logbook =>
                logbook.status === "PENDING"
            );
            const revisionLogbooks = totalStudentLogbooks.filter(logbook =>
                logbook.status === "REVISION"
            );

            const reviewRate = totalStudentLogbooks.length > 0
                ? Math.round(((approvedLogbooks.length + revisionLogbooks.length) / totalStudentLogbooks.length) * 100)
                : 0;

            const avgResponseTime = assignedStudents.length > 0
                ? assignedStudents.reduce((sum, student) => {
                const studentLogbooks = student.Logbooks || [];
                const approvedLogs = studentLogbooks.filter(log => log.status === "APPROVED");
                if (approvedLogs.length > 0) {
                    const lastApproved = approvedLogs[0];
                    const submissionTime = new Date(lastApproved.createdAt);
                    const approvalTime = new Date(lastApproved.updatedAt);
                    const responseTime = (approvalTime - submissionTime) / (1000 * 60 * 60 * 24); // in days
                    return sum + responseTime;
                }
                return sum;
            }, 0) / assignedStudents.length
                : 0;

            return {
                supervisorId: supervisor.id,
                supervisorName: supervisor.fullName,
                supervisorEmail: supervisor.email,
                assignedStudents: assignedStudents.length,
                logbooks: {
                    total: totalStudentLogbooks.length,
                    approved: approvedLogbooks.length,
                    pending: pendingLogbooks.length,
                    revision: revisionLogbooks.length
                },
                reviewRate,
                avgResponseTime: Math.round(avgResponseTime * 10) / 10, // Round to 1 decimal
                performanceScore: Math.min(100, reviewRate * 0.7 + (Math.max(0, 100 - avgResponseTime) * 0.3))
            };
        });

        // Sort by performance score
        performanceData.sort((a, b) => b.performanceScore - a.performanceScore);

        res.json({
            department: hod.department,
            supervisors: performanceData,
            summary: {
                totalSupervisors: supervisors.length,
                avgReviewRate: performanceData.length > 0
                    ? Math.round(performanceData.reduce((sum, sup) => sum + sup.reviewRate, 0) / performanceData.length)
                    : 0,
                avgResponseTime: performanceData.length > 0
                    ? Math.round(performanceData.reduce((sum, sup) => sum + sup.avgResponseTime, 0) / performanceData.length * 10) / 10
                    : 0
            }
        });

    } catch (err) {
        console.error("Get supervisor performance error:", err);
        res.status(500).json({
            error: "Failed to fetch supervisor performance",
            details: err.message
        });
    }
};

// Assign student to supervisor
export const assignStudentToSupervisor = async (req, res) => {
    try {
        const hodId = req.user.id;
        const { studentId, institutionSupervisorId } = req.body;

        if (!studentId || !institutionSupervisorId) {
            return res.status(400).json({
                error: "Student ID and Institution Supervisor ID are required"
            });
        }

        const hod = await HOD.findByPk(hodId);
        if (!hod) {
            return res.status(404).json({ error: "HOD not found" });
        }

        // Check if student belongs to HOD's department
        const student = await Student.findByPk(studentId);
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        if (student.department !== hod.department) {
            return res.status(403).json({
                error: "Student does not belong to your department"
            });
        }

        // Check if supervisor belongs to HOD's department
        const supervisor = await InstitutionSupervisor.findByPk(institutionSupervisorId);
        if (!supervisor) {
            return res.status(404).json({ error: "Institution Supervisor not found" });
        }

        if (supervisor.department !== hod.department) {
            return res.status(403).json({
                error: "Supervisor does not belong to your department"
            });
        }

        // Check if student already assigned to a supervisor
        if (student.assignedSupervisor) {
            const existingAssignment = await Assignment.findOne({
                where: {
                    studentId,
                    institutionSupervisorId: student.assignedSupervisor
                }
            });

            if (existingAssignment) {
                return res.status(400).json({
                    error: "Student is already assigned to a supervisor",
                    currentSupervisor: student.assignedSupervisor
                });
            }
        }

        // Update student assignment
        student.assignedSupervisor = institutionSupervisorId;
        await student.save();

        // Create assignment record
        const assignment = await Assignment.create({
            studentId,
            institutionSupervisorId,
            assignedBy: hodId,
            status: "ACTIVE"
        });

        res.status(201).json({
            message: "Student assigned to supervisor successfully",
            assignment: {
                id: assignment.id,
                studentId: assignment.studentId,
                institutionSupervisorId: assignment.institutionSupervisorId,
                assignedBy: assignment.assignedBy,
                status: assignment.status,
                assignedAt: assignment.createdAt
            }
        });

    } catch (err) {
        console.error("Assign student to supervisor error:", err);
        res.status(500).json({
            error: "Failed to assign student to supervisor",
            details: err.message
        });
    }
};

// Update HOD profile
export const updateHod = async (req, res) => {
    try {
        const hodId = req.user.id;
        const { fullName, department, phone, profileImage } = req.body;

        const hod = await HOD.findByPk(hodId);
        if (!hod) {
            return res.status(404).json({ error: "HOD not found" });
        }

        // Update fields
        if (fullName) hod.fullName = fullName;
        if (department) hod.department = department;
        if (phone !== undefined) hod.phone = phone;
        if (profileImage !== undefined) hod.profileImage = profileImage;

        await hod.save();

        // Remove password from response
        const hodResponse = hod.toJSON();
        delete hodResponse.password;

        res.json({
            message: "HOD profile updated successfully",
            hod: hodResponse
        });

    } catch (err) {
        console.error("Update HOD error:", err);
        res.status(500).json({
            error: "Failed to update HOD profile",
            details: err.message
        });
    }
};

// Change HOD password
export const changePassword = async (req, res) => {
    try {
        const hodId = req.user.id;
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

        const hod = await HOD.findByPk(hodId);
        if (!hod) {
            return res.status(404).json({ error: "HOD not found" });
        }

        // Verify current password
        const isValidPassword = await hod.comparePassword(currentPassword);
        if (!isValidPassword) {
            return res.status(401).json({
                error: "Current password is incorrect"
            });
        }

        // Update password
        hod.password = newPassword;
        await hod.save();

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

// Delete HOD (Admin only)
export const deleteHod = async (req, res) => {
    try {
        const { id } = req.params;

        const hod = await HOD.findByPk(id);
        if (!hod) {
            return res.status(404).json({ error: "HOD not found" });
        }

        // Check if HOD has assigned students
        const assignedStudents = await Student.count({
            where: { assignedSupervisor: id }
        });

        if (assignedStudents > 0) {
            return res.status(400).json({
                error: "Cannot delete HOD with assigned students",
                assignedStudents
            });
        }

        await hod.destroy();

        res.json({
            message: "HOD deleted successfully"
        });

    } catch (err) {
        console.error("Delete HOD error:", err);
        res.status(500).json({
            error: "Failed to delete HOD",
            details: err.message
        });
    }
};

// Get department students
export const getDepartmentStudents = async (req, res) => {
    try {
        const hodId = req.user.id;

        const hod = await HOD.findByPk(hodId);
        if (!hod) {
            return res.status(404).json({ error: "HOD not found" });
        }

        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const where = { department: hod.department };
        if (status) {
            where.status = status;
        }

        const { count, rows: students } = await Student.findAndCountAll({
            where,
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: InstitutionSupervisor,
                    as: 'Supervisor',
                    attributes: ['id', 'fullName', 'email']
                },
                {
                    model: IndustrySupervisor,
                    as: 'IndustrySupervisor',
                    attributes: ['id', 'fullName', 'companyName']
                },
                {
                    model: Logbook,
                    attributes: ['id', 'weekNumber', 'status', 'createdAt'],
                    limit: 5,
                    order: [['weekNumber', 'DESC']]
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
            },
            department: hod.department
        });

    } catch (err) {
        console.error("Get department students error:", err);
        res.status(500).json({
            error: "Failed to fetch department students",
            details: err.message
        });
    }
};

export default {
    createHod,
    getHods,
    getHodById,
    getHODDashboard,
    getDepartmentDefenses,
    getDepartmentalAssignments,
    getSupervisorPerformance,
    assignStudentToSupervisor,
    updateHod,
    changePassword,
    deleteHod,
    getDepartmentStudents
};
