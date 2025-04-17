import bcrypt from 'bcrypt';
import db from '../database.js';

export const resetPassword = async (req, res) => {
    const { token } = req.params;      // token from URL
    const { newPassword } = req.body; // password from body

    try {
        const query = `SELECT * FROM users WHERE reset_token = $1 AND token_expiry > NOW()`;
        const result = await db.query(query, [token]);

        if (result.rows.length > 0) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await db.query(
                `UPDATE users SET password = $1, reset_token = NULL, token_expiry = NULL WHERE reset_token = $2`,
                [newPassword, token]
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
