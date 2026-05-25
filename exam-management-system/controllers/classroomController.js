const pool = require('../config/db');

const createClassroom = async (req, res) => {
    try {
        const { class_number, section, capacity } = req.body;
        const result = await pool.query(
            'INSERT INTO classroom (class_number, section, capacity) VALUES ($1, $2, $3) RETURNING *',
            [class_number, section, capacity]
        );
        res.status(201).json({ message: '✅ Classroom created!', data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to create classroom', error: error.message });
    }
};

const getAllClassrooms = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM classroom ORDER BY class_number ASC');
        res.status(200).json({ message: '✅ Classrooms fetched!', data: result.rows });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to fetch classrooms', error: error.message });
    }
};

module.exports = { createClassroom, getAllClassrooms };