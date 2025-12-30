import Assignment from "../models/Assignment.js";
import Student from "../models/student.js";
import InstitutionSupervisor from "../models/institutionSupervisor.js";
import HOD from "../models/hod.js";

// Assign student to supervisor (HOD only)
export const assignStudentToSupervisor = async (req, res) => {
    try {
        const { studentId, institutionSupervisorId } = req.body;
        const hodId = req.user.id;

        if (!studentId || !institutionSupervisorId) {
            return res.status(400).json({
                error: "Student ID and Supervisor ID required"
            });
        }

        // Check if student exists
        const student = await Student.findByPk(studentId);
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Check if supervisor exists
        const supervisor = await InstitutionSupervisor.findByPk(institutionSupervisorId);
        if (!supervisor) {
            return res.status(404).json({ error: "Supervisor not found" });
        }

        // Check if HOD is in same department
        const hod = await HOD.findByPk(hodId);
        if (hod.department !== student.department) {
            return res.status(403).json({
                error: "Can only assign students from your department"
            });
        }

        // Create or update assignment
        const [assignment, created] = await Assignment.findOrCreate({
            where: { studentId },
            defaults: {
                studentId,
                institutionSupervisorId,
                hodId,
            }
        });

        if (!created) {
            // Update existing assignment
            assignment.institutionSupervisorId = institutionSupervisorId;
            assignment.hodId = hodId;
            await assignment.save();
        }

        // Update student record
        student.assignedSupervisor = institutionSupervisorId;
        await student.save();

        res.status(created ? 201 : 200).json({
            message: created ? "Student assigned successfully" : "Assignment updated",
            assignment,
            student: {
                id: student.id,
                fullName: student.fullName,
                assignedSupervisor: institutionSupervisorId,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to assign student" });
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

        // Get all students in HOD's department
        const students = await Student.findAll({
            where: { department: hod.department },
            include: [
                {
                    model: Assignment,
                    include: [
                        {
                            model: InstitutionSupervisor,
                            attributes: ['id', 'fullName', 'email']
                        }
                    ]
                }
            ]
        });

        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch assignments" });
    }
};

// Get supervisor's assigned students
export const getSupervisorStudents = async (req, res) => {
    try {
        const supervisorId = req.user.id;

        const assignments = await Assignment.findAll({
            where: { institutionSupervisorId: supervisorId },
            include: [
                {
                    model: Student,
                    attributes: ['id', 'fullName', 'email', 'department']
                }
            ]
        });

        res.json(assignments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch assigned students" });
    }
};