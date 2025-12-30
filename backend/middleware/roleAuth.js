import jwt from "jsonwebtoken";

// Higher-order function to check user role
export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: "Authentication required" });
            }

            const userRole = req.user.role;

            // Convert single role to array for consistency
            const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

            if (!rolesArray.includes(userRole)) {
                return res.status(403).json({
                    error: `Access denied. Required roles: ${rolesArray.join(', ')}`
                });
            }

            next();
        } catch (err) {
            console.error("Role auth error:", err);
            res.status(500).json({ error: "Authorization failed" });
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