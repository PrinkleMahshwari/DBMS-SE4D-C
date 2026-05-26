const pool = require('../config/db');

const createSchedule = async (req, res) => {
    try {
        const { 
            exam_id, class_id, subject_id, room_id, lab_id, 
            scheduled_by_admin_id, schedule_day, schedule_date, start_time, end_time 
        } = req.body;
        
        // approved_by_principal_id is left out because it defaults to Pending/null initially
        const query = `
            INSERT INTO exam_schedule (
                exam_id, class_id, subject_id, room_id, lab_id, 
                scheduled_by_admin_id, schedule_day, schedule_date, start_time, end_time
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
        `;
        
        // If room_id or lab_id is not provided, we convert empty string to null
        const values = [
            exam_id, class_id, subject_id, room_id || null, lab_id || null, 
            scheduled_by_admin_id, schedule_day, schedule_date, start_time, end_time
        ];
        
        const result = await pool.query(query, values);

        res.status(201).json({ message: '✅ Exam Schedule created!', data: result.rows[0] });
    } catch (error) {
        if (error.code === '23503') return res.status(400).json({ message: '❌ Foreign Key Violation! Check your IDs.' });
        res.status(500).json({ message: '❌ Failed to create schedule', error: error.message });
    }
};

const getAllSchedules = async (req, res) => {
    try {
        // Massive JOIN to get human-readable data!
        const query = `
            SELECT 
                es.schedule_id, es.schedule_day, es.schedule_date, es.start_time, es.end_time, es.status,
                e.exam_name, e.exam_type,
                c.class_number, c.section,
                s.subject_name,
                cr.class_number AS room_number, cr.section AS room_section,
                l.lab_name,
                p.first_name AS admin_first_name
            FROM exam_schedule es
            JOIN exam e ON es.exam_id = e.exam_id
            JOIN class c ON es.class_id = c.class_id
            JOIN subject s ON es.subject_id = s.subject_id
            LEFT JOIN classroom cr ON es.room_id = cr.room_id
            LEFT JOIN lab l ON es.lab_id = l.lab_id
            JOIN admin a ON es.scheduled_by_admin_id = a.admin_id
            JOIN person p ON a.email = p.email
        `;
        const result = await pool.query(query);

        res.status(200).json({ message: '✅ Schedules fetched!', data: result.rows });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to fetch schedules', error: error.message });
    }
};

const approveSchedule = async (req, res) => {
    try {
        const scheduleId = req.params.id;
        const { approved_by_principal_id } = req.body;

        const result = await pool.query(
            `UPDATE exam_schedule 
             SET approved_by_principal_id = $1, status = 'Approved' 
             WHERE schedule_id = $2 RETURNING *`,
            [approved_by_principal_id, scheduleId]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: '❌ Schedule not found' });

        res.status(200).json({ message: '✅ Schedule approved by Principal!', data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to approve schedule', error: error.message });
    }
};

module.exports = { createSchedule, getAllSchedules, approveSchedule };