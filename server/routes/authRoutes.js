import express from "express";
import {
  login,
  verifyStudent,
  verifyAdmin,
  checkUserStatus,
  verifyStaff,
} from "../controllers/authController.js";
import { forgotPassword } from "../controllers/forgetPassword.js";
import { resetPassword } from "../controllers/resetPassword.js";
import { verifyToken, verifyAdmin as isAdmin} from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", login);

router.get("/verifystudent", verifyToken, verifyStudent,  (req, res) => {
  res.status(200).json({ success: true, message: "Student verified" });
});
router.get("/verifyadmin", verifyToken, verifyAdmin, (req, res) => {
  res.status(200).json({ success: true, message: "Admin verified" });
});
router.get("/verifystaff", verifyToken, verifyStaff, (req, res) => {
  res.status(200).json({ success: true, message: "Staff verified" });
});

router.post("/forgot-password", forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post("/check-status", checkUserStatus);

export default router;
