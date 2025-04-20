import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { handleAssignmentAddition } from "../controllers/assignmentController.js";
import { getAssignmentsForStudent, getAllSubmittedAssignments } from "../controllers/assignmentController.js";

const router = express.Router();



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { assignmentname } = req.headers;
    if (!assignmentname) return cb(new Error("Missing assignment name in headers!"), null);

    const dir = `uploads/assignments/${assignmentname}`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.post("/add-assignment", upload.single("assignmentFile"), handleAssignmentAddition);


// Fetch assignments for a student based on their courses
router.get("/student", getAssignmentsForStudent);

router.get("/assignmentlist", getAllSubmittedAssignments)


export default router;
