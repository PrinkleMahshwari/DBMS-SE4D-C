const pool = require('../config/db');

const createMarks = async (req, res) => {
    try {
        const { 
            student_id, exam_id, subject_id, schedule_id, component_id, 
            attendance_id, submitted_by_teacher_id, marks_obtained, is_absent 
        } = req.body;

        // ERD Rule: If absent and not eligible for re-exam, marks are 0.
        // We can check the attendance table to enforce this, but for a beginner project,
        // we will trust the `is_absent` boolean from the frontend. If true, force marks to 0.
        const finalMarks = is_absent ? 0 : marks_obtained;

        const query = `
            INSERT INTO marks (
                student_id, exam_id, subject_id, schedule_id, component_id, 
                attendance_id, submitted_by_teacher_id, marks_obtained, is_absent
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
        `;
        
        // Convert empty strings to null for component_id and attendance_id
        const values = [
            student_id, exam_id, subject_id, schedule_id, component_id || null, 
            attendance_id || null, submitted_by_teacher_id, finalMarks, is_absent
        ];
        
        const result = await pool.query(query, values);

        res.status(201).json({ message: '✅ Marks entered successfully!', data: result.rows[0] });
    } catch (error) {
        if (error.code === '23503') return res.status(400).json({ message: '❌ Foreign Key Violation! Check your IDs.' });
        if (error.code === '23505') return res.status(400).json({ message: '❌ Marks for this student/exam/subject/component already exist!' });
        res.status(500).json({ message: '❌ Failed to enter marks', error: error.message });
    }
};

const getMarksByStudent = async (req, res) => {
    try {
        const studentId = req.params.student_id;
        const query = `
            SELECT m.marks_id, m.marks_obtained, m.is_absent,
                   e.exam_name, e.exam_type,
                   s.subject_name,
                   ec.component_type
            FROM marks m
            JOIN exam e ON m.exam_id = e.exam_id
            JOIN subject s ON m.subject_id = s.subject_id
            LEFT JOIN exam_component ec ON m.component_id = ec.component_id
            WHERE m.student_id = $1
        `;
        const result = await pool.query(query, [studentId]);
        res.status(200).json({ message: '✅ Marks fetched!', data: result.rows });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to fetch marks', error: error.message });
    }
};

module.exports = { createMarks, getMarksByStudent };