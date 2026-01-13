import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import IndustrySupervisor from "../models/industrySupervisor.js";
import Student from "../models/student.js";
import InstitutionSupervisor from "../models/institutionSupervisor.js";
import Hod from "../models/hod.js";
import Coordinator from "../models/siwesCoordinator.js";

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
    const { email, password } = req.body;

    const student = await Student.findOne({ where: { email } });

    if (!student) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid email or password" 
      });
    }

    const isPasswordValid = await student.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid email or password" 
      });
    }

    // Update last login
    student.lastLogin = new Date();
    await student.save();

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
  } catch (err) {
    console.error("Login error:", err);
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

export default router;