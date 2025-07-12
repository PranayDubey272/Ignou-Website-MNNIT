import db from "../database.js"; 

export const addStaff = async (req, res) => {
  try {
    const {
      registration_no,
      name,
      programme,
      email,
      mobile,
      password,
    } = req.body;

    if (!registration_no || !name || !programme || !email || !mobile || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    await db.query(
      `INSERT INTO users (
        registration_no, name, programme, mobile, email,
        semester, session, year, password, role
      ) VALUES ($1, $2, $3, $4, $5, NULL, NULL, NULL, $6, 'office_staff')`,
      [registration_no, name, programme, mobile, email, password]
    );

    res.status(201).json({ message: "Staff added successfully" });
  } catch (err) {
    console.error("Error adding staff:", err);

    if (err.code === '23505') {
      res.status(409).json({ error: "Staff with this registration number or email already exists" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};
