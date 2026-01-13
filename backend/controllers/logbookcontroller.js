import Logbook from "../models/logbook.js";
import Student from "../models/student.js";
import InstitutionSupervisor from "../models/institutionSupervisor.js";
import IndustrySupervisor from "../models/industrySupervisor.js";
import { Op } from "sequelize";
import { uploadMultiple } from "../utils/upload.js";
import path from "path";
import fs from "fs";

// Helper function to get public URL for file
const getFileUrl = (filename) => {
    return `/uploads/logbooks/${filename}`;
};

// CREATE logbook entry with images (Student)
export const createLogbook = async (req, res) => {
    try {
        const {
            weekNumber,
            startDate,
            endDate,
            title,
            mondayActivities,
            tuesdayActivities,
            wednesdayActivities,
            thursdayActivities,
            fridayActivities,
            weekSummary,
            challengesFaced,
            lessonsLearned,
            skillsAcquired,
        } = req.body;

        const studentId = req.user.id;
        console.log("Creating logbook for student:", studentId, "Week:", weekNumber); // Debug log
        console.log("Request body:", req.body); // Debug log

        // Validate required fields
        if (!weekNumber || !startDate || !endDate || !title || !weekSummary) {
            return res.status(400).json({
                error: "Week number, dates, title, and summary are required",
            });
        }

        // Check if logbook for this week already exists
        const existingLogbook = await Logbook.findOne({
            where: {
                studentId,
                weekNumber,
            },
        });

        if (existingLogbook) {
            return res.status(400).json({
                error: "Logbook entry for this week already exists",
            });
        }

        // Handle file upload (files already processed by middleware)
        let imageUrls = [];
        try {
            console.log("Checking for uploaded files..."); // Debug log
            if (req.files && req.files.length > 0) {
                imageUrls = req.files.map(file => getFileUrl(file.filename));
                console.log("Uploaded images:", imageUrls); // Debug log
            } else {
                console.log("No files uploaded");
            }
        } catch (uploadError) {
            console.error("File processing error:", uploadError);
            // Continue without images if fail
        }

        const logbook = await Logbook.create({
            studentId,
            weekNumber,
            startDate,
            endDate,
            title,
            mondayActivities,
            tuesdayActivities,
            wednesdayActivities,
            thursdayActivities,
            fridayActivities,
            weekSummary,
            challengesFaced,
            lessonsLearned,
            skillsAcquired,
            images: imageUrls,
            status: "PENDING",
        });

        // Update student progress
        const student = await Student.findByPk(studentId);
        const totalWeeks = 24; // Assuming 24-week SIWES program
        const completedWeeks = await Logbook.count({
            where: { studentId, status: "APPROVED" },
        });
        const progress = Math.round((completedWeeks / totalWeeks) * 100);

        student.progress = progress;
        await student.save();

        res.status(201).json({
            message: "Logbook entry created successfully",
            logbook,
        });
    } catch (err) {
        console.error("Create logbook error:", err);
        console.error("Stack trace:", err.stack); // Debug log
        res.status(500).json({
            error: "Failed to create logbook entry",
            details: err.message,
        });
    }
};

// GET all student's logbooks
export const getMyLogbooks = async (req, res) => {
    try {
        const studentId = req.user.id;
        console.log("Fetching logbooks for student:", studentId); // Debug log

        const logbooks = await Logbook.findAll({
            where: { studentId },
            order: [["weekNumber", "DESC"]],
        });

        res.json(logbooks);
    } catch (err) {
        console.error("Get my logbooks error:", err);
        console.error("Stack trace:", err.stack); // Debug log
        res.status(500).json({
            error: "Failed to fetch logbooks",
            details: err.message,
        });
    }
};

// GET single logbook by ID with images
export const getLogbookById = async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = req.user.id;

        const logbook = await Logbook.findOne({
            where: { id, studentId },
            include: [
                {
                    model: Student,
                    attributes: ["id", "fullName", "matricNumber", "department"],
                },
            ],
        });

        if (!logbook) {
            return res.status(404).json({ error: "Logbook not found" });
        }

        // Transform image URLs to include full path
        if (logbook.images && Array.isArray(logbook.images)) {
            logbook.images = logbook.images.map(image => ({
                url: `${req.protocol}://${req.get('host')}${image}`,
                filename: path.basename(image)
            }));
        }

        res.json(logbook);
    } catch (err) {
        console.error("Get logbook error:", err);
        res.status(500).json({
            error: "Failed to fetch logbook",
            details: err.message,
        });
    }
};

