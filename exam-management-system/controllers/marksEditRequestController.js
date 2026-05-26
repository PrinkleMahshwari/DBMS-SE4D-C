const pool = require('../config/db');

const createEditRequest = async (req, res) => {
    try {
        const { marks_id, teacher_id, principal_id, old_marks, new_marks, reason } = req.body;
        
        const query = `
            INSERT INTO marks_edit_request (marks_id, teacher_id, principal_id, old_marks, new_marks, reason)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const values = [marks_id, teacher_id, principal_id, old_marks, new_marks, reason];
        const result = await pool.query(query, values);

        res.status(201).json({ message: '✅ Edit request submitted to Principal!', data: result.rows[0] });
    } catch (error) {
        if (error.code === '23503') return res.status(400).json({ message: '❌ Invalid marks_id, teacher_id, or principal_id!' });
        res.status(500).json({ message: '❌ Failed to submit request', error: error.message });
    }
};

const approveEditRequest = async (req, res) => {
    try {
        const requestId = req.params.id;
        
        // 1. Get the edit request details
        const requestResult = await pool.query('SELECT * FROM marks_edit_request WHERE edit_request_id = $1', [requestId]);
        if (requestResult.rows.length === 0) return res.status(404).json({ message: '❌ Request not found' });
        
        const editRequest = requestResult.rows[0];

        // 2. Update the actual marks in the marks table
        await pool.query(
            'UPDATE marks SET marks_obtained = $1 WHERE marks_id = $2',
            [editRequest.new_marks, editRequest.marks_id]
        );

        // 3. Update the request status to Approved
        const updateResult = await pool.query(
            `UPDATE marks_edit_request SET approval_status = 'Approved', approval_date = CURRENT_TIMESTAMP WHERE edit_request_id = $1 RETURNING *`,
            [requestId]
        );

        res.status(200).json({ message: '✅ Edit request approved and marks updated!', data: updateResult.rows[0] });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to approve request', error: error.message });
    }
};

module.exports = { createEditRequest, approveEditRequest };