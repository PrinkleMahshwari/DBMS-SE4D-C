const pool = require('../config/db');

// allocate seat to student
const allocateSeat = async (req, res) => {
    try {
        const {
            schedule_id,
            student_id,
            seat_no
        } = req.body;

        const query = `
            INSERT INTO seat_allocation (
                schedule_id,
                student_id,
                seat_no
            )
            VALUES ($1, $2, $3)
            RETURNING *
        `;

        const result = await pool.query(query, [
            schedule_id,
            student_id,
            seat_no
        ]);

        res.status(201).json({
            message: '✅ Seat allocated!',
            data: result.rows[0]
        });

    } catch (error) {
        // duplicate schedule/student or duplicate seat number
        if (error.code === '23505') {
            return res.status(400).json({
                message: '❌ Student already has a seat for this schedule OR seat number is already taken!'
            });
        }

        // invalid schedule_id or student_id
        if (error.code === '23503') {
            return res.status(400).json({
                message: '❌ Invalid schedule_id or student_id!'
            });
        }

        res.status(500).json({
            message: '❌ Failed to allocate seat',
            error: error.message
        });
    }
};

// get all seat allocations
const getAllSeats = async (req, res) => {
    try {
        const query = `
            SELECT
                sa.seat_allocation_id,
                sa.schedule_id,
                sa.student_id,
                sa.seat_no,

                p.first_name,
                p.last_name,
                s.roll_no,

                e.exam_name,
                sub.subject_name,
                c.class_number,
                c.section,
                es.schedule_date,
                es.start_time,
                es.end_time
            FROM seat_allocation sa
            JOIN student s ON sa.student_id = s.student_id
            JOIN person p ON s.email = p.email
            JOIN exam_schedule es ON sa.schedule_id = es.schedule_id
            JOIN exam e ON es.exam_id = e.exam_id
            JOIN subject sub ON es.subject_id = sub.subject_id
            JOIN class c ON es.class_id = c.class_id
            ORDER BY sa.seat_allocation_id DESC
        `;

        const result = await pool.query(query);

        res.status(200).json({
            message: '✅ Seat allocations fetched!',
            data: result.rows
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to fetch seat allocations',
            error: error.message
        });
    }
};

// get seats by schedule
const getSeatsBySchedule = async (req, res) => {
    try {
        const scheduleId = req.params.schedule_id;

        const query = `
            SELECT
                sa.seat_allocation_id,
                sa.schedule_id,
                sa.student_id,
                sa.seat_no,

                p.first_name,
                p.last_name,
                s.roll_no,

                e.exam_name,
                sub.subject_name,
                c.class_number,
                c.section,
                es.schedule_date,
                es.start_time,
                es.end_time
            FROM seat_allocation sa
            JOIN student s ON sa.student_id = s.student_id
            JOIN person p ON s.email = p.email
            JOIN exam_schedule es ON sa.schedule_id = es.schedule_id
            JOIN exam e ON es.exam_id = e.exam_id
            JOIN subject sub ON es.subject_id = sub.subject_id
            JOIN class c ON es.class_id = c.class_id
            WHERE sa.schedule_id = $1
            ORDER BY sa.seat_no ASC
        `;

        const result = await pool.query(query, [scheduleId]);

        res.status(200).json({
            message: '✅ Seat map fetched!',
            data: result.rows
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to fetch seats',
            error: error.message
        });
    }
};

// update seat allocation
const updateSeat = async (req, res) => {
    try {
        const seatAllocationId = req.params.id;

        const {
            schedule_id,
            student_id,
            seat_no
        } = req.body;

        const query = `
            UPDATE seat_allocation
            SET
                schedule_id = $1,
                student_id = $2,
                seat_no = $3
            WHERE seat_allocation_id = $4
            RETURNING *
        `;

        const result = await pool.query(query, [
            schedule_id,
            student_id,
            seat_no,
            seatAllocationId
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: '❌ Seat allocation not found'
            });
        }

        res.status(200).json({
            message: '✅ Seat allocation updated!',
            data: result.rows[0]
        });

    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({
                message: '❌ Student already has a seat for this schedule OR seat number is already taken!'
            });
        }

        if (error.code === '23503') {
            return res.status(400).json({
                message: '❌ Invalid schedule_id or student_id!'
            });
        }

        res.status(500).json({
            message: '❌ Failed to update seat allocation',
            error: error.message
        });
    }
};

// delete seat allocation
const deleteSeat = async (req, res) => {
    try {
        const seatAllocationId = req.params.id;

        const result = await pool.query(
            'DELETE FROM seat_allocation WHERE seat_allocation_id = $1 RETURNING *',
            [seatAllocationId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: '❌ Seat allocation not found'
            });
        }

        res.status(200).json({
            message: '✅ Seat allocation deleted!',
            deletedData: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to delete seat allocation',
            error: error.message
        });
    }
};

module.exports = {
    allocateSeat,
    getAllSeats,
    getSeatsBySchedule,
    updateSeat,
    deleteSeat
};