const pool = require('../config/db');

const createLab = async (req, res) => {
    try {
        const { lab_name, lab_type, capacity, location } = req.body;
        const result = await pool.query(
            'INSERT INTO lab (lab_name, lab_type, capacity, location) VALUES ($1, $2, $3, $4) RETURNING *',
            [lab_name, lab_type, capacity, location]
        );
        res.status(201).json({ message: '✅ Lab created!', data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to create lab', error: error.message });
    }
};

const getAllLabs = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM lab ORDER BY lab_name ASC');
        res.status(200).json({ message: '✅ Labs fetched!', data: result.rows });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to fetch labs', error: error.message });
    }
};

module.exports = { createLab, getAllLabs };