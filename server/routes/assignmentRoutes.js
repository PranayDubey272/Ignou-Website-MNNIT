import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { handleAssignmentSubmission } from "../controllers/assignmentController.js";

const router = express.Router();

// Storage strategy
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { assignmentname } = req.headers; // Accessing assignmentname from the headers
    if (!assignmentname) return cb(new Error("Missing assignment name in request headers!"), null);
    
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

router.post("/submit", upload.single("assignmentFile"), (req, res, next) => {
    console.log("inside backend assignment route");
    try {
    console.log("inside backend assignment route try");

      handleAssignmentSubmission(req, res);
    } catch (error) {
      console.error(error);  // Logs the error to the console
      res.status(500).send("Server Error");
    }
  });
  

export default router;
