import xlsx from "xlsx";
import db from "../database.js";
import sendWelcomeEmail from "./emailController.js";

export const ExcelFile = async (req, res) => {
  try {
    const { session, year, sendWelcomeMail } = req.body;
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    for (const row of data) {
      const lastLetter = row.programme.slice(-1);
      const semesterValue = isNaN(lastLetter) ? "1" : lastLetter;
      const updatedProgramme = isNaN(lastLetter)
        ? `${row.programme}1`
        : row.programme;

      // Insert user
      await db.query(
        `
        INSERT INTO users (registration_no, name, programme, mobile, email, semester, session, year, password, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'student')
        `,
        [
          row.registration_no,
          row.name,
          updatedProgramme,
          row.mobile,
          row.email,
          semesterValue,
          session,
          year,
          row.registration_no,
        ]
      );

      const courseList = row.courses.split(",").map(c => c.trim());

      for (const courseRaw of courseList) {
        const courseName = courseRaw.trim().toLowerCase();

        // Try inserting the course or ignoring if it already exists
        const insertCourse = await db.query(
          `INSERT INTO courses (course_name)
            VALUES ($1)
            ON CONFLICT (course_name) DO NOTHING
            RETURNING course_id`,
          [courseName]
        );

        let courseId;
        if (insertCourse.rows.length > 0) {
          // If the course was inserted, get the course_id
          courseId = insertCourse.rows[0].course_id;
        } else {
          // If the course already exists, query for the course_id
          const existingCourseResult = await db.query(
            `SELECT course_id FROM courses WHERE LOWER(TRIM(course_name)) = $1`,
            [courseName]
          );
          courseId = existingCourseResult.rows[0].course_id;
        }

        // Link user and course in user_courses (will not insert duplicates due to ON CONFLICT)
        await db.query(
          `
          INSERT INTO user_courses (registration_no, course_id)
          VALUES ($1, $2)
          ON CONFLICT (registration_no, course_id) DO NOTHING
          `,
          [row.registration_no, courseId]
        );
      }

      if (sendWelcomeMail === "true") {
        console.log(`Sending welcome email to ${row.email}`);
        await sendWelcomeEmail(row.email, row.name);
      }
    }

    res.status(200).send("File uploaded and data saved to database");
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).send("Error uploading file");
  }
};
