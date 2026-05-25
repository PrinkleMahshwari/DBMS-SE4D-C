// index.js

const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ========== ROUTES ==========
// Import routes
const personRoutes = require('./routes/personRoutes');
const studentRoutes = require('./routes/studentRoutes');
const classRoutes = require('./routes/classRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const classSubjectRoutes = require('./routes/classSubjectRoutes');
const teachingAssignmentRoutes = require('./routes/teachingAssignmentRoutes');
const classTeacherAssignmentRoutes = require('./routes/classTeacherAssignmentRoutes');
const examRoutes = require('./routes/examRoutes');
const classroomRoutes = require('./routes/classroomRoutes');
const labRoutes = require('./routes/labRoutes');

// Use routes
app.use('/api/persons', personRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/class-subjects', classSubjectRoutes);
app.use('/api/teaching-assignments', teachingAssignmentRoutes);
app.use('/api/class-teacher-assignments', classTeacherAssignmentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/labs', labRoutes);

// Test Route
app.get('/', (req, res) => {
    res.json({ message: '🎉 School Examination Management System API is running!' });
});

// Database Test Route
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ message: '✅ Database connection is working!', currentTime: result.rows[0].now });
    } catch (error) {
        res.status(500).json({ message: '❌ Database connection failed!', error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    // Check if running in GitHub Codespaces
    if (process.env.CODESPACE_NAME) {
        const codespaceUrl = `https://${process.env.CODESPACE_NAME}-${PORT}.app.github.dev`;
        console.log(`🚀 Server is running on Codespaces: ${codespaceUrl}`);
    } else {
        // Fallback for local machine
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    }
});