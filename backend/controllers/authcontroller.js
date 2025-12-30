import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Student from "../models/student.js";
import InstitutionSupervisor from "../models/institutionSupervisor.js";
import IndustrySupervisor from "../models/industrySupervisor.js";
import HOD from "../models/hod.js";
import SIWESCoordinator from "../models/siwesCoordinator.js";
import VerificationCode from "../models/VerificationCode.js";
import Department from "../models/department.js";

// -----------------------------------
// 🔐 Generate JWT Token
// -----------------------------------
const generateToken = (user, role) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// -----------------------------------
// 🧑‍🎓 Student Signup
// -----------------------------------
const studentSignup = async (req, res) => {
  try {
    const { fullName, email, verificationCode, password, matricNumber, department, companyName, companyAddress } = req.body;

    if (!fullName || !email || !verificationCode || !password || !matricNumber || !department || !companyName || !companyAddress) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const codeExists = await VerificationCode.findOne({
      where: { email, code: verificationCode },
    });

    if (!codeExists) {
      return res.status(400).json({ error: "Invalid or expired verification code" });
    }

    const existingStudent = await Student.findOne({ where: { email } });
    if (existingStudent) {
      return res.status(400).json({ error: "Student already registered" });
    }

    const existingMatric = await Student.findOne({ where: { matricNumber } });
    if (existingMatric) {
      return res.status(400).json({ error: "Matric number already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      fullName,
      email,
      matricNumber,
      department,
      companyName,
      companyAddress,
      password: hashedPassword,
      isVerified: true,
    });

    // Delete used verification code
    await VerificationCode.destroy({ where: { email, code: verificationCode } });

    const token = generateToken(student, "student");

    res.status(201).json({
      message: "Student registered successfully",
      token,
      user: {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        matricNumber: student.matricNumber,
        department: student.department,
        companyName: student.companyName,
        companyAddress: student.companyAddress,
        role: "student",
      },
    });

  } catch (err) {
    console.error("Student signup error:", err);
    res.status(500).json({ error: "Student signup failed", details: err.message });
  }
};

// -----------------------------------
// 🔐 Login for supervisors, HOD, SIWES, etc.
// -----------------------------------
const roleLogin = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Email, password & role required" });
    }

    let UserModel;

    switch (role) {
      case "institutionSupervisor":
        UserModel = InstitutionSupervisor;
        break;
      case "industrySupervisor":
        UserModel = IndustrySupervisor;
        break;
      case "hod":
        UserModel = HOD;
        break;
      case "siwesCoordinator":
        UserModel = SIWESCoordinator;
        break;
      default:
        return res.status(400).json({ error: "Invalid role" });
    }

    const user = await UserModel.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ error: "Incorrect password" });

    const token = generateToken(user, role);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role,
        department: user.department,
      },
    });

  } catch (err) {
    console.error("Role login error:", err);
    res.status(500).json({ error: "Login failed", details: err.message });
  }
};

// -----------------------------------
// 🧑‍🎓 Student Login (Separate Endpoint)
// -----------------------------------
const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const student = await Student.findOne({ where: { email } });
    if (!student) return res.status(400).json({ error: "Student not found" });

    if (!student.isVerified) {
      return res.status(403).json({ error: "Account not verified. Please complete verification." });
    }

    const validPassword = await bcrypt.compare(password, student.password);
    if (!validPassword)
      return res.status(401).json({ error: "Incorrect password" });

    const token = generateToken(student, "student");

    res.json({
      message: "Login successful",
      token,
      user: {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        matricNumber: student.matricNumber,
        department: student.department,
        companyName: student.companyName,
        companyAddress: student.companyAddress,
        role: "student",
      },
    });

  } catch (err) {
    console.error("Student login error:", err);
    res.status(500).json({ error: "Student login failed", details: err.message });
  }
};

// -----------------------------------
// 📩 Verify Student Email (Code Check)
// -----------------------------------
const verifyStudentEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email and code required" });
    }

    const record = await VerificationCode.findOne({ 
      where: { email, code } 
    });

    if (!record) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    // Check if code has expired (24 hours)
    const now = new Date();
    const codeCreatedAt = new Date(record.createdAt);
    const hoursDiff = (now - codeCreatedAt) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      await VerificationCode.destroy({ where: { email, code } });
      return res.status(400).json({ error: "Verification code has expired" });
    }

    // Check if student already registered
    const existingStudent = await Student.findOne({ where: { email } });
    if (existingStudent) {
      return res.status(400).json({ error: "Student already registered" });
    }

    res.json({ 
      message: "Verification successful",
      email,
      code,
    });

  } catch (err) {
    console.error("Email verification error:", err);
    res.status(500).json({ error: "Verification failed", details: err.message });
  }
};

