
import Defense from "../models/Defense.js";
import Student from "../models/student.js";
import Logbook from "../models/logbook.js";
import HOD from "../models/hod.js"; // ADD THIS IMPORT
import { Op } from "sequelize";

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

// GET department defenses for HOD
export const getDepartmentDefenses = async (req, res) => {
    try {
        const hodId = req.user.id;

        const hod = await HOD.findByPk(hodId);
        if (!hod) {
            return res.status(404).json({ error: "HOD not found" });
        }

        const defenses = await Defense.findAll({
            include: [{
                model: Student,
                where: { department: hod.department },
                attributes: ['id', 'fullName', 'matricNumber', 'email', 'department']
            }],
            order: [['defenseDate', 'ASC']]
        });

        res.json({
            defenses,
            department: hod.department
        });
    } catch (error) {
        console.error("Department defenses error:", error);
        res.status(500).json({ error: "Failed to fetch department defenses" });
    }
};