import Student from "../models/student.js";
import InstitutionSupervisor from "../models/institutionSupervisor.js";
import IndustrySupervisor from "../models/industrySupervisor.js";
import HOD from "../models/hod.js";
import SIWESCoordinator from "../models/siwesCoordinator.js";
import Logbook from "../models/logbook.js";
import Defense from "../models/Defense.js";
import Assignment from "../models/Assignment.js";
import VerificationCode from "../models/VerificationCode.js";
import { Op } from "sequelize";

// Get student dashboard stats
export const getStudentDashboard = async (req, res) => {
    try {
        const studentId = req.user.id;
        console.log(" Fetching dashboard for student:", studentId);

        const student = await Student.findByPk(studentId, {
            attributes: [
                "id",
                "fullName",
                "matricNumber",
                "department",
                "companyName",
                "companyAddress",
                "progress",
                "status",
                "siwesStartDate",
                "siwesEndDate",
                "totalWeeks",
                "assignedSupervisor"
            ],
            include: [
                {
                    model: InstitutionSupervisor,
                    as: 'Supervisor',
                    attributes: ['fullName']
                }
            ]
        });

        if (!student) {
            console.log(" Student not found:", studentId);
            return res.status(404).json({
                success: false,
                error: "Student not found"
            });
        }

        console.log(" Found student:", student.fullName);

        // Get logbook stats
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

        console.log("📈 Logbook stats:", { totalEntries, approvedEntries, pendingEntries, revisionEntries });

        // Get defense info with error handling
        let defense = null;
        try {
            defense = await Defense.findOne({
                where: { studentId },
                attributes: ["defenseDate", "defenseTime", "venue", "status", "score"],
            });
            if (defense) {
                console.log(" Found defense info for student");
            }
        } catch (defenseError) {
            console.warn(" Could not fetch defense info:", defenseError.message);
            // Defense table might not exist yet, continue without it
        }

        // Get recent logbooks
        const recentLogbooks = await Logbook.findAll({
            where: { studentId },
            order: [["weekNumber", "DESC"]],
            limit: 5,
            attributes: ["id", "weekNumber", "title", "status", "createdAt"],
        });

        console.log(" Found recent logbooks:", recentLogbooks.length);

        res.json({
            success: true,
            student: {
                ...student.toJSON(),
                supervisorName: student.Supervisor?.fullName || "Not Assigned",
            },
            stats: {
                weeksCompleted: approvedEntries,
                totalWeeks: student.totalWeeks || 24,
                logbooksSubmitted: totalEntries,
                logbooksPending: pendingEntries,
                logbooksApproved: approvedEntries,
                logbooksRevision: revisionEntries,
                progress: student.progress,
                completionRate: totalEntries > 0 ? Math.round((approvedEntries / totalEntries) * 100) : 0,
            },
            recentActivities: recentLogbooks.map((logbook) => ({
                id: logbook.id,
                week: logbook.weekNumber,
                status: logbook.status,
                date: logbook.createdAt,
                title: logbook.title,
            })),
            upcomingDefense: defense
                ? {
                    date: defense.defenseDate,
                    time: defense.defenseTime,
                    venue: defense.venue,
                    status: defense.status,
                    score: defense.score,
                }
                : null,
        });
    } catch (err) {
        console.error(" Get student dashboard error:", err.message);
        console.error(" Error stack:", err.stack);

        // Provide more helpful error message
        let errorMessage = "Failed to fetch dashboard data";
        if (err.original && err.original.sqlMessage) {
            if (err.original.sqlMessage.includes("doesn't exist")) {
                errorMessage = "Some required database tables are missing";
            }
        }

        res.status(500).json({
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

export const getSupervisorDashboard = async (req, res) => {
    try {
        const supervisorId = req.user.id;
        const userRole = req.user.role;

        console.log(` Fetching dashboard for ${userRole}:`, supervisorId);

        let stats = {};
        let recentSubmissions = [];
        let assignedStudentsList = [];

        if (userRole === "institutionSupervisor") {
            const supervisor = await InstitutionSupervisor.findByPk(supervisorId, {
                attributes: ['id', 'fullName', 'email', 'department']
            });

            if (!supervisor) {
                return res.status(404).json({ success: false, error: "Institution supervisor not found" });
            }

            assignedStudentsList = await Student.findAll({
                where: { assignedSupervisor: supervisorId },
                attributes: ['id', 'fullName', 'matricNumber', 'email', 'department', 'companyName', 'progress', 'status', 'updatedAt'],
                order: [['fullName', 'ASC']]
            });

        } else if (userRole === "industrySupervisor") {
            const supervisor = await IndustrySupervisor.findByPk(supervisorId, {
                attributes: ['id', 'fullName', 'email', 'companyName']
            });

            if (!supervisor) {
                return res.status(404).json({ success: false, error: "Industry supervisor not found" });
            }

            assignedStudentsList = await Student.findAll({
                where: { assignedIndustrySupervisor: supervisorId },
                attributes: ['id', 'fullName', 'matricNumber', 'email', 'department', 'companyName', 'progress', 'status', 'companyAddress', 'updatedAt'],
                order: [['fullName', 'ASC']]
            });
        } else {
            return res.status(403).json({ success: false, error: "Not authorized" });
        }

        console.log(` Found ${assignedStudentsList.length} assigned students`);

        // Fetch logbooks for all students manully
        const studentIds = assignedStudentsList.map(s => s.id);
        const allLogbooks = studentIds.length > 0 ? await Logbook.findAll({
            where: { studentId: studentIds },
            attributes: ['id', 'weekNumber', 'title', 'status', 'createdAt', 'updatedAt', 'studentId', 'weekSummary'],
            order: [["createdAt", "DESC"]]
        }) : [];

        // Calculate statistics
        const pendingReviews = allLogbooks.filter((lb) => lb.status === "PENDING").length;
        const reviewedThisWeek = allLogbooks.filter(
            (lb) => lb.status === "APPROVED" && new Date(lb.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;

        stats = {
            assignedStudents: assignedStudentsList.length,
            pendingReviews,
            reviewedThisWeek,
            totalSubmissions: allLogbooks.length,
        };

        // Prepare recent submissions
        recentSubmissions = allLogbooks.slice(0, 10).map((logbook) => {
            const student = assignedStudentsList.find((s) => s.id === logbook.studentId);
            return {
                id: logbook.id,
                student: student ? student.fullName : "Unknown",
                week: logbook.weekNumber,
                submittedAt: logbook.createdAt,
                status: logbook.status,
                preview: logbook.weekSummary ? (logbook.weekSummary.substring(0, 100) + "...") : "No summary",
            };
        });

        res.json({
            success: true,
            stats,
            recentSubmissions,
            assignedStudents: assignedStudentsList.map((student) => ({
                id: student.id,
                name: student.fullName,
                matricNumber: student.matricNumber,
                company: student.companyName,
                progress: student.progress,
                lastActivity: student.updatedAt,
            })),
        });
    } catch (err) {
        console.error(" Get supervisor dashboard error:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to fetch dashboard data",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Get HOD dashboard stats
export const getHODDashboard = async (req, res) => {
    try {
        const hodId = req.user.id;
        console.log(" Fetching dashboard for HOD:", hodId);

        const hod = await HOD.findByPk(hodId, {
            attributes: ['id', 'fullName', 'email', 'department']
        });
        if (!hod) {
            return res.status(404).json({
                success: false,
                error: "HOD not found"
            });
        }

        console.log(" Found HOD:", hod.fullName, "Department:", hod.department);

        // Get department stats
        const totalStudents = await Student.count({
            where: { department: hod.department },
        });
        const activeStudents = await Student.count({
            where: { department: hod.department, status: "ACTIVE" },
        });
        const completedStudents = await Student.count({
            where: { department: hod.department, status: "COMPLETED" },
        });

        // Get supervisor stats
        const totalSupervisors = await InstitutionSupervisor.count({
            where: { department: hod.department },
        });

        // Get logbook stats
        const students = await Student.findAll({
            where: { department: hod.department },
            attributes: ['id', 'fullName', 'matricNumber', 'email', 'department', 'progress'],
            include: [{
                model: Logbook,
                as: 'Logbooks',
                attributes: ['id', 'status', 'createdAt', 'studentId']
            }],
        });

        const allLogbooks = students.flatMap((student) => student.Logbooks || []);
        const approvedLogbooks = allLogbooks.filter(
            (lb) => lb.status === "APPROVED"
        );

        const avgProgress =
            students.length > 0
                ? Math.round(
                    students.reduce((sum, student) => sum + (student.progress || 0), 0) /
                    students.length
                )
                : 0;

        // Get supervisor performance
        const supervisors = await InstitutionSupervisor.findAll({
            where: { department: hod.department },
            attributes: ['id', 'fullName', 'email', 'department'],
            include: [
                {
                    model: Student,
                    as: "AssignedStudents",
                    attributes: ['id', 'fullName', 'progress'],
                    include: [{
                        model: Logbook,
                        as: 'Logbooks',
                        attributes: ['id', 'status', 'studentId']
                    }],
                },
            ],
        });

        const supervisorPerformance = supervisors.map((supervisor) => {
            const assignedStudents = supervisor.AssignedStudents || [];
            const studentLogbooks = assignedStudents.flatMap(
                (student) => student.Logbooks || []
            );
            const reviewed = studentLogbooks.filter(
                (lb) => lb.status === "APPROVED" || lb.status === "REVISION"
            ).length;
            const pending = studentLogbooks.filter(
                (lb) => lb.status === "PENDING"
            ).length;

            return {
                id: supervisor.id,
                name: supervisor.fullName,
                students: assignedStudents.length,
                reviewed,
                pending,
                reviewRate:
                    studentLogbooks.length > 0
                        ? Math.round((reviewed / studentLogbooks.length) * 100)
                        : 0,
            };
        });

        console.log(" Department stats calculated");

        res.json({
            success: true,
            stats: {
                totalStudents,
                activeStudents,
                completedStudents,
                totalSupervisors,
                avgProgress,
                completionRate:
                    totalStudents > 0
                        ? Math.round((completedStudents / totalStudents) * 100)
                        : 0,
                approvedLogbooks: approvedLogbooks.length,
                totalLogbooks: allLogbooks.length,
            },
            supervisorPerformance,
            departmentProgress: [
                {
                    name: hod.department || "Computer Science",
                    students: totalStudents,
                    avgProgress: avgProgress,
                },
            ],
        });
    } catch (err) {
        console.error(" Get HOD dashboard error:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to fetch dashboard data",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Get coordinator dashboard stats
export const getCoordinatorDashboard = async (req, res) => {
    try {
        const coordinatorId = req.user.id;
        console.log("👩‍💼 Fetching dashboard for coordinator:", coordinatorId);

        // Get total students
        const totalStudents = await Student.count();

        // Get active verification codes with error handling
        let activeVerificationCodes = 0;
        try {
            activeVerificationCodes = await VerificationCode.count({
                where: {
                    isUsed: false,
                    expiresAt: { [Op.gt]: new Date() },
                },
            });
        } catch (vcError) {
            console.warn(" Could not fetch verification codes:", vcError.message);
            // Verification codes table might not exist
        }

        // Get upcoming defenses with error handling
        let upcomingDefenses = 0;
        try {
            upcomingDefenses = await Defense.count({
                where: {
                    status: "SCHEDULED",
                    defenseDate: { [Op.gte]: new Date() },
                },
            });
        } catch (defenseError) {
            console.warn(" Could not fetch defenses:", defenseError.message);
            // Defenses table might not exist
        }

        // Get pending logbooks
        const pendingLogbooks = await Logbook.count({
            where: { status: "PENDING" },
        });

        // Get recent verification codes
        let verificationCodes = [];
        try {
            verificationCodes = await VerificationCode.findAll({
                order: [["createdAt", "DESC"]],
                limit: 10,
            });
        } catch (vcError) {
            console.warn(" Could not fetch recent verification codes:", vcError.message);
        }

        console.log(" Coordinator stats calculated");

        res.json({
            success: true,
            stats: {
                totalStudents,
                activeVerificationCodes,
                upcomingDefenses,
                pendingLogbooks,
            },
            verificationCodes: verificationCodes.map((code) => ({
                id: code.id,
                code: code.code,
                email: code.email,
                department: code.department,
                isUsed: code.isUsed,
                usedBy: code.isUsed ? code.email : null,
                createdAt: code.createdAt,
                expiresAt: code.expiresAt,
            })),
        });
    } catch (err) {
        console.error(" Get coordinator dashboard error:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to fetch dashboard data",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Get system-wide stats (Admin/Coordinator)
export const getSystemStats = async (req, res) => {
    try {
        console.log(" Fetching system-wide stats");

        const totalStudents = await Student.count();
        const totalSupervisors = await InstitutionSupervisor.count();
        const totalIndustrySupervisors = await IndustrySupervisor.count();
        const totalHODs = await HOD.count();
        const totalCoordinators = await SIWESCoordinator.count();

        const activeStudents = await Student.count({ where: { status: "ACTIVE" } });
        const completedStudents = await Student.count({
            where: { status: "COMPLETED" },
        });

        const totalLogbooks = await Logbook.count();
        const approvedLogbooks = await Logbook.count({
            where: { status: "APPROVED" },
        });

        let totalDefenses = 0;
        let completedDefenses = 0;
        try {
            totalDefenses = await Defense.count();
            completedDefenses = await Defense.count({
                where: { status: "COMPLETED" },
            });
        } catch (defenseError) {
            console.warn(" Could not fetch defense stats:", defenseError.message);
        }

        // Get department distribution
        const departments = await Student.findAll({
            attributes: [
                "department",
                [sequelize.fn("COUNT", sequelize.col("id")), "count"],
            ],
            group: ["department"],
        });

        console.log(" System stats calculated");

        res.json({
            success: true,
            users: {
                totalStudents,
                totalSupervisors,
                totalIndustrySupervisors,
                totalHODs,
                totalCoordinators,
            },
            activities: {
                activeStudents,
                completedStudents,
                totalLogbooks,
                approvedLogbooks,
                approvalRate:
                    totalLogbooks > 0
                        ? Math.round((approvedLogbooks / totalLogbooks) * 100)
                        : 0,
                totalDefenses,
                completedDefenses,
            },
            departments,
        });
    } catch (err) {
        console.error(" Get system stats error:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to fetch system statistics",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};