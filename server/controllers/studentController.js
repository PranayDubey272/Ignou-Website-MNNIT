import db from "../database.js";

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

export const getCoursesList = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT TRIM(course_name) AS course_name
      FROM users,
      LATERAL jsonb_array_elements_text(courses::jsonb) AS course_name
      WHERE role = 'user' AND courses IS NOT NULL
      ORDER BY course_name;
    `;
    const { rows } = await db.query(query);
    // Format response to match frontend expectation
    const courses = rows.map((row) => ({ course_name: row.course_name }));
    res.json(courses);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ error: "Internal Server Error" });
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