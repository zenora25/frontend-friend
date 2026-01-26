import Assignment from "../models/Assignment.js";
import Student from "../models/student.js";
import InstitutionSupervisor from "../models/institutionSupervisor.js";
import IndustrySupervisor from "../models/industrySupervisor.js";
import HOD from "../models/hod.js";

// Assign student to supervisor (HOD)
export const assignStudentToSupervisor = async (req, res) => {
    try {
        const { studentId, institutionSupervisorId, industrySupervisorId } = req.body;
        const hodId = req.user.id;

        if (!studentId) {
            return res.status(400).json({
                error: "Student ID is required",
            });
        }

        // Check if student exists
        const student = await Student.findByPk(studentId);
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Check if HOD is authorized
        const hod = await HOD.findByPk(hodId);
        if (hod.department !== student.department) {
            return res.status(403).json({
                error: "Can only assign students from your department",
            });
        }

        // Check supervisors if provided
        if (institutionSupervisorId) {
            const institutionSupervisor = await InstitutionSupervisor.findByPk(institutionSupervisorId);
            if (!institutionSupervisor) {
                return res.status(404).json({ error: "Institution supervisor not found" });
            }
        }

        if (industrySupervisorId) {
            const industrySupervisor = await IndustrySupervisor.findByPk(industrySupervisorId);
            if (!industrySupervisor) {
                return res.status(404).json({ error: "Industry supervisor not found" });
            }
        }

        // Create or update assignment
        const [assignment, created] = await Assignment.findOrCreate({
            where: { studentId },
            defaults: {
                studentId,
                institutionSupervisorId,
                industrySupervisorId,
                assignedBy: hodId,
            },
        });

        if (!created) {
            assignment.institutionSupervisorId = institutionSupervisorId;
            assignment.industrySupervisorId = industrySupervisorId;
            assignment.assignedBy = hodId;
            await assignment.save();
        }

        // Update student record
        if (institutionSupervisorId) {
            student.assignedSupervisor = institutionSupervisorId;
        }
        if (industrySupervisorId) {
            student.assignedIndustrySupervisor = industrySupervisorId;
        }
        await student.save();

        res.status(created ? 201 : 200).json({
            message: created ? "Student assigned successfully" : "Assignment updated",
            assignment,
            student: {
                id: student.id,
                fullName: student.fullName,
                assignedSupervisor: institutionSupervisorId,
                assignedIndustrySupervisor: industrySupervisorId,
            },
        });
    } catch (err) {
        console.error("Assign student error:", err);
        res.status(500).json({
            error: "Failed to assign student",
            details: err.message,
        });
    }
};

// Get HOD's departmental assignments
export const getDepartmentalAssignments = async (req, res) => {
    try {
        const hodId = req.user.id;

        const hod = await HOD.findByPk(hodId);
        if (!hod) {
            return res.status(404).json({ error: "HOD not found" });
        }

        const students = await Student.findAll({
            where: { department: hod.department },
            include: [
                {
                    model: Assignment,
                    include: [
                        {
                            model: InstitutionSupervisor,
                            attributes: ["id", "fullName", "email"],
                        },
                        {
                            model: IndustrySupervisor,
                            attributes: ["id", "fullName", "email", "companyName"],
                        },
                    ],
                },
            ],
            order: [["fullName", "ASC"]],
        });

        res.json(students);
    } catch (err) {
        console.error("Get departmental assignments error:", err);
        res.status(500).json({
            error: "Failed to fetch departmental assignments",
            details: err.message,
        });
    }
};

