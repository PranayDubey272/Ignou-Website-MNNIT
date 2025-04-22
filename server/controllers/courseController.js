import db from "../database.js";

export const getCourses = async (req, res) => {
  try {
    const registrationno = req.query.registrationno;

    let query = `
      SELECT courses
      FROM users
      WHERE registrationno = $1;
    `;
    const result = await db.query(query, [registrationno]);

    const courses = result.rows[0].courses;

    const courseList = courses.split(" ");

    res.json(courseList);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    let query = `
      SELECT DISTINCT course_name
      FROM courses;
    `;
    const result = await db.query(query);
    const courseList = result.rows.map(row => row.course_name);
    res.json(courseList);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

