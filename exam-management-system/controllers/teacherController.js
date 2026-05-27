const pool = require('../config/db');

// create a teacher
const createTeacher = async (req, res) => {
    try {
        const {
            email,
            qualification,
            experience_years,
            teacher_type,
            status
        } = req.body;

        const query = `
            INSERT INTO teacher (
                email,
                qualification,
                experience_years,
                teacher_type,
                status
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;

        const values = [
            email,
            qualification,
            experience_years,
            teacher_type,
            status || 'Active'
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: '✅ Teacher created!',
            data: result.rows[0]
        });

    } catch (error) {
        // email must exist in person table first
        if (error.code === '23503') {
            return res.status(400).json({
                message: '❌ Email does not exist in Person table. Create a Person first!',
                error: error.message
            });
        }

        // teacher email must be unique
        if (error.code === '23505') {
            return res.status(400).json({
                message: '❌ A teacher with this email already exists!',
                error: error.message
            });
        }

        res.status(500).json({
            message: '❌ Failed to create teacher',
            error: error.message
        });
    }
};

// get all teachers
const getAllTeachers = async (req, res) => {
    try {
        const query = `
            SELECT 
                t.teacher_id,
                t.email,
                t.qualification,
                t.experience_years,
                t.teacher_type,
                t.status,

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
                p.religion
            FROM teacher t
            JOIN person p ON t.email = p.email
            ORDER BY t.teacher_id ASC
        `;

        const result = await pool.query(query);

        res.status(200).json({
            message: '✅ Teachers fetched!',
            data: result.rows
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to fetch teachers',
            error: error.message
        });
    }
};

// get one teacher by id
const getTeacherById = async (req, res) => {
    try {
        const query = `
            SELECT 
                t.teacher_id,
                t.email,
                t.qualification,
                t.experience_years,
                t.teacher_type,
                t.status,

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
                p.religion
            FROM teacher t
            JOIN person p ON t.email = p.email
            WHERE t.teacher_id = $1
        `;

        const result = await pool.query(query, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: '❌ Teacher not found'
            });
        }

        res.status(200).json({
            message: '✅ Teacher found!',
            data: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to fetch teacher',
            error: error.message
        });
    }
};

// update teacher and related person data
const updateTeacher = async (req, res) => {
    const client = await pool.connect();

    try {
        const teacherId = req.params.id;

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
            qualification,
            experience_years,
            teacher_type,
            status
        } = req.body;

        // start transaction so both person and teacher update together
        await client.query('BEGIN');

        // find teacher email first because person table uses email
        const teacherCheck = await client.query(
            `SELECT email FROM teacher WHERE teacher_id = $1`,
            [teacherId]
        );

        if (teacherCheck.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                message: '❌ Teacher not found'
            });
        }

        const email = teacherCheck.rows[0].email;

        // update person table
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

        // update teacher table
        const result = await client.query(
            `
            UPDATE teacher
            SET
                qualification = $1,
                experience_years = $2,
                teacher_type = $3,
                status = $4
            WHERE teacher_id = $5
            RETURNING *
            `,
            [
                qualification,
                experience_years,
                teacher_type,
                status,
                teacherId
            ]
        );

        // save both updates
        await client.query('COMMIT');

        res.status(200).json({
            message: '✅ Teacher updated!',
            data: result.rows[0]
        });

    } catch (error) {
        // undo update if anything fails
        await client.query('ROLLBACK');

        res.status(500).json({
            message: '❌ Failed to update teacher',
            error: error.message
        });

    } finally {
        // release connection
        client.release();
    }
};

// delete teacher
const deleteTeacher = async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM teacher WHERE teacher_id = $1 RETURNING *',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: '❌ Teacher not found'
            });
        }

        res.status(200).json({
            message: '✅ Teacher deleted!',
            deletedData: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to delete teacher',
            error: error.message
        });
    }
};

module.exports = {
    createTeacher,
    getAllTeachers,
    getTeacherById,
    updateTeacher,
    deleteTeacher
};