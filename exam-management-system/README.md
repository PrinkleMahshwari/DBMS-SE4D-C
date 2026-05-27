# DBMS-SE4D-C

# 🎓 School Examination Management System (SEMS)

A full-stack Database Systems university project developed using **Node.js, Express.js, PostgreSQL (NeonDB), HTML, CSS, and Vanilla JavaScript**.

This project demonstrates complete CRUD operations, relational database concepts, REST API architecture, responsive frontend development, charts/graphs, and frontend-backend integration for managing school examination workflows.

---

# 📌 Project Overview

The School Examination Management System (SEMS) is designed to digitize and simplify examination management inside educational institutions.

The system manages:

- Students
- Teachers
- Classes
- Subjects
- Exams
- Exam Schedules
- Seat Allocation
- Attendance
- Marks
- Results
- Report Cards
- Marks Edit Requests
- Class Subject Assignment
- Teaching Assignment
- Class Teacher Assignment
- Classrooms
- Labs
- Exam Components
- Invigilation
- Attendance Marks

The project demonstrates practical implementation of:

- Database normalization
- Foreign key relationships
- CRUD operations
- API integration
- Responsive UI/UX
- Real-world relational database workflows

---

# ⚙️ Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| UI Libraries | Chart.js, Font Awesome |
| Backend | Node.js, Express.js |
| Database | PostgreSQL using NeonDB Cloud |
| Architecture | REST API, Single Page Application |
| Tools | VS Code, Git, GitHub, Postman, NeonDB, Vercel |

---

# 🏗️ System Architecture

This project follows a **3-Tier Architecture**.

## 1. Presentation Layer

The frontend is built using:

- HTML
- CSS
- Vanilla JavaScript

It works as a simple single page interface where pages are shown and hidden using JavaScript without reloading the browser.

## 2. Application Layer

The backend is built using:

- Node.js
- Express.js

It contains:

- Routes
- Controllers
- REST APIs
- CRUD logic
- Database queries

## 3. Data Layer

The database is PostgreSQL hosted on NeonDB.

It stores all system data using relational tables, primary keys, foreign keys, constraints, and joins.

---

# ✨ Key Features

## 📊 Dashboard

- Dynamic dashboard cards
- Student, teacher, class, subject, exam, attendance and report card counts
- Charts and graphs using Chart.js
- Responsive design

## 👨‍🎓 Student Management

- Add student
- Update student
- Delete student
- Search/filter students
- Student data linked with person table
- Email is used as foreign key from person table

## 👨‍🏫 Teacher Management

- Add teacher
- Update teacher
- Delete teacher
- Teacher data linked with person table
- Qualification, experience, type and status management

## 🏫 Class Management

- Add class
- Update class
- Delete class
- Class number, section and academic year management

## 📚 Subject Management

- Add subject
- Update subject
- Delete subject
- Subject recap with result summary

## 📝 Exam Management

- Add exam
- Update exam
- Delete exam
- Exam type and total marks handling

## 📅 Exam Schedule

- Manage scheduled exams
- Link exams with class and subject
- Show exam date and time

## 💺 Seat Allocation

- Allocate seats to students
- Link seat allocation with exam schedule
- Search/filter seat allocations
- Seat allocation chart

## ✅ Attendance Management

- Student attendance records
- Present/Absent summary
- Attendance marks
- Attendance charts

## 📈 Results

- Subject-wise result records
- Percentage calculation
- Grade display
- Search and filter support

## 📜 Report Cards

- Final report card style summary
- Overall marks
- Overall percentage
- Grade and position display

## ✏️ Marks Edit Requests

- Marks correction request workflow
- Pending, approved and rejected status
- Teacher and principal approval tracking

---

# 🧠 Database Concepts Used

This project demonstrates:

- Primary Keys
- Foreign Keys
- JOIN Queries
- CRUD Operations
- Transactions
- Normalization
- Data Integrity
- Referential Integrity
- Relationship Tables
- One-to-Many Relationships
- Many-to-Many Relationships through bridge tables

---

# 🔗 Important Database Relationships

## Person Table

The `person` table stores common details such as:

