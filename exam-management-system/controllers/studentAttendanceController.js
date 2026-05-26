const pool = require('../config/db');

// get all student attendance records
const getAllAttendance = async (req, res) => {
    try {
        // this query will show attendance with student name, class, exam and subject
        const query = `
            SELECT
                sa.attendance_id,
                sa.schedule_id,
                sa.student_id,
                sa.invigilation_id,
                sa.status,
                sa.reason,
                sa.re_exam_eligibility,

                p.first_name,
                p.last_name,
                p.email,

                c.class_number,
                c.section,

                e.exam_name,
                sub.subject_name
            FROM student_attendance sa
            JOIN student st ON sa.student_id = st.student_id
            JOIN person p ON st.email = p.email
            JOIN exam_schedule es ON sa.schedule_id = es.schedule_id
            JOIN class c ON es.class_id = c.class_id
            JOIN exam e ON es.exam_id = e.exam_id
            JOIN subject sub ON es.subject_id = sub.subject_id
            ORDER BY sa.attendance_id DESC
        `;

        const result = await pool.query(query);

        res.status(200).json({
            message: '✅ Attendance fetched successfully',
            data: result.rows
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to fetch attendance',
            error: error.message
        });
    }
};

// create attendance manually
const createAttendance = async (req, res) => {
    try {
        const {
            schedule_id,
            student_id,
            invigilation_id,
            status,
            reason,
            re_exam_eligibility
        } = req.body;

        // insert attendance record
        const query = `
            INSERT INTO student_attendance (
                schedule_id,
                student_id,
                invigilation_id,
                status,
                reason,
                re_exam_eligibility
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;

        const values = [
            schedule_id,
            student_id,
            invigilation_id,
            status,
            reason,
            re_exam_eligibility
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: '✅ Attendance added successfully',
            data: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to add attendance',
            error: error.message
        });
    }
};

module.exports = {
    getAllAttendance,
    createAttendance
};