import db from "../database.js";


export const getCourses = async (req, res) => {
  try {
    const { registration_no } = req.query;

    // Get user_id from registration_no
    const userResult = await db.query(
      `SELECT user_id FROM users WHERE registration_no = $1`,
      [registration_no]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = userResult.rows[0].user_id;

    // Get all courses associated with the user
    const coursesResult = await db.query(
      `SELECT c.course_name
       FROM user_courses uc
       JOIN courses c ON uc.course_id = c.course_id
       WHERE uc.user_id = $1`,
      [userId]
    );

    const courseList = coursesResult.rows.map(row => row.course_name);
    res.json(courseList);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};


export const getAllCourses = async (req, res) => {
  try {
    // Fetch all distinct courses
    const query = `SELECT DISTINCT course_name FROM courses`;
    const result = await db.query(query);

    const courseList = result.rows.map(row => row.course_name);
    res.json(courseList);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};