- Email
- First Name
- Last Name
- Gender
- Date of Birth
- Father Name
- Phone
- Address
- Religion

## Student Table

The `student` table stores student-specific details such as:

- Student ID
- Email
- Roll No
- Emergency Phone
- Class ID

It uses `email` as a foreign key from the `person` table.

## Teacher Table

The `teacher` table stores teacher-specific details such as:

- Teacher ID
- Email
- Qualification
- Experience Years
- Teacher Type
- Status

It also uses `email` as a foreign key from the `person` table.

## Exam Schedule

The `exam_schedule` table links:

- Exam
- Class
- Subject
- Date
- Time

## Seat Allocation

The `seat_allocation` table links:

- Student
- Exam Schedule
- Seat Number

## Result

The `result` table links:

- Student
- Subject
- Class
- Term
- Marks
- Grade

## Report Card

The `report_card` table stores final term report card data for students.

---

# 📂 Complete Project Folder Structure

```text
DBMS-SE4D-C/
│
├── exam-management-system/
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── attendanceMarksController.js
│   │   ├── classController.js
│   │   ├── classroomController.js
│   │   ├── classSubjectController.js
│   │   ├── classTeacherAssignmentController.js
│   │   ├── examComponentController.js
│   │   ├── examController.js
│   │   ├── examScheduleController.js
│   │   ├── invigilationController.js
│   │   ├── labController.js
│   │   ├── marksController.js
│   │   ├── marksEditRequestController.js
│   │   ├── personController.js
│   │   ├── reportCardController.js
│   │   ├── resultController.js
│   │   ├── seatAllocationController.js
│   │   ├── studentAttendanceController.js
│   │   ├── studentController.js
│   │   ├── subjectController.js
│   │   ├── teacherController.js
│   │   └── teachingAssignmentController.js
│   │
│   ├── public/
│   │   ├── app.js
│   │   ├── favicon.svg
│   │   ├── index.html
│   │   └── style.css
│   │
│   ├── routes/
│   │   ├── attendanceMarksRoutes.js
│   │   ├── classroomRoutes.js
│   │   ├── classRoutes.js
│   │   ├── classSubjectRoutes.js
│   │   ├── classTeacherAssignmentRoutes.js
│   │   ├── examComponentRoutes.js
│   │   ├── examRoutes.js
│   │   ├── examScheduleRoutes.js
│   │   ├── invigilationRoutes.js
│   │   ├── labRoutes.js
│   │   ├── marksEditRequestRoutes.js
│   │   ├── marksRoutes.js
│   │   ├── personRoutes.js
│   │   ├── reportCardRoutes.js
│   │   ├── resultRoutes.js
│   │   ├── seatAllocationRoutes.js
│   │   ├── studentAttendanceRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── subjectRoutes.js
│   │   ├── teacherRoutes.js
│   │   └── teachingAssignmentRoutes.js
│   │
│   ├── sql/
│   │   ├── new_ordered_complete_script.sql
│   │   └── old_unordered_script.sql
│   │
│   ├── .env
│   ├── .gitignore
│   ├── index.js
│   ├── package-lock.json
│   ├── package.json
│   ├── vercel.json
│   └── README.md
```

---

# 📁 Important Folders Explanation

## config/

Contains database connection file.

```text
config/db.js
```

This file connects Node.js backend with NeonDB PostgreSQL database.

## controllers/

Contains backend logic for every module.

Example:

```text
studentController.js
teacherController.js
examController.js
resultController.js
```

Controllers handle:

- Request data
- SQL queries
- CRUD logic
- Response messages
- Error handling

## routes/

Contains API route definitions.

Example:

```text
studentRoutes.js
teacherRoutes.js
examRoutes.js
```

Routes connect API URLs with controller functions.

## public/

Contains frontend files:

```text
index.html
style.css
app.js
favicon.svg
```

## sql/

Contains database SQL scripts:

```text
new_ordered_complete_script.sql
old_unordered_script.sql
```

---

# 🚀 Local Setup

## 1. Clone Repository

```bash
git clone https://github.com/PrinkleMahshwari/DBMS-SE4D-C.git
```

## 2. Move into Project Folder

