// middleware/roleAuth.js

// Higher-order function to check user role
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      console.log(" Role Authorization Check:");
      console.log("- Request user:", req.user);
      console.log("- Allowed roles:", allowedRoles);

      if (!req.user) {
        console.log(" No user in request");
        return res.status(401).json({ 
          success: false,
          error: "Authentication required" 
        });
      }

      const userRole = req.user.role;
      console.log("- User role:", userRole);

      // Convert single role to array for consistency
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      if (!rolesArray.includes(userRole)) {
        console.log(" Access denied. User role not in allowed roles");
        return res.status(403).json({
          success: false,
          error: `Access denied. Required roles: ${rolesArray.join(', ')}`,
          userRole: userRole,
          requiredRoles: rolesArray
        });
      }

      console.log(" Role authorization passed");
      next();
    } catch (err) {
      console.error(" Role auth error:", err);
      res.status(500).json({ 
        success: false,
        error: "Authorization failed" 
      });
    }
  };
};

// Convenience middleware for specific roles
export const requireStudent = requireRole('student');
export const requireInstitutionSupervisor = requireRole('institutionSupervisor');
export const requireIndustrySupervisor = requireRole('industrySupervisor');
export const requireHOD = requireRole('hod');
export const requireCoordinator = requireRole('siwesCoordinator');

// Middleware for supervisor roles (both institution and industry)
export const requireSupervisor = requireRole(['institutionSupervisor', 'industrySupervisor']);

// Middleware for admin roles (HOD and Coordinator)
export const requireAdmin = requireRole(['hod', 'siwesCoordinator']);

// Special middleware for dashboard access
export const requireDashboardAccess = requireRole([
  'student', 
  'institutionSupervisor', 
  'industrySupervisor', 
  'hod', 
  'siwesCoordinator'
]);