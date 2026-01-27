// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import Hod from "../models/hod.js";
import Student from "../models/student.js";
import InstitutionSupervisor from "../models/institutionSupervisor.js";
import IndustrySupervisor from "../models/industrySupervisor.js";
import Coordinator from "../models/siwesCoordinator.js";

const protect = async (req, res, next) => {
  console.log(" Auth Middleware - Checking authentication");

  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(" No token found in Authorization header");
    return res.status(401).json({
      success: false,
      error: "Not authorized, no token provided"
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    console.log(" Token is empty");
    return res.status(401).json({
      success: false,
      error: "Not authorized, no token"
    });
  }

  try {
    console.log(" Verifying JWT token...");

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key-change-this");
    console.log(" Token decoded successfully:", decoded);

    let user;

    // Fetch the actual user from database based on role
    switch (decoded.role) {
      case "student":
        console.log(" Looking for student with ID:", decoded.id);
        user = await Student.findByPk(decoded.id, {
          attributes: ["id", "fullName", "email", "matricNumber", "department", "companyName", "profileImage", "password"]
        });

        break;
      case "institutionSupervisor":
        console.log(" Looking for institution supervisor with ID:", decoded.id);
        user = await InstitutionSupervisor.findByPk(decoded.id, {
          attributes: ["id", "fullName", "email", "department", "profileImage", "password"]
        });

        break;

      case "industrySupervisor":
        console.log(" Looking for industry supervisor with ID:", decoded.id);
        user = await IndustrySupervisor.findByPk(decoded.id, {
          attributes: ["id", "fullName", "email", "companyName", "profileImage", "password"]
        });
        break;
      case "hod":
        console.log("🎓 Looking for HOD with ID:", decoded.id);
        user = await Hod.findByPk(decoded.id, {
          attributes: ["id", "fullName", "email", "department", "profileImage", "password"]
        });
        break;
      case "siwesCoordinator":
        console.log(" Looking for coordinator with ID:", decoded.id);
        user = await Coordinator.findByPk(decoded.id, {
          attributes: ["id", "fullName", "email", "department", "password"]
        });
        break;
      default:
        console.log(" Invalid user role in token:", decoded.role);
        return res.status(401).json({
          success: false,
          error: "Invalid user role"
        });
    }

    if (!user) {
      console.log(" User not found in database");
      return res.status(401).json({
        success: false,
        error: "User not found"
      });
    }

    console.log(" User found:", user.email, "Role:", decoded.role);

    // Create a clean user object for req.user
    const userData = user.toJSON ? user.toJSON() : user;

    // Attach user info to request
    req.user = {
      id: userData.id,
      email: userData.email,
      fullName: userData.fullName,
      role: decoded.role,
      department: userData.department || null,
      profileImage: userData.profileImage || null,
      // Add any other important fields
      ...(userData.matricNumber && { matricNumber: userData.matricNumber }),
      ...(userData.phone && { phone: userData.phone }),
      ...(userData.companyName && { companyName: userData.companyName }),
    };

    console.log(" req.user set:", req.user);
    next();
  } catch (err) {
    console.error(" JWT Error:", err.message);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: "Invalid token"
      });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: "Token expired"
      });
    } else {
      return res.status(500).json({
        success: false,
        error: "Authentication failed"
      });
    }
  }
};

export default protect;