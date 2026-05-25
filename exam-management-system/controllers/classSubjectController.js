const pool = require('../config/db');

// Add a subject to a class
const addSubjectToClass = async (req, res) => {
    try {
        const { class_id, subject_id } = req.body;
        
        const query = `
            INSERT INTO class_subject (class_id, subject_id)
            VALUES ($1, $2) RETURNING *
        `;
        const result = await pool.query(query, [class_id, subject_id]);

        res.status(201).json({ message: '✅ Subject assigned to class!', data: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: '❌ This subject is already assigned to this class!' });
        }
        if (error.code === '23503') {
            return res.status(400).json({ message: '❌ Invalid class_id or subject_id. They do not exist!' });
        }
        res.status(500).json({ message: '❌ Failed to assign subject', error: error.message });
    }
};

// Get all subjects for a specific class
const getSubjectsByClass = async (req, res) => {
    try {
        const classId = req.params.class_id;
        
        // We JOIN class_subject with subject to get the actual subject names!
        const query = `
            SELECT cs.class_subject_id, s.subject_id, s.subject_name, s.subject_code
            FROM class_subject cs
            JOIN subject s ON cs.subject_id = s.subject_id
            WHERE cs.class_id = $1
        `;
        const result = await pool.query(query, [classId]);

        res.status(200).json({ message: '✅ Subjects fetched!', data: result.rows });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to fetch subjects', error: error.message });
    }
};

module.exports = { addSubjectToClass, getSubjectsByClass };