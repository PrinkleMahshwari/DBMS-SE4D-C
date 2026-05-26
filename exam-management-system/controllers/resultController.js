const pool = require('../config/db');

// Helper function for grading scale
const calculateGrade = (percentage) => {
    if (percentage >= 80) return 'A1';
    if (percentage >= 70) return 'A';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    if (percentage >= 33) return 'E';
    return 'F';
};

// Create Result
const createResult = async (req, res) => {
    try {
        const {
            student_id,
            subject_id,
            class_id,
            term,
            total_marks,
            obtained_marks
        } = req.body;

        // Calculate percentage and grade automatically
        const percentage = (obtained_marks / total_marks) * 100;
        const grade = calculateGrade(percentage);

        const query = `
            INSERT INTO result (
                student_id,
                subject_id,
                class_id,
                term,
                total_marks,
                obtained_marks,
                percentage,
                grade
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;

        const values = [
            student_id,
            subject_id,
            class_id,
            term,
            total_marks,
            obtained_marks,
            percentage.toFixed(2),
            grade
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: '✅ Result generated!',
            data: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to generate result',
            error: error.message
        });
    }
};

// Get all results
const getAllResults = async (req, res) => {
    try {
        const query = `
            SELECT
                r.result_id,
                r.student_id,
                r.subject_id,
                r.class_id,
                r.term,
                r.total_marks,
                r.obtained_marks,
                r.percentage,
                r.grade,

                p.first_name,
                p.last_name,
                p.email,

                s.roll_no,

                sub.subject_name,
                sub.subject_code,

                c.class_number,
                c.section,
                c.academic_year
            FROM result r
            JOIN student s ON r.student_id = s.student_id
            JOIN person p ON s.email = p.email
            JOIN subject sub ON r.subject_id = sub.subject_id
            JOIN class c ON r.class_id = c.class_id
            ORDER BY r.result_id DESC
        `;

        const result = await pool.query(query);

        res.status(200).json({
            message: '✅ Results fetched!',
            data: result.rows
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to fetch results',
            error: error.message
        });
    }
};

// Get results by student
const getResultsByStudent = async (req, res) => {
    try {
        const studentId = req.params.student_id;

        const query = `
            SELECT
                r.result_id,
                r.student_id,
                r.subject_id,
                r.class_id,
                r.term,
                r.total_marks,
                r.obtained_marks,
                r.percentage,
                r.grade,

                sub.subject_name,
                sub.subject_code,

                c.class_number,
                c.section
            FROM result r
            JOIN subject sub ON r.subject_id = sub.subject_id
            JOIN class c ON r.class_id = c.class_id
            WHERE r.student_id = $1
            ORDER BY r.result_id DESC
        `;

        const result = await pool.query(query, [studentId]);

        res.status(200).json({
            message: '✅ Results fetched!',
            data: result.rows
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to fetch results',
            error: error.message
        });
    }
};

module.exports = {
    createResult,
    getAllResults,
    getResultsByStudent
};