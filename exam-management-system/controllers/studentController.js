// controllers/studentController.js

const pool = require('../config/db');

const createStudent = async (req, res) => {
    try {
        const { email, roll_no, emergency_phone, class_id } = req.body;

        const query = `
            INSERT INTO student (email, roll_no, emergency_phone, class_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        const values = [email, roll_no, emergency_phone, class_id];
        const result = await pool.query(query, values);

        res.status(201).json({
            message: '✅ Student created successfully!',
            data: result.rows[0]
        });

        } catch (error) {
        // Error code 23503 means Foreign Key Violation (Person doesn't exist)
        if (error.code === '23503') {
            return res.status(400).json({
                message: '❌ Failed: This email does not exist in the Person table. Create a Person first!',
                error: error.message
            });
        }
        // Error code 23505 means Unique Violation (Duplicate email)
        if (error.code === '23505') {
            return res.status(400).json({
                message: '❌ Failed: A student with this email already exists!',
                error: error.message
            });
        }
        
        res.status(500).json({
            message: '❌ Failed to create student',
            error: error.message
        });
    }
};

const getAllStudents = async (req, res) => {
    try {
        // Let's do a JOIN so we get student details AND their personal info!
        const query = `
            SELECT s.student_id, s.email, s.roll_no, s.emergency_phone, s.class_id,
                   p.first_name, p.last_name, p.gender, p.phone
            FROM student s
            JOIN person p ON s.email = p.email
            ORDER BY s.roll_no ASC
        `;
        const result = await pool.query(query);

        res.status(200).json({
            message: '✅ Students fetched successfully!',
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to fetch students',
            error: error.message
        });
    }
};

const getStudentById = async (req, res) => {
    try {
        const studentId = req.params.id;

        const query = `
            SELECT s.student_id, s.email, s.roll_no, s.emergency_phone, s.class_id,
                   p.first_name, p.last_name, p.gender, p.phone
            FROM student s
            JOIN person p ON s.email = p.email
            WHERE s.student_id = $1
        `;
        const result = await pool.query(query, [studentId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: '❌ Student not found' });
        }

        res.status(200).json({
            message: '✅ Student found!',
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to fetch student',
            error: error.message
        });
    }
};

const updateStudent = async (req, res) => {
    try {
        const studentId = req.params.id;
        const { roll_no, emergency_phone, class_id } = req.body;

        const query = `
            UPDATE student 
            SET roll_no = $1, emergency_phone = $2, class_id = $3
            WHERE student_id = $4
            RETURNING *
        `;
        const values = [roll_no, emergency_phone, class_id, studentId];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: '❌ Student not found to update' });
        }

        res.status(200).json({
            message: '✅ Student updated successfully!',
            data: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to update student',
            error: error.message
        });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const studentId = req.params.id;
        const result = await pool.query('DELETE FROM student WHERE student_id = $1 RETURNING *', [studentId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: '❌ Student not found to delete' });
        }

        res.status(200).json({
            message: '✅ Student deleted successfully!',
            deletedData: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to delete student',
            error: error.message
        });
    }
};

module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent
};