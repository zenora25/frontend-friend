import jwt from 'jsonwebtoken';
import Student from '../models/student.js';
import InstitutionSupervisor from '../models/institutionSupervisor.js';
import IndustrySupervisor from '../models/industrySupervisor.js';
import HOD from '../models/hod.js';
import SIWESCoordinator from '../models/siwesCoordinator.js';
import VerificationCode from '../models/VerificationCode.js';

// Generate JWT token
const generateToken = (id, role, email, fullName, department) => {
  return jwt.sign(
    { id, role, email, fullName, department },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Student registration with verification code
export const studentSignup = async (req, res) => {
  try {
    const {
      fullName,
      email,
      verificationCode,
      password,
      matricNumber,
      department,
      companyName,
      companyAddress
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !verificationCode || !password || !matricNumber || !department || !companyName || !companyAddress) {
      return res.status(400).json({
        error: 'All fields are required'
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ where: { email: email.toLowerCase() } });
    if (existingStudent) {
      return res.status(400).json({
        error: 'Student with this email already exists'
      });
    }

    // Enforce @bazeuniversity.edu.ng domain
    if (!email.toLowerCase().endsWith('@bazeuniversity.edu.ng')) {
      return res.status(400).json({
        error: 'Student registration requires a @bazeuniversity.edu.ng email address'
      });
    }

    // Check if matric number already exists
    const existingMatric = await Student.findOne({ where: { matricNumber } });
    if (existingMatric) {
      return res.status(400).json({
        error: 'Student with this matric number already exists'
      });
    }

    // Verify the verification code
    const codeRecord = await VerificationCode.findOne({
      where: {
        code: verificationCode.toUpperCase(),
        email: email.toLowerCase()
      }
    });

    if (!codeRecord) {
      return res.status(400).json({
        error: 'Invalid verification code or email'
      });
    }

    if (codeRecord.isUsed) {
      return res.status(400).json({
        error: 'Verification code has already been used'
      });
    }

    if (codeRecord.expiresAt < new Date()) {
      return res.status(400).json({
        error: 'Verification code has expired'
      });
    }

    if (codeRecord.department !== department) {
      return res.status(400).json({
        error: 'Verification code is not valid for this department'
      });
    }

    // Create student
    const student = await Student.create({
      fullName,
      email: email.toLowerCase(),
      password,
      matricNumber,
      department,
      companyName,
      companyAddress,
      isVerified: true,
      verificationCodeUsed: true
    });

    // Mark verification code as used
    codeRecord.isUsed = true;
    await codeRecord.save();

    // Generate token
    const token = generateToken(
      student.id,
      'student',
      student.email,
      student.fullName,
      student.department
    );

    // Remove password from response
    const studentResponse = student.toJSON();
    delete studentResponse.password;

    res.status(201).json({
      message: 'Student registered successfully',
      token,
      user: studentResponse
    });
  } catch (err) {
    console.error('Student signup error:', err);
    res.status(500).json({
      error: 'Failed to register student',
      details: err.message
    });
  }
};

// Student login
export const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Find student
    const student = await Student.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!student) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Check if student is verified
    if (!student.isVerified) {
      return res.status(401).json({
        error: 'Account not verified. Please contact your coordinator'
      });
    }

    // Check password
    const isPasswordValid = await student.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(
      student.id,
      'student',
      student.email,
      student.fullName,
      student.department
    );

    // Remove password from response
    const studentResponse = student.toJSON();
    delete studentResponse.password;

    res.json({
      message: 'Login successful',
      token,
      user: studentResponse
    });
  } catch (err) {
    console.error('Student login error:', err);
    res.status(500).json({
      error: 'Failed to login',
      details: err.message
    });
  }
};