export const getSupervisorStudents = async (req, res) => {
    try {
        const supervisorId = req.user.id;
        const userRole = req.user.role;

        console.log(` Fetching students for ${userRole}:`, supervisorId);

        let students = [];

        if (userRole === "institutionSupervisor") {
            students = await Student.findAll({
                where: { assignedSupervisor: supervisorId },
                attributes: ['id', 'fullName', 'matricNumber', 'email', 'department', 'companyName', 'progress', 'status', 'updatedAt'],
                order: [['fullName', 'ASC']]
            });
        } else if (userRole === "industrySupervisor") {
            students = await Student.findAll({
                where: { assignedIndustrySupervisor: supervisorId },
                attributes: ['id', 'fullName', 'matricNumber', 'email', 'department', 'companyName', 'progress', 'status', 'companyAddress', 'updatedAt'],
                order: [['fullName', 'ASC']]
            });
        } else {
            return res.status(400).json({ error: "Invalid role for this operation" });
        }

        // Fetch assignment details manually for each student to avoid complex joins
        const studentsWithDetails = await Promise.all(
            students.map(async (student) => {
                const assignment = await Assignment.findOne({
                    where: { studentId: student.id },
                    include: [
                        {
                            model: InstitutionSupervisor,
                            as: 'institutionSupervisor',
                            attributes: ["id", "fullName", "email"],
                        },
                        {
                            model: IndustrySupervisor,
                            as: 'industrySupervisor',
                            attributes: ["id", "fullName", "email", "companyName"],
                        },
                    ],
                });

                const studentData = student.toJSON();
                studentData.Assignment = assignment;
                return studentData;
            })
        );

        res.json(studentsWithDetails);
    } catch (err) {
        console.error(" Get supervisor students error:", err.message);
        res.status(500).json({
            error: "Failed to fetch assigned students",
            details: err.message,
        });
    }
};

// Get all assignments (Coordinator)
export const getAllAssignments = async (req, res) => {
    try {
        const { department, page = 1, limit = 20 } = req.query;

        const where = {};
        const include = [
            {
                model: Student,
                as: 'student',
                attributes: ["id", "fullName", "matricNumber", "department"],
                where: department ? { department } : undefined,
            },
            {
                model: InstitutionSupervisor,
                as: 'institutionSupervisor',
                attributes: ["id", "fullName", "email"],
            },
            {
                model: IndustrySupervisor,
                as: 'industrySupervisor',
                attributes: ["id", "fullName", "companyName"],
            },
        ];

        const offset = (page - 1) * limit;

        const { count, rows: assignments } = await Assignment.findAndCountAll({
            where,
            include,
            order: [["createdAt", "DESC"]],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({
            assignments,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit),
                limit: parseInt(limit),
            },
        });
    } catch (err) {
        console.error("Get all assignments error:", err);
        res.status(500).json({
            error: "Failed to fetch assignments",
            details: err.message,
        });
    }
};

// Remove assignment (HOD/Coordinator)
export const removeAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const userRole = req.user.role;

        const assignment = await Assignment.findByPk(assignmentId, {
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ["id", "department"],
                },
            ],
        });

        if (!assignment) {
            return res.status(404).json({ error: "Assignment not found" });
        }

        // Check authorization for HOD
        if (userRole === "hod") {
            const hod = await HOD.findByPk(req.user.id);
            if (hod.department !== assignment.student.department) {
                return res.status(403).json({
                    error: "Not authorized to remove this assignment",
                });
            }
        }

        // Update student record
        const student = await Student.findByPk(assignment.studentId);
        if (student) {
            if (student.assignedSupervisor === assignment.institutionSupervisorId) {
                student.assignedSupervisor = null;
            }
            if (student.assignedIndustrySupervisor === assignment.industrySupervisorId) {
                student.assignedIndustrySupervisor = null;
            }
            await student.save();
        }

        await assignment.destroy();

        res.json({
            message: "Assignment removed successfully",
        });
    } catch (err) {
        console.error("Remove assignment error:", err);
        res.status(500).json({
            error: "Failed to remove assignment",
            details: err.message,
        });
    }
};

// export {
//     assignStudentToSupervisor,
//     getDepartmentalAssignments,
//     getSupervisorStudents,
//     getAllAssignments,
//     removeAssignment,
// };