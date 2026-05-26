const pool = require('../config/db');

const createAttendanceMarks = async (req, res) => {
    try {
        const { student_id, class_id, report_card_id, term, leaves, absents } = req.body;
        
        // ERD Logic: Base is 25. Leave = -0.5, Absent = -1
        const deduction = (leaves * 0.5) + (absents * 1);
        let total_attendance_marks = 25 - deduction;
        
        // Marks cannot go below 0
        if (total_attendance_marks < 0) total_attendance_marks = 0;

        const query = `
            INSERT INTO attendance_marks (student_id, class_id, report_card_id, term, total_attendance_marks, leaves, absents)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
        `;
        const values = [student_id, class_id, report_card_id, term, total_attendance_marks.toFixed(1), leaves, absents];
        const result = await pool.query(query, values);

        res.status(201).json({ message: '✅ Attendance marks calculated!', data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to calculate attendance marks', error: error.message });
    }
};

module.exports = { createAttendanceMarks };