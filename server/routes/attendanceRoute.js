import express from "express";
import { markAttendanceBulk, getAttendanceReport} from "../controllers/attendanceController.js";

const router = express.Router();

// Mark bulk attendance
router.post("/mark-attendance-bulk", markAttendanceBulk);
router.get("/attendance-report", getAttendanceReport);

export default router;
