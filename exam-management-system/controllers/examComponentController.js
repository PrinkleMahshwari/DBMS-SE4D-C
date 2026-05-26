const pool = require('../config/db');

const createComponent = async (req, res) => {
    try {
        const { exam_id, subject_id, component_type, max_marks, conducted_in } = req.body;
        
        const query = `
            INSERT INTO exam_component (exam_id, subject_id, component_type, max_marks, conducted_in)
            VALUES ($1, $2, $3, $4, $5) RETURNING *
        `;
        const values = [exam_id, subject_id, component_type, max_marks, conducted_in];
        const result = await pool.query(query, values);

        res.status(201).json({ message: '✅ Exam Component created!', data: result.rows[0] });
    } catch (error) {
        if (error.code === '23503') return res.status(400).json({ message: '❌ Invalid exam_id or subject_id!' });
        res.status(500).json({ message: '❌ Failed to create component', error: error.message });
    }
};

const getComponentsByExam = async (req, res) => {
    try {
        const examId = req.params.exam_id;
        const result = await pool.query('SELECT * FROM exam_component WHERE exam_id = $1', [examId]);
        res.status(200).json({ message: '✅ Components fetched!', data: result.rows });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to fetch components', error: error.message });
    }
};

module.exports = { createComponent, getComponentsByExam };