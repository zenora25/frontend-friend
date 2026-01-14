// middleware/hodAuth.js
import HOD from "../models/hod.js";

const requireHOD = async (req, res, next) => {
  try {
    if (req.user.role !== "hod") {
      return res.status(403).json({ 
        error: "Access denied. HOD role required" 
      });
    }

    // Fetch HOD from database to get department
    const hod = await HOD.findByPk(req.user.id, {
      attributes: ['id', 'fullName', 'email', 'department']
    });

    if (!hod) {
      return res.status(404).json({ 
        error: "HOD profile not found" 
      });
    }

    // Add HOD data to request
    req.hod = hod;
    
    // Make sure user has department info
    req.user = {
      ...req.user,
      department: hod.department
    };

    next();
  } catch (error) {
    console.error("HOD auth error:", error);
    res.status(500).json({ 
      error: "Authentication error" 
    });
  }
};

export default requireHOD;