// Role-based login (for staff)
export const roleLogin = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        error: 'Email, password, and role are required'
      });
    }

    let user;
    let userRole;

    // Find user based on role
    switch (role) {
      case 'institutionSupervisor':
        user = await InstitutionSupervisor.findOne({
          where: { email: email.toLowerCase() }
        });
        userRole = 'institutionSupervisor';
        break;

      case 'industrySupervisor':
        user = await IndustrySupervisor.findOne({
          where: { email: email.toLowerCase() }
        });
        userRole = 'industrySupervisor';
        break;

      case 'hod':
        user = await HOD.findOne({
          where: { email: email.toLowerCase() }
        });
        userRole = 'hod';
        break;

      case 'siwesCoordinator':
        user = await SIWESCoordinator.findOne({
          where: { email: email.toLowerCase() }
        });
        userRole = 'siwesCoordinator';
        break;

      default:
        return res.status(400).json({
          error: 'Invalid role specified'
        });
    }

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(
      user.id,
      userRole,
      user.email,
      user.fullName,
      user.department || null
    );

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Role login error:', err);
    res.status(500).json({
      error: 'Failed to login',
      details: err.message
    });
  }
};

// Register staff (coordinator can register other staff)
export const registerStaff = async (req, res) => {
  try {
    const { fullName, email, password, role, department } = req.body;

    if (!fullName || !email || !password || !role || !department) {
      return res.status(400).json({
        error: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingUser = await getModelByRole(role).findOne({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(400).json({
        error: `${role} with this email already exists`
      });
    }

    // Create user based on role
    let user;
    switch (role) {
      case 'institutionSupervisor':
        user = await InstitutionSupervisor.create({
          fullName,
          email: email.toLowerCase(),
          password,
          department
        });
        break;

      case 'hod':
        user = await HOD.create({
          fullName,
          email: email.toLowerCase(),
          password,
          department
        });
        break;

      default:
        return res.status(400).json({
          error: 'Invalid role for registration'
        });
    }

    // Generate token
    const token = generateToken(
      user.id,
      role,
      user.email,
      user.fullName,
      user.department
    );

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({
      message: `${role} registered successfully`,
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Staff registration error:', err);
    res.status(500).json({
      error: 'Failed to register staff',
      details: err.message
    });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const { id, role } = req.user;

    let user;
    switch (role) {
      case 'student':
        user = await Student.findByPk(id, {
          attributes: { exclude: ['password'] }
        });
        break;

      case 'institutionSupervisor':
        user = await InstitutionSupervisor.findByPk(id, {
          attributes: { exclude: ['password'] }
        });
        break;

      case 'industrySupervisor':
        user = await IndustrySupervisor.findByPk(id, {
          attributes: { exclude: ['password'] }
        });
        break;

      case 'hod':
        user = await HOD.findByPk(id, {
          attributes: { exclude: ['password'] }
        });
        break;

      case 'siwesCoordinator':
        user = await SIWESCoordinator.findByPk(id, {
          attributes: { exclude: ['password'] }
        });
        break;

      default:
        return res.status(400).json({
          error: 'Invalid user role'
        });
    }

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      user
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({
      error: 'Failed to get profile',
      details: err.message
    });
  }
};

// Verify token
export const verifyToken = (req, res) => {
  res.json({
    message: 'Token is valid',
    user: req.user
  });
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { id, role } = req.user;
    const { fullName, phone, profileImage, companyName, companyAddress, department } = req.body;

    const Model = getModelByRole(role);
    const user = await Model.findByPk(id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Update common fields
    if (fullName) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (profileImage !== undefined) user.profileImage = profileImage;
    if (department && role !== 'student') user.department = department;

    // Update role-specific fields
    if (role === 'student') {
      if (companyName) user.companyName = companyName;
      if (companyAddress) user.companyAddress = companyAddress;
    }

    await user.save();

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({
      error: 'Failed to update profile',
      details: err.message
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { id, role } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current and new passwords are required'
      });
    }

    const Model = getModelByRole(role);
    const user = await Model.findByPk(id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Incorrect current password'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully'
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({
      error: 'Failed to change password',
      details: err.message
    });
  }
};

// Helper function to get model by role
const getModelByRole = (role) => {
  switch (role) {
    case 'student':
      return Student;
    case 'institutionSupervisor':
      return InstitutionSupervisor;
    case 'industrySupervisor':
      return IndustrySupervisor;
    case 'hod':
      return HOD;
    case 'siwesCoordinator':
      return SIWESCoordinator;
    default:
      throw new Error('Invalid role');
  }
};

export default {
  studentSignup,
  studentLogin,
  roleLogin,
  registerStaff,
  getProfile,
  verifyToken
};