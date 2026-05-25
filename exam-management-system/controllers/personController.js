// controllers/personController.js

// Import the database pool so we can talk to PostgreSQL
const pool = require('../config/db');

// ========== CREATE a new Person ==========
// POST request
const createPerson = async (req, res) => {
    try {
        // 1. Get data from the request body
        const { 
            email, first_name, last_name, gender, dob, 
            father_name, phone, street, area, postal_code, 
            city, province, country 
        } = req.body;

        // 2. Write the SQL query
        // The $1, $2, etc. are called "parameterized queries". 
        // They prevent SQL Injection (hackers destroying your database).
        // NEVER do: `INSERT INTO person VALUES ('${email}')` - it's unsafe!
        const query = `
            INSERT INTO person (
                email, first_name, last_name, gender, dob, 
                father_name, phone, street, area, postal_code, 
                city, province, country
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;

        // 3. Execute the query
        const values = [email, first_name, last_name, gender, dob, father_name, phone, street, area, postal_code, city, province, country];
        const result = await pool.query(query, values);

        // 4. Send success response
        res.status(201).json({
            message: '✅ Person created successfully!',
            data: result.rows[0] // RETURNING * gives us the newly created row
        });

    } catch (error) {
        // 5. Handle errors (like duplicate email)
        res.status(500).json({
            message: '❌ Failed to create person',
            error: error.message
        });
    }
};

// ========== READ all Persons ==========
// GET request
const getAllPersons = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM person ORDER BY first_name ASC');
        
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

// ========== READ one Person by Email ==========
// GET request with a parameter
const getPersonByEmail = async (req, res) => {
    try {
        // req.params.email gets the value from the URL: /persons/:email
        const email = req.params.email;

        const result = await pool.query('SELECT * FROM person WHERE email = $1', [email]);

        // Check if person exists
        if (result.rows.length === 0) {
            return res.status(404).json({ message: '❌ Person not found' });
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

// ========== UPDATE a Person ==========
// PUT request
const updatePerson = async (req, res) => {
    try {
        const email = req.params.email;
        const { 
            first_name, last_name, gender, dob, 
            father_name, phone, street, area, postal_code, 
            city, province, country 
        } = req.body;

        const query = `
            UPDATE person SET 
                first_name = $1, last_name = $2, gender = $3, dob = $4, 
                father_name = $5, phone = $6, street = $7, area = $8, 
                postal_code = $9, city = $10, province = $11, country = $12
            WHERE email = $13
            RETURNING *
        `;

        const values = [first_name, last_name, gender, dob, father_name, phone, street, area, postal_code, city, province, country, email];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: '❌ Person not found to update' });
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

// ========== DELETE a Person ==========
// DELETE request
const deletePerson = async (req, res) => {
    try {
        const email = req.params.email;

        // Because we used ON DELETE CASCADE in Phase 1,
        // deleting a Person will automatically delete their Student/Teacher records too!
        const result = await pool.query('DELETE FROM person WHERE email = $1 RETURNING *', [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: '❌ Person not found to delete' });
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

// Export all functions so routes can use them
module.exports = {
    createPerson,
    getAllPersons,
    getPersonByEmail,
    updatePerson,
    deletePerson
};