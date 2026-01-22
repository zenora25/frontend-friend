import Student from "../models/student.js";
import InstitutionSupervisor from "../models/institutionSupervisor.js";
import Logbook from "../models/logbook.js";
import Defense from "../models/Defense.js";
import { Op } from "sequelize";

// Generate Student Report
export const generateStudentReport = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findByPk(studentId, {
            include: [
                { model: Logbook, as: 'Logbooks' },
                { model: Defense, as: 'Defense' }
            ]
        });

        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.json({
            success: true,
            data: {
                student: {
                    fullName: student.fullName,
                    matricNumber: student.matricNumber,
                    department: student.department,
                    progress: student.progress,
                    status: student.status
                },
                logbooks: student.Logbooks,
                defense: student.Defense
            }
        });
    } catch (err) {
        console.error("Generate student report error:", err);
        res.status(500).json({ error: "Failed to generate student report" });
    }
};

// Generate Department Report
export const generateDepartmentReport = async (req, res) => {
    try {
        const { department } = req.params;
        const students = await Student.findAll({
            where: { department },
            attributes: ['fullName', 'matricNumber', 'progress', 'status']
        });

        res.json({
            success: true,
            data: {
                department,
                totalStudents: students.length,
                students
            }
        });
    } catch (err) {
        console.error("Generate department report error:", err);
        res.status(500).json({ error: "Failed to generate department report" });
    }
};

export default {
    generateStudentReport,
    generateDepartmentReport
};
