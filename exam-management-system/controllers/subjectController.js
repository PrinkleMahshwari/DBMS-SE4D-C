const pool = require('../config/db');

const createSubject = async (req, res) => {
    try {
        const { subject_name, subject_code } = req.body;
        const result = await pool.query('INSERT INTO subject (subject_name, subject_code) VALUES ($1, $2) RETURNING *', [subject_name, subject_code]);
        res.status(201).json({ message: '✅ Subject created!', data: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') return res.status(400).json({ message: '❌ Subject code already exists!' });
        res.status(500).json({ message: '❌ Failed', error: error.message });
    }
};

const getAllSubjects = async (req, res) => {
    try { const result = await pool.query('SELECT * FROM subject'); res.status(200).json({ data: result.rows }); }
    catch (error) { res.status(500).json({ error: error.message }); }
};

const getSubjectById = async (req, res) => {
    try { const result = await pool.query('SELECT * FROM subject WHERE subject_id=$1', [req.params.id]); result.rows.length ? res.status(200).json({ data: result.rows[0] }) : res.status(404).json({ message: 'Not found' }); }
    catch (error) { res.status(500).json({ error: error.message }); }
};

const updateSubject = async (req, res) => {
    try { const { subject_name, subject_code } = req.body; const result = await pool.query('UPDATE subject SET subject_name=$1, subject_code=$2 WHERE subject_id=$3 RETURNING *', [subject_name, subject_code, req.params.id]); result.rows.length ? res.status(200).json({ data: result.rows[0] }) : res.status(404).json({ message: 'Not found' }); }
    catch (error) { res.status(500).json({ error: error.message }); }
};

const deleteSubject = async (req, res) => {
    try { const result = await pool.query('DELETE FROM subject WHERE subject_id=$1 RETURNING *', [req.params.id]); result.rows.length ? res.status(200).json({ data: result.rows[0] }) : res.status(404).json({ message: 'Not found' }); }
    catch (error) { res.status(500).json({ error: error.message }); }
};

module.exports = { createSubject, getAllSubjects, getSubjectById, updateSubject, deleteSubject };