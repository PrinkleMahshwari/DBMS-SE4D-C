const pool = require('../config/db');

// Create Report Card
const createReportCard = async (req, res) => {
    try {
        const {
            student_id,
            class_id,
            academic_year,
            term,
            overall_total_marks,
            overall_obtained_marks,
            parent_signature_name,
            class_teacher_signature_name,
            student_signature_name
        } = req.body;

        // Calculate percentage
        const overall_percentage = (overall_obtained_marks / overall_total_marks) * 100;

        // Calculate grade
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
                student_id,
                class_id,
                academic_year,
                term,
                overall_total_marks,
                overall_obtained_marks,
                overall_percentage,
                overall_grade,
                parent_signature_name,
                class_teacher_signature_name,
                student_signature_name
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;

        const values = [
            student_id,
            class_id,
            academic_year,
            term,
            overall_total_marks,
            overall_obtained_marks,
            overall_percentage.toFixed(2),
            overall_grade,
            parent_signature_name,
            class_teacher_signature_name,
            student_signature_name
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: '✅ Report Card generated!',
            data: result.rows[0]
        });

    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({
                message: '❌ Report card for this student/term/year already exists!'
            });
        }

        res.status(500).json({
            message: '❌ Failed to generate report card',
            error: error.message
        });
    }
};

// Get all report cards
const getAllReportCards = async (req, res) => {
    try {
        const query = `
            SELECT
                rc.report_card_id,
                rc.student_id,
                rc.class_id,
                rc.academic_year,
                rc.term,
                rc.overall_total_marks,
                rc.overall_obtained_marks,
                rc.overall_percentage,
                rc.overall_grade,
                rc.overall_position,
                rc.issue_date,
                rc.parent_signature_name,
                rc.class_teacher_signature_name,
                rc.student_signature_name,

                p.first_name,
                p.last_name,
                p.email,
                p.father_name,

                s.roll_no,

                c.class_number,
                c.section
            FROM report_card rc
            JOIN student s ON rc.student_id = s.student_id
            JOIN person p ON s.email = p.email
            JOIN class c ON rc.class_id = c.class_id
            ORDER BY rc.report_card_id DESC
        `;

        const result = await pool.query(query);

        res.status(200).json({
            message: '✅ Report cards fetched!',
            data: result.rows
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to fetch report cards',
            error: error.message
        });
    }
};

// Get one report card by ID
const getReportCard = async (req, res) => {
    try {
        const reportCardId = req.params.id;

        const query = `
            SELECT
                rc.*,
                p.first_name,
                p.last_name,
                p.email,
                p.father_name,
                s.roll_no,
                c.class_number,
                c.section
            FROM report_card rc
            JOIN student s ON rc.student_id = s.student_id
            JOIN person p ON s.email = p.email
            JOIN class c ON rc.class_id = c.class_id
            WHERE rc.report_card_id = $1
        `;

        const result = await pool.query(query, [reportCardId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: '❌ Report card not found'
            });
        }

        res.status(200).json({
            message: '✅ Report card fetched!',
            data: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to fetch report card',
            error: error.message
        });
    }
};

module.exports = {
    createReportCard,
    getAllReportCards,
    getReportCard
};