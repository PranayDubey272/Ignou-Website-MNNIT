import crypto from 'crypto';
import { sendResetEmail } from '../utils/mailer.js';
import db from '../database.js';

export const forgotPassword = async (req, res) => {
    console.log("here");
    const { email } = req.body;
    try {
      console.log("here2");
      const query = `SELECT * FROM users WHERE email = $1`;
      const result = await db.query(query, [email]);
      console.log("here3", result);

      if (result.rows.length > 0) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000);
        console.log("here4");
        await db.query(
          `UPDATE users SET reset_token = $1, token_expiry = $2 WHERE email = $3`,
          [token, expiry, email]
        );
  
        await sendResetEmail(email, token);
        res.json({ success: true, message: 'Reset link sent to email.' });
      } else {
        res.json({ success: true, message: 'If this email is registered, you will receive a password reset link.' });
      }
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ success: false, error: "An error occurred." });
    }
  };