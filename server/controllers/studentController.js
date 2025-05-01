import db from "../database.js";
import dayjs from "dayjs"; // for dates

export const getStudentsList = async (req, res) => {
  try {
    const query = `
      SELECT 
        s.registration_no, 
        s.name, 
        s.programme, 
        s.mobile, 
        s.email, 
        s.session,
        s.year,
        s.registration_no AS id 
      FROM 
        users s 
      WHERE 
        s.role = 'user'
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



export const getStudentsByCourse = async (req, res) => {
  try {
    const { courseName } = req.params;
    const query = `
      SELECT s.registration_no, s.name, s.programme, s.semester, s.session, year
      FROM users s 
      JOIN user_courses u ON u.registration_no = s.registration_no
      JOIN courses c ON u.course_id = c.course_id 
      WHERE c.course_name ILIKE $1 AND s.role = 'user';
    `;

    const result = await db.query(query, [`%${courseName}%`]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No students found for this course." });
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching students by course:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
};




export const getCoursesList = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT course_name AS course_name
      FROM courses;
    `;
    const result = await db.query(query);

    const courseList = result.rows.map((row) => row.course_name);

    res.json({ data: courseList });  // Wrapping course list in a 'data' field
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};


export const getAssignmentList = async (req, res) => {
  try {
    const query = `
      SELECT
        s.registration_no,
        s.name,
        s.programme,
        s.session,
        s.year,
        c.course_name,
        a.assignment_name,
        a.id AS assignment_id,
        sub.submitted_at,
        sub.file_path,
        sub.grade
    FROM
        assignments a
    JOIN users s ON s.role = 'user'
    JOIN user_courses uc ON s.registration_no = uc.registration_no
    JOIN courses c ON uc.course_id = c.course_id
        AND c.course_id = a.course_id  -- Join using course_id
    LEFT JOIN submissions sub
        ON sub.assignment_id = a.id
        AND sub.registration_no = s.registration_no
    ORDER BY
        a.assignment_name,
        s.registration_no;
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching assignment list:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getStudentProfile = async (req, res) => {
  const registration_no = req.query.registration_no;
  try {
    const result = await db.query(
      "SELECT * FROM users WHERE registration_no = $1",
      [registration_no]
    );

    if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getStudentSubmissionsList = async (req, res) => {
  const registration_no = req.query.registration_no;

  try {
    const result = await db.query(
      `
        SELECT 
            c.course_name, 
            a.assignment_name,
            s.submitted_at, 
            s.file_path
        FROM submissions s
        JOIN users st ON s.registration_no = st.registration_no
        JOIN assignments a ON s.assignment_id = a.id
        JOIN courses c ON a.course_id = c.course_id  -- Join assignments with courses based on course_id
        WHERE st.registration_no = $1
        ORDER BY s.submitted_at DESC;
      `,
      [registration_no]
    );

    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(404).json({ error: "No submissions found" });
    }
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAttendanceSheet = async (req, res) => {
  try {
    const result = await db.query(
      `
        SELECT
          s.registration_no,
          s.name,
          s.programme,
          NULL AS signature,
          NULL AS remark
      FROM users s
      WHERE s.role = 'user'
      ORDER BY s.registration_no;

      `
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching attendance sheet data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateGrade = async (req, res) => {
  const { registration_no, assignment_id, grade } = req.body;

  try {
    await db.query(
      'UPDATE submissions SET grade = $1 WHERE registration_no = $2 AND assignment_id = $3',
      [grade, registration_no, assignment_id]
    );
    res.status(200).json({ message: 'Grade updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update grade' });
  }
};


export const getStudentReport = async (req, res) => {
  const { registration_no } = req.params;

  try {
    // Get the student's courses (from the normalized relationship)
    const userResult = await db.query(
      `SELECT uc.course_id
       FROM user_courses uc
       JOIN users u ON u.registration_no = uc.registration_no
       WHERE u.registration_no = $1`,
      [registration_no]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const courseIds = userResult.rows.map(row => row.course_id);

    if (courseIds.length === 0) {
      return res.status(400).json({ error: "No courses found for student" });
    }

    // Get all assignments for the student's courses (now matching course_id)
    const assignmentsResult = await db.query(
      `SELECT * FROM assignments WHERE course_id = ANY($1::int[])`,
      [courseIds]
    );

    const assignments = assignmentsResult.rows;
    const today = dayjs();
    const report = [];

    for (const assignment of assignments) {
      // Check if submission exists for this assignment and student
      const submissionResult = await db.query(
        `SELECT * FROM submissions 
         WHERE registration_no = $1 AND assignment_id = $2 AND grade <> 'NA'`,
        [registration_no, assignment.id]
      );

      const submission = submissionResult.rows[0];
      const deadline = dayjs(assignment.deadline);

      if (submission) {
        // Student has submitted, include actual submission
        report.push({
          assignment_name: assignment.assignment_name,
          course_name: assignment.course_name,
          submitted_at: submission.submitted_at,
          file_path: submission.file_path,
          grade: submission.grade || 'NA',
        });
      } else if (today.isAfter(deadline)) {
        // No submission and deadline passed → mark as F temporarily
        report.push({
          assignment_name: assignment.assignment_name,
          course_name: assignment.course_name,
          submitted_at: null,
          file_path: null,
          grade: 'F',
        });
      }
    }

    res.status(200).json(report);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while generating report" });
  }
};




