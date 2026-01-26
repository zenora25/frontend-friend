
import Student from "../models/student.js";

//this is for creating user
export const createStudent = async (req, res) => {

    try {
        const { fullName, email, password } = req.body;

        const student = await Student.create({ fullName, email, password });
        req.status(201).json({ message: "student created successfully", student })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "failed to create student" })
    }
};

import { Op } from "sequelize";
import InstitutionSupervisor from "../models/institutionSupervisor.js";
import IndustrySupervisor from "../models/industrySupervisor.js";

//this is to get students with pagination, search and filtering
export const getStudents = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status, department } = req.query;
        const offset = (page - 1) * limit;

        const where = {};

        if (status && status !== 'all') {
            where.status = status;
        }

        if (department && department !== 'all') {
            where.department = department;
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
            attributes: ['id', 'fullName', 'matricNumber', 'email', 'department', 'companyName', 'progress', 'status', 'createdAt'],
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
                }
            }
        });

    } catch (err) {
        console.error(" Get students error:", err);
        res.status(500).json({
            success: false,
            error: "Failed to fetch students",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
}

// Update student profile/details
export const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await Student.findByPk(id);

        if (!student) {
            return res.status(404).json({
                success: false,
                error: "Student not found"
            });
        }

        // List of fields allowed to be updated through this endpoint
        const allowedFields = [
            'fullName', 'email', 'phone', 'department',
            'companyName', 'companyAddress', 'profileImage',
            'siwesStartDate', 'siwesEndDate', 'totalWeeks',
            'progress', 'status'
        ];

        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedFields.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        await student.update(updates);

        res.json({
            success: true,
            message: "Student updated successfully",
            student
        });
    } catch (err) {
        console.error(" Update student error:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to update student",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};