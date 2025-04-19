import pool from "../database.js";

export const handleAssignmentSubmission = async (req, res) => {
  const { assignmentid, registrationno } = req.headers;

  if (!assignmentid || !registrationno) {
    return res.status(400).json({ error: "Missing assignment ID or registration number!" });
  }

  try {
    // Check if already submitted
    const result = await pool.query(
      "SELECT * FROM submissions WHERE assignment_id = $1 AND registrationno = $2",
      [assignmentid, registrationno]
    );

    if (result.rows.length > 0) {
      return res.status(400).json({ error: "Assignment already submitted!" });
    }

    // Insert submission record
    await pool.query(
      "INSERT INTO submissions (assignment_id, registrationno, file_path) VALUES ($1, $2, $3)",
      [assignmentid, registrationno, req.file.path]
    );

    res.status(200).json({ message: "Assignment submitted successfully!" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
