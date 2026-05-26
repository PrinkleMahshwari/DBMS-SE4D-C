const pool = require('../config/db');

// get all attendance marks
const getAllAttendanceMarks = async (req, res) => {
    try {
        // this query will show attendance marks with student and class details
        const query = `
            SELECT
                am.attendance_marks_id,
                am.student_id,
                am.class_id,
                am.report_card_id,
                am.term,
                am.total_attendance_marks,
                am.leaves,
                am.absents,

                p.first_name,
                p.last_name,
                p.email,

                c.class_number,
                c.section
            FROM attendance_marks am
            JOIN student st ON am.student_id = st.student_id
            JOIN person p ON st.email = p.email
            JOIN class c ON am.class_id = c.class_id
            ORDER BY am.attendance_marks_id DESC
        `;

        const result = await pool.query(query);

        res.status(200).json({
            message: '✅ Attendance marks fetched successfully',
            data: result.rows
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to fetch attendance marks',
            error: error.message
        });
    }
};

// create attendance marks manually
const createAttendanceMarks = async (req, res) => {
    try {
        const {
            student_id,
            class_id,
            report_card_id,
            term,
            total_attendance_marks,
            leaves,
            absents
        } = req.body;

        // insert attendance marks record
        const query = `
            INSERT INTO attendance_marks (
                student_id,
                class_id,
                report_card_id,
                term,
                total_attendance_marks,
                leaves,
                absents
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const values = [
            student_id,
            class_id,
            report_card_id,
            term,
            total_attendance_marks,
            leaves,
            absents
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: '✅ Attendance marks added successfully',
            data: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to add attendance marks',
            error: error.message
        });
    }
};

module.exports = {
    getAllAttendanceMarks,
    createAttendanceMarks
};