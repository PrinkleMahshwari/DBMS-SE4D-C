const pool = require('../config/db');

const assignInvigilator = async (req, res) => {
    try {
        const { schedule_id, teacher_id, role } = req.body;
        
        const query = `
            INSERT INTO invigilation (schedule_id, teacher_id, role)
            VALUES ($1, $2, $3) RETURNING *
        `;
        const result = await pool.query(query, [schedule_id, teacher_id, role]);

        res.status(201).json({ message: '✅ Invigilator assigned!', data: result.rows[0] });
    } catch (error) {
        if (error.code === '23503') return res.status(400).json({ message: '❌ Invalid schedule_id or teacher_id!' });
        res.status(500).json({ message: '❌ Failed to assign invigilator', error: error.message });
    }
};

module.exports = { assignInvigilator };