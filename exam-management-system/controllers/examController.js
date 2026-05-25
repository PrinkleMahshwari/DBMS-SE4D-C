const pool = require('../config/db');

const createExam = async (req, res) => {
    try {
        const { exam_name, exam_type, exam_date, total_marks } = req.body;
        const result = await pool.query(
            'INSERT INTO exam (exam_name, exam_type, exam_date, total_marks) VALUES ($1, $2, $3, $4) RETURNING *',
            [exam_name, exam_type, exam_date, total_marks]
        );
        res.status(201).json({ message: '✅ Exam created!', data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to create exam', error: error.message });
    }
};

const getAllExams = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM exam ORDER BY exam_date DESC');
        res.status(200).json({ message: '✅ Exams fetched!', data: result.rows });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to fetch exams', error: error.message });
    }
};

const getExamById = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM exam WHERE exam_id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: '❌ Exam not found' });
        res.status(200).json({ message: '✅ Exam found!', data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to fetch exam', error: error.message });
    }
};

module.exports = { createExam, getAllExams, getExamById };