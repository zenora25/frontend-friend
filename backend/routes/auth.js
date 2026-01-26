import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import IndustrySupervisor from "../models/industrySupervisor.js";
import Student from "../models/student.js";
import InstitutionSupervisor from "../models/institutionSupervisor.js";
import Hod from "../models/hod.js";
import Coordinator from "../models/siwesCoordinator.js";
import protect from "../middleware/authMiddleware.js";
import { uploadProfile } from "../utils/upload.js";

const router = express.Router();

// Login for all roles
router.post("/role/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: "Email, password, and role are required"
      });
    }

    let user;
    let userModel;

    switch (role) {
      case "student":
        userModel = Student;
        break;
      case "institutionSupervisor":
        userModel = InstitutionSupervisor;
        break;
      case "industrySupervisor":
        userModel = IndustrySupervisor;
        break;
      case "hod":
        userModel = Hod;
        break;
      case "siwesCoordinator":
        userModel = Coordinator;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: "Invalid role specified"
        });
    }

    user = await userModel.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: role,
        name: user.fullName,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Prepare user data for response
    const userData = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: role,
    };

    // Add role-specific fields
    if (role === "student") {
      userData.matricNumber = user.matricNumber;
      userData.department = user.department;
      userData.progress = user.progress;
      userData.companyName = user.companyName;
    } else if (role === "institutionSupervisor") {
      userData.department = user.department;
      userData.title = user.title;
    } else if (role === "industrySupervisor") {
      userData.companyName = user.companyName;
      userData.position = user.position;
      userData.companyAddress = user.companyAddress;
    } else if (role === "hod") {
      userData.department = user.department;
    }

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      error: "Login failed",
      details: err.message
    });
  }
});

// Student registration
router.post("/student/signup", async (req, res) => {
  try {
    const {
      fullName,
      email,
      verificationCode,
      password,
      matricNumber,
      department,
      phone,
      companyName,
      companyAddress
    } = req.body;

    // Check required fields
    if (!fullName || !email || !password || !matricNumber || !department) {
      return res.status(400).json({
        success: false,
        error: "All required fields must be provided"
      });
    }

    // Check if email already exists
    const existingStudent = await Student.findOne({ where: { email } });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        error: "Email already registered"
      });
    }

    // Check if matric number exists
    const existingMatric = await Student.findOne({ where: { matricNumber } });
    if (existingMatric) {
      return res.status(400).json({
        success: false,
        error: "Matric number already registered"
      });
    }

    const student = await Student.create({
      fullName,
      email,
      password,
      matricNumber,
      department,
      phone,
      companyName,
      companyAddress,
      verificationCode,
      isVerified: true,
      status: 'ACTIVE'
    });

    // Generate token
    const token = jwt.sign(
      {
        id: student.id,
        email: student.email,
        role: "student",
        name: student.fullName,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      token,
      user: {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        role: "student",
        matricNumber: student.matricNumber,
        department: student.department,
        progress: student.progress,
        companyName: student.companyName
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      success: false,
      error: "Registration failed",
      details: err.message
    });
  }
});

// Student login
router.post("/student/login", async (req, res) => {
  try {
    console.log("Student login attempt started"); // Debug log
    const { email, password } = req.body;
    console.log("Request body:", { email, passwordReceived: !!password }); // Debug log

    const student = await Student.findOne({ where: { email } });
    console.log("Student found:", !!student); // Debug log

    if (!student) {
      console.log("Student not found for email:", email); // Debug log
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    const isPasswordValid = await student.comparePassword(password);
    console.log("Password valid:", isPasswordValid); // Debug log

    if (!isPasswordValid) {
      console.log("Invalid password for student:", email); // Debug log
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    // Update last login
    console.log("Updating last login..."); // Debug log
    student.lastLogin = new Date();
    await student.save();
    console.log("Last login updated."); // Debug log

    const token = jwt.sign(
      {
        id: student.id,
        email: student.email,
        role: "student",
        name: student.fullName,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );
    console.log("Token generated."); // Debug log

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        role: "student",
        matricNumber: student.matricNumber,
        department: student.department,
        progress: student.progress,
        companyName: student.companyName,
        status: student.status
      },
    });
    console.log("Login successful response sent."); // Debug log
  } catch (err) {
    console.error("Login error:", err);
    console.error("Stack trace:", err.stack); // Debug log
    res.status(500).json({
      success: false,
      error: "Login failed",
      details: err.message
    });
  }
});

// Verify token
router.get("/verify", (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No token provided"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

    res.json({
      success: true,
      user: decoded,
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      error: "Invalid or expired token"
    });
  }
});

// Get current user profile
router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No token provided"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

    let user;
    const { role, id } = decoded;

    switch (role) {
      case "student":
        user = await Student.findByPk(id, {
          attributes: { exclude: ['password'] }
        });
        break;
      case "institutionSupervisor":
        user = await InstitutionSupervisor.findByPk(id, {
          attributes: { exclude: ['password'] }
        });
        break;
      case "industrySupervisor":
        user = await IndustrySupervisor.findByPk(id, {
          attributes: { exclude: ['password'] }
        });
        break;
      case "hod":
        user = await Hod.findByPk(id, {
          attributes: { exclude: ['password'] }
        });
        break;
      case "siwesCoordinator":
        user = await Coordinator.findByPk(id, {
          attributes: { exclude: ['password'] }
        });
        break;
      default:
        return res.status(400).json({
          success: false,
          error: "Invalid role"
        });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch profile"
    });
  }
});

// Update current user profile
router.put("/profile", protect, uploadProfile, async (req, res) => {
  try {
    const { id, role } = req.user;
    const { fullName, phone, companyName, companyAddress, department } = req.body;

    let userModel;
    switch (role) {
      case "student": userModel = Student; break;
      case "institutionSupervisor": userModel = InstitutionSupervisor; break;
      case "industrySupervisor": userModel = IndustrySupervisor; break;
      case "hod": userModel = Hod; break;
      case "siwesCoordinator": userModel = Coordinator; break;
      default: return res.status(400).json({ success: false, error: "Invalid role" });
    }

    const user = await userModel.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Update common fields
    if (fullName) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (department && role !== 'student') user.department = department;

    // Role specific fields
    if (role === 'student' || role === 'industrySupervisor') {
      if (companyName) user.companyName = companyName;
      if (companyAddress) user.companyAddress = companyAddress;
    }

    // Handle profile image upload
    if (req.file) {
      user.profileImage = `/uploads/profiles/${req.file.filename}`;
    }

    await user.save();

    // Prepare clean response
    const userJson = user.toJSON();
    delete userJson.password;

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        ...userJson,
        role // Ensure role is returned
      }
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update profile",
      details: err.message
    });
  }
});

export default router;