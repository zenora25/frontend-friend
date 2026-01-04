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
            ],
        });

        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Get logbook stats
        const totalEntries = await Logbook.count({ where: { studentId } });
        const approvedEntries = await Logbook.count({
            where: { studentId, status: "APPROVED" },
        });
        const pendingEntries = await Logbook.count({
            where: { studentId, status: "PENDING" },
        });

        // Get defense info
        const defense = await Defense.findOne({
            where: { studentId },
            attributes: ["defenseDate", "defenseTime", "venue", "status", "score"],
        });

        // Get recent logbooks
        const recentLogbooks = await Logbook.findAll({
            where: { studentId },
            order: [["weekNumber", "DESC"]],
            limit: 5,
            attributes: ["id", "weekNumber", "title", "status", "createdAt"],
        });

        res.json({
            student,
            stats: {
                weeksCompleted: approvedEntries,
                totalWeeks: 24, // Assuming 24-week program
                logbooksSubmitted: totalEntries,
                logbooksPending: pendingEntries,
                logbooksApproved: approvedEntries,
                progress: student.progress,
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
        console.error("Get student dashboard error:", err);
        res.status(500).json({
            error: "Failed to fetch dashboard data",
            details: err.message,
        });
    }
};

// Get supervisor dashboard stats
export const getSupervisorDashboard = async (req, res) => {
    try {
        const supervisorId = req.user.id;
        const userRole = req.user.role;

        let stats = {};
        let recentSubmissions = [];
        let assignedStudents = [];

        if (userRole === "institutionSupervisor") {
            const supervisor = await InstitutionSupervisor.findByPk(supervisorId, {
                include: [
                    {
                        model: Student,
                        as: "AssignedStudents",
                        include: [
                            {
                                model: Logbook,
                                order: [["createdAt", "DESC"]],
                                limit: 3,
                            },
                        ],
                    },
                ],
            });

            if (supervisor) {
                assignedStudents = supervisor.AssignedStudents;

                const allLogbooks = assignedStudents.flatMap(
                    (student) => student.Logbooks
                );

                stats = {
                    assignedStudents: assignedStudents.length,
                    pendingReviews: allLogbooks.filter((lb) => lb.status === "PENDING")
                        .length,
                    reviewedThisWeek: allLogbooks.filter(
                        (lb) =>
                            lb.status === "APPROVED" &&
                            new Date(lb.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    ).length,
                    totalSubmissions: allLogbooks.length,
                };

                recentSubmissions = allLogbooks
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 10)
                    .map((logbook) => ({
                        id: logbook.id,
                        student: assignedStudents.find((s) => s.id === logbook.studentId)
                            ?.fullName,
                        week: logbook.weekNumber,
                        submittedAt: logbook.createdAt,
                        status: logbook.status,
                        preview: logbook.weekSummary?.substring(0, 100) + "...",
                    }));
            }
        } else if (userRole === "industrySupervisor") {
            const supervisor = await IndustrySupervisor.findByPk(supervisorId, {
                include: [
                    {
                        model: Student,
                        as: "IndustryStudents",
                        include: [
                            {
                                model: Logbook,
                                order: [["createdAt", "DESC"]],
                                limit: 3,
                            },
                        ],
                    },
                ],
            });

            if (supervisor) {
                assignedStudents = supervisor.IndustryStudents;

                const allLogbooks = assignedStudents.flatMap(
                    (student) => student.Logbooks
                );

                stats = {
                    assignedStudents: assignedStudents.length,
                    pendingReviews: allLogbooks.filter((lb) => lb.status === "PENDING")
                        .length,
                    reviewedThisWeek: allLogbooks.filter(
                        (lb) =>
                            lb.status === "APPROVED" &&
                            new Date(lb.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    ).length,
                    totalSubmissions: allLogbooks.length,
                };

                recentSubmissions = allLogbooks
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 10)
                    .map((logbook) => ({
                        id: logbook.id,
                        student: assignedStudents.find((s) => s.id === logbook.studentId)
                            ?.fullName,
                        week: logbook.weekNumber,
                        submittedAt: logbook.createdAt,
                        status: logbook.status,
                        preview: logbook.weekSummary?.substring(0, 100) + "...",
                    }));
            }
        }

        res.json({
            stats,
            recentSubmissions,
            assignedStudents: assignedStudents.map((student) => ({
                id: student.id,
                name: student.fullName,
                matricNumber: student.matricNumber,
                company: student.companyName,
                progress: student.progress,
                lastActivity: student.updatedAt,
            })),
        });
    } catch (err) {
        console.error("Get supervisor dashboard error:", err);
        res.status(500).json({
            error: "Failed to fetch dashboard data",
            details: err.message,
        });
    }
};

// Get HOD dashboard stats
export const getHODDashboard = async (req, res) => {
    try {
        const hodId = req.user.id;

        const hod = await HOD.findByPk(hodId);
        if (!hod) {
            return res.status(404).json({ error: "HOD not found" });
        }

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
            include: [Logbook],
        });

        const allLogbooks = students.flatMap((student) => student.Logbooks);
        const approvedLogbooks = allLogbooks.filter(
            (lb) => lb.status === "APPROVED"
        );

        const avgProgress =
            students.length > 0
                ? Math.round(
                    students.reduce((sum, student) => sum + student.progress, 0) /
                    students.length
                )
                : 0;

        // Get supervisor performance
        const supervisors = await InstitutionSupervisor.findAll({
            where: { department: hod.department },
            include: [
                {
                    model: Student,
                    as: "AssignedStudents",
                    include: [Logbook],
                },
            ],
        });

        const supervisorPerformance = supervisors.map((supervisor) => {
            const assignedStudents = supervisor.AssignedStudents;
            const studentLogbooks = assignedStudents.flatMap(
                (student) => student.Logbooks
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

        res.json({
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
            },
            supervisorPerformance,
            departmentProgress: [
                {
                    name: "Computer Science",
                    students: Math.floor(totalStudents * 0.4),
                    avgProgress: 72,
                },
                {
                    name: "Software Engineering",
                    students: Math.floor(totalStudents * 0.3),
                    avgProgress: 65,
                },
                {
                    name: "Information Technology",
                    students: Math.floor(totalStudents * 0.2),
                    avgProgress: 70,
                },
                {
                    name: "Cybersecurity",
                    students: Math.floor(totalStudents * 0.1),
                    avgProgress: 62,
                },
            ],
        });
    } catch (err) {
        console.error("Get HOD dashboard error:", err);
        res.status(500).json({
            error: "Failed to fetch dashboard data",
            details: err.message,
        });
    }
};

// Get coordinator dashboard stats
export const getCoordinatorDashboard = async (req, res) => {
    try {
        const coordinatorId = req.user.id;

        // Get total students
        const totalStudents = await Student.count();

        // Get active verification codes
        const activeVerificationCodes = await VerificationCode.count({
            where: {
                isUsed: false,
                expiresAt: { [Op.gt]: new Date() },
            },
        });

        // Get upcoming defenses
        const upcomingDefenses = await Defense.count({
            where: {
                status: "SCHEDULED",
                defenseDate: { [Op.gte]: new Date() },
            },
        });

        // Get pending logbooks
        const pendingLogbooks = await Logbook.count({
            where: { status: "PENDING" },
        });

        // Get recent verification codes
        const verificationCodes = await VerificationCode.findAll({
            order: [["createdAt", "DESC"]],
            limit: 10,
        });

        res.json({
            stats: {
                totalStudents,
                activeVerificationCodes,
                upcomingDefenses,
                pendingLogbooks,
            },
            verificationCodes: verificationCodes.map((code) => ({
                id: code.id,
                code: code.code,
                department: code.department,
                usedBy: code.isUsed ? code.email : null,
                createdAt: code.createdAt,
                expiresAt: code.expiresAt,
            })),
        });
    } catch (err) {
        console.error("Get coordinator dashboard error:", err);
        res.status(500).json({
            error: "Failed to fetch dashboard data",
            details: err.message,
        });
    }
};

// Get system-wide stats (Admin/Coordinator)
export const getSystemStats = async (req, res) => {
    try {
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

        const totalDefenses = await Defense.count();
        const completedDefenses = await Defense.count({
            where: { status: "COMPLETED" },
        });

        // Get department distribution
        const departments = await Student.findAll({
            attributes: [
                "department",
                [sequelize.fn("COUNT", sequelize.col("id")), "count"],
            ],
            group: ["department"],
        });

        res.json({
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
        console.error("Get system stats error:", err);
        res.status(500).json({
            error: "Failed to fetch system statistics",
            details: err.message,
        });
    }
};

// export {
//     getStudentDashboard,
//     getSupervisorDashboard,
//     getHODDashboard,
//     getCoordinatorDashboard,
//     getSystemStats,
// };