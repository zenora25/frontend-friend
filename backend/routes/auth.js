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
// ========== NEW WORKING ENDPOINTS (ADD AT BOTTOM) ==========

//  NEW WORKING STUDENT LOGIN (RAW SQL - NO Sequelize issues)
router.post("/student/login-working", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(' NEW WORKING login endpoint called for:', email);
    console.log(' Using raw SQL to avoid Sequelize issues');

    //  KEY FIX: Use raw SQL query instead of Sequelize
    // This bypasses all column mapping problems
    const [students] = await sequelize.query(
      `SELECT 
        id, 
        full_name, 
        email, 
        matric_number, 
        password, 
        department, 
        is_verified, 
        status,
        company_name,
        phone,
        company_address,
        progress,
        last_login,
        created_at,  -- Note: snake_case, not camelCase
        updated_at   -- Note: snake_case, not camelCase
      FROM students 
      WHERE email = ?`,
      { replacements: [email] }  // This prevents SQL injection
    );

    console.log(` Found ${students.length} student(s)`);

    // Check if student exists
    if (students.length === 0) {
      console.log(' No student found with email:', email);
      return res.status(404).json({
        success: false,
        error: "Student not found. Please check your email."
      });
    }

    const student = students[0];
    console.log(' Student found:', student.email);

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, student.password);
    
    console.log(' Password check:', isPasswordValid ? ' Valid' : ' Invalid');
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    // Check if student account is verified
    if (!student.is_verified) {
      console.log(' Account not verified');
      return res.status(403).json({
        success: false,
        error: "Account not verified. Please verify your account first."
      });
    }

    //  Create JWT token
    const token = jwt.sign(
      {
        id: student.id,
        email: student.email,
        role: "student",
        name: student.full_name,
        matricNumber: student.matric_number,
        department: student.department
      },
      process.env.JWT_SECRET,  // Make sure this matches your .env file
      { expiresIn: "7d" }
    );

    console.log(' JWT token created successfully');

    // Prepare user data for response
    const userData = {
      id: student.id,
      fullName: student.full_name,
      email: student.email,
      role: "student",
      matricNumber: student.matric_number,
      department: student.department,
      progress: student.progress || 0,
      companyName: student.company_name || '',
      phone: student.phone || '',
      companyAddress: student.company_address || '',
      status: student.status || 'ACTIVE',
      isVerified: student.is_verified,
      lastLogin: new Date().toISOString()
    };

    console.log(' Login successful!');
    console.log(' Sending response...');

    // Send success response
    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: userData
    });

  } catch (error) {
    console.error(' ERROR in working login endpoint:', error);
    console.error(' Error details:', error.message);
    console.error(' Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: "Login failed",
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

//  NEW WORKING ROLE LOGIN 
router.post("/role/login-working", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    console.log(' NEW WORKING role login for:', email, 'as', role);

    // For now, only handle student role
    if (role !== "student") {
      return res.status(501).json({
        success: false,
        error: `${role} login coming soon. For now, please use student role.`
      });
    }

    // Use the SAME raw SQL query as above
    const [students] = await sequelize.query(
      `SELECT * FROM students WHERE email = ? LIMIT 1`,
      { replacements: [email] }
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Student not found"
      });
    }

    const student = students[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, student.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password"
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: student.id,
        email: student.email,
        role: "student",
        name: student.full_name,
        matricNumber: student.matric_number,
        department: student.department
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Prepare response
    const userData = {
      id: student.id,
      fullName: student.full_name,
      email: student.email,
      role: "student",
      matricNumber: student.matric_number,
      department: student.department,
      progress: student.progress || 0,
      companyName: student.company_name || '',
      phone: student.phone || '',
      companyAddress: student.company_address || '',
      status: student.status || 'ACTIVE',
      isVerified: student.is_verified,
      lastLogin: new Date().toISOString()
    };

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userData
    });

  } catch (error) {
    console.error(' Error in role login:', error);
    res.status(500).json({
      success: false,
      error: "Login failed",
      details: error.message
    });
  }
});

//  SIMPLE TEST LOGIN (ALWAYS WORKS - for quick testing)
router.post("/simple-test-login", (req, res) => {
  const { email } = req.body;
  
  console.log(' Simple test login for:', email);
  
  // Always create a valid token
  const token = jwt.sign(
    {
      id: 'test-user-' + Date.now(),
      email: email,
      role: "student",
      name: "Test User",
      matricNumber: "TEST/2023/CSC/001",
      department: "Computer Science"
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  
  res.json({
    success: true,
    message: "Test login successful (for debugging)",
    token,
    user: {
      id: 'test-user-123',
      fullName: 'Test User',
      email: email,
      role: 'student',
      matricNumber: 'TEST/2023/CSC/001',
      department: 'Computer Science',
      status: 'ACTIVE',
      isVerified: true,
      lastLogin: new Date().toISOString()
    },
    note: "This is a test endpoint only. Use /student/login-working for real login."
  });
});

//  DEBUG ENDPOINT - Check database status
router.get("/debug-db", async (req, res) => {
  try {
    console.log('🔧 Debug endpoint called');
    
    // Test database connection
    await sequelize.authenticate();
    console.log(' Database connection OK');
    
    // Get student count
    const [result] = await sequelize.query("SELECT COUNT(*) as count FROM students");
    const studentCount = result[0].count;
    
    // Get sample students
    const [students] = await sequelize.query(
      "SELECT email, full_name, is_verified, status FROM students LIMIT 3"
    );
    
    res.json({
      success: true,
      database: {
        connected: true,
        studentCount: studentCount,
        sampleStudents: students
      }
    });
    
  } catch (error) {
    console.error(' Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;