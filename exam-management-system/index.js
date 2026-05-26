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
// Serve static files from the "public" folder
app.use(express.static('public'));

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
const examComponentRoutes = require('./routes/examComponentRoutes');
const examScheduleRoutes = require('./routes/examScheduleRoutes');
const seatAllocationRoutes = require('./routes/seatAllocationRoutes');
const invigilationRoutes = require('./routes/invigilationRoutes');
const studentAttendanceRoutes = require('./routes/studentAttendanceRoutes');
const marksRoutes = require('./routes/marksRoutes');
const marksEditRequestRoutes = require('./routes/marksEditRequestRoutes');
const resultRoutes = require('./routes/resultRoutes');
const attendanceMarksRoutes = require('./routes/attendanceMarksRoutes');
const reportCardRoutes = require('./routes/reportCardRoutes');

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
app.use('/api/exam-components', examComponentRoutes);
app.use('/api/exam-schedules', examScheduleRoutes);
app.use('/api/seat-allocations', seatAllocationRoutes);
app.use('/api/invigilation', invigilationRoutes);
app.use('/api/student-attendance', studentAttendanceRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/marks-edit-requests', marksEditRequestRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/attendance-marks', attendanceMarksRoutes);
app.use('/api/report-cards', reportCardRoutes);

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