// -----------------------------------
// 🔎 Verify Token
// -----------------------------------
const verifyToken = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ error: "No user data found" });

    const { id, role } = req.user;

    let userData;

    switch (role) {
      case "student":
        userData = await Student.findByPk(id, { 
          attributes: { exclude: ["password"] } 
        });
        break;
      case "institutionSupervisor":
        userData = await InstitutionSupervisor.findByPk(id, { 
          attributes: { exclude: ["password"] } 
        });
        break;
      case "industrySupervisor":
        userData = await IndustrySupervisor.findByPk(id, { 
          attributes: { exclude: ["password"] } 
        });
        break;
      case "hod":
        userData = await HOD.findByPk(id, { 
          attributes: { exclude: ["password"] } 
        });
        break;
      case "siwesCoordinator":
        userData = await SIWESCoordinator.findByPk(id, { 
          attributes: { exclude: ["password"] } 
        });
        break;
      default:
        return res.status(400).json({ error: "Invalid role" });
    }

    if (!userData)
      return res.status(404).json({ error: "User not found" });

    res.json({
      message: "Token is valid",
      user: { ...userData.toJSON(), role },
    });

  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ error: "Token verification failed", details: error.message });
  }
};

// -----------------------------------
// 🧑‍💼 Register any supervisor role
// -----------------------------------
const registerRole = async (req, res) => {
  try {
    const { fullName, email, password, role, department } = req.body;

    if (!fullName || !email || !password || !role || !department)
      return res.status(400).json({ error: "All fields required" });

    let UserModel;

    switch (role) {
      case "institutionSupervisor":
        UserModel = InstitutionSupervisor;
        break;
      case "industrySupervisor":
        UserModel = IndustrySupervisor;
        break;
      case "hod":
        UserModel = HOD;
        break;
      case "siwesCoordinator":
        UserModel = SIWESCoordinator;
        break;
      default:
        return res.status(400).json({ error: "Invalid role" });
    }

    const existingUser = await UserModel.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "User already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      fullName,
      email,
      department,
      password: hashedPassword,
    });

    const token = generateToken(user, role);

    res.status(201).json({
      message: `${role} registered successfully`,
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role,
        department: user.department,
      },
    });

  } catch (err) {
    console.error("Role registration error:", err);
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
};

// -----------------------------------
// 👤 Get User Profile
// -----------------------------------
const getProfile = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ error: "No user data found" });

    const { id, role } = req.user;

    let userData;

    switch (role) {
      case "student":
        userData = await Student.findByPk(id, { 
          attributes: { exclude: ["password"] } 
        });
        break;
      case "institutionSupervisor":
        userData = await InstitutionSupervisor.findByPk(id, { 
          attributes: { exclude: ["password"] } 
        });
        break;
      case "industrySupervisor":
        userData = await IndustrySupervisor.findByPk(id, { 
          attributes: { exclude: ["password"] } 
        });
        break;
      case "hod":
        userData = await HOD.findByPk(id, { 
          attributes: { exclude: ["password"] } 
        });
        break;
      case "siwesCoordinator":
        userData = await SIWESCoordinator.findByPk(id, { 
          attributes: { exclude: ["password"] } 
        });
        break;
      default:
        return res.status(400).json({ error: "Invalid role" });
    }

    if (!userData)
      return res.status(404).json({ error: "User not found" });

    res.json({
      message: "Profile retrieved successfully",
      user: { ...userData.toJSON(), role },
    });

  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to get profile", details: error.message });
  }
};

// -----------------------------------
// 🔄 Check Auth Status
// -----------------------------------
const checkAuth = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ authenticated: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded) {
      return res.status(401).json({ authenticated: false });
    }

    const { id, role } = decoded;

    let userExists = false;

    switch (role) {
      case "student":
        userExists = await Student.findByPk(id);
        break;
      case "institutionSupervisor":
        userExists = await InstitutionSupervisor.findByPk(id);
        break;
      case "industrySupervisor":
        userExists = await IndustrySupervisor.findByPk(id);
        break;
      case "hod":
        userExists = await HOD.findByPk(id);
        break;
      case "siwesCoordinator":
        userExists = await SIWESCoordinator.findByPk(id);
        break;
    }

    if (!userExists) {
      return res.status(401).json({ authenticated: false });
    }

    res.json({ authenticated: true, user: decoded });

  } catch (error) {
    console.error("Check auth error:", error);
    res.status(401).json({ authenticated: false });
  }
};

// -----------------------------------
// 📤 Export ALL Controllers Cleanly
// -----------------------------------
export {
  studentSignup,
  studentLogin,
  roleLogin,
  verifyStudentEmail,
  verifyToken,
  registerRole,
  getProfile,
  checkAuth,
};