import HOD from "../models/hod.js";
import Student from "../models/student.js";
import InstitutionSupervisor from "../models/institutionSupervisor.js";
import Logbook from "../models/Logbook.js";
import Defense from "../models/Defense.js";
import Assignment from "../models/Assignment.js";
import IndustrySupervisor from "../models/industrySupervisor.js";
import { Op } from "sequelize";

// Add this at the top after imports
import sequelize from "../config/db.js";
const { Sequelize } = sequelize;

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
            attributes: { exclude: ['password'] },
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
            attributes: { exclude: ['password'] }
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

// Get HOD dashboard - SIMPLIFIED VERSION
export const getHODDashboard = async (req, res) => {
    try {
        console.log("Getting HOD dashboard for user:", req.user);
        
        // First get HOD data
        const hod = await HOD.findByPk(req.user.id, {
            attributes: ['id', 'fullName', 'email', 'department']
        });

        if (!hod) {
            return res.status(404).json({ 
                success: false,
                error: "HOD not found" 
            });
        }

        console.log("HOD found, department:", hod.department);

        if (!hod.department) {
            return res.status(400).json({
                success: false,
                error: "HOD department not set",
                data: {
                    hod: {
                        id: hod.id,
                        fullName: hod.fullName,
                        email: hod.email,
                        department: hod.department
                    }
                }
            });
        }

        // Simple test queries
        const totalStudents = await Student.count({
            where: { department: hod.department }
        });

        const activeStudents = await Student.count({
            where: {
                department: hod.department,
                status: "ACTIVE"
            }
        });

        const institutionSupervisors = await InstitutionSupervisor.count({
            where: { department: hod.department }
        });

        // Get recent students
        const recentStudents = await Student.findAll({
            where: { department: hod.department },
            attributes: ['id', 'fullName', 'matricNumber', 'email', 'progress', 'status'],
            limit: 5,
            order: [['createdAt', 'DESC']]
        });

        console.log("Total students in department:", totalStudents);

        res.json({
            success: true,
            data: {
                hod: {
                    id: hod.id,
                    fullName: hod.fullName,
                    email: hod.email,
                    department: hod.department
                },
                stats: {
                    totalStudents,
                    activeStudents,
                    institutionSupervisors,
                    department: hod.department
                },
                recentStudents: recentStudents.map(student => ({
                    id: student.id,
                    name: student.fullName,
                    matricNumber: student.matricNumber,
                    email: student.email,
                    progress: student.progress,
                    status: student.status
                }))
            }
        });

    } catch (err) {
        console.error("Get HOD dashboard error:", err);
        console.error("Error details:", err.message);
        console.error("Error stack:", err.stack);
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

// Get department students - SIMPLIFIED VERSION
export const getDepartmentStudents = async (req, res) => {
    try {
        console.log("Getting department students for user:", req.user);
        
        const hod = await HOD.findByPk(req.user.id);
        if (!hod) {
            return res.status(404).json({ 
                success: false,
                error: "HOD not found" 
            });
        }

        console.log("HOD department:", hod.department);

        if (!hod.department) {
            return res.status(400).json({
                success: false,
                error: "HOD department not set",
                data: {
                    hod: {
                        id: hod.id,
                        fullName: hod.fullName,
                        email: hod.email
                    }
                }
            });
        }

        const { page = 1, limit = 10, search = '', status } = req.query;
        const offset = (page - 1) * limit;

        // Build where clause
        const where = { department: hod.department };
        
        if (status) {
            where.status = status;
        }
        
        if (search) {
            where[Op.or] = [
                { fullName: { [Op.like]: `%${search}%` } },
                { matricNumber: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        // Simple query without complex includes
        const { count, rows: students } = await Student.findAndCountAll({
            where,
            attributes: ['id', 'fullName', 'matricNumber', 'email', 'department', 'progress', 'status', 'companyName', 'assignedSupervisor'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        console.log("Found students:", count);

        res.json({
            success: true,
            data: {
                students,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    limit: parseInt(limit)
                },
                department: hod.department
            }
        });

    } catch (err) {
        console.error("Get department students error:", err);
        console.error("Error details:", err.message);
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