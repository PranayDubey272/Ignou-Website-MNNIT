import pool from "../database.js";

export const handleAssignmentSubmission = async (req, res) => {
  const { assignmentid, registration_no } = req.headers;

  // Validate input
  if (!assignmentid || !registration_no) {
    return res.status(400).json({ error: "Missing assignment ID or registration number!" });
  }

  try {
    // Check if the assignment exists
    const assignmentResult = await pool.query(
      "SELECT * FROM assignments WHERE id = $1",
      [assignmentid]
    );

    if (assignmentResult.rows.length === 0) {
      return res.status(404).json({ error: "Assignment not found!" });
    }

    const assignment = assignmentResult.rows[0];

    // Check if the student is enrolled in the course for this assignment
    const courseCheckResult = await pool.query(
      `SELECT 1 FROM user_courses WHERE registration_no = $1 AND course_id = $2`,
      [registration_no, assignment.course_id]
    );

    if (courseCheckResult.rows.length === 0) {
      return res.status(400).json({ error: "Student not enrolled in the course!" });
    }

    // Check if the assignment has already been submitted
    const submissionCheckResult = await pool.query(
      "SELECT * FROM submissions WHERE assignment_id = $1 AND registration_no = $2",
      [assignmentid, registration_no]
    );

    if (submissionCheckResult.rows.length > 0) {
      return res.status(400).json({ error: "Assignment already submitted!" });
    }

    // Insert the submission into the database
    await pool.query(
      "INSERT INTO submissions (assignment_id, registration_no, file_path) VALUES ($1, $2, $3)",
      [assignmentid, registration_no, req.file.path]
    );

    res.status(200).json({ message: "Assignment submitted successfully!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while submitting the assignment." });
  }
};
