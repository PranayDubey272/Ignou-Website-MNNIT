import express from "express";
import {
  getStudentsList,
  getAssignmentList,
  getStudentProfile,
  getStudentSubmissionsList,
  getAttendanceSheet,
  getCoursesList,
  updateGrade,
  getStudentsByCourse,
  getStudentReport
} from "../controllers/studentController.js";

const router = express.Router();

router.get("/studentslist", getStudentsList);
router.get("/assignmentlist", getAssignmentList);
router.get("/student-courses", getCoursesList);

router.get("/studentsprofile", getStudentProfile);
router.get("/studentsubmissionslist", getStudentSubmissionsList);
router.get("/attendancesheet", getAttendanceSheet);
router.put("/update-grade", updateGrade);
router.get("/student-report/:registrationno", getStudentReport);
router.get("/students-by-course/:courseName", getStudentsByCourse);
export default router;
