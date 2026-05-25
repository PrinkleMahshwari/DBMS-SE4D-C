const pool = require('../config/db');

const assignTeacher = async (req, res) => {
    try {
        const { teacher_id, class_id, subject_id } = req.body;
        
        const query = `
            INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
            VALUES ($1, $2, $3) RETURNING *
        `;
        const result = await pool.query(query, [teacher_id, class_id, subject_id]);

        res.status(201).json({ message: '✅ Teacher assigned to subject and class!', data: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: '❌ This class + subject already has a teacher assigned!' });
        }
        if (error.code === '23503') {
            return res.status(400).json({ message: '❌ Invalid teacher_id, class_id, or subject_id.' });
        }
        res.status(500).json({ message: '❌ Failed to assign teacher', error: error.message });
    }
};

// Get the full teaching schedule
const getAllAssignments = async (req, res) => {
    try {
        // A massive JOIN to get human-readable data!
        const query = `
            SELECT ta.assignment_id, 
                   p.first_name AS teacher_first_name, p.last_name AS teacher_last_name,
                   c.class_number, c.section, 
                   s.subject_name
            FROM teaching_assignment ta
            JOIN teacher t ON ta.teacher_id = t.teacher_id
            JOIN person p ON t.email = p.email
            JOIN class c ON ta.class_id = c.class_id
            JOIN subject s ON ta.subject_id = s.subject_id
        `;
        const result = await pool.query(query);

        res.status(200).json({ message: '✅ Assignments fetched!', data: result.rows });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to fetch assignments', error: error.message });
    }
};

module.exports = { assignTeacher, getAllAssignments };