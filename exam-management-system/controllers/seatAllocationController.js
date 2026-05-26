const pool = require('../config/db');

const allocateSeat = async (req, res) => {
    try {
        const { schedule_id, student_id, seat_no } = req.body;
        
        const query = `
            INSERT INTO seat_allocation (schedule_id, student_id, seat_no)
            VALUES ($1, $2, $3) RETURNING *
        `;
        const result = await pool.query(query, [schedule_id, student_id, seat_no]);

        res.status(201).json({ message: '✅ Seat allocated!', data: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: '❌ Student already has a seat for this schedule OR seat number is already taken!' });
        }
        if (error.code === '23503') return res.status(400).json({ message: '❌ Invalid schedule_id or student_id!' });
        res.status(500).json({ message: '❌ Failed to allocate seat', error: error.message });
    }
};

const getSeatsBySchedule = async (req, res) => {
    try {
        const scheduleId = req.params.schedule_id;
        const result = await pool.query(
            `SELECT sa.seat_no, p.first_name, p.last_name, s.roll_no 
             FROM seat_allocation sa 
             JOIN student s ON sa.student_id = s.student_id 
             JOIN person p ON s.email = p.email 
             WHERE sa.schedule_id = $1 
             ORDER BY sa.seat_no ASC`,
            [scheduleId]
        );
        res.status(200).json({ message: '✅ Seat map fetched!', data: result.rows });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to fetch seats', error: error.message });
    }
};

module.exports = { allocateSeat, getSeatsBySchedule };