// UPDATE logbook with images (Student)
export const updateLogbook = async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = req.user.id;

        const logbook = await Logbook.findOne({
            where: { id, studentId, status: "PENDING" },
        });

        if (!logbook) {
            return res.status(404).json({
                error: "Logbook not found or already reviewed",
            });
        }

        // Handle file upload for new images (files processed by middleware)
        let newImageUrls = [];
        try {
            if (req.files && req.files.length > 0) {
                newImageUrls = req.files.map(file => getFileUrl(file.filename));
            }
        } catch (uploadError) {
            console.error("File processing error:", uploadError);
        }

        // Combine existing images with new ones
        const existingImages = logbook.images || [];
        const allImages = [...existingImages, ...newImageUrls];

        const updatedData = {
            ...req.body,
            images: allImages,
        };

        await logbook.update(updatedData);

        res.json({
            message: "Logbook updated successfully",
            logbook,
        });
    } catch (err) {
        console.error("Update logbook error:", err);
        res.status(500).json({
            error: "Failed to update logbook",
            details: err.message,
        });
    }
};

// DELETE logbook (Student)
export const deleteLogbook = async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = req.user.id;

        const logbook = await Logbook.findOne({
            where: { id, studentId, status: "PENDING" },
        });

        if (!logbook) {
            return res.status(404).json({
                error: "Logbook not found or cannot be deleted",
            });
        }

        // Delete associated images
        if (logbook.images && Array.isArray(logbook.images)) {
            for (const image of logbook.images) {
                const filename = path.basename(image);
                const filePath = path.join('uploads/logbooks', filename);

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }

        await logbook.destroy();

        res.json({
            message: "Logbook deleted successfully",
        });
    } catch (err) {
        console.error("Delete logbook error:", err);
        res.status(500).json({
            error: "Failed to delete logbook",
            details: err.message,
        });
    }
};

// DELETE image from logbook
export const deleteLogbookImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body;
        const studentId = req.user.id;

        const logbook = await Logbook.findOne({
            where: { id, studentId, status: "PENDING" },
        });

        if (!logbook) {
            return res.status(404).json({
                error: "Logbook not found or cannot be modified",
            });
        }

        // Remove image from array
        const images = logbook.images || [];
        const updatedImages = images.filter(img => img !== imageUrl);

        // Delete the physical file
        const filename = path.basename(imageUrl);
        const filePath = path.join('uploads/logbooks', filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await logbook.update({ images: updatedImages });

        res.json({
            message: "Image deleted successfully",
            logbook,
        });
    } catch (err) {
        console.error("Delete image error:", err);
        res.status(500).json({
            error: "Failed to delete image",
            details: err.message,
        });
    }
};

// GET supervisor's assigned students' logbooks
export const getSupervisorLogbooks = async (req, res) => {
    try {
        const supervisorId = req.user.id;
        const userRole = req.user.role;
        const { status } = req.query;

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
                                where: status ? { status } : {},
                                required: false,
                            },
                        ],
                    },
                ],
            });

            if (!supervisor) {
                return res.status(404).json({ error: "Supervisor not found" });
            }

            assignedStudents = supervisor.AssignedStudents;
        } else if (userRole === "industrySupervisor") {
            const supervisor = await IndustrySupervisor.findByPk(supervisorId, {
                include: [
                    {
                        model: Student,
                        as: "AssignedInterns",
                        include: [
                            {
                                model: Logbook,
                                where: status ? { status } : {},
                                required: false,
                            },
                        ],
                    },
                ],
            });

            if (!supervisor) {
                return res.status(404).json({ error: "Industry supervisor not found" });
            }

            assignedStudents = supervisor.AssignedInterns;
        } else {
            return res.status(403).json({ error: "Not authorized" });
        }

        // Flatten logbooks from all assigned students
        const logbooks = [];
        assignedStudents.forEach(student => {
            if (student.Logbooks && student.Logbooks.length > 0) {
                student.Logbooks.forEach(logbook => {
                    logbooks.push({
                        ...logbook.toJSON(),
                        student: {
                            id: student.id,
                            fullName: student.fullName,
                            matricNumber: student.matricNumber,
                            department: student.department,
                        }
                    });
                });
            }
        });

        res.json(logbooks);
    } catch (err) {
        console.error("Get supervisor logbooks error:", err);
        res.status(500).json({
            error: "Failed to fetch supervisor logbooks",
            details: err.message,
        });
    }
};

