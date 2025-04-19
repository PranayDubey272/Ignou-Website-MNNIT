// routes/studentAssignmentRoutes.js
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { handleAssignmentSubmission } from "../controllers/assignmentController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { assignmentName } = req.body;  // Correct camelCase

    if (!assignmentName) return cb(new Error("Missing assignment name in form data!"), null);

    const dir = `uploads/submissions/${assignmentName}`;
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
  limits: { fileSize: 50 * 1024 * 1024 }  // limit to 50MB
});

router.post("/submit-assignment", upload.single("assignmentFile"), handleAssignmentSubmission);

export default router;
