const pool = require('../config/db');

const createReportCard = async (req, res) => {
    try {
        const { 
            student_id, class_id, academic_year, term, 
            overall_total_marks, overall_obtained_marks,
            parent_signature_name, class_teacher_signature_name, student_signature_name
        } = req.body;
        
        // Calculate overall percentage and grade
        const overall_percentage = (overall_obtained_marks / overall_total_marks) * 100;
        
        // Re-use the same grading logic
        let overall_grade;
        if (overall_percentage >= 80) overall_grade = 'A1';
        else if (overall_percentage >= 70) overall_grade = 'A';
        else if (overall_percentage >= 60) overall_grade = 'B';
        else if (overall_percentage >= 50) overall_grade = 'C';
        else if (overall_percentage >= 40) overall_grade = 'D';
        else if (overall_percentage >= 33) overall_grade = 'E';
        else overall_grade = 'F';

        const query = `
            INSERT INTO report_card (
                student_id, class_id, academic_year, term, 
                overall_total_marks, overall_obtained_marks, overall_percentage, overall_grade,
                parent_signature_name, class_teacher_signature_name, student_signature_name
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
        `;
        const values = [
            student_id, class_id, academic_year, term, 
            overall_total_marks, overall_obtained_marks, overall_percentage.toFixed(2), overall_grade,
            parent_signature_name, class_teacher_signature_name, student_signature_name
        ];
        const result = await pool.query(query, values);

        res.status(201).json({ message: '✅ Report Card generated!', data: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') return res.status(400).json({ message: '❌ Report card for this student/term/year already exists!' });
        res.status(500).json({ message: '❌ Failed to generate report card', error: error.message });
    }
};

const getReportCard = async (req, res) => {
    try {
        const reportCardId = req.params.id;
        const result = await pool.query('SELECT * FROM report_card WHERE report_card_id = $1', [reportCardId]);
        if (result.rows.length === 0) return res.status(404).json({ message: '❌ Report card not found' });
        res.status(200).json({ message: '✅ Report card fetched!', data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to fetch report card', error: error.message });
    }
};

module.exports = { createReportCard, getReportCard };