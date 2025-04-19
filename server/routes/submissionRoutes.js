import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { handleAssignmentSubmission } from "../controllers/submissionController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { assignmentid } = req.headers;
    if (!assignmentid) return cb(new Error("Missing assignment ID in headers!"), null);

    const dir = `uploads/submissions/${assignmentid}`;
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

router.post("/submit-assignment", upload.single("assignmentFile"), handleAssignmentSubmission);

export default router;
