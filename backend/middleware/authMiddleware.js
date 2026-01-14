// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import Hod from "../models/hod.js";
import Student from "../models/student.js";
import InstitutionSupervisor from "../models/institutionSupervisor.js";
import IndustrySupervisor from "../models/industrySupervisor.js";
import Coordinator from "../models/siwesCoordinator.js";

const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    
    let user;
    
    // Fetch the actual user from database based on role
    switch (decoded.role) {
      case "student":
        user = await Student.findByPk(decoded.id, {
          attributes: { exclude: ['password'] }
        });
        break;
      case "institutionSupervisor":
        user = await InstitutionSupervisor.findByPk(decoded.id, {
          attributes: { exclude: ['password'] }
        });
        break;
      case "industrySupervisor":
        user = await IndustrySupervisor.findByPk(decoded.id, {
          attributes: { exclude: ['password'] }
        });
        break;
      case "hod":
        user = await Hod.findByPk(decoded.id, {
          attributes: { exclude: ['password'] }
        });
        break;
      case "siwesCoordinator":
        user = await Coordinator.findByPk(decoded.id, {
          attributes: { exclude: ['password'] }
        });
        break;
      default:
        return res.status(401).json({ error: "Invalid user role" });
    }

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Attach both decoded token info and database user
    req.user = {
      ...decoded,
      ...user.toJSON() // Include all user data from database
    };

    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

export default protect;