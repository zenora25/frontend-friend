import Grading from "../models/Grading.js";
import Student from "../models/student.js";
import Logbook from "../models/logbook.js";

// Schedule defense (Coordinator only)
export const scheduleDefense = async (req, res) => {
    try {
        const { studentId, defenseDate, assessor } = req.body;
        const coordinatorId = req.user.id;

        if (!studentId || !defenseDate || !assessor) {
            return res.status(400).json({
                error: "Student ID, defense date, and assessor required"
            });
        }

        // Check if student exists
        const student = await Student.findByPk(studentId);
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Check if all logbooks are approved (weeks 1-13)
        const logbooks = await Logbook.findAll({
            where: { studentId, status: 'APPROVED' }
        });

        const approvedWeeks = new Set(logbooks.map(l => l.weekNumber));
        const allWeeksApproved = Array.from({length: 13}, (_, i) => i + 1)
            .every(week => approvedWeeks.has(week));

        if (!allWeeksApproved) {
            return res.status(400).json({
                error: "All 13 weeks of logbooks must be approved before scheduling defense"
            });
        }

        // Create or update grading record
        const [grading, created] = await Grading.findOrCreate({
            where: { studentId },
            defaults: {
                studentId,
                defenseDate: new Date(defenseDate),
                assessor,
                verdict: 'PENDING',
                score: 0,
            }
        });

        if (!created) {
            grading.defenseDate = new Date(defenseDate);
            grading.assessor = assessor;
            await grading.save();
        }

        // Notify student
        await sendEmail({
            to: student.email,
            ...emailTemplates.defenseScheduled(student.fullName, defenseDate)
        });

        res.status(created ? 201 : 200).json({
            message: created ? "Defense scheduled successfully" : "Defense updated",
            grading,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to schedule defense" });
    }
};

// Submit grade (Coordinator only)
export const submitGrade = async (req, res) => {
    try {
        const { studentId, score, remarks, verdict } = req.body;

        if (!studentId || score === undefined || !verdict) {
            return res.status(400).json({
                error: "Student ID, score, and verdict required"
            });
        }

        // Validate score (0-100)
        if (score < 0 || score > 100) {
            return res.status(400).json({ error: "Score must be between 0 and 100" });
        }

        // Validate verdict
        const validVerdicts = ['PASS', 'FAIL'];
        if (!validVerdicts.includes(verdict)) {
            return res.status(400).json({ error: "Invalid verdict" });
        }

        const grading = await Grading.findOne({ where: { studentId } });
        if (!grading) {
            return res.status(404).json({
                error: "No defense scheduled for this student"
            });
        }

        grading.score = score;
        grading.remarks = remarks;
        grading.verdict = verdict;
        await grading.save();

        res.json({
            message: "Grade submitted successfully",
            grading,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to submit grade" });
    }
};

// Get student's defense info
export const getStudentDefenseInfo = async (req, res) => {
    try {
        const studentId = req.params.studentId || req.user.id;

        const grading = await Grading.findOne({
            where: { studentId },
            include: [
                {
                    model: Student,
                    attributes: ['id', 'fullName', 'email', 'department']
                }
            ]
        });

        if (!grading) {
            return res.status(404).json({
                error: "No defense information found"
            });
        }

        res.json(grading);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch defense information" });
    }
};

// Get all defenses (Coordinator only)
export const getAllDefenses = async (req, res) => {
    try {
        const defenses = await Grading.findAll({
            include: [
                {
                    model: Student,
                    attributes: ['id', 'fullName', 'email', 'department']
                }
            ],
            order: [['defenseDate', 'ASC']],
        });

        res.json(defenses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch defenses" });
    }
};