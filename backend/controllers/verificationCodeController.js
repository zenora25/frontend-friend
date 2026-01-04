import VerificationCode from "../models/VerificationCode.js";
import Student from "../models/student.js";
import { Op } from "sequelize";

// Helper function to generate random code
const generateVerificationCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Generate a new verification code (Coordinator only)
export const generateCode = async (req, res) => {
  try {
    const { email, department } = req.body;
    const coordinatorId = req.user.id;

    if (!email || !department) {
      return res.status(400).json({ error: "Email and department required" });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ where: { email } });
    if (existingStudent) {
      return res.status(400).json({ error: "Student already registered" });
    }

    // Generate unique code
    let code;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      code = generateVerificationCode();
      const existingCode = await VerificationCode.findOne({
        where: { code, isUsed: false },
      });
      if (!existingCode) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ error: "Failed to generate unique code" });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const newCode = await VerificationCode.create({
      code,
      email,
      issuedBy: coordinatorId,
      department,
      expiresAt,
      isUsed: false,
    });

    // In production, send email here
    console.log(`Verification code for ${email}: ${code}`);

    res.status(201).json({
      message: "Verification code generated successfully",
      code: newCode.code,
      expiresAt: newCode.expiresAt,
      email: newCode.email,
      department: newCode.department,
    });
  } catch (err) {
    console.error("Generate code error:", err);
    res.status(500).json({
      error: "Failed to generate verification code",
      details: err.message,
    });
  }
};

// Verify a student's code (during registration)
export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email and code required" });
    }

    const verification = await VerificationCode.findOne({
      where: {
        email,
        code: code.toUpperCase(),
        isUsed: false,
      },
    });

    if (!verification) {
      return res
          .status(400)
          .json({ error: "Invalid verification code or email" });
    }

    // Check if code is expired
    if (new Date() > new Date(verification.expiresAt)) {
      await VerificationCode.destroy({ where: { id: verification.id } });
      return res.status(400).json({ error: "Verification code has expired" });
    }

    res.json({
      message: "Verification successful",
      valid: true,
      department: verification.department,
      email: verification.email,
    });
  } catch (err) {
    console.error("Verify code error:", err);
    res.status(500).json({
      error: "Verification failed",
      details: err.message,
    });
  }
};

// Get all codes (Coordinator only)
export const getCodes = async (req, res) => {
  try {
    const { page = 1, limit = 20, isUsed, department } = req.query;

    const where = {};
    if (isUsed !== undefined) {
      where.isUsed = isUsed === "true";
    }
    if (department) {
      where.department = department;
    }

    const offset = (page - 1) * limit;

    const { count, rows: codes } = await VerificationCode.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      codes,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error("Get codes error:", err);
    res.status(500).json({
      error: "Failed to fetch verification codes",
      details: err.message,
    });
  }
};

// Get unused codes for a department
export const getUnusedCodes = async (req, res) => {
  try {
    const { department } = req.params;

    const codes = await VerificationCode.findAll({
      where: {
        department,
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() },
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(codes);
  } catch (err) {
    console.error("Get unused codes error:", err);
    res.status(500).json({
      error: "Failed to fetch unused codes",
      details: err.message,
    });
  }
};

// Delete verification code (Coordinator only)
export const deleteCode = async (req, res) => {
  try {
    const { id } = req.params;

    const code = await VerificationCode.findByPk(id);
    if (!code) {
      return res.status(404).json({ error: "Code not found" });
    }

    if (code.isUsed) {
      return res.status(400).json({ error: "Cannot delete used code" });
    }

    await code.destroy();

    res.json({
      message: "Verification code deleted successfully",
    });
  } catch (err) {
    console.error("Delete code error:", err);
    res.status(500).json({
      error: "Failed to delete verification code",
      details: err.message,
    });
  }
};

// Bulk generate codes (Coordinator only)
export const bulkGenerateCodes = async (req, res) => {
  try {
    const { emails, department } = req.body;
    const coordinatorId = req.user.id;

    if (!emails || !Array.isArray(emails) || emails.length === 0 || !department) {
      return res.status(400).json({
        error: "Emails array and department are required",
      });
    }

    // Check existing students
    const existingStudents = await Student.findAll({
      where: { email: emails },
    });

    if (existingStudents.length > 0) {
      return res.status(400).json({
        error: "Some emails are already registered",
        existingEmails: existingStudents.map((s) => s.email),
      });
    }

    const generatedCodes = [];
    const errors = [];

    for (const email of emails) {
      try {
        // Generate unique code
        let code;
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 10) {
          code = generateVerificationCode();
          const existingCode = await VerificationCode.findOne({
            where: { code, isUsed: false },
          });
          if (!existingCode) {
            isUnique = true;
          }
          attempts++;
        }

        if (!isUnique) {
          errors.push({ email, error: "Failed to generate unique code" });
          continue;
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const newCode = await VerificationCode.create({
          code,
          email,
          issuedBy: coordinatorId,
          department,
          expiresAt,
          isUsed: false,
        });

        generatedCodes.push({
          email,
          code: newCode.code,
          expiresAt: newCode.expiresAt,
        });
      } catch (err) {
        errors.push({ email, error: err.message });
      }
    }

    res.status(201).json({
      message: `Generated ${generatedCodes.length} codes successfully`,
      generatedCodes,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("Bulk generate codes error:", err);
    res.status(500).json({
      error: "Failed to bulk generate codes",
      details: err.message,
    });
  }
};

/*
export {
  generateCode,
  verifyCode,
  getCodes,
  getUnusedCodes,
  deleteCode,
  bulkGenerateCodes,
};*/
