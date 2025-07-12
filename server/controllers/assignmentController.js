import fs from "fs";
import db from "../database.js";


export const handleAssignmentAddition = async (req, res) => {
  try {
    const { courseName, assignmentName, deadline } = req.body;
    const { registration_no, role } = req.user; 

    if (!courseName || !assignmentName || !deadline || !req.file) {
      return res.status(400).json({ error: "Missing required fields or file." });
    }

    const filePath = req.file.path;
    const createdAt = new Date().toISOString();

    // Get course_id from course name
    const courseRes = await db.query("SELECT course_id FROM courses WHERE course_name = $1", [courseName]);
    if (courseRes.rows.length === 0) {
      return res.status(404).json({ error: "Course not found." });
    }
    const courseId = courseRes.rows[0].course_id;

    // If evaluator, verify they are assigned to this course
    if (role === 'evaluator') {
      const accessRes = await db.query(
        "SELECT * FROM user_courses WHERE registration_no = $1 AND course_id = $2",
        [registration_no, courseId]
      );
      if (accessRes.rows.length === 0) {
        return res.status(403).json({ error: "You are not authorized to add assignments to this course." });
      }
    }

    // Check if assignment already exists
    const existingAssignment = await db.query(
      "SELECT * FROM assignments WHERE course_id = $1 AND assignment_name = $2",
      [courseId, assignmentName]
    );

    if (existingAssignment.rows.length > 0) {
      await db.query(
        "UPDATE assignments SET file_path = $1, deadline = $2, created_at = $3 WHERE course_id = $4 AND assignment_name = $5",
        [filePath, deadline, createdAt, courseId, assignmentName]
      );
    } else {
      await db.query(
        "INSERT INTO assignments (course_id, assignment_name, file_path, deadline, created_at) VALUES ($1, $2, $3, $4, $5)",
        [courseId, assignmentName, filePath, deadline, createdAt]
      );
    }

    res.status(200).json({ message: "Assignment added/updated successfully." });
  } catch (err) {
    console.error("Error adding assignment:", err);
    res.status(500).json({ error: "Error adding assignment." });
  }
};



export const handleAssignmentSubmission = async (req, res) => {
  try {
    const { registration_no, selectedCourse, assignmentName } = req.body;

    if (!registration_no || !selectedCourse || !assignmentName || !req.file) {
      return res.status(400).json({ error: "Missing required fields or file." });
    }

    const filePath = req.file.path;
    const currentTime = new Date().toISOString();

    // Get course_id
    const courseRes = await db.query("SELECT course_id FROM courses WHERE course_name = $1", [selectedCourse]);
    if (courseRes.rows.length === 0) {
      return res.status(404).json({ error: "Course not found." });
    }
    const courseId = courseRes.rows[0].course_id;

    // Get assignment_id
    const assignmentRes = await db.query(
      "SELECT id FROM assignments WHERE course_id = $1 AND assignment_name = $2",
      [courseId, assignmentName]
    );
    if (assignmentRes.rows.length === 0) {
      return res.status(404).json({ error: "Assignment not found." });
    }
    const assignmentId = assignmentRes.rows[0].id;

    // Check existing submission
    const existingSubmission = await db.query(
      "SELECT * FROM submissions WHERE registration_no = $1 AND assignment_id = $2",
      [registration_no, assignmentId]
    );

    if (existingSubmission.rows.length > 0) {
      await db.query(
        "UPDATE submissions SET file_path = $1, submitted_at = $2 WHERE registration_no = $3 AND assignment_id = $4",
        [filePath, currentTime, registration_no, assignmentId]
      );
    } else {
      await db.query(
        "INSERT INTO submissions (registration_no, file_path, assignment_id, submitted_at) VALUES ($1, $2, $3, $4)",
        [registration_no, filePath, assignmentId, currentTime]
      );
    }

    res.status(200).json({ message: "Assignment submitted successfully." });
  } catch (err) {
    console.error("Error submitting assignment:", err);
    res.status(500).json({ error: "Error submitting assignment." });
  }
};


export const getAssignmentsForStudent = async (req, res) => {
  const { registration_no } = req.query;

  if (!registration_no) {
    return res.status(400).json({ message: "Registration number is required." });
  }

  try {
    // Step 1: Get all courses for this student
    const enrolledCourses = await db.query(
      `SELECT c.course_id, c.course_name 
       FROM user_courses e 
       JOIN courses c ON e.course_id = c.course_id 
       WHERE e.registration_no = $1`,
      [registration_no]
    );

    if (enrolledCourses.rows.length === 0) {
      return res.json([]); // No courses enrolled
    }

    const courseIds = enrolledCourses.rows.map(c => c.course_id);

    // Step 2: Get all assignments for those courses the student hasn't submitted
    const assignments = await db.query(
      `SELECT a.*, c.course_name
       FROM assignments a
       JOIN courses c ON a.course_id = c.course_id
       WHERE a.course_id = ANY($1::int[])
       AND a.id NOT IN (
         SELECT assignment_id FROM submissions WHERE registration_no = $2
       )`,
      [courseIds, registration_no]
    );

    res.json(assignments.rows);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};





export const getAllSubmittedAssignments = async (req, res) => {
  try {
    const { registration_no, role } = req.user; // assume this is populated via auth middleware

    let query;
    let params;

    if (role === 'admin') {
      // Fetch everything
      query = `
        SELECT s.*, u.name AS student_name, a.assignment_name, c.course_name
        FROM submissions s
        JOIN users u ON s.registration_no = u.registration_no
        JOIN assignments a ON s.assignment_id = a.id
        JOIN courses c ON a.course_id = c.course_id
        ORDER BY submitted_at DESC;
      `;
      params = [];
    } else if (role === 'evaluator') {
      // Fetch only from courses this evaluator is assigned to (via user_courses)
      query = `
        SELECT s.*, u.name AS student_name, a.assignment_name, c.course_name
        FROM submissions s
        JOIN users u ON s.registration_no = u.registration_no
        JOIN assignments a ON s.assignment_id = a.id
        JOIN courses c ON a.course_id = c.course_id
        WHERE c.course_id IN (
          SELECT course_id FROM user_courses WHERE registration_no = $1
        )
        ORDER BY submitted_at DESC;
      `;
      params = [registration_no];
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching submitted assignments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


