import db from "../database.js";

// Mark attendance in bulk
export const markAttendanceBulk = async (req, res) => {
  try {
    const attendanceData = req.body; // Array of { registration_no, course, date, time_slot, status }

    const courseIds = await Promise.all(
      attendanceData.map(async (record) => {
        const courseResult = await db.query(
          `SELECT course_id FROM courses WHERE course_name = $1`,
          [record.course]
        );
        return courseResult.rows[0]?.course_id;
      })
    );

    // Prepare data for bulk insert
    const attendanceInsertData = attendanceData.map((record, index) => {
      return [
        record.registration_no,
        courseIds[index],
        record.date,
        record.time_slot,
        record.status,
      ];
    });

    // Bulk insert into attendance table
    const insertQuery = `
      INSERT INTO attendance (registration_no, course_id, date, time_slot, status)
      VALUES ($1, $2, $3, $4, $5)
    `;

    const insertPromises = attendanceInsertData.map(data =>
      db.query(insertQuery, data)
    );

    await Promise.all(insertPromises);

    res.status(200).json({ message: "Attendance recorded successfully" });
  } catch (error) {
    console.error("Error recording attendance:", error);
    res.status(500).json({ error: "Failed to record attendance" });
  }
};

// Get attendance for a specific course and date
export const getAttendanceByCourseAndDate = async (req, res) => {
  try {
    const { course, date } = req.query;

    // Fetch course_id
    const courseResult = await db.query(
      `SELECT course_id FROM courses WHERE course_name = $1`,
      [course]
    );
    const courseId = courseResult.rows[0]?.course_id;

    if (!courseId) {
      return res.status(404).json({ error: "Course not found" });
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
  const { registration_no, course, date } = req.query;

  try {
    let attendanceResult;

    if (date) {
      // Detailed report
      let query = `
        SELECT a.registration_no, a.course_id, a.date, a.status, c.course_name
        FROM attendance a
        JOIN courses c ON a.course_id = c.course_id
        WHERE a.date = $1`;
      const params = [date];

      if (registration_no) {
        query += ` AND a.registration_no = $${params.length + 1}`;
        params.push(registration_no);
      }

      if (course) {
        query += ` AND c.course_name = $${params.length + 1}`;
        params.push(course);
      }

      attendanceResult = await db.query(query, params);

      if (attendanceResult.rows.length === 0) {
        return res.status(404).json({ error: "No attendance records found for the specified filters." });
      }

      const attendanceReport = attendanceResult.rows.map(item => ({
        registration_no: item.registration_no,
        course: item.course_name,
        date: item.date,
        status: item.status,
      }));

      return res.status(200).json(attendanceReport);
    } else {
      // Summary report
      let query = `
        SELECT a.registration_no, c.course_name,
               COUNT(*) FILTER (WHERE a.status = 'Present')::float / COUNT(*) * 100 AS attendance_percentage
        FROM attendance a
        JOIN courses c ON a.course_id = c.course_id`;
      const params = [];
      let conditions = [];

      if (registration_no) {
        conditions.push(`a.registration_no = $${params.length + 1}`);
        params.push(registration_no);
      }

      if (course) {
        conditions.push(`c.course_name = $${params.length + 1}`);
        params.push(course);
      }

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }

      query += ` GROUP BY a.registration_no, c.course_name ORDER BY a.registration_no`;

      attendanceResult = await db.query(query, params);

      if (attendanceResult.rows.length === 0) {
        return res.status(404).json({ error: "No attendance summary found for the specified filters." });
      }

      const summaryReport = attendanceResult.rows.map(item => ({
        registration_no: item.registration_no,
        course: item.course_name,
        attendance_percentage: parseFloat(item.attendance_percentage).toFixed(2),
      }));

      return res.status(200).json(summaryReport);
    }

  } catch (error) {
    console.error("Error generating attendance report:", error);
    res.status(500).json({ error: "Server error while generating attendance report." });
  }
};
