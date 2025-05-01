import db from "../database.js";

// Controller to update marks
const updateMarks = async (req, res) => {
    const { studeregistration_nontId, course, marks } = req.body;

    if (!registration_no || !course || marks === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const query = `
            UPDATE marks
            SET marks = $1
            WHERE registration_no = $2 AND course = $3
            RETURNING *;
        `;
        const values = [marks, studentId, course];

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }

        res.status(200).json({ message: 'Marks updated successfully', data: result.rows[0] });
    } catch (error) {
        console.error('Error updating marks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { updateMarks };