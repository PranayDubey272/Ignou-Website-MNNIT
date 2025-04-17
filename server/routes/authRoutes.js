import express from "express";
import {
  login,
  verifyStudent,
  verifyAdmin,
  checkUserStatus,
} from "../controllers/authController.js";
import { forgotPassword } from "../controllers/forgetPassword.js";
import { resetPassword } from "../controllers/resetPassword.js";
import { verifyToken, verifyAdmin as isAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", login);
router.get("/verifystudent", verifyToken, verifyStudent);
router.get("/verifyadmin", verifyToken, verifyAdmin);
router.post("/forgot-password", forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post("/check-status", checkUserStatus);

export default router;
