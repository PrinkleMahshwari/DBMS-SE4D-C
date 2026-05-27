const pool = require('../config/db');

// create a new person
const createPerson = async (req, res) => {
    try {
        const {
            email,
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
            religion
        } = req.body;

        const query = `
            INSERT INTO person (
                email,
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
                religion
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        `;

        const values = [
            email,
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
            religion
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: '✅ Person created successfully!',
            data: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to create person',
            error: error.message
        });
    }
};

// get all persons
const getAllPersons = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM person ORDER BY first_name ASC'
        );

        res.status(200).json({
            message: '✅ Persons fetched successfully!',
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to fetch persons',
            error: error.message
        });
    }
};

// get one person by email
const getPersonByEmail = async (req, res) => {
    try {
        const email = req.params.email;

        const result = await pool.query(
            'SELECT * FROM person WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: '❌ Person not found'
            });
        }

        res.status(200).json({
            message: '✅ Person found!',
            data: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to fetch person',
            error: error.message
        });
    }
};

// update a person
const updatePerson = async (req, res) => {
    try {
        const email = req.params.email;

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
            religion
        } = req.body;

        const query = `
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
            RETURNING *
        `;

        const values = [
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
        ];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: '❌ Person not found to update'
            });
        }

        res.status(200).json({
            message: '✅ Person updated successfully!',
            data: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to update person',
            error: error.message
        });
    }
};

// delete a person
const deletePerson = async (req, res) => {
    try {
        const email = req.params.email;

        const result = await pool.query(
            'DELETE FROM person WHERE email = $1 RETURNING *',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: '❌ Person not found to delete'
            });
        }

        res.status(200).json({
            message: '✅ Person and their roles deleted successfully!',
            deletedData: result.rows[0]
        });

    } catch (error) {
        res.status(500).json({
            message: '❌ Failed to delete person',
            error: error.message
        });
    }
};

module.exports = {
    createPerson,
    getAllPersons,
    getPersonByEmail,
    updatePerson,
    deletePerson
};