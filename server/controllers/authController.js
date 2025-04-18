import db from "../database.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const login = async (req, res) => {
  console.log("here");
  const { registration, password } = req.body;
  try {
    const result = await db.query(
      "SELECT * FROM users WHERE registrationno = $1 AND password = $2",
      [registration, password]
    );
    if (result.rows.length > 0) {
      const token = jwt.sign({ data: result.rows[0] }, process.env.JWT_SECRET, { expiresIn: "1h" });
      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        role: result.rows[0].role,
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const verifyStudent = (req, res) => {
  res.status(200).json({ success: true, message: "Token verified" });
};

export const verifyAdmin = async (req, res) => {
  try {
    // just returning a success response, assuming user is already verified via middleware
    return res.status(200).json({ success: true, message: "Admin verified" });
  } catch (err) {
    console.error("verifyAdmin error:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const verifyStaff = async (req, res) => {
  try {
    // just returning a success response, assuming user is already verified via middleware
    return res.status(200).json({ success: true, message: "Staff verified" });
  } catch (err) {
    console.error("verifyStaff error:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// forget password controller
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await db.query(query, [email]);

    if (result.rows.length > 0) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 3600000);

      await db.query(
        `UPDATE users SET reset_token = $1, token_expiry = $2 WHERE email = $3`,
        [token, expiry, email]
      );

      await sendResetEmail(email, token);
      res.json({ success: true, message: 'Reset link sent to email.' });
    } else {
      res.json({ success: true, userExists: false });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: "An error occurred." });
  }
};

// reset password controller
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const query = `SELECT * FROM users WHERE reset_token = $1 AND token_expiry > NOW()`;
    const result = await db.query(query, [token]);

    if (result.rows.length > 0) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.query(
        `UPDATE users SET password = $1, reset_token = NULL, token_expiry = NULL WHERE reset_token = $2`,
        [hashedPassword, token]
      );
      res.json({ success: true, message: 'Password updated successfully.' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: "An error occurred." });
  }
};


export const updatePassword = async (req, res) => {
  const { registration, newPassword } = req.body;

  try {
    const query = `UPDATE users SET password = '${newPassword}' WHERE registrationno = '${registration}'`;
    const result = await db.query(query);

    if (result.rowCount > 0) {
      res.json({ success: true, message: "Password updated successfully." });
    }
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).json({ success: false, error: "An error occurred." });
  }
};

export const checkUserStatus = async (req, res) => {
  const { registrationno, emailAddress } = req.body;

  try {
    // Query the database to find a user with the provided enrollment number and email
    const result = await db.query(
      "SELECT * FROM users WHERE registrationno = $1 AND email = $2",
      [registrationno, emailAddress]
    );

    if (result.rows.length > 0) {
      // If a user is found, send the user's details as a response
      res.status(200).json(result.rows[0]);
    } else {
      // If no user is found, send an error response
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
