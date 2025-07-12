import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Authorization: Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized - Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode token
    req.user = decoded; // Attach decoded data (including role) to req.user
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized - Token invalid" });
  }
};


export const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: "Forbidden - Admins only" });
  }
  return next(); // Proceed to the next middleware or route handler
};

export const verifyStaff = (req, res, next) => {
  if (req.user.role !== 'office_staff') {
    return res.status(403).json({ success: false, message: "Forbidden - Office Staff only" });
  }
  return next(); // Proceed to the next middleware or route handler
};
