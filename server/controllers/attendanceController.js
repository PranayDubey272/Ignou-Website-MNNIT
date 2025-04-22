import db from "../database.js";

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
