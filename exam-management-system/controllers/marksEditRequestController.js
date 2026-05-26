const pool = require('../config/db');

// get all marks edit requests
const getAllMarksEditRequests = async (req, res) => {
    try {
        // this query shows request with teacher, principal, student, subject and marks details
        const query = `
            SELECT
                mer.edit_request_id,
                mer.marks_id,
                mer.teacher_id,
                mer.principal_id,
                mer.old_marks,
                mer.new_marks,
                mer.reason,
                mer.approval_status,
                mer.request_date,
                mer.approval_date,

                m.student_id,
                m.subject_id,
                m.exam_id,

                sp.first_name AS student_first_name,
                sp.last_name AS student_last_name,

                tp.first_name AS teacher_first_name,
                tp.last_name AS teacher_last_name,

                pp.first_name AS principal_first_name,
                pp.last_name AS principal_last_name,

                sub.subject_name,
                e.exam_name
            FROM marks_edit_request mer
            JOIN marks m ON mer.marks_id = m.marks_id
            JOIN student st ON m.student_id = st.student_id
            JOIN person sp ON st.email = sp.email
            JOIN teacher t ON mer.teacher_id = t.teacher_id
            JOIN person tp ON t.email = tp.email
            JOIN principal pr ON mer.principal_id = pr.principal_id
            JOIN person pp ON pr.email = pp.email
            JOIN subject sub ON m.subject_id = sub.subject_id
            JOIN exam e ON m.exam_id = e.exam_id
            ORDER BY mer.edit_request_id DESC
        `;

        const result = await pool.query(query);

        res.status(200).json({
            message: '✅ Marks edit requests fetched successfully',
            data: result.rows
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to fetch marks edit requests',
            error: error.message
        });
    }
};

// create marks edit request
const createMarksEditRequest = async (req, res) => {
    try {
        const {
            marks_id,
            teacher_id,
            principal_id,
            old_marks,
            new_marks,
            reason
        } = req.body;

        // insert request as pending by default
        const query = `
            INSERT INTO marks_edit_request (
                marks_id,
                teacher_id,
                principal_id,
                old_marks,
                new_marks,
                reason,
                approval_status,
                request_date
            )
            VALUES ($1, $2, $3, $4, $5, $6, 'Pending', CURRENT_TIMESTAMP)
            RETURNING *
        `;

        const values = [
            marks_id,
            teacher_id,
            principal_id,
            old_marks,
            new_marks,
            reason
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: '✅ Marks edit request created successfully',
            data: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to create marks edit request',
            error: error.message
        });
    }
};

// approve marks edit request
const approveMarksEditRequest = async (req, res) => {
    try {
        const editRequestId = req.params.id;

        // get request first
        const requestResult = await pool.query(
            `SELECT * FROM marks_edit_request WHERE edit_request_id = $1`,
            [editRequestId]
        );

        if (requestResult.rows.length === 0) {
            return res.status(404).json({
                message: '❌ Marks edit request not found'
            });
        }

        const request = requestResult.rows[0];

        // update actual marks table
        await pool.query(
            `UPDATE marks SET marks_obtained = $1 WHERE marks_id = $2`,
            [request.new_marks, request.marks_id]
        );

        // approve request
        const updateRequest = await pool.query(
            `
            UPDATE marks_edit_request
            SET approval_status = 'Approved',
                approval_date = CURRENT_TIMESTAMP
            WHERE edit_request_id = $1
            RETURNING *
            `,
            [editRequestId]
        );

        res.status(200).json({
            message: '✅ Marks edit request approved successfully',
            data: updateRequest.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to approve marks edit request',
            error: error.message
        });
    }
};

// reject marks edit request
const rejectMarksEditRequest = async (req, res) => {
    try {
        const editRequestId = req.params.id;

        const result = await pool.query(
            `
            UPDATE marks_edit_request
            SET approval_status = 'Rejected',
                approval_date = CURRENT_TIMESTAMP
            WHERE edit_request_id = $1
            RETURNING *
            `,
            [editRequestId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: '❌ Marks edit request not found'
            });
        }

        res.status(200).json({
            message: '✅ Marks edit request rejected successfully',
            data: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to reject marks edit request',
            error: error.message
        });
    }
};

module.exports = {
    getAllMarksEditRequests,
    createMarksEditRequest,
    approveMarksEditRequest,
    rejectMarksEditRequest
};