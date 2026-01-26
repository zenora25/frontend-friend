import {
    HOD,
    Student,
    InstitutionSupervisor,
    Logbook,
    Defense,
    Assignment,
    IndustrySupervisor,
    sequelize
} from "../models/index.js";
import { Op } from "sequelize";

// Create HOD (Admin/Coordinator)
export const createHod = async (req, res) => {
    try {
        const { fullName, email, department, password } = req.body;

        if (!fullName || !email || !department || !password) {
            return res.status(400).json({
                success: false,
                error: "All fields are required"
            });
        }

        // Check if email already exists
        const existingHod = await HOD.findOne({ where: { email } });
        if (existingHod) {
            return res.status(400).json({
                success: false,
                error: "HOD with this email already exists"
            });
        }

        // FIXED: Changed 'fullame' to 'fullName'
        const hod = await HOD.create({ fullName, email, department, password });

        // Remove password from response
        const hodResponse = hod.toJSON();
        delete hodResponse.password;

        res.status(201).json({
            success: true,
            message: "HOD created successfully",
            hod: hodResponse
        });
    } catch (err) {
        console.error("Create HOD error:", err);
        res.status(500).json({
            success: false,
            error: "Failed to create HOD",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Get all HODs
export const getHods = async (req, res) => {
    try {
        const hods = await HOD.findAll({
            attributes: ['id', 'fullName', 'email', 'department'],
            order: [['createdAt', 'DESC']]
        });
        res.json({
            success: true,
            data: hods
        });
    } catch (err) {
        console.error("Get HODs error:", err);
        res.status(500).json({
            success: false,
            error: "Failed to fetch HODs",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Get HOD by ID
export const getHodById = async (req, res) => {
    try {
        const { id } = req.params;

        const hod = await HOD.findByPk(id, {
            attributes: ['id', 'fullName', 'email', 'department']
        });

        if (!hod) {
            return res.status(404).json({
                success: false,
                error: "HOD not found"
            });
        }

        res.json({
            success: true,
            data: hod
        });
    } catch (err) {
        console.error("Get HOD by ID error:", err);
        res.status(500).json({
            success: false,
            error: "Failed to fetch HOD",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Get HOD dashboard - COMPREHENSIVE VERSION
export const getHODDashboard = async (req, res) => {
    try {
        console.log("📊 Fetching comprehensive HOD dashboard for user:", req.user.id);

        const hod = await HOD.findByPk(req.user.id, {
            attributes: ['id', 'fullName', 'email', 'department']
        });

        if (!hod) {
            return res.status(404).json({
                success: false,
                error: "HOD not found"
            });
        }

        const dept = hod.department;
        console.log("🏢 Department:", dept);

        if (!dept) {
            return res.status(400).json({
                success: false,
                error: "HOD department not set",
                data: { hod }
            });
        }

        // 1. Basic Counts
        const totalStudents = await Student.count({ where: { department: dept } });
        const activeStudents = await Student.count({ where: { department: dept, status: "ACTIVE" } });
        const completedStudents = await Student.count({ where: { department: dept, status: "COMPLETED" } });
        const institutionSupervisorsCount = await InstitutionSupervisor.count({ where: { department: dept } });

        // 2. Logbook Stats
        const studentsInDept = await Student.findAll({
            where: { department: dept },
            attributes: ['id']
        });
        const studentIds = studentsInDept.map(s => s.id);

        const totalLogbooks = await Logbook.count({ where: { studentId: studentIds } });
        const pendingLogbooks = await Logbook.count({ where: { studentId: studentIds, status: "PENDING" } });
        const approvedLogbooks = await Logbook.count({ where: { studentId: studentIds, status: "APPROVED" } });

        // 3. Defense Stats
        const totalDefenses = await Defense.count({
            include: [{
                model: Student,
                as: 'student',
                where: { department: dept }
            }]
        });
        const scheduledDefenses = await Defense.count({
            where: { status: "SCHEDULED" },
            include: [{
                model: Student,
                as: 'student',
                where: { department: dept }
            }]
        });

        // 4. Progress & Rates
        const avgProgressResult = await Student.findAll({
            where: { department: dept },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('progress')), 'avgProgress']
            ],
            raw: true
        });
        const avgProgress = Math.round(avgProgressResult[0]?.avgProgress || 0);
        const completionRate = totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;
        const approvalRate = totalLogbooks > 0 ? Math.round((approvedLogbooks / totalLogbooks) * 100) : 0;

        // 5. Recent Activities
        const recentLogbooks = await Logbook.findAll({
            where: { studentId: studentIds },
            include: [{
                model: Student,
                as: 'student',
                attributes: ['fullName', 'matricNumber']
            }],
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        const upcomingDefenses = await Defense.findAll({
            where: {
                status: "SCHEDULED",
                defenseDate: { [Op.gte]: new Date() }
            },
            include: [{
                model: Student,
                as: 'student',
                where: { department: dept },
                attributes: ['fullName', 'matricNumber']
            }],
            order: [['defenseDate', 'ASC']],
            limit: 5
        });

        // 6. Supervisor Performance
        const supervisors = await InstitutionSupervisor.findAll({
            where: { department: dept },
            attributes: ['id', 'fullName', 'email']
        });

        const supervisorPerformance = await Promise.all(supervisors.map(async (sup) => {
            const assignedStudentsCount = await Student.count({ where: { assignedSupervisor: sup.id } });

            const supStudentIds = (await Student.findAll({
                where: { assignedSupervisor: sup.id },
                attributes: ['id']
            })).map(s => s.id);

            const reviewsTotal = await Logbook.count({
                where: {
                    studentId: supStudentIds,
                    status: { [Op.ne]: "PENDING" }
                }
            });
            const pendingTotal = await Logbook.count({
                where: {
                    studentId: supStudentIds,
                    status: "PENDING"
                }
            });

            const totalLogbooksForSup = reviewsTotal + pendingTotal;
            const reviewRate = totalLogbooksForSup > 0 ? Math.round((reviewsTotal / totalLogbooksForSup) * 100) : 0;

            return {
                id: sup.id,
                name: sup.fullName,
                email: sup.email,
                studentsAssigned: assignedStudentsCount,
                logbooksReviewed: reviewsTotal,
                logbooksPending: pendingTotal,
                reviewRate
            };
        }));

        res.json({
            success: true,
            data: {
                hod: {
                    id: hod.id,
                    fullName: hod.fullName,
                    email: hod.email,
                    department: dept
                },
                stats: {
                    totalStudents,
                    activeStudents,
                    completedStudents,
                    institutionSupervisors: institutionSupervisorsCount,
                    totalLogbooks,
                    pendingLogbooks,
                    approvedLogbooks,
                    totalDefenses,
                    scheduledDefenses,
                    avgProgress,
                    completionRate,
                    approvalRate
                },
                recentActivities: {
                    logbooks: recentLogbooks.map(lb => ({
                        id: lb.id,
                        studentName: lb.student?.fullName || "Unknown",
                        studentMatric: lb.student?.matricNumber || "Unknown",
                        weekNumber: lb.weekNumber,
                        title: lb.title,
                        status: lb.status,
                        submittedAt: lb.createdAt
                    })),
                    upcomingDefenses: upcomingDefenses.map(def => ({
                        id: def.id,
                        studentName: def.student?.fullName || "Unknown", // Defense model uses student (lowercase) in its own association
                        studentMatric: def.student?.matricNumber || "Unknown",
                        defenseDate: def.defenseDate,
                        defenseTime: def.defenseTime,
                        venue: def.venue
                    }))
                },
                supervisorPerformance,
                departmentProgress: {
                    current: avgProgress,
                    target: 100,
                    remaining: 100 - avgProgress
                }
            }
        });

    } catch (err) {
        console.error("❌ HOD Dashboard Error:", err);
        res.status(500).json({
            success: false,
            error: "Failed to fetch HOD dashboard",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Get department defenses
export const getDepartmentDefenses = async (req, res) => {
    try {
        console.log("Getting department defenses for user:", req.user);

        const hod = await HOD.findByPk(req.user.id);
        if (!hod || !hod.department) {
            return res.status(400).json({
                success: false,
                error: "HOD department not found"
            });
        }

        const { status, page = 1, limit = 20 } = req.query;

        const where = {};
        if (status) {
            where.status = status;
        }

        const offset = (page - 1) * limit;

        // Simple query without complex associations
        const { count, rows: defenses } = await Defense.findAndCountAll({
            where,
            include: [{
                model: Student,
                as: 'student',
                where: { department: hod.department },
                attributes: ['id', 'fullName', 'matricNumber', 'email']
            }],
            order: [['defenseDate', 'ASC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                defenses,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    pages: Math.ceil(count / limit),
                    limit: parseInt(limit)
                },
                department: hod.department
            }
        });

    } catch (err) {
        console.error("Get department defenses error:", err);
        res.status(500).json({
            success: false,
            error: "Failed to fetch department defenses",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Get department assignments
export const getDepartmentalAssignments = async (req, res) => {
    try {
        console.log("Getting department assignments for user:", req.user);

        const hod = await HOD.findByPk(req.user.id);
        if (!hod || !hod.department) {
            return res.status(400).json({
                success: false,
                error: "HOD department not found"
            });
        }

        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        // Simple query for assignments
        const { count, rows: assignments } = await Assignment.findAndCountAll({
            include: [
                {
                    model: Student,
                    as: 'student',
                    where: { department: hod.department },
                    attributes: ['id', 'fullName', 'matricNumber', 'email']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                assignments,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    pages: Math.ceil(count / limit),
                    limit: parseInt(limit)
                },
                department: hod.department
            }
        });

    } catch (err) {
        console.error("Get department assignments error:", err);
        res.status(500).json({
            success: false,
            error: "Failed to fetch department assignments",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Get supervisor performance
export const getSupervisorPerformance = async (req, res) => {
    try {
        console.log("Getting supervisor performance for user:", req.user);

        const hod = await HOD.findByPk(req.user.id);
        if (!hod || !hod.department) {
            return res.status(400).json({
                success: false,
                error: "HOD department not found"
            });
        }

        const supervisors = await InstitutionSupervisor.findAll({
            where: { department: hod.department },
            attributes: ['id', 'fullName', 'email', 'department']
        });

        const performanceData = supervisors.map(supervisor => ({
            supervisorId: supervisor.id,
            supervisorName: supervisor.fullName,
            supervisorEmail: supervisor.email,
            department: supervisor.department,
            assignedStudents: 0, // Placeholder
            logbooksReviewed: 0, // Placeholder
            performanceScore: 0  // Placeholder
        }));

        res.json({
            success: true,
            data: {
                department: hod.department,
                supervisors: performanceData,
                summary: {
                    totalSupervisors: supervisors.length
                }
            }
        });

    } catch (err) {
        console.error("Get supervisor performance error:", err);
        res.status(500).json({
            success: false,
            error: "Failed to fetch supervisor performance",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Assign student to supervisor
export const assignStudentToSupervisor = async (req, res) => {
    try {
        console.log("Assigning student to supervisor:", req.body);

        const hodId = req.user.id;
        const { studentId, institutionSupervisorId } = req.body;

        if (!studentId || !institutionSupervisorId) {
            return res.status(400).json({
                success: false,
                error: "Student ID and Institution Supervisor ID are required"
            });
        }

        const hod = await HOD.findByPk(hodId);
        if (!hod || !hod.department) {
            return res.status(400).json({
                success: false,
                error: "HOD department not found"
            });
        }

        // Check if student exists and belongs to HOD's department
        const student = await Student.findByPk(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                error: "Student not found"
            });
        }

        if (student.department !== hod.department) {
            return res.status(403).json({
                success: false,
                error: "Student does not belong to your department"
            });
        }

        // Check if supervisor exists and belongs to HOD's department
        const supervisor = await InstitutionSupervisor.findByPk(institutionSupervisorId);
        if (!supervisor) {
            return res.status(404).json({
                success: false,
                error: "Institution Supervisor not found"
            });
        }

        if (supervisor.department !== hod.department) {
            return res.status(403).json({
                success: false,
                error: "Supervisor does not belong to your department"
            });
        }

        // Update student assignment
        student.assignedSupervisor = institutionSupervisorId;
        await student.save();

        // Create simple assignment record
        const assignment = await Assignment.create({
            studentId,
            institutionSupervisorId,
            assignedBy: hodId,
            status: "ACTIVE"
        });

        res.status(201).json({
            success: true,
            message: "Student assigned to supervisor successfully",
            data: {
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
            success: false,
            error: "Failed to assign student to supervisor",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Update HOD profile
export const updateHod = async (req, res) => {
    try {
        console.log("Updating HOD profile:", req.body);

        const hodId = req.user.id;
        const { fullName, department, phone, profileImage } = req.body;

        const hod = await HOD.findByPk(hodId);
        if (!hod) {
            return res.status(404).json({
                success: false,
                error: "HOD not found"
            });
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
            success: true,
            message: "HOD profile updated successfully",
            data: hodResponse
        });

    } catch (err) {
        console.error("Update HOD error:", err);
        res.status(500).json({
            success: false,
            error: "Failed to update HOD profile",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Change HOD password
export const changePassword = async (req, res) => {
    try {
        console.log("Changing HOD password");

        const hodId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: "Current password and new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: "New password must be at least 6 characters long"
            });
        }

        const hod = await HOD.findByPk(hodId);
        if (!hod) {
            return res.status(404).json({
                success: false,
                error: "HOD not found"
            });
        }

        // Verify current password
        const isValidPassword = await hod.comparePassword(currentPassword);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: "Current password is incorrect"
            });
        }

        // Update password
        hod.password = newPassword;
        await hod.save();

        res.json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (err) {
        console.error("Change password error:", err);
        res.status(500).json({
            success: false,
            error: "Failed to change password",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Delete HOD (Admin only)
export const deleteHod = async (req, res) => {
    try {
        console.log("Deleting HOD:", req.params.id);

        const { id } = req.params;

        const hod = await HOD.findByPk(id);
        if (!hod) {
            return res.status(404).json({
                success: false,
                error: "HOD not found"
            });
        }

        // Check if HOD has department (simple check)
        const studentsInDepartment = await Student.count({
            where: { department: hod.department }
        });

        if (studentsInDepartment > 0) {
            return res.status(400).json({
                success: false,
                error: "Cannot delete HOD with students in their department",
                data: { studentsInDepartment }
            });
        }

        await hod.destroy();

        res.json({
            success: true,
            message: "HOD deleted successfully"
        });

    } catch (err) {
        console.error("Delete HOD error:", err);
        res.status(500).json({
            success: false,
            error: "Failed to delete HOD",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Get department students - ENHANCED VERSION
export const getDepartmentStudents = async (req, res) => {
    try {
        console.log("📊 Getting department students for user:", req.user.id);

        const hod = await HOD.findByPk(req.user.id);
        if (!hod) {
            return res.status(404).json({
                success: false,
                error: "HOD not found"
            });
        }

        const dept = hod.department;
        if (!dept) {
            return res.status(400).json({
                success: false,
                error: "HOD department not set"
            });
        }

        const { page = 1, limit = 10, search = '', status } = req.query;
        const offset = (page - 1) * limit;

        const where = { department: dept };

        if (status && status !== 'all') {
            where.status = status;
        }

        if (search) {
            where[Op.or] = [
                { fullName: { [Op.like]: `%${search}%` } },
                { matricNumber: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: students } = await Student.findAndCountAll({
            where,
            include: [
                {
                    model: InstitutionSupervisor,
                    as: 'Supervisor',
                    attributes: ['fullName', 'email']
                },
                {
                    model: IndustrySupervisor,
                    as: 'IndustrySupervisor',
                    attributes: ['fullName', 'companyName']
                }
            ],
            attributes: ['id', 'fullName', 'matricNumber', 'email', 'department', 'companyName', 'progress', 'status'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                students,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    pages: Math.ceil(count / limit),
                    limit: parseInt(limit)
                },
                department: dept
            }
        });

    } catch (err) {
        console.error("❌ Get department students error:", err);
        res.status(500).json({
            success: false,
            error: "Failed to fetch department students",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
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
