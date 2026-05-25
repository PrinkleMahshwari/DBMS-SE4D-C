const pool = require('../config/db');

// ========== CREATE a Teacher ==========
const createTeacher = async (req, res) => {
    try {
        const { email, qualification, experience_years, teacher_type } = req.body;
        
        const query = `
            INSERT INTO teacher (email, qualification, experience_years, teacher_type)
            VALUES ($1, $2, $3, $4) RETURNING *
        `;
        const values = [email, qualification, experience_years, teacher_type];
        const result = await pool.query(query, values);

        res.status(201).json({ message: '✅ Teacher created!', data: result.rows[0] });
    } catch (error) {
        // If the email doesn't exist in the Person table
        if (error.code === '23503') {
            return res.status(400).json({ 
                message: '❌ Email does not exist in Person table. Create a Person first!',
                error: error.message 
            });
        }
        // If the teacher email already exists
        if (error.code === '23505') {
            return res.status(400).json({ 
                message: '❌ A teacher with this email already exists!',
                error: error.message 
            });
        }
        res.status(500).json({ message: '❌ Failed to create teacher', error: error.message });
    }
};

// ========== READ All Teachers ==========
const getAllTeachers = async (req, res) => {
    try {
        // JOIN to get personal info + teacher info
        const query = `
            SELECT t.teacher_id, t.email, t.qualification, t.experience_years, t.teacher_type, t.status,
                   p.first_name, p.last_name, p.phone
            FROM teacher t
            JOIN person p ON t.email = p.email
            ORDER BY t.teacher_id ASC
        `;
        const result = await pool.query(query);
        res.status(200).json({ message: '✅ Teachers fetched!', data: result.rows });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to fetch teachers', error: error.message });
    }
};

// ========== READ One Teacher by ID ==========
const getTeacherById = async (req, res) => {
    try {
        const query = `
            SELECT t.teacher_id, t.email, t.qualification, t.experience_years, t.teacher_type, t.status,
                   p.first_name, p.last_name, p.phone
            FROM teacher t
            JOIN person p ON t.email = p.email
            WHERE t.teacher_id = $1
        `;
        const result = await pool.query(query, [req.params.id]);
        
        if (result.rows.length === 0) return res.status(404).json({ message: '❌ Teacher not found' });
        
        res.status(200).json({ message: '✅ Teacher found!', data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to fetch teacher', error: error.message });
    }
};

// ========== UPDATE a Teacher ==========
const updateTeacher = async (req, res) => {
    try {
        const { qualification, experience_years, teacher_type, status } = req.body;
        const result = await pool.query(
            `UPDATE teacher SET qualification = $1, experience_years = $2, teacher_type = $3, status = $4 
             WHERE teacher_id = $5 RETURNING *`,
            [qualification, experience_years, teacher_type, status, req.params.id]
        );
        
        if (result.rows.length === 0) return res.status(404).json({ message: '❌ Teacher not found' });
        
        res.status(200).json({ message: '✅ Teacher updated!', data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to update teacher', error: error.message });
    }
};

// ========== DELETE a Teacher ==========
const deleteTeacher = async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM teacher WHERE teacher_id = $1 RETURNING *', [req.params.id]);
        
        if (result.rows.length === 0) return res.status(404).json({ message: '❌ Teacher not found' });
        
        res.status(200).json({ message: '✅ Teacher deleted!', deletedData: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: '❌ Failed to delete teacher', error: error.message });
    }
};

module.exports = { createTeacher, getAllTeachers, getTeacherById, updateTeacher, deleteTeacher };