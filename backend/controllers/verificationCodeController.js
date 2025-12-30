import VerificationCode from "../models/VerificationCode.js";
import { generateVerificationCode } from "../utils/codeGenerator.js";
import { sendEmail, emailTemplates } from "../utils/emailService.js";
import Student from "../models/student.js";

// Generate a new verification code (Coordinator only)
export const generateCode = async (req, res) => {
  try {
    const { email, department } = req.body;
    const coordinatorId = req.user.id; // From JWT

    if (!email || !department) {
      return res.status(400).json({ error: "Email and department required" });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ where: { email } });
    if (existingStudent) {
      return res.status(400).json({ error: "Student already registered" });
    }

    // Generate unique code
    const code = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // Expires in 24 hours

    const newCode = await VerificationCode.create({
      code,
      email,
      issuedBy: coordinatorId,
      department,
      expiresAt,
      isUsed: false,
    });

    // Send email with code (mock for MVP)
    await sendEmail({
      to: email,
      subject: emailTemplates.verificationCode(email, code).subject,
      text: emailTemplates.verificationCode(email, code).text,
      html: emailTemplates.verificationCode(email, code).html
    });

    res.status(201).json({
      message: "Verification code generated and sent to student",
      code: newCode.code, // Only return in development
      expiresAt: newCode.expiresAt,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate verification code" });
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
      where: { email, code }
    });

    if (!verification) {
      return res.status(404).json({ error: "Invalid verification code or email" });
    }

    // Check if code is already used
    if (verification.isUsed) {
      return res.status(400).json({ error: "Code already used" });
    }

    // Check if code is expired
    if (new Date() > new Date(verification.expiresAt)) {
      return res.status(400).json({ error: "Verification code has expired" });
    }

    res.json({
      message: "Verification successful",
      valid: true,
      department: verification.department
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
};

// Get all codes (Coordinator only)
export const getCodes = async (req, res) => {
  try {
    const codes = await VerificationCode.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json(codes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch verification codes" });
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
        expiresAt: { [Op.gt]: new Date() } // Not expired
      },
      order: [['createdAt', 'DESC']],
    });

    res.json(codes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch unused codes" });
  }
};