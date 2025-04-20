import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { handleAssignmentSubmission } from "../controllers/submissionController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const assignmentid = req.headers.assignmentid;
    console.log(assignmentid);
    if (!assignmentid) {
      return cb(new Error("Missing assignment ID in headers!"), null);
    }

    const dir = `uploads/submissions/${assignmentid}`;

    // Ensure the 'uploads' directory exists
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("uploads", { recursive: true });
    }

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname); // Get file extension
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // You can add file type validation here
    const allowedExtensions = ['.pdf', '.docx', '.txt', '.jpg', '.png'];
    const ext = path.extname(file.originalname);
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error("File type not allowed"));
    }
    cb(null, true);
  }
});

router.post("/submit-assignment", upload.single("assignmentFile"), handleAssignmentSubmission);

export default router;
