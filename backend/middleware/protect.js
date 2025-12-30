import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    let token;

    // Authorization: Bearer xxxxx
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // No token found
    if (!token) {
      return res.status(401).json({
        error: "Not authorized. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user info (id + role) to request object
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.status(401).json({
      error: "Not authorized. Invalid or expired token.",
    });
  }
};
