import db from "../database.js";
import dayjs from "dayjs"; // for dates

export const getStudentsList = async (req, res) => {
  try {
    const query = `
      SELECT 
        s.registrationno, 
        s.name, 
        s.programme, 
        s.courses, 
        s.mobile, 
        s.email, 
        s.session,
        s.year,
        s.registrationno AS id 
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
    // Escape the course name to ensure proper search
    const query = `
      SELECT registrationno, name, programme, semester, session, year
      FROM users
      WHERE courses ILIKE $1
      AND role = 'user';
    `;

    // Wrap the course name in quotes for the ILIKE query (matching like "course")
    const result = await db.query(query, [`%\"${courseName}\"%`]);

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
      SELECT DISTINCT jsonb_array_elements_text(courses::jsonb) AS course_name
      FROM users
      WHERE courses IS NOT NULL;
    `;
    const result = await db.query(query);

    const courseList = result.rows.map((row) => row.course_name);

    res.json(courseList);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

export const getAssignmentList = async (req, res) => {
  try {
    const query = `
      SELECT
        s.registrationno,
        s.name,
        s.programme,
        s.session,
        s.year,
        a.course_name,
        a.assignment_name,
        a.id AS assignment_id,
        sub.submitted_at,
        sub.file_path,
        sub.grade
      FROM
        assignments a
      JOIN users s
        ON s.role = 'user'
        AND jsonb_typeof(s.courses::jsonb) = 'array'
        AND s.courses::jsonb @> ('["' || a.course_name || '"]')::jsonb
      LEFT JOIN submissions sub
        ON sub.assignment_id = a.id
        AND sub.registrationno = s.registrationno
      ORDER BY
        a.assignment_name,
        s.registrationno;


    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching assignment list:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getStudentProfile = async (req, res) => {
  const registrationno = req.query.registrationno;
  try {
    const result = await db.query(
      "SELECT * FROM users WHERE registrationno = $1",
      [registrationno]
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
  const registrationno = req.query.registrationno;

  try {
    const result = await db.query(
      `
        SELECT 
          a.course_name, 
          a.assignment_name,
          s.submitted_at, 
          s.file_path
        FROM submissions s
        JOIN users st ON s.registrationno = st.registrationno
        LEFT JOIN assignments a ON s.assignment_id = a.id
        WHERE st.registrationno = $1
        ORDER BY s.submitted_at DESC;
      `,
      [registrationno]
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
          s.registrationno,
          s.name,
          s.programme,
          NULL AS signature,
          NULL AS remark
        FROM users s
        WHERE s.role = 'user'
        ORDER BY s.registrationno;
      `
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching attendance sheet data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateGrade = async (req, res) => {
  const { registrationno, assignment_id, grade } = req.body;

  try {
    await db.query(
      'UPDATE submissions SET grade = $1 WHERE registrationno = $2 AND assignment_id = $3',
      [grade, registrationno, assignment_id]
    );
    res.status(200).json({ message: 'Grade updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update grade' });
  }
};


export const getStudentReport = async (req, res) => {
  const { registrationno } = req.params;

  try {
    // Get the student's courses (as a JSON array)
    const userResult = await db.query(
      `SELECT courses FROM users WHERE registrationno = $1`,
      [registrationno]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const coursesString = userResult.rows[0].courses;
    const courses = JSON.parse(coursesString); // Convert the JSON array to a JavaScript array

    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({ error: "No courses found for student" });
    }

    // Get all assignments for the student's courses (now comparing course names correctly)
    const assignmentsResult = await db.query(
      `SELECT * FROM assignments WHERE course_name = ANY($1::text[])`, // Match against the student's courses
      [courses]
    );

    const assignments = assignmentsResult.rows;

    const today = dayjs();
    const report = [];

    for (const assignment of assignments) {
      // Check if submission exists
      const submissionResult = await db.query(
        `SELECT * FROM submissions 
         WHERE registrationno = $1 AND assignment_id = $2 AND grade<>'NA'`,
        [registrationno, assignment.id] // Ensure assignment_id is properly matched
      );

      const submission = submissionResult.rows[0];
      const deadline = dayjs(assignment.deadline);

      if (submission) {
        // Student submitted, include actual submission
        report.push({
          assignment_name: assignment.assignment_name,
          course_name: assignment.course_name,
          submitted_at: submission.submitted_at,
          file_path: submission.file_path,
          grade: submission.grade || 'na',
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




