const pool = require('../config/db');

const recordAttendance = async (req, res) => {
    try {
        const { schedule_id, student_id, invigilation_id, status, reason, re_exam_eligibility } = req.body;
        
        const query = `
            INSERT INTO student_attendance (schedule_id, student_id, invigilation_id, status, reason, re_exam_eligibility)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const values = [schedule_id, student_id, invigilation_id, status, reason, re_exam_eligibility];
        const result = await pool.query(query, values);

        res.status(201).json({ message: '✅ Attendance recorded!', data: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: '❌ Attendance for this student in this schedule already exists!' });
        }
        if (error.code === '23503') return res.status(400).json({ message: '❌ Invalid IDs provided!' });
        res.status(500).json({ message: '❌ Failed to record attendance', error: error.message });
    }
};

module.exports = { recordAttendance };