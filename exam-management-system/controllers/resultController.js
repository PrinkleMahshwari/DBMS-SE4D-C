const pool = require('../config/db');

// Helper function for your grading scale
const calculateGrade = (percentage) => {
    if (percentage >= 80) return 'A1';
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    if (percentage >= 33) return 'E';
    return 'F';
};

const createResult = async (req, res) => {
    try {
        const { student_id, subject_id, class_id, term, total_marks, obtained_marks } = req.body;
        
        // Calculate percentage and grade automatically!
        const percentage = (obtained_marks / total_marks) * 100;
        const grade = calculateGrade(percentage);

        const query = `
            INSERT INTO result (student_id, subject_id, class_id, term, total_marks, obtained_marks, percentage, grade)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
        `;
        const values = [student_id, subject_id, class_id, term, total_marks, obtained_marks, percentage.toFixed(2), grade];
        const result = await pool.query(query, values);

        res.status(201).json({ message: '✅ Result generated!', data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to generate result', error: error.message });
    }
};

const getResultsByStudent = async (req, res) => {
    try {
        const studentId = req.params.student_id;
        const result = await pool.query(
            `SELECT r.term, r.total_marks, r.obtained_marks, r.percentage, r.grade, s.subject_name 
             FROM result r JOIN subject s ON r.subject_id = s.subject_id 
             WHERE r.student_id = $1`,
            [studentId]
        );
        res.status(200).json({ message: '✅ Results fetched!', data: result.rows });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to fetch results', error: error.message });
    }
};

module.exports = { createResult, getResultsByStudent };