```bash
cd DBMS-SE4D-C/exam-management-system
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Create `.env` File

```env
DATABASE_URL=your_neondb_connection_string
PORT=3000
```

## 5. Run Project

```bash
npm start
```

or

```bash
node index.js
```

---

# 🌐 Important API Endpoints

## Person

```text
/api/persons
```

## Students

```text
/api/students
```

## Teachers

```text
/api/teachers
```

## Classes

```text
/api/classes
```

## Subjects

```text
/api/subjects
```

## Class Subjects

```text
/api/class-subjects
```

## Teaching Assignments

```text
/api/teaching-assignments
```

## Class Teacher Assignments

```text
/api/class-teacher-assignments
```

## Exams

```text
/api/exams
```

## Exam Components

```text
/api/exam-components
```

## Exam Schedules

```text
/api/exam-schedules
```

## Classrooms

```text
/api/classrooms
```

## Labs

```text
/api/labs
```

## Seat Allocations

```text
/api/seat-allocations
```

## Invigilation

```text
/api/invigilation
```

## Student Attendance

```text
/api/student-attendance
```

## Marks

```text
/api/marks
```

## Marks Edit Requests

```text
/api/marks-edit-requests
```

## Results

```text
/api/results
```

## Attendance Marks

```text
/api/attendance-marks
```

## Report Cards

```text
/api/report-cards
```

---

# 🧪 Test Routes

## API Test

```text
/
```

## Database Test

```text
/test-db
```

If `/test-db` returns current database time, it means NeonDB connection is working.

---

# 📱 Responsive UI Features

The frontend is responsive and supports:

- Desktop view
- Tablet view
- Mobile view
- Hamburger menu
- Sidebar navigation
- Responsive cards
- Responsive charts
- Mobile-friendly tables

---

# 📊 Charts Included

The project includes charts for:

- Students per class
- Pass/fail result summary
- Subject average marks
- Teacher types
- Attendance status
- Attendance marks
- Marks edit request status
- Seat allocation by schedule

---

# 🛡️ Security & Best Practices

## SQL Injection Prevention

Parameterized queries are used in SQL queries.

Example:

```js
pool.query(
    'SELECT * FROM student WHERE student_id = $1',
    [studentId]
);
```

## XSS Protection

Frontend uses a safe rendering function before inserting dynamic data into HTML.

## Error Handling

The system uses:

- try-catch blocks
- proper error messages
- HTTP status codes
- Promise.allSettled() for safe frontend loading

## Transaction Usage

Student and teacher updates use transactions when updating both role-specific table and person table together.

---

# 🎓 Viva / Defense Notes

## Why NeonDB?

NeonDB is used because it provides cloud PostgreSQL database hosting. It makes deployment easier because the database is not dependent on a local machine.

## Why Vanilla JavaScript?

Vanilla JavaScript is used to demonstrate core frontend concepts like:

- DOM manipulation
- Event listeners
- Fetch API
- Async/Await
- Dynamic rendering

## Why Person Table?

The `person` table avoids repeated common fields for students and teachers. It follows normalization because shared data is stored once.

## Why Controllers and Routes?

Routes define API URLs, and controllers contain the actual logic. This makes the backend clean and modular.

---

# 🚀 Deployment

## GitHub

The complete source code is hosted on GitHub.

## Vercel

The project is configured for deployment using Vercel.

Required environment variable:

```env
DATABASE_URL=your_neondb_connection_string
```

---

# 🎯 Learning Outcomes

This project helped in understanding:

- PostgreSQL database design
- NeonDB cloud database connection
- CRUD operations
- REST API development
- Express.js routing
- Controller-based architecture
- Frontend and backend connection
- Fetch API
- Async/Await
- Dynamic rendering
- Responsive UI design
- Charts using Chart.js
- Database relationships
- JOIN queries
- Transactions
- Foreign keys
- Data integrity

---

# 👨‍💻 Developer

## Prinkle Kella

BS Software Engineering Student  
SZABIST Karachi

GitHub:  
https://github.com/PrinkleMahshwari

---

# 📜 License

This project is developed for educational and academic purposes.