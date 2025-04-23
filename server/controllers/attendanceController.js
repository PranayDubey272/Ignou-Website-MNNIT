import db from "../database.js";
import dayjs from 'dayjs';

// Mark attendance in bulk
export const markAttendanceBulk = async (req, res) => {
  try {
    const attendanceData = req.body; // Array of { registrationno, course, date, time_slot, status }
    for (const record of attendanceData) {
      const { registrationno, course, date, time_slot, status } = record;

      await db.query(
        `INSERT INTO attendance (registrationno, course, date, time_slot, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [registrationno, course, date, time_slot, status]
      );
    }

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

    const result = await db.query(
      `SELECT * FROM attendance WHERE course = $1 AND date = $2`,
      [course, date]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
};

export const getAttendanceReport = async (req, res) => {
  const { registrationno, course, date } = req.query;

  try {
    let attendanceResult;

    if (date) {
      // If date is present — fetch detailed attendance records
      let query = `SELECT * FROM attendance WHERE 1=1`;
      const params = [];
      let index = 1;

      if (registrationno) {
        query += ` AND registrationno = $${index++}`;
        params.push(registrationno);
      }

      if (course) {
        query += ` AND course = $${index++}`;
        params.push(course);
      }

      query += ` AND date = $${index++}`;
      params.push(date);

      attendanceResult = await db.query(query, params);

      if (attendanceResult.rows.length === 0) {
        return res.status(404).json({ error: "No attendance records found for the specified filters." });
      }

      const attendanceReport = attendanceResult.rows.map((item) => ({
        registrationno: item.registrationno,
        course: item.course,
        date: dayjs(item.date).format('YYYY-MM-DD'),
        status: item.status,
      }));

      return res.status(200).json(attendanceReport);

    } else {
      // If date is NOT present — return percentage summary
      let query = `
        SELECT registrationno, course,
               COUNT(*) FILTER (WHERE status = 'Present')::float / COUNT(*) * 100 AS attendance_percentage
        FROM attendance
      `;
      
      const params = [];
      let index = 1;

      if (registrationno || course) {
        query += ` WHERE `;
        const conditions = [];
        if (registrationno) {
          conditions.push(`registrationno = $${index++}`);
          params.push(registrationno);
        }
        if (course) {
          conditions.push(`course = $${index++}`);
          params.push(course);
        }
        query += conditions.join(' AND ');
      }

      query += ` GROUP BY registrationno, course ORDER BY registrationno`;

      attendanceResult = await db.query(query, params);
      if (attendanceResult.rows.length === 0) {
        return res.status(404).json({ error: "No attendance summary found for the specified filters." });
      }

      const summaryReport = attendanceResult.rows.map(item => ({
        registrationno: item.registrationno,
        course: item.course,
        attendance_percentage: parseFloat(item.attendance_percentage).toFixed(2)
      }));

      return res.status(200).json(summaryReport);
    }

  } catch (error) {
    console.error("Error generating attendance report:", error);
    res.status(500).json({ error: "Server error while generating attendance report." });
  }
};
