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
        console.log(" Creating logbook for student:", studentId, "Week:", weekNumber);
        console.log(" Request body:", req.body);

        // Validate required fields
        const missingFields = [];
        if (!weekNumber) missingFields.push('weekNumber');
        if (!startDate) missingFields.push('startDate');
        if (!endDate) missingFields.push('endDate');
        if (!title) missingFields.push('title');
        if (!weekSummary) missingFields.push('weekSummary');

        if (missingFields.length > 0) {
            console.log(" Missing required fields:", missingFields);
            return res.status(400).json({
                error: "Missing required fields",
                missingFields,
                message: "Week number, dates, title, and summary are required"
            });
        }

        // Convert weekNumber to integer
        const weekNum = parseInt(weekNumber);
        if (isNaN(weekNum) || weekNum < 1) {
            return res.status(400).json({
                error: "Invalid week number",
                message: "Week number must be a valid positive number"
            });
        }

        console.log(" Checking for existing logbook...");

        // Check if logbook for this week already exists
        const existingLogbook = await Logbook.findOne({
            where: {
                studentId,
                weekNumber: weekNum,
            },
        });

        if (existingLogbook) {
            console.log(" Logbook already exists for week:", weekNum);
            return res.status(400).json({
                error: "Logbook entry for this week already exists",
                weekNumber: weekNum
            });
        }

        // Handle file upload (files already processed by middleware)
        let imageUrls = [];
        try {
            console.log(" Checking for uploaded files...");
            if (req.files && req.files.length > 0) {
                imageUrls = req.files.map(file => getFileUrl(file.filename));
                console.log("📸 Uploaded images:", imageUrls.length);
            } else {
                console.log(" No files uploaded");
            }
        } catch (uploadError) {
            console.error(" File processing error:", uploadError.message);
            // Continue without images
        }

        console.log(" Creating new logbook...");

        const logbook = await Logbook.create({
            studentId,
            weekNumber: weekNum,
            startDate,
            endDate,
            title,
            mondayActivities: mondayActivities || '',
            tuesdayActivities: tuesdayActivities || '',
            wednesdayActivities: wednesdayActivities || '',
            thursdayActivities: thursdayActivities || '',
            fridayActivities: fridayActivities || '',
            weekSummary,
            challengesFaced: challengesFaced || '',
            lessonsLearned: lessonsLearned || '',
            skillsAcquired: skillsAcquired || '',
            images: imageUrls,
            status: "PENDING",
        });

        console.log(" Logbook created with ID:", logbook.id);

        // Update student progress with better error handling
        try {
            console.log(" Updating student progress...");
            const student = await Student.findByPk(studentId);

            if (!student) {
                console.warn(` Student with ID ${studentId} not found for progress update`);
            } else {
                const totalWeeks = 24; // Assuming 24-week SIWES program
                const completedWeeks = await Logbook.count({
                    where: {
                        studentId,
                        status: "APPROVED"
                    },
                });
                const progress = Math.round((completedWeeks / totalWeeks) * 100);
                console.log(` Progress calculation: ${completedWeeks}/${totalWeeks} = ${progress}%`);

                await student.update({ progress: progress });
                console.log(` Student progress updated to: ${progress}%`);
            }
        } catch (progressError) {
            console.error(" Error updating student progress:", progressError.message);
            // Don't fail the whole request because of progress update
        }

        console.log(" Logbook creation completed successfully");

        res.status(201).json({
            success: true,
            message: "Logbook entry created successfully",
            logbook: {
                id: logbook.id,
                weekNumber: logbook.weekNumber,
                title: logbook.title,
                startDate: logbook.startDate,
                endDate: logbook.endDate,
                status: logbook.status,
                createdAt: logbook.createdAt
            },
        });
    } catch (err) {
        console.error(" Create logbook error:", err.message);
        console.error(" Error stack:", err.stack);

        // Provide more specific error messages
        let errorMessage = "Failed to create logbook entry";
        let statusCode = 500;

        if (err.name === 'SequelizeValidationError') {
            errorMessage = "Validation error";
            statusCode = 400;
        } else if (err.name === 'SequelizeDatabaseError') {
            errorMessage = "Database error";
        }

        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// GET all student's logbooks
export const getMyLogbooks = async (req, res) => {
    try {
        const studentId = req.user.id;
        console.log(" Fetching logbooks for student:", studentId);

        const logbooks = await Logbook.findAll({
            where: { studentId },
            order: [["weekNumber", "DESC"]],
            attributes: [
                'id', 'weekNumber', 'title', 'startDate', 'endDate',
                'status', 'createdAt', 'updatedAt'
            ]
        });

        console.log(` Found ${logbooks.length} logbooks`);

        res.json({
            success: true,
            count: logbooks.length,
            logbooks
        });
    } catch (err) {
        console.error(" Get my logbooks error:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to fetch logbooks",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// GET single logbook by ID with images
export const getLogbookById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log(` Fetching logbook ${id} for user ${userId} (${userRole})`);

        // Find the logbook first to check ownership/permission
        const logbook = await Logbook.findByPk(id, {
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ["id", "fullName", "matricNumber", "department", "assignedSupervisor", "assignedIndustrySupervisor"],
                },
            ],
        });

        if (!logbook) {
            console.log(` Logbook ${id} not found`);
            return res.status(404).json({
                success: false,
                error: "Logbook not found"
            });
        }

        // Check permissions
        let isAuthorized = false;

        if (userRole === "student") {
            // Students can only view their own logbooks
            if (logbook.studentId == userId) {
                isAuthorized = true;
            } else {
                console.log(` studentId ${logbook.studentId} !== userId ${userId}`);
            }
        } else if (userRole === "institutionSupervisor") {
            // Institution supervisors can view logbooks of their assigned students
            if (logbook.student && logbook.student.assignedSupervisor == userId) {
                isAuthorized = true;
            } else {
                console.log(` assignedSupervisor ${logbook.student?.assignedSupervisor} !== supervisorId ${userId}`);
            }
        } else if (userRole === "industrySupervisor") {
            // Industry supervisors can view logbooks of their assigned interns
            if (logbook.student && logbook.student.assignedIndustrySupervisor == userId) {
                isAuthorized = true;
            } else {
                console.log(` assignedIndustrySupervisor ${logbook.student?.assignedIndustrySupervisor} !== supervisorId ${userId}`);
            }
        } else if (["admin", "hod", "siwesCoordinator", "coordinator"].includes(userRole)) {
            // Admins/HODs/Coordinators can view all (or department filtered - simplifed to all for now/detail view)
            isAuthorized = true;
        }

        if (!isAuthorized) {
            console.log(` Unauthorized access to logbook ${id} by ${userRole} ${userId}`);
            return res.status(403).json({
                success: false,
                error: "Not authorized to view this logbook"
            });
        }

        console.log(` Found logbook: ${logbook.title}`);

        // Transform image URLs to include full path
        if (logbook.images && Array.isArray(logbook.images)) {
            logbook.images = logbook.images.map(image => ({
                url: `${req.protocol}://${req.get('host')}${image}`,
                filename: path.basename(image)
            }));
        }

        res.json({
            success: true,
            logbook
        });
    } catch (err) {
        console.error(" Get logbook error:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to fetch logbook",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// UPDATE logbook with images (Student)
export const updateLogbook = async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = req.user.id;

        console.log(` Updating logbook ${id} for student ${studentId}`);

        const logbook = await Logbook.findOne({
            where: { id, studentId, status: "PENDING" },
        });

        if (!logbook) {
            console.log(` Logbook ${id} not found or already reviewed`);
            return res.status(404).json({
                success: false,
                error: "Logbook not found or already reviewed",
            });
        }

        // Handle file upload for new images
        let newImageUrls = [];
        try {
            if (req.files && req.files.length > 0) {
                newImageUrls = req.files.map(file => getFileUrl(file.filename));
                console.log(` Adding ${newImageUrls.length} new images`);
            }
        } catch (uploadError) {
            console.error(" File processing error:", uploadError.message);
        }

        // Combine existing images with new ones
        const existingImages = logbook.images || [];
        const allImages = [...existingImages, ...newImageUrls];

        const updatedData = {
            ...req.body,
            images: allImages,
            status: "PENDING" // Reset to pending when updated
        };

        await logbook.update(updatedData);

        console.log(` Logbook ${id} updated successfully`);

        res.json({
            success: true,
            message: "Logbook updated successfully",
            logbook,
        });
    } catch (err) {
        console.error(" Update logbook error:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to update logbook",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// DELETE logbook (Student)
export const deleteLogbook = async (req, res) => {
    try {
        const { id } = req.params;
        const studentId = req.user.id;

        console.log(` Deleting logbook ${id} for student ${studentId}`);

        const logbook = await Logbook.findOne({
            where: { id, studentId, status: "PENDING" },
        });

        if (!logbook) {
            console.log(` Logbook ${id} not found or cannot be deleted`);
            return res.status(404).json({
                success: false,
                error: "Logbook not found or cannot be deleted",
            });
        }

        // Delete associated images
        if (logbook.images && Array.isArray(logbook.images)) {
            console.log(` Deleting ${logbook.images.length} associated images`);
            for (const image of logbook.images) {
                try {
                    const filename = path.basename(image);
                    const filePath = path.join('uploads/logbooks', filename);

                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log(` Deleted file: ${filename}`);
                    }
                } catch (fileError) {
                    console.warn(` Could not delete file: ${image}`, fileError.message);
                }
            }
        }

        await logbook.destroy();
        console.log(` Logbook ${id} deleted successfully`);

        res.json({
            success: true,
            message: "Logbook deleted successfully",
        });
    } catch (err) {
        console.error(" Delete logbook error:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to delete logbook",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// DELETE image from logbook
export const deleteLogbookImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl } = req.body;
        const studentId = req.user.id;

        console.log(` Deleting image from logbook ${id}`);

        const logbook = await Logbook.findOne({
            where: { id, studentId, status: "PENDING" },
        });

        if (!logbook) {
            return res.status(404).json({
                success: false,
                error: "Logbook not found or cannot be modified",
            });
        }

        // Remove image from array
        const images = logbook.images || [];
        const updatedImages = images.filter(img => img !== imageUrl);

        // Delete the physical file
        try {
            const filename = path.basename(imageUrl);
            const filePath = path.join('uploads/logbooks', filename);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(` Deleted image file: ${filename}`);
            }
        } catch (fileError) {
            console.warn(` Could not delete physical file:`, fileError.message);
        }

        await logbook.update({ images: updatedImages });

        console.log(` Image removed from logbook ${id}`);

        res.json({
            success: true,
            message: "Image deleted successfully",
            logbook,
        });
    } catch (err) {
        console.error(" Delete image error:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to delete image",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// GET supervisor's assigned students' logbooks
export const getSupervisorLogbooks = async (req, res) => {
    try {
        const supervisorId = req.user.id;
        const userRole = req.user.role;
        const { status } = req.query;

        console.log(` ${userRole} ${supervisorId} fetching assigned logbooks`);

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
                                as: 'Logbooks',
                                where: status ? { status } : {},
                                required: false,
                            },
                        ],
                    },
                ],
            });

            if (!supervisor) {
                return res.status(404).json({
                    success: false,
                    error: "Supervisor not found"
                });
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
                                as: 'Logbooks',
                                where: status ? { status } : {},
                                required: false,
                            },
                        ],
                    },
                ],
            });

            if (!supervisor) {
                return res.status(404).json({
                    success: false,
                    error: "Industry supervisor not found"
                });
            }

            assignedStudents = supervisor.AssignedInterns;
        } else {
            return res.status(403).json({
                success: false,
                error: "Not authorized"
            });
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

        console.log(` Found ${logbooks.length} logbooks for ${assignedStudents.length} students`);

        res.json({
            success: true,
            count: logbooks.length,
            logbooks
        });
    } catch (err) {
        console.error(" Get supervisor logbooks error:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to fetch supervisor logbooks",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
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

        console.log(` ${userRole} ${supervisorId} reviewing logbook ${logbookId}`);

        // Validate status
        const validStatuses = ["APPROVED", "REVISION"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: "Invalid status"
            });
        }

        // Get logbook with student info
        const logbook = await Logbook.findByPk(logbookId, {
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ["id", "assignedSupervisor", "assignedIndustrySupervisor"],
                },
            ],
        });

        if (!logbook) {
            return res.status(404).json({
                success: false,
                error: "Logbook not found"
            });
        }

        // Check if supervisor is authorized based on role
        if (userRole === "institutionSupervisor") {
            if (logbook.student.assignedSupervisor != supervisorId) {
                console.log(` Auth failed: student.assignedSupervisor (${logbook.student.assignedSupervisor}) != supervisorId (${supervisorId})`);
                return res.status(403).json({
                    success: false,
                    error: "Not authorized to review this logbook",
                    details: `Assigned: ${logbook.student.assignedSupervisor}, User: ${supervisorId}`
                });
            }
            logbook.institutionStatus = status;
            logbook.institutionComment = comment;
            logbook.institutionReviewedAt = new Date();
        } else if (userRole === "industrySupervisor") {
            if (logbook.student.assignedIndustrySupervisor != supervisorId) {
                console.log(` Auth failed: student.assignedIndustrySupervisor (${logbook.student.assignedIndustrySupervisor}) != supervisorId (${supervisorId})`);
                return res.status(403).json({
                    success: false,
                    error: "Not authorized to review this logbook",
                    details: `Assigned: ${logbook.student.assignedIndustrySupervisor}, User: ${supervisorId}`
                });
            }
            logbook.industryStatus = status;
            logbook.industryComment = comment;
            logbook.industryReviewedAt = new Date();
        } else {
            return res.status(403).json({
                success: false,
                error: "Not authorized"
            });
        }

        // Determine overall status
        if (logbook.institutionStatus === "APPROVED" &&
            logbook.industryStatus === "APPROVED") {
            logbook.status = "APPROVED";
        } else if (logbook.institutionStatus === "REVISION" ||
            logbook.industryStatus === "REVISION") {
            logbook.status = "REVISION";
        } else {
            logbook.status = "PENDING";
        }

        await logbook.save();

        console.log(` Logbook ${logbookId} ${status.toLowerCase()} by ${userRole}`);

        res.json({
            success: true,
            message: `Logbook ${status.toLowerCase()} successfully`,
            logbook,
        });
    } catch (err) {
        console.error(" Review logbook error:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to review logbook",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// GET all logbooks (Admin/HOD/Coordinator)
export const getAllLogbooks = async (req, res) => {
    try {
        const { department, status, page = 1, limit = 20 } = req.query;

        console.log(` Admin fetching all logbooks - Dept: ${department}, Status: ${status}`);

        const where = {};
        const include = [
            {
                model: Student,
                as: 'student',
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

        console.log(` Found ${count} total logbooks, showing ${logbooks.length}`);

        res.json({
            success: true,
            logbooks,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit),
                limit: parseInt(limit),
            },
        });
    } catch (err) {
        console.error(" Get all logbooks error:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to fetch logbooks",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// GET student logbook by student ID (Supervisor/Admin)
export const getStudentLogbook = async (req, res) => {
    try {
        const { studentId } = req.params;

        console.log(` Fetching logbooks for student ${studentId}`);

        const logbooks = await Logbook.findAll({
            where: { studentId },
            order: [["weekNumber", "ASC"]],
            include: [
                {
                    model: Student,
                    as: 'student',
                    attributes: ["id", "fullName", "matricNumber", "department"],
                },
            ],
        });

        console.log(` Found ${logbooks.length} logbooks for student ${studentId}`);

        res.json({
            success: true,
            count: logbooks.length,
            logbooks
        });
    } catch (err) {
        console.error(" Get student logbook error:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to fetch student logbook",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// GET logbook statistics
export const getLogbookStats = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userId = req.user.id;

        console.log(` Getting logbook stats for ${userRole} ${userId}`);

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
                        include: [{ model: Logbook, as: 'Logbooks' }],
                    },
                ],
            });

            if (supervisor) {
                const students = supervisor.AssignedStudents;
                const allLogbooks = students.flatMap((student) => student.Logbooks || []);

                const totalEntries = allLogbooks.length;
                const pendingReviews = allLogbooks.filter((logbook) =>
                    logbook.status === "PENDING" ||
                    (logbook.institutionStatus === "PENDING" && logbook.status !== "APPROVED")
                ).length;
                const reviewedThisWeek = allLogbooks.filter(
                    (logbook) =>
                        logbook.institutionStatus === "APPROVED" &&
                        new Date(logbook.institutionReviewedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
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
                        include: [{ model: Logbook, as: 'Logbooks' }],
                    },
                ],
            });

            if (supervisor) {
                const students = supervisor.AssignedInterns;
                const allLogbooks = students.flatMap((student) => student.Logbooks || []);

                const totalEntries = allLogbooks.length;
                const pendingReviews = allLogbooks.filter((logbook) =>
                    logbook.status === "PENDING" ||
                    (logbook.industryStatus === "PENDING" && logbook.status !== "APPROVED")
                ).length;
                const reviewedThisWeek = allLogbooks.filter(
                    (logbook) =>
                        logbook.industryStatus === "APPROVED" &&
                        new Date(logbook.industryReviewedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
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

        console.log(` Stats calculated for ${userRole}`);

        res.json({
            success: true,
            stats
        });
    } catch (err) {
        console.error(" Get logbook stats error:", err.message);
        res.status(500).json({
            success: false,
            error: "Failed to fetch logbook statistics",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};