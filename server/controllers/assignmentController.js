import fs from "fs";
import db from "../database.js";


export const handleAssignmentAddition = async (req, res) => {
  try {
    console.log("inside admin handler");

    const { courseName, assignmentName, deadline } = req.body;

    if (!courseName || !assignmentName || !deadline || !req.file) {
      if (!req.file) console.log("missing file");
      return res.status(400).json({ error: "Missing required fields or file." });
    }

    const filePath = req.file.path;
    const createdAt = new Date().toISOString();

    const existingAssignment = await db.query(
      "SELECT * FROM assignments WHERE course_name = $1 AND assignment_name = $2",
      [courseName, assignmentName]
    );

    if (existingAssignment.rows.length > 0) {
      await db.query(
        "UPDATE assignments SET file_path = $1, deadline = $2, created_at = $3 WHERE course_name = $4 AND assignment_name = $5",
        [filePath, deadline, createdAt, courseName, assignmentName]
      );
      console.log("assignment updated");
    } else {
      await db.query(
        "INSERT INTO assignments (course_name, assignment_name, file_path, deadline, created_at) VALUES ($1, $2, $3, $4, $5)",
        [courseName, assignmentName, filePath, deadline, createdAt]
      );
      console.log("assignment inserted");
    }

    res.status(200).json({ message: "Assignment added/updated successfully." });
  } catch (err) {
    console.error("Error adding assignment:", err);
    res.status(500).json({ error: "Error adding assignment." });
  }
};

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

export const getAssignmentsForStudent = async (req, res) => {
  const { registrationno, course } = req.query;

  if (!registrationno) {
    return res.status(400).json({ message: "Registration number is required." });
  }

  try {
    const userQuery = `SELECT courses FROM users WHERE registrationno = $1`;
    const userResult = await db.query(userQuery, [registrationno]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Student not found." });
    }

    let courses = userResult.rows[0].courses;

    let coursesArray;
    try {
      coursesArray = JSON.parse(courses);
    } catch (err) {
      coursesArray = [courses];
    }

    // console.log("Student Courses:", coursesArray);

    if (!Array.isArray(coursesArray) || coursesArray.length === 0) {
      return res.json([]); // No courses
    }

    let assignmentsQuery;
    let assignmentsResult;

    if (course) {
      // Filter by selected course
      assignmentsQuery = `
        SELECT a.* FROM assignments a
        LEFT JOIN submissions s 
        ON a.id = s.assignment_id AND s.registrationno = $2
        WHERE a.course_name = $1 AND s.submission_id IS NULL;
      `;
      assignmentsResult = await db.query(assignmentsQuery, [course, registrationno]);
    } else {
      // Fetch all courses if course param is not sent
      assignmentsQuery = `
        SELECT a.* FROM assignments a
        LEFT JOIN submissions s 
        ON a.id = s.assignment_id AND s.registrationno = $2
        WHERE a.course_name = ANY($1::text[]) AND s.submission_id IS NULL;
      `;
      assignmentsResult = await db.query(assignmentsQuery, [coursesArray, registrationno]);
    }

    return res.json(assignmentsResult.rows);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const getAllSubmittedAssignments = async(req, res) =>{
  try{
    const query = `SELECT * FROM assignments`;
    const result = await db.query(query);
    return res.json(query);
  }
  catch(error){
    console.log("Error fetching all assignments", error.response?.data);
    res.status(500).json({ message: "Internal server error" });
  }
}
