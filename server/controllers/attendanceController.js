import db from "../database.js";

// Mark attendance in bulk
export const markAttendanceBulk = async (req, res) => {
  try {
    const attendanceData = req.body; // [{ registration_no, course, date, time_slot, status }]
    const { registration_no, role } = req.user;

    const courseIds = await Promise.all(
      attendanceData.map(async (record) => {
        const courseResult = await db.query(
          `SELECT course_id FROM courses WHERE course_name = $1`,
          [record.course]
        );
        const courseId = courseResult.rows[0]?.course_id;

        if (!courseId) throw new Error(`Course '${record.course}' not found`);

        // Evaluator: verify they are assigned
        if (role === "evaluator") {
          const access = await db.query(
            `SELECT * FROM user_courses WHERE registration_no = $1 AND course_id = $2`,
            [registration_no, courseId]
          );
          if (access.rows.length === 0) {
            throw new Error(`You are not authorized to mark attendance for ${record.course}`);
          }
        }

        return courseId;
      })
    );

    // Prepare and insert attendance
    const insertQuery = `
      INSERT INTO attendance (registration_no, course_id, date, time_slot, status)
      VALUES ($1, $2, $3, $4, $5)
    `;

    const insertPromises = attendanceData.map((record, i) =>
      db.query(insertQuery, [
        record.registration_no,
        courseIds[i],
        record.date,
        record.time_slot,
        record.status,
      ])
    );

    await Promise.all(insertPromises);

    res.status(200).json({ message: "Attendance recorded successfully" });
  } catch (error) {
    console.error("Error recording attendance:", error.message);
    res.status(500).json({ error: error.message || "Failed to record attendance" });
  }
};

// Get attendance for a specific course and date
export const getAttendanceByCourseAndDate = async (req, res) => {
  try {
    const { course, date } = req.query;
    const { registration_no, role } = req.user;

    const courseResult = await db.query(
      `SELECT course_id FROM courses WHERE course_name = $1`,
      [course]
    );
    const courseId = courseResult.rows[0]?.course_id;

    if (!courseId) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (role === "evaluator") {
      const access = await db.query(
        `SELECT * FROM user_courses WHERE registration_no = $1 AND course_id = $2`,
        [registration_no, courseId]
      );
      if (access.rows.length === 0) {
        return res.status(403).json({ error: "Not authorized for this course" });
      }
    }

    const result = await db.query(
      `SELECT a.registration_no, a.date, a.time_slot, a.status
       FROM attendance a
       WHERE a.course_id = $1 AND a.date = $2`,
      [courseId, date]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
};


// Get attendance report: detailed if date is provided, summary if not
export const getAttendanceReport = async (req, res) => {
  const { registration_no: regNoQuery, course, date } = req.query;
  const { registration_no: userRegNo, role } = req.user;

  try {
    let courseId;

    // If course is specified, verify evaluator access
    if (course) {
      const courseResult = await db.query(`SELECT course_id FROM courses WHERE course_name = $1`, [course]);
      courseId = courseResult.rows[0]?.course_id;

      if (!courseId) return res.status(404).json({ error: "Course not found" });

      if (role === "evaluator") {
        const access = await db.query(
          `SELECT * FROM user_courses WHERE registration_no = $1 AND course_id = $2`,
          [userRegNo, courseId]
        );
        if (access.rows.length === 0) {
          return res.status(403).json({ error: "Not authorized for this course" });
        }
      }
    }

    let attendanceResult;

    if (date) {
      // Detailed
      let query = `
        SELECT a.registration_no, a.course_id, a.date, a.status, c.course_name
        FROM attendance a
        JOIN courses c ON a.course_id = c.course_id
        WHERE a.date = $1`;
      const params = [date];

      if (regNoQuery) {
        query += ` AND a.registration_no = $${params.length + 1}`;
        params.push(regNoQuery);
      }

      if (course) {
        query += ` AND c.course_name = $${params.length + 1}`;
        params.push(course);
      }

      attendanceResult = await db.query(query, params);

      if (attendanceResult.rows.length === 0) {
        return res.status(404).json({ error: "No attendance records found." });
      }

      const report = attendanceResult.rows.map(r => ({
        registration_no: r.registration_no,
        course: r.course_name,
        date: r.date,
        status: r.status,
      }));

      return res.status(200).json(report);
    } else {
      // Summary
      let query = `
        SELECT a.registration_no, c.course_name,
               COUNT(*) FILTER (WHERE a.status = 'Present')::float / COUNT(*) * 100 AS attendance_percentage
        FROM attendance a
        JOIN courses c ON a.course_id = c.course_id`;
      const params = [];
      const conditions = [];

      if (regNoQuery) {
        conditions.push(`a.registration_no = $${params.length + 1}`);
        params.push(regNoQuery);
      }

      if (course) {
        conditions.push(`c.course_name = $${params.length + 1}`);
        params.push(course);
      }

      if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(" AND ");
      }

      query += ` GROUP BY a.registration_no, c.course_name ORDER BY a.registration_no`;

      attendanceResult = await db.query(query, params);

      if (attendanceResult.rows.length === 0) {
        return res.status(404).json({ error: "No attendance summary found." });
      }

      const summary = attendanceResult.rows.map(item => ({
        registration_no: item.registration_no,
        course: item.course_name,
        attendance_percentage: parseFloat(item.attendance_percentage).toFixed(2),
      }));

      return res.status(200).json(summary);
    }
  } catch (error) {
    console.error("Error generating attendance report:", error);
    res.status(500).json({ error: "Server error while generating attendance report." });
  }
};

