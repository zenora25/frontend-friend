
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

//this is to get users
export const getStudents = async (req, res) => {
    try {
        const students = await Student.findAll();
        res.json(students);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "failed to fetch students" })
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
        console.error("❌ Update student error:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to update student",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};