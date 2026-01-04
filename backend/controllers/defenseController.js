import Defense from "../models/Defense.js";
import Student from "../models/student.js";
import Logbook from "../models/logbook.js";
import { Op } from "sequelize";

// Schedule defense (Coordinator)
export const scheduleDefense = async (req, res) => {
    try {
        const {
            studentId,
            defenseDate,
            defenseTime,
            venue,
            duration,
            panelMembers,
        } = req.body;

        const coordinatorId = req.user.id;

        if (!studentId || !defenseDate || !defenseTime || !venue) {
            return res.status(400).json({
                error: "Student ID, date, time, and venue are required",
            });
        }

        // Check if student exists
        const student = await Student.findByPk(studentId);
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Check if all logbooks are approved
        const totalLogbooks = await Logbook.count({ where: { studentId } });
        const approvedLogbooks = await Logbook.count({
            where: { studentId, status: "APPROVED" },
        });

        if (totalLogbooks === 0) {
            return res.status(400).json({
                error: "Student has no logbook entries",
            });
        }

        if (approvedLogbooks < totalLogbooks) {
            return res.status(400).json({
                error: "All logbooks must be approved before scheduling defense",
            });
        }

        // Create or update defense
        const [defense, created] = await Defense.findOrCreate({
            where: { studentId },
            defaults: {
                studentId,
                defenseDate,
                defenseTime,
                venue,
                duration: duration || "30 minutes",
                panelMembers: panelMembers || [],
                status: "SCHEDULED",
                scheduledBy: coordinatorId,
            },
        });

        if (!created) {
            await defense.update({
                defenseDate,
                defenseTime,
                venue,
                duration,
                panelMembers,
                status: "SCHEDULED",
            });
        }

        res.status(created ? 201 : 200).json({
            message: created ? "Defense scheduled successfully" : "Defense updated",
            defense,
        });
    } catch (err) {
        console.error("Schedule defense error:", err);
        res.status(500).json({
            error: "Failed to schedule defense",
            details: err.message,
        });
    }
};

// Submit grade (Coordinator/Supervisor)
export const submitGrade = async (req, res) => {
    try {
        const { defenseId } = req.params;
        const { score, remarks, verdict } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Validate verdict
        const validVerdicts = ["PASS", "FAIL"];
        if (!validVerdicts.includes(verdict)) {
            return res.status(400).json({ error: "Invalid verdict" });
        }

        // Validate score
        if (score < 0 || score > 100) {
            return res.status(400).json({ error: "Score must be between 0 and 100" });
        }

        const defense = await Defense.findByPk(defenseId);
        if (!defense) {
            return res.status(404).json({ error: "Defense not found" });
        }

        // Check authorization
        if (userRole === "institutionSupervisor") {
            const student = await Student.findByPk(defense.studentId);
            if (student.assignedSupervisor !== userId) {
                return res.status(403).json({
                    error: "Not authorized to grade this defense",
                });
            }
        }

        // Update defense
        defense.score = score;
        defense.remarks = remarks;
        defense.verdict = verdict;
        defense.status = "COMPLETED";
        await defense.save();

        // Update student status if passed
        if (verdict === "PASS" && score >= 50) {
            const student = await Student.findByPk(defense.studentId);
            student.status = "COMPLETED";
            student.progress = 100;
            await student.save();
        }

        res.json({
            message: "Grade submitted successfully",
            defense,
        });
    } catch (err) {
        console.error("Submit grade error:", err);
        res.status(500).json({
            error: "Failed to submit grade",
            details: err.message,
        });
    }
};

// GET all defenses (Coordinator/HOD)
export const getAllDefenses = async (req, res) => {
    try {
        const { department, status, page = 1, limit = 20 } = req.query;
        const userRole = req.user.role;

        const where = {};
        const include = [
            {
                model: Student,
                attributes: ["id", "fullName", "matricNumber", "department"],
                where: department ? { department } : undefined,
            },
        ];

        if (status) where.status = status;

        // HOD can only see their department defenses
        if (userRole === "hod") {
            const hod = await HOD.findByPk(req.user.id);
            if (hod) {
                include[0].where = {
                    ...include[0].where,
                    department: hod.department,
                };
            }
        }

        const offset = (page - 1) * limit;

        const { count, rows: defenses } = await Defense.findAndCountAll({
            where,
            include,
            order: [["defenseDate", "ASC"]],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({
            defenses,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit),
                limit: parseInt(limit),
            },
        });
    } catch (err) {
        console.error("Get all defenses error:", err);
        res.status(500).json({
            error: "Failed to fetch defenses",
            details: err.message,
        });
    }
};

// GET student's defense (Student)
export const getMyDefense = async (req, res) => {
    try {
        const studentId = req.user.id;

        const defense = await Defense.findOne({
            where: { studentId },
            include: [
                {
                    model: Student,
                    attributes: ["id", "fullName", "matricNumber", "department"],
                },
            ],
        });

        if (!defense) {
            return res.status(404).json({
                error: "No defense scheduled",
            });
        }

        res.json(defense);
    } catch (err) {
        console.error("Get my defense error:", err);
        res.status(500).json({
            error: "Failed to fetch defense information",
            details: err.message,
        });
    }
};

// GET defense by student ID
export const getStudentDefense = async (req, res) => {
    try {
        const { studentId } = req.params;

        const defense = await Defense.findOne({
            where: { studentId },
            include: [
                {
                    model: Student,
                    attributes: ["id", "fullName", "matricNumber", "department"],
                },
            ],
        });

        if (!defense) {
            return res.status(404).json({
                error: "No defense scheduled for this student",
            });
        }

        res.json(defense);
    } catch (err) {
        console.error("Get student defense error:", err);
        res.status(500).json({
            error: "Failed to fetch student defense",
            details: err.message,
        });
    }
};

// Cancel defense (Coordinator)
export const cancelDefense = async (req, res) => {
    try {
        const { defenseId } = req.params;

        const defense = await Defense.findByPk(defenseId);
        if (!defense) {
            return res.status(404).json({ error: "Defense not found" });
        }

        defense.status = "CANCELLED";
        await defense.save();

        res.json({
            message: "Defense cancelled successfully",
            defense,
        });
    } catch (err) {
        console.error("Cancel defense error:", err);
        res.status(500).json({
            error: "Failed to cancel defense",
            details: err.message,
        });
    }
};

// GET defense statistics
export const getDefenseStats = async (req, res) => {
    try {
        const totalDefenses = await Defense.count();
        const scheduledDefenses = await Defense.count({
            where: { status: "SCHEDULED" },
        });
        const completedDefenses = await Defense.count({
            where: { status: "COMPLETED" },
        });
        const pendingDefenses = await Defense.count({
            where: { status: "PENDING" },
        });

        // Get average score
        const completed = await Defense.findAll({
            where: { status: "COMPLETED", score: { [Op.not]: null } },
            attributes: [[sequelize.fn("AVG", sequelize.col("score")), "averageScore"]],
        });

        const averageScore = completed[0]?.dataValues.averageScore || 0;

        res.json({
            totalDefenses,
            scheduledDefenses,
            completedDefenses,
            pendingDefenses,
            averageScore: Math.round(averageScore * 100) / 100,
            passRate: completedDefenses > 0 ?
                Math.round((await Defense.count({ where: { verdict: "PASS" } })) / completedDefenses * 100) : 0,
        });
    } catch (err) {
        console.error("Get defense stats error:", err);
        res.status(500).json({
            error: "Failed to fetch defense statistics",
            details: err.message,
        });
    }
};

// export {
//     scheduleDefense,
//     submitGrade,
//     getAllDefenses,
//     getMyDefense,
//     getStudentDefense,
//     cancelDefense,
//     getDefenseStats,
// };