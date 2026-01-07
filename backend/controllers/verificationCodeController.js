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

    console.log('🔵 Generate code request:', { email, department, coordinatorId });

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

    console.log('✅ Code generated successfully:', { code, email, expiresAt });

    res.status(201).json({
      message: "Verification code generated successfully",
      code: newCode.code,
      expiresAt: newCode.expiresAt,
      email: newCode.email,
      department: newCode.department,
    });
  } catch (err) {
    console.error("❌ Generate code error:", err);
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

    console.log('\n🔍 ========== VERIFICATION REQUEST ==========');
    console.log('📧 Email received:', email);
    console.log('🔑 Code received:', code);
    console.log('📝 Email type:', typeof email);
    console.log('📝 Code type:', typeof code);
    console.log('📝 Email length:', email?.length);
    console.log('📝 Code length:', code?.length);
    console.log('📝 Email trimmed:', email?.trim());
    console.log('📝 Code trimmed:', code?.trim());
    console.log('📝 Code uppercase:', code?.toUpperCase());

    if (!email || !code) {
      console.log('❌ Missing email or code');
      return res.status(400).json({ error: "Email and code required" });
    }

    // Clean the inputs
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim().toUpperCase();

    console.log('🧹 Cleaned email:', cleanEmail);
    console.log('🧹 Cleaned code:', cleanCode);

    // First, let's see all codes in database
    const allCodes = await VerificationCode.findAll({
      attributes: ['id', 'code', 'email', 'isUsed', 'expiresAt'],
      limit: 10
    });

    console.log('\n📊 All verification codes in database:');
    allCodes.forEach(c => {
      console.log(`  - ID: ${c.id}, Code: ${c.code}, Email: ${c.email}, Used: ${c.isUsed}, Expires: ${c.expiresAt}`);
    });

    // Now try to find the specific code
    console.log('\n🔍 Searching for verification code with:');
    console.log('  - email:', cleanEmail);
    console.log('  - code:', cleanCode);
    console.log('  - isUsed: false');

    const verification = await VerificationCode.findOne({
      where: {
        email: cleanEmail,
        code: cleanCode,
        isUsed: false,
      },
    });

    console.log('\n📋 Query result:', verification ? 'FOUND ✅' : 'NOT FOUND ❌');

    if (verification) {
      console.log('✅ Verification code details:');
      console.log('  - ID:', verification.id);
      console.log('  - Code:', verification.code);
      console.log('  - Email:', verification.email);
      console.log('  - Is Used:', verification.isUsed);
      console.log('  - Expires At:', verification.expiresAt);
      console.log('  - Department:', verification.department);
    } else {
      console.log('❌ Code not found. Possible reasons:');
      console.log('  1. Code does not exist');
      console.log('  2. Email mismatch');
      console.log('  3. Code already used (isUsed = true)');
      console.log('  4. Case sensitivity issue');

      // Check if code exists with different email
      const codeWithDifferentEmail = await VerificationCode.findOne({
        where: { code: cleanCode }
      });

      if (codeWithDifferentEmail) {
        console.log('⚠️  Code exists but with different email:');
        console.log('   Expected:', cleanEmail);
        console.log('   Found:', codeWithDifferentEmail.email);
      }

      // Check if email exists with different code
      const emailWithDifferentCode = await VerificationCode.findOne({
        where: { email: cleanEmail, isUsed: false }
      });

      if (emailWithDifferentCode) {
        console.log('⚠️  Email has a different code:');
        console.log('   Expected:', cleanCode);
        console.log('   Found:', emailWithDifferentCode.code);
      }
    }

    if (!verification) {
      console.log('❌ Returning error: Invalid verification code or email\n');
      return res.status(400).json({
        error: "Invalid verification code or email"
      });
    }

    // Check if code is expired
    const now = new Date();
    const expiryDate = new Date(verification.expiresAt);

    console.log('⏰ Checking expiration:');
    console.log('  - Now:', now);
    console.log('  - Expires:', expiryDate);
    console.log('  - Is Expired:', now > expiryDate);

    if (now > expiryDate) {
      console.log('❌ Code has expired, deleting...');
      await VerificationCode.destroy({ where: { id: verification.id } });
      return res.status(400).json({ error: "Verification code has expired" });
    }

    console.log('✅ Verification successful!\n');
    console.log('========================================\n');

    res.json({
      message: "Verification successful",
      valid: true,
      department: verification.department,
      email: verification.email,
    });
  } catch (err) {
    console.error("❌ Verify code error:", err);
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