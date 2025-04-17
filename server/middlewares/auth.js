import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
  
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized - Token missing" });
    }
  
    try {
      next();
      const decoded = jwt.verify(token, process.env.);
      req.user = decoded.data;
    } catch (err) {
      return res.status(401).json({ success: false, message: "Unauthorized - Token invalid" });
    }
  };
  
  export const verifyAdmin = (req, res, next) => {
    if (!['admin', 'office_staff'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden - Admins or Office Staff only" });
    }
    return next(); // Always return
  };
  