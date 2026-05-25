const pool = require('../config/db');

const assignClassTeacher = async (req, res) => {
    try {
        const { teacher_id, class_id } = req.body;
        
        const query = `
            INSERT INTO class_teacher_assignment (teacher_id, class_id)
            VALUES ($1, $2) RETURNING *
        `;
        const result = await pool.query(query, [teacher_id, class_id]);

        res.status(201).json({ message: '✅ Class teacher assigned!', data: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            // The UNIQUE constraints on teacher_id and class_id catch this
            return res.status(400).json({ message: '❌ This teacher already manages a class, OR this class already has a class teacher!' });
        }
        res.status(500).json({ message: '❌ Failed to assign class teacher', error: error.message });
    }
};

module.exports = { assignClassTeacher };