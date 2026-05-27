// controllers/studentController.js

const pool = require('../config/db');

// create new student
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
        // Error code 23503 means email does not exist in person table
        if (error.code === '23503') {
            return res.status(400).json({
                message: '❌ Failed: This email does not exist in the Person table. Create a Person first!',
                error: error.message
            });
        }

        // Error code 23505 means duplicate student
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

// get all students
const getAllStudents = async (req, res) => {
    try {
        // join student with person so frontend can show full student details
        const query = `
            SELECT 
                s.student_id,
                s.email,
                s.roll_no,
                s.emergency_phone,
                s.class_id,

                p.first_name,
                p.last_name,
                p.gender,
                p.dob,
                p.father_name,
                p.phone,
                p.street,
                p.area,
                p.postal_code,
                p.city,
                p.province,
                p.country,
                p.religion,

                c.class_number,
                c.section,
                c.academic_year
            FROM student s
            JOIN person p ON s.email = p.email
            LEFT JOIN class c ON s.class_id = c.class_id
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

// get one student by id
const getStudentById = async (req, res) => {
    try {
        const studentId = req.params.id;

        const query = `
            SELECT 
                s.student_id,
                s.email,
                s.roll_no,
                s.emergency_phone,
                s.class_id,

                p.first_name,
                p.last_name,
                p.gender,
                p.dob,
                p.father_name,
                p.phone,
                p.street,
                p.area,
                p.postal_code,
                p.city,
                p.province,
                p.country,
                p.religion,

                c.class_number,
                c.section,
                c.academic_year
            FROM student s
            JOIN person p ON s.email = p.email
            LEFT JOIN class c ON s.class_id = c.class_id
            WHERE s.student_id = $1
        `;

        const result = await pool.query(query, [studentId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: '❌ Student not found'
            });
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

// update student and related person data
const updateStudent = async (req, res) => {
    const client = await pool.connect();

    try {
        const studentId = req.params.id;

        const {
            first_name,
            last_name,
            gender,
            dob,
            father_name,
            phone,
            street,
            area,
            postal_code,
            city,
            province,
            country,
            religion,
            roll_no,
            emergency_phone,
            class_id
        } = req.body;

        // start transaction so both person and student update together
        await client.query('BEGIN');

        // find student email first because person table uses email
        const studentCheck = await client.query(
            `SELECT email FROM student WHERE student_id = $1`,
            [studentId]
        );

        if (studentCheck.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                message: '❌ Student not found to update'
            });
        }

        const email = studentCheck.rows[0].email;

        // update person table fields
        await client.query(
            `
            UPDATE person
            SET
                first_name = $1,
                last_name = $2,
                gender = $3,
                dob = $4,
                father_name = $5,
                phone = $6,
                street = $7,
                area = $8,
                postal_code = $9,
                city = $10,
                province = $11,
                country = $12,
                religion = $13
            WHERE email = $14
            `,
            [
                first_name,
                last_name,
                gender,
                dob,
                father_name,
                phone,
                street,
                area,
                postal_code,
                city,
                province,
                country,
                religion,
                email
            ]
        );

        // update student table fields
        const updatedStudent = await client.query(
            `
            UPDATE student
            SET
                roll_no = $1,
                emergency_phone = $2,
                class_id = $3
            WHERE student_id = $4
            RETURNING *
            `,
            [
                roll_no,
                emergency_phone,
                class_id,
                studentId
            ]
        );

        // save both updates
        await client.query('COMMIT');

        res.status(200).json({
            message: '✅ Student updated successfully!',
            data: updatedStudent.rows[0]
        });

    } catch (error) {
        // undo update if anything fails
        await client.query('ROLLBACK');

        res.status(500).json({
            message: '❌ Failed to update student',
            error: error.message
        });

    } finally {
        // release connection
        client.release();
    }
};

// delete student
const deleteStudent = async (req, res) => {
    try {
        const studentId = req.params.id;

        const result = await pool.query(
            'DELETE FROM student WHERE student_id = $1 RETURNING *',
            [studentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: '❌ Student not found to delete'
            });
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