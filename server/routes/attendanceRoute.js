import express from "express";
import { markAttendanceBulk, getAttendanceReport} from "../controllers/attendanceController.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// Mark bulk attendance
router.post("/mark-attendance-bulk",verifyToken, markAttendanceBulk);
router.get("/attendance-report", verifyToken, getAttendanceReport);

export default router;
