import fs from "fs";
import db from "../database.js";

export const handleAssignmentSubmission = async (req, res) => {
  try {
    console.log("inside handler");
    const { registrationno, selectedCourse, assignmentName } = req.body;

    // Ensure all required fields and file are provided
    if (!registrationno || !selectedCourse || !assignmentName || !req.file) {
      if(!registrationno) console.log("missing reg");
      if(!selectedCourse) console.log("missing course");
      if(!assignmentName) console.log("missing name");
      if(!req.file) console.log("missing file");

      console.log("missing field or file");
      return res.status(400).json({ error: "Missing required fields or file." });
    }

    const filePath = req.file.path;
    const currentTime = new Date().toISOString();

    // Check if the submission already exists for the given registrationno, course, and assignment
    console.log("doint db query");

    const existingSubmission = await db.query(
      "SELECT * FROM submissions WHERE registrationno = $1 AND course_name = $2 AND assignment_name = $3",
      [registrationno, selectedCourse, assignmentName]
    );
    console.log("after db query");

    // Update if submission exists, otherwise insert a new one
    if (existingSubmission.rows.length > 0) {
      await db.query(
        "UPDATE submissions SET file_path = $1, submitted_at = $2 WHERE registrationno = $3 AND course_name = $4 AND assignment_name = $5",
        [filePath, currentTime, registrationno, selectedCourse, assignmentName]
      );
    } else {
      await db.query(
        "INSERT INTO submissions (registrationno, file_path, course_name, assignment_name, submitted_at) VALUES ($1, $2, $3, $4, $5)",
        [registrationno, filePath, selectedCourse, assignmentName, currentTime]
      );
    }

    res.status(200).json({ message: "Assignment submitted successfully." });
  } catch (err) {
    console.error("Error submitting assignment:", err);
    res.status(500).json({ error: "Error submitting assignment." });
  }
};
