const pool = require('../config/db');

const createClass = async (req, res) => {
    try {
        const { class_number, section, academic_year } = req.body;
        const result = await pool.query(
            'INSERT INTO class (class_number, section, academic_year) VALUES ($1, $2, $3) RETURNING *',
            [class_number, section, academic_year]
        );
        res.status(201).json({ message: '✅ Class created!', data: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') return res.status(400).json({ message: '❌ This Class/Section/Year already exists!' });
        res.status(500).json({ message: '❌ Failed to create class', error: error.message });
    }
};

const getAllClasses = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM class ORDER BY class_number ASC');
        res.status(200).json({ message: '✅ Classes fetched!', data: result.rows });
    } catch (error) { res.status(500).json({ message: '❌ Failed', error: error.message }); }
};

const getClassById = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM class WHERE class_id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: '❌ Not found' });
        res.status(200).json({ message: '✅ Class found!', data: result.rows[0] });
    } catch (error) { res.status(500).json({ message: '❌ Failed', error: error.message }); }
};

const updateClass = async (req, res) => {
    try {
        const { class_number, section, academic_year } = req.body;
        const result = await pool.query(
            'UPDATE class SET class_number=$1, section=$2, academic_year=$3 WHERE class_id=$4 RETURNING *',
            [class_number, section, academic_year, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: '❌ Not found' });
        res.status(200).json({ message: '✅ Class updated!', data: result.rows[0] });
    } catch (error) { res.status(500).json({ message: '❌ Failed', error: error.message }); }
};

const deleteClass = async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM class WHERE class_id=$1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: '❌ Not found' });
        res.status(200).json({ message: '✅ Class deleted!', data: result.rows[0] });
    } catch (error) { res.status(500).json({ message: '❌ Failed', error: error.message }); }
};

module.exports = { createClass, getAllClasses, getClassById, updateClass, deleteClass };