// REVIEW logbook (Supervisor)
export const reviewLogbook = async (req, res) => {
    try {
        const { logbookId } = req.params;
        const supervisorId = req.user.id;
        const userRole = req.user.role;
        const { status, comment } = req.body;

        // Validate status
        const validStatuses = ["APPROVED", "REVISION"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        // Get logbook with student info
        const logbook = await Logbook.findByPk(logbookId, {
            include: [
                {
                    model: Student,
                    attributes: ["id", "assignedSupervisor", "assignedIndustrySupervisor"],
                },
            ],
        });

        if (!logbook) {
            return res.status(404).json({ error: "Logbook not found" });
        }

        // Check if supervisor is authorized based on role
        if (userRole === "institutionSupervisor") {
            if (logbook.Student.assignedSupervisor !== supervisorId) {
                return res.status(403).json({
                    error: "Not authorized to review this logbook",
                });
            }
            logbook.institutionSupervisorStatus = status;
            logbook.institutionSupervisorComment = comment;
            logbook.institutionSupervisorReviewedAt = new Date();
        } else if (userRole === "industrySupervisor") {
            if (logbook.Student.assignedIndustrySupervisor !== supervisorId) {
                return res.status(403).json({
                    error: "Not authorized to review this logbook",
                });
            }
            logbook.industrySupervisorStatus = status;
            logbook.industrySupervisorComment = comment;
            logbook.industrySupervisorReviewedAt = new Date();
        } else {
            return res.status(403).json({ error: "Not authorized" });
        }

        // Determine overall status
        if (logbook.institutionSupervisorStatus === "APPROVED" &&
            logbook.industrySupervisorStatus === "APPROVED") {
            logbook.status = "APPROVED";
        } else if (logbook.institutionSupervisorStatus === "REVISION" ||
            logbook.industrySupervisorStatus === "REVISION") {
            logbook.status = "REVISION";
        } else {
            logbook.status = "PENDING";
        }

        await logbook.save();

        res.json({
            message: `Logbook ${status.toLowerCase()} successfully`,
            logbook,
        });
    } catch (err) {
        console.error("Review logbook error:", err);
        res.status(500).json({
            error: "Failed to review logbook",
            details: err.message,
        });
    }
};

// GET all logbooks (Admin/HOD/Coordinator)
export const getAllLogbooks = async (req, res) => {
    try {
        const { department, status, page = 1, limit = 20 } = req.query;

        const where = {};
        const include = [
            {
                model: Student,
                attributes: ["id", "fullName", "matricNumber", "department"],
                where: department ? { department } : {},
            },
        ];

        if (status) where.status = status;

        const offset = (page - 1) * limit;

        const { count, rows: logbooks } = await Logbook.findAndCountAll({
            where,
            include,
            order: [["createdAt", "DESC"]],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({
            logbooks,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit),
                limit: parseInt(limit),
            },
        });
    } catch (err) {
        console.error("Get all logbooks error:", err);
        res.status(500).json({
            error: "Failed to fetch logbooks",
            details: err.message,
        });
    }
};

// GET student logbook by student ID (Supervisor/Admin)
export const getStudentLogbook = async (req, res) => {
    try {
        const { studentId } = req.params;

        const logbooks = await Logbook.findAll({
            where: { studentId },
            order: [["weekNumber", "ASC"]],
            include: [
                {
                    model: Student,
                    attributes: ["id", "fullName", "matricNumber", "department"],
                },
            ],
        });

        res.json(logbooks);
    } catch (err) {
        console.error("Get student logbook error:", err);
        res.status(500).json({
            error: "Failed to fetch student logbook",
            details: err.message,
        });
    }
};

// GET logbook statistics
export const getLogbookStats = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.id;

        let stats = {};

        if (userRole === "student") {
            const studentId = userId;
            const totalEntries = await Logbook.count({ where: { studentId } });
            const approvedEntries = await Logbook.count({
                where: { studentId, status: "APPROVED" },
            });
            const pendingEntries = await Logbook.count({
                where: { studentId, status: "PENDING" },
            });
            const revisionEntries = await Logbook.count({
                where: { studentId, status: "REVISION" },
            });

            stats = {
                totalEntries,
                approvedEntries,
                pendingEntries,
                revisionEntries,
                completionRate: totalEntries > 0 ? Math.round((approvedEntries / totalEntries) * 100) : 0,
            };
        } else if (userRole === "institutionSupervisor") {
            const supervisor = await InstitutionSupervisor.findByPk(userId, {
                include: [
                    {
                        model: Student,
                        as: "AssignedStudents",
                        include: [Logbook],
                    },
                ],
            });

            if (supervisor) {
                const students = supervisor.AssignedStudents;
                const allLogbooks = students.flatMap((student) => student.Logbooks);

                const totalEntries = allLogbooks.length;
                const pendingReviews = allLogbooks.filter((logbook) =>
                    logbook.status === "PENDING" ||
                    (logbook.institutionSupervisorStatus === "PENDING" && logbook.status !== "APPROVED")
                ).length;
                const reviewedThisWeek = allLogbooks.filter(
                    (logbook) =>
                        logbook.institutionSupervisorStatus === "APPROVED" &&
                        new Date(logbook.institutionSupervisorReviewedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length;

                stats = {
                    totalEntries,
                    pendingReviews,
                    reviewedThisWeek,
                    assignedStudents: students.length,
                };
            }
        } else if (userRole === "industrySupervisor") {
            const supervisor = await IndustrySupervisor.findByPk(userId, {
                include: [
                    {
                        model: Student,
                        as: "AssignedInterns",
                        include: [Logbook],
                    },
                ],
            });

            if (supervisor) {
                const students = supervisor.AssignedInterns;
                const allLogbooks = students.flatMap((student) => student.Logbooks);

                const totalEntries = allLogbooks.length;
                const pendingReviews = allLogbooks.filter((logbook) =>
                    logbook.status === "PENDING" ||
                    (logbook.industrySupervisorStatus === "PENDING" && logbook.status !== "APPROVED")
                ).length;
                const reviewedThisWeek = allLogbooks.filter(
                    (logbook) =>
                        logbook.industrySupervisorStatus === "APPROVED" &&
                        new Date(logbook.industrySupervisorReviewedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length;

                stats = {
                    totalEntries,
                    pendingReviews,
                    reviewedThisWeek,
                    assignedStudents: students.length,
                };
            }
        } else if (["hod", "coordinator", "admin"].includes(userRole)) {
            // For admin/HOD/coordinator, show system-wide stats
            const totalEntries = await Logbook.count();
            const approvedEntries = await Logbook.count({ where: { status: "APPROVED" } });
            const pendingEntries = await Logbook.count({ where: { status: "PENDING" } });
            const revisionEntries = await Logbook.count({ where: { status: "REVISION" } });

            stats = {
                totalEntries,
                approvedEntries,
                pendingEntries,
                revisionEntries,
                approvalRate: totalEntries > 0 ? Math.round((approvedEntries / totalEntries) * 100) : 0,
            };
        }

        res.json(stats);
    } catch (err) {
        console.error("Get logbook stats error:", err);
        res.status(500).json({
            error: "Failed to fetch logbook statistics",
            details: err.message,
        });
    }
};

// Export all functions
/*export {
    createLogbook,
    getMyLogbooks,
    getLogbookById,
    updateLogbook,
    deleteLogbook,
    deleteLogbookImage,
    getSupervisorLogbooks,
    reviewLogbook,
    getAllLogbooks,
    getStudentLogbook,
    getLogbookStats,
};*/