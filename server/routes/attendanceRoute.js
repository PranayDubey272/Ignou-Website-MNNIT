import express from "express";
import { markAttendanceBulk, getAttendanceByCourseAndDate } from "../controllers/attendanceController.js";

const router = express.Router();

// Mark bulk attendance
router.post("/mark-attendance-bulk", markAttendanceBulk);

// Get attendance records for a course on a specific date
// router.get("/attendance", getAttendanceByCourseAndDate);

export default router;
