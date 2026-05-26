// ===============================
// SCHOOL EXAMINATION MANAGEMENT SYSTEM
// VANILLA JS FRONTEND
// ===============================

// Base API URL
// Because Express serves public folder, relative path will work.
// Example: /api/students
const API_BASE = "";

// Global arrays where we store backend data after fetching
let students = [];
let teachers = [];
let classes = [];
let subjects = [];
let exams = [];
let results = [];
let reportCards = [];
let schedules = [];
let attendance = [];
let attendanceMarks = [];
let marksEditRequests = [];

// Chart variables, so we can destroy old chart before creating new one
let studentsChart = null;
let passFailChart = null;
let subjectAverageChart = null;
let teacherTypeChart = null;
let attendanceStatusChart = null;
let attendanceMarksChart = null;
let marksRequestChart = null;

// ===============================
// HELPER FUNCTIONS
// ===============================

// This helper reads API response safely.
// It supports both response formats:
// 1) { success: true, data: [...] }
// 2) direct array [...]
function extractData(responseJson) {
    if (Array.isArray(responseJson)) return responseJson;
    if (responseJson && Array.isArray(responseJson.data)) return responseJson.data;
    if (responseJson && responseJson.data) return responseJson.data;
    return [];
}

// Fetch data from API
async function apiGet(endpoint) {
    const response = await fetch(`${API_BASE}${endpoint}`);
    const json = await response.json();

    if (!response.ok) {
        throw new Error(json.message || "Failed to fetch data");
    }

    return extractData(json);
}

// Send POST request
async function apiPost(endpoint, body) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const json = await response.json();

    if (!response.ok) {
        throw new Error(json.message || "Failed to add record");
    }

    return json;
}

// Send PUT request
async function apiPut(endpoint, body) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    const json = await response.json();

    if (!response.ok) {
        throw new Error(json.message || "Failed to update record");
    }

    return json;
}

// Send DELETE request
async function apiDelete(endpoint) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "DELETE"
    });

    const json = await response.json();

    if (!response.ok) {
        throw new Error(json.message || "Failed to delete record");
    }

    return json;
}

// Show success/error message
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;

    if (type === "error") {
        toast.style.background = "#dc2626";
    } else {
        toast.style.background = "#0f172a";
    }

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// Format date for input or display
function formatDate(dateValue) {
    if (!dateValue) return "";
    return String(dateValue).split("T")[0];
}

// Get full name from joined person data
function fullName(item) {
    const first = item.first_name || "";
    const last = item.last_name || "";
    return `${first} ${last}`.trim() || "N/A";
}

// Find class name by class_id
function getClassName(classId) {
    const cls = classes.find(c => String(c.class_id) === String(classId));
    if (!cls) return classId || "N/A";
    return `${cls.class_number}-${cls.section}`;
}

// Find subject name by subject_id
function getSubjectName(subjectId) {
    const subject = subjects.find(s => String(s.subject_id) === String(subjectId));
    return subject ? subject.subject_name : subjectId || "N/A";
}

// Find exam name by exam_id
function getExamName(examId) {
    const exam = exams.find(e => String(e.exam_id) === String(examId));
    return exam ? exam.exam_name : examId || "N/A";
}

// Find student name by student_id
function getStudentName(studentId) {
    const student = students.find(s => String(s.student_id) === String(studentId));
    return student ? fullName(student) : studentId || "N/A";
}

// Escape HTML to avoid layout breaking from special characters
function safe(value) {
    return value === null || value === undefined ? "" : String(value);
}

// ===============================
// NAVIGATION
// ===============================

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();

        const page = link.dataset.page;

        // Active nav link
        document.querySelectorAll(".nav-link").forEach(nav => nav.classList.remove("active"));
        link.classList.add("active");

        // Active page section
        document.querySelectorAll(".page").forEach(section => section.classList.remove("active"));
        document.getElementById(page).classList.add("active");

        // Update title
        const title = link.textContent.trim();
        document.getElementById("pageTitle").textContent = title;
        document.getElementById("pageSubtitle").textContent = getSubtitle(page);

        // Close menu on mobile
        closeSidebar();
    });
});

function getSubtitle(page) {
    const subtitles = {
        dashboard: "School Examination Management System overview",
        students: "Manage students with person and student table data",
        teachers: "Manage teachers with person and teacher table data",
        classes: "Manage class number, section and academic year",
        subjects: "Manage subjects and subject result recap",
        exams: "Manage exams, schedules and components",
        results: "View final subject wise results",
        reports: "View final report cards",
        attendance: "View student attendance and attendance marks",
        marksRequests: "View marks correction requests and approval status"
    };
    return subtitles[page] || "";
}

// Mobile hamburger
document.getElementById("hamburgerBtn").addEventListener("click", () => {
    document.getElementById("sidebar").classList.add("show");
    document.getElementById("overlay").classList.add("show");
});

document.getElementById("overlay").addEventListener("click", closeSidebar);

function closeSidebar() {
    document.getElementById("sidebar").classList.remove("show");
    document.getElementById("overlay").classList.remove("show");
}

// ===============================
// LOAD ALL DATA
// ===============================

async function loadAllData() {
    try {
        // Loading all important data
        // If any route is missing, only that module can fail. Check console for details.
        const responses = await Promise.allSettled([
            apiGet("/api/students"),
            apiGet("/api/teachers"),
            apiGet("/api/classes"),
            apiGet("/api/subjects"),
            apiGet("/api/exams"),
            apiGet("/api/results"),
            apiGet("/api/report-cards"),
            apiGet("/api/exam-schedules"),
            apiGet("/api/student-attendance"),
            apiGet("/api/attendance-marks"),
            apiGet("/api/marks-edit-requests")
        ]);

        students = responses[0].status === "fulfilled" ? responses[0].value : [];
        teachers = responses[1].status === "fulfilled" ? responses[1].value : [];
        classes = responses[2].status === "fulfilled" ? responses[2].value : [];
        subjects = responses[3].status === "fulfilled" ? responses[3].value : [];
        exams = responses[4].status === "fulfilled" ? responses[4].value : [];
        results = responses[5].status === "fulfilled" ? responses[5].value : [];
        reportCards = responses[6].status === "fulfilled" ? responses[6].value : [];
        schedules = responses[7].status === "fulfilled" ? responses[7].value : [];
        attendance = responses[8].status === "fulfilled" ? responses[8].value : [];
        attendanceMarks = responses[9].status === "fulfilled" ? responses[9].value : [];
        marksEditRequests = responses[10].status === "fulfilled" ? responses[10].value : [];

        fillClassDropdowns();
        renderDashboard();
        renderStudents();
        renderTeachers();
        renderClasses();
        renderSubjects();
        renderExams();
        renderExamSchedules();
        renderResults();
        renderReportCards();
        renderAttendance();
        renderMarksEditRequests();

    } catch (error) {
        console.error(error);
        showToast("Failed to load data. Check backend routes.", "error");
    }
}

// ===============================
// DASHBOARD
// ===============================

function renderDashboard() {
    document.getElementById("totalStudents").textContent = students.length;
    document.getElementById("totalTeachers").textContent = teachers.length;
    document.getElementById("totalClasses").textContent = classes.length;
    document.getElementById("totalSubjects").textContent = subjects.length;
    document.getElementById("totalExams").textContent = exams.length;
    document.getElementById("totalAttendance").textContent = attendance.length;
    document.getElementById("totalReportCards").textContent = reportCards.length;

    renderStudentsPerClassChart();
    renderPassFailChart();
    renderSubjectAverageChart();
    renderTeacherTypeChart();
}

function renderStudentsPerClassChart() {
    const ctx = document.getElementById("studentsChart");

    const labels = classes.map(cls => `${cls.class_number}-${cls.section}`);
    const counts = classes.map(cls => {
        return students.filter(st => String(st.class_id) === String(cls.class_id)).length;
    });

    if (studentsChart) studentsChart.destroy();

    studentsChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Students",
                data: counts
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderPassFailChart() {
    const ctx = document.getElementById("passFailChart");

    const pass = results.filter(r => Number(r.percentage) >= 33).length;
    const fail = results.filter(r => Number(r.percentage) < 33).length;

    if (passFailChart) passFailChart.destroy();

    passFailChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Pass", "Fail"],
            datasets: [{
                data: [pass, fail]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Subject average chart shows average percentage for each subject
function renderSubjectAverageChart() {
    const ctx = document.getElementById("subjectAverageChart");
    if (!ctx) return;

    const subjectGroups = {};

    results.forEach(result => {
        const subjectName = result.subject_name || getSubjectName(result.subject_id);
        if (!subjectGroups[subjectName]) {
            subjectGroups[subjectName] = [];
        }
        subjectGroups[subjectName].push(Number(result.percentage || 0));
    });

    const labels = Object.keys(subjectGroups);
    const averages = labels.map(label => {
        const list = subjectGroups[label];
        const total = list.reduce((sum, value) => sum + value, 0);
        return list.length ? (total / list.length).toFixed(2) : 0;
    });

    if (subjectAverageChart) subjectAverageChart.destroy();

    subjectAverageChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Average %",
                data: averages
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Teacher type chart shows how many teachers belong to each type
function renderTeacherTypeChart() {
    const ctx = document.getElementById("teacherTypeChart");
    if (!ctx) return;

    const typeCounts = {};

    teachers.forEach(teacher => {
        const type = teacher.teacher_type || "Unknown";
        typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    if (teacherTypeChart) teacherTypeChart.destroy();

    teacherTypeChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: Object.keys(typeCounts),
            datasets: [{
                data: Object.values(typeCounts)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}


// ===============================
// CLASSES
// ===============================

function renderClasses() {
    const search = document.getElementById("classSearch").value.toLowerCase();
    const body = document.getElementById("classesBody");

    const filtered = classes.filter(cls => {
        return `${cls.class_number} ${cls.section} ${cls.academic_year}`.toLowerCase().includes(search);
    });

    if (filtered.length === 0) {
        body.innerHTML = `<tr><td colspan="5">No classes found.</td></tr>`;
        return;
    }

    body.innerHTML = filtered.map(cls => `
        <tr>
            <td data-label="ID">${safe(cls.class_id)}</td>
            <td data-label="Class">${safe(cls.class_number)}</td>
            <td data-label="Section">${safe(cls.section)}</td>
            <td data-label="Academic Year">${safe(cls.academic_year)}</td>
            <td data-label="Actions">
                <div class="action-group">
                    <button class="btn light" onclick="openClassModal(${cls.class_id})">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn danger" onclick="deleteClass(${cls.class_id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

function openClassModal(classId = null) {
    const cls = classes.find(c => String(c.class_id) === String(classId));

    openModal(
        cls ? "Update Class" : "Add Class",
        [
            { name: "class_number", label: "Class Number", value: cls?.class_number || "", required: true },
            { name: "section", label: "Section", value: cls?.section || "", required: true },
            { name: "academic_year", label: "Academic Year", value: cls?.academic_year || "2026-27", required: true }
        ],
        async formData => {
            if (cls) {
                await apiPut(`/api/classes/${classId}`, formData);
                showToast("Class updated successfully");
            } else {
                await apiPost("/api/classes", formData);
                showToast("Class added successfully");
            }

            closeModal();
            await loadAllData();
        }
    );
}

async function deleteClass(classId) {
    if (!confirm("Are you sure you want to delete this class?")) return;

    try {
        await apiDelete(`/api/classes/${classId}`);
        showToast("Class deleted successfully");
        await loadAllData();
    } catch (error) {
        showToast(error.message, "error");
    }
}

// ===============================
// SUBJECTS
// ===============================

function renderSubjects() {
    const search = document.getElementById("subjectSearch").value.toLowerCase();
    const body = document.getElementById("subjectsBody");

    const filtered = subjects.filter(subject => {
        return `${subject.subject_name} ${subject.subject_code}`.toLowerCase().includes(search);
    });

    if (filtered.length === 0) {
        body.innerHTML = `<tr><td colspan="4">No subjects found.</td></tr>`;
    } else {
        body.innerHTML = filtered.map(subject => `
            <tr>
                <td data-label="ID">${safe(subject.subject_id)}</td>
                <td data-label="Subject Name">${safe(subject.subject_name)}</td>
                <td data-label="Subject Code">${safe(subject.subject_code)}</td>
                <td data-label="Actions">
                    <div class="action-group">
                        <button class="btn light" onclick="openSubjectModal(${subject.subject_id})">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn danger" onclick="deleteSubject(${subject.subject_id})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join("");
    }

    renderSubjectRecap();
}

function renderSubjectRecap() {
    const recap = document.getElementById("subjectRecap");

    if (results.length === 0) {
        recap.innerHTML = `<div class="recap-card">No result recap found.</div>`;
        return;
    }

    const subjectGroups = {};

    results.forEach(result => {
        const subjectId = result.subject_id;
        if (!subjectGroups[subjectId]) {
            subjectGroups[subjectId] = [];
        }
        subjectGroups[subjectId].push(result);
    });

    recap.innerHTML = Object.keys(subjectGroups).map(subjectId => {
        const list = subjectGroups[subjectId];
        const totalObtained = list.reduce((sum, r) => sum + Number(r.obtained_marks || 0), 0);
        const totalMarks = list.reduce((sum, r) => sum + Number(r.total_marks || 0), 0);
        const avg = totalMarks ? ((totalObtained / totalMarks) * 100).toFixed(2) : 0;

        return `
            <div class="recap-card">
                <h3>${getSubjectName(subjectId)}</h3>
                <div class="recap-row"><span>Term</span><strong>${safe(list[0].term)}</strong></div>
                <div class="recap-row"><span>Total Records</span><strong>${list.length}</strong></div>
                <div class="recap-row"><span>Total Marks</span><strong>${totalObtained}/${totalMarks}</strong></div>
                <div class="recap-row"><span>Average</span><strong class="grade">${avg}%</strong></div>
            </div>
        `;
    }).join("");
}

function openSubjectModal(subjectId = null) {
    const subject = subjects.find(s => String(s.subject_id) === String(subjectId));

    openModal(
        subject ? "Update Subject" : "Add Subject",
        [
            { name: "subject_name", label: "Subject Name", value: subject?.subject_name || "", required: true },
            { name: "subject_code", label: "Subject Code", value: subject?.subject_code || "", required: true }
        ],
        async formData => {
            if (subject) {
                await apiPut(`/api/subjects/${subjectId}`, formData);
                showToast("Subject updated successfully");
            } else {
                await apiPost("/api/subjects", formData);
                showToast("Subject added successfully");
            }

            closeModal();
            await loadAllData();
        }
    );
}

async function deleteSubject(subjectId) {
    if (!confirm("Are you sure you want to delete this subject?")) return;

    try {
        await apiDelete(`/api/subjects/${subjectId}`);
        showToast("Subject deleted successfully");
        await loadAllData();
    } catch (error) {
        showToast(error.message, "error");
    }
}

// ===============================
// STUDENTS
// ===============================

function renderStudents() {
    const search = document.getElementById("studentSearch").value.toLowerCase();
    const classFilter = document.getElementById("studentClassFilter").value;
    const body = document.getElementById("studentsBody");

    const filtered = students.filter(student => {
        const text = `${fullName(student)} ${student.email} ${student.roll_no} ${student.phone}`.toLowerCase();
        const matchSearch = text.includes(search);
        const matchClass = !classFilter || String(student.class_id) === String(classFilter);
        return matchSearch && matchClass;
    });

    if (filtered.length === 0) {
        body.innerHTML = `<tr><td colspan="7">No students found.</td></tr>`;
        return;
    }

    body.innerHTML = filtered.map(student => `
        <tr>
            <td data-label="ID">${safe(student.student_id)}</td>
            <td data-label="Student">${fullName(student)}</td>
            <td data-label="Email">${safe(student.email)}</td>
            <td data-label="Roll No">${safe(student.roll_no)}</td>
            <td data-label="Class">${getClassName(student.class_id)}</td>
            <td data-label="Phone">${safe(student.phone)}</td>
            <td data-label="Actions">
                <div class="action-group">
                    <button class="btn light" onclick="openStudentModal(${student.student_id})">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn danger" onclick="deleteStudent(${student.student_id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

function openStudentModal(studentId = null) {
    const student = students.find(s => String(s.student_id) === String(studentId));
    const isEdit = Boolean(student);

    openModal(
        isEdit ? "Update Student" : "Add Student",
        [
            { name: "first_name", label: "First Name", value: student?.first_name || "", required: true },
            { name: "last_name", label: "Last Name", value: student?.last_name || "", required: true },
            { name: "email", label: "Email", type: "email", value: student?.email || "", required: true, disabled: isEdit },
            { name: "gender", label: "Gender", type: "select", value: student?.gender || "", options: ["Male", "Female"], required: true },
            { name: "dob", label: "Date of Birth", type: "date", value: formatDate(student?.dob), required: true },
            { name: "father_name", label: "Father Name", value: student?.father_name || "" },
            { name: "phone", label: "Phone", value: student?.phone || "" },
            { name: "street", label: "Street", value: student?.street || "" },
            { name: "area", label: "Area", value: student?.area || "" },
            { name: "postal_code", label: "Postal Code", value: student?.postal_code || "" },
            { name: "city", label: "City", value: student?.city || "Karachi" },
            { name: "province", label: "Province", value: student?.province || "Sindh" },
            { name: "country", label: "Country", value: student?.country || "Pakistan" },
            { name: "religion", label: "Religion", value: student?.religion || "" },
            { name: "roll_no", label: "Roll No", type: "number", value: student?.roll_no || "", required: true },
            { name: "emergency_phone", label: "Emergency Phone", value: student?.emergency_phone || "" },
            { name: "class_id", label: "Class", type: "select", value: student?.class_id || "", options: classOptions(), required: true }
        ],
        async formData => {
            try {
                if (isEdit) {
                    // Email is not updated because it is primary/unique key in person table
                    delete formData.email;

                    // In backend you may have one combined student update route.
                    // If your controller separates person and student update,
                    // adjust this endpoint according to your route.
                    await apiPut(`/api/students/${studentId}`, formData);
                    showToast("Student updated successfully");
                } else {
                    // Create person first
                    const personData = pick(formData, [
                        "email", "first_name", "last_name", "gender", "dob", "father_name",
                        "phone", "street", "area", "postal_code", "city", "province", "country", "religion"
                    ]);

                    await apiPost("/api/persons", personData);

                    // Then create student with same email
                    const studentData = pick(formData, ["email", "roll_no", "emergency_phone", "class_id"]);
                    await apiPost("/api/students", studentData);

                    showToast("Student added successfully");
                }

                closeModal();
                await loadAllData();

            } catch (error) {
                showToast(error.message, "error");
            }
        }
    );
}

async function deleteStudent(studentId) {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
        await apiDelete(`/api/students/${studentId}`);
        showToast("Student deleted successfully");
        await loadAllData();
    } catch (error) {
        showToast(error.message, "error");
    }
}

// ===============================
// TEACHERS
// ===============================

function renderTeachers() {
    const search = document.getElementById("teacherSearch").value.toLowerCase();
    const body = document.getElementById("teachersBody");

    const filtered = teachers.filter(teacher => {
        return `${fullName(teacher)} ${teacher.email} ${teacher.qualification} ${teacher.teacher_type}`.toLowerCase().includes(search);
    });

    if (filtered.length === 0) {
        body.innerHTML = `<tr><td colspan="7">No teachers found.</td></tr>`;
        return;
    }

    body.innerHTML = filtered.map(teacher => `
        <tr>
            <td data-label="ID">${safe(teacher.teacher_id)}</td>
            <td data-label="Teacher">${fullName(teacher)}</td>
            <td data-label="Email">${safe(teacher.email)}</td>
            <td data-label="Qualification">${safe(teacher.qualification)}</td>
            <td data-label="Experience">${safe(teacher.experience_years)}</td>
            <td data-label="Type">${safe(teacher.teacher_type)}</td>
            <td data-label="Actions">
                <div class="action-group">
                    <button class="btn light" onclick="openTeacherModal(${teacher.teacher_id})">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn danger" onclick="deleteTeacher(${teacher.teacher_id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

function openTeacherModal(teacherId = null) {
    const teacher = teachers.find(t => String(t.teacher_id) === String(teacherId));
    const isEdit = Boolean(teacher);

    openModal(
        isEdit ? "Update Teacher" : "Add Teacher",
        [
            { name: "first_name", label: "First Name", value: teacher?.first_name || "", required: true },
            { name: "last_name", label: "Last Name", value: teacher?.last_name || "", required: true },
            { name: "email", label: "Email", type: "email", value: teacher?.email || "", required: true, disabled: isEdit },
            { name: "gender", label: "Gender", type: "select", value: teacher?.gender || "", options: ["Male", "Female"], required: true },
            { name: "dob", label: "Date of Birth", type: "date", value: formatDate(teacher?.dob), required: true },
            { name: "father_name", label: "Father Name", value: teacher?.father_name || "" },
            { name: "phone", label: "Phone", value: teacher?.phone || "" },
            { name: "street", label: "Street", value: teacher?.street || "" },
            { name: "area", label: "Area", value: teacher?.area || "" },
            { name: "postal_code", label: "Postal Code", value: teacher?.postal_code || "" },
            { name: "city", label: "City", value: teacher?.city || "Karachi" },
            { name: "province", label: "Province", value: teacher?.province || "Sindh" },
            { name: "country", label: "Country", value: teacher?.country || "Pakistan" },
            { name: "religion", label: "Religion", value: teacher?.religion || "" },
            { name: "qualification", label: "Qualification", value: teacher?.qualification || "" },
            { name: "experience_years", label: "Experience Years", type: "number", value: teacher?.experience_years || "" },
            { name: "teacher_type", label: "Teacher Type", type: "select", value: teacher?.teacher_type || "", options: ["SubjectTeacher", "ClassTeacher", "LabTeacher", "Invigilator"] },
            { name: "status", label: "Status", type: "select", value: teacher?.status || "Active", options: ["Active", "Inactive"] }
        ],
        async formData => {
            try {
                if (isEdit) {
                    delete formData.email;
                    await apiPut(`/api/teachers/${teacherId}`, formData);
                    showToast("Teacher updated successfully");
                } else {
                    const personData = pick(formData, [
                        "email", "first_name", "last_name", "gender", "dob", "father_name",
                        "phone", "street", "area", "postal_code", "city", "province", "country", "religion"
                    ]);

                    await apiPost("/api/persons", personData);

                    const teacherData = pick(formData, [
                        "email", "qualification", "experience_years", "teacher_type", "status"
                    ]);

                    await apiPost("/api/teachers", teacherData);
                    showToast("Teacher added successfully");
                }

                closeModal();
                await loadAllData();

            } catch (error) {
                showToast(error.message, "error");
            }
        }
    );
}

async function deleteTeacher(teacherId) {
    if (!confirm("Are you sure you want to delete this teacher?")) return;

    try {
        await apiDelete(`/api/teachers/${teacherId}`);
        showToast("Teacher deleted successfully");
        await loadAllData();
    } catch (error) {
        showToast(error.message, "error");
    }
}

// ===============================
// EXAMS
// ===============================

function renderExams() {
    const search = document.getElementById("examSearch").value.toLowerCase();
    const body = document.getElementById("examsBody");

    const filtered = exams.filter(exam => {
        return `${exam.exam_name} ${exam.exam_type}`.toLowerCase().includes(search);
    });

    if (filtered.length === 0) {
        body.innerHTML = `<tr><td colspan="6">No exams found.</td></tr>`;
        return;
    }

    body.innerHTML = filtered.map(exam => `
        <tr>
            <td data-label="ID">${safe(exam.exam_id)}</td>
            <td data-label="Exam Name">${safe(exam.exam_name)}</td>
            <td data-label="Type">${safe(exam.exam_type)}</td>
            <td data-label="Date">${formatDate(exam.exam_date)}</td>
            <td data-label="Total Marks">${safe(exam.total_marks)}</td>
            <td data-label="Actions">
                <div class="action-group">
                    <button class="btn light" onclick="openExamModal(${exam.exam_id})">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn danger" onclick="deleteExam(${exam.exam_id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

function openExamModal(examId = null) {
    const exam = exams.find(e => String(e.exam_id) === String(examId));

    openModal(
        exam ? "Update Exam" : "Add Exam",
        [
            { name: "exam_name", label: "Exam Name", value: exam?.exam_name || "", required: true },
            { name: "exam_type", label: "Exam Type", type: "select", value: exam?.exam_type || "", options: ["UnitTest", "MidTerm", "FinalTerm", "Viva"], required: true },
            { name: "exam_date", label: "Exam Date", type: "date", value: formatDate(exam?.exam_date), required: true },
            { name: "total_marks", label: "Total Marks", type: "number", value: exam?.total_marks || 100, required: true }
        ],
        async formData => {
            if (exam) {
                await apiPut(`/api/exams/${examId}`, formData);
                showToast("Exam updated successfully");
            } else {
                await apiPost("/api/exams", formData);
                showToast("Exam added successfully");
            }

            closeModal();
            await loadAllData();
        }
    );
}

async function deleteExam(examId) {
    if (!confirm("Are you sure you want to delete this exam?")) return;

    try {
        await apiDelete(`/api/exams/${examId}`);
        showToast("Exam deleted successfully");
        await loadAllData();
    } catch (error) {
        showToast(error.message, "error");
    }
}

function renderExamSchedules() {
    const body = document.getElementById("examScheduleBody");

    if (schedules.length === 0) {
        body.innerHTML = `<tr><td colspan="7">No exam schedules found.</td></tr>`;
        return;
    }

    body.innerHTML = schedules.map(schedule => `
        <tr>
            <td data-label="Schedule ID">${safe(schedule.schedule_id)}</td>
            <td data-label="Exam">${safe(schedule.exam_name || getExamName(schedule.exam_id))}</td>
            <td data-label="Class">${safe(schedule.class_number && schedule.section ? `${schedule.class_number}-${schedule.section}` : getClassName(schedule.class_id))}</td>
            <td data-label="Subject">${safe(schedule.subject_name || getSubjectName(schedule.subject_id))}</td>
            <td data-label="Date">${formatDate(schedule.schedule_date)}</td>
            <td data-label="Time">${safe(schedule.start_time)} - ${safe(schedule.end_time)}</td>
            <td data-label="Status">${safe(schedule.status)}</td>
        </tr>
    `).join("");
}

// ===============================
// RESULTS + REPORT CARDS
// ===============================

function renderResults() {
    const search = document.getElementById("resultSearch").value.toLowerCase();
    const classFilter = document.getElementById("resultClassFilter").value;
    const body = document.getElementById("resultsBody");

    const filtered = results.filter(result => {
        const text = `${result.first_name} ${result.last_name} ${result.student_name} ${result.subject_name} ${result.grade} ${result.term}`.toLowerCase();
        const matchSearch = text.includes(search);
        const matchClass = !classFilter || String(result.class_id) === String(classFilter);
        return matchSearch && matchClass;
    });

    if (filtered.length === 0) {
        body.innerHTML = `<tr><td colspan="8">No results found.</td></tr>`;
        return;
    }

    body.innerHTML = filtered.map(result => `
        <tr>
            <td data-label="Result ID">${safe(result.result_id)}</td>
            <td data-label="Student">${safe(result.student_name || fullName(result))}</td>
            <td data-label="Class">${safe(result.class_number && result.section ? `${result.class_number}-${result.section}` : getClassName(result.class_id))}</td>
            <td data-label="Subject">${safe(result.subject_name || getSubjectName(result.subject_id))}</td>
            <td data-label="Term">${safe(result.term)}</td>
            <td data-label="Marks">${safe(result.obtained_marks)}/${safe(result.total_marks)}</td>
            <td data-label="%">${safe(result.percentage)}%</td>
            <td data-label="Grade"><span class="grade">${safe(result.grade)}</span></td>
        </tr>
    `).join("");
}

function renderReportCards() {
    const search = document.getElementById("reportSearch").value.toLowerCase();
    const container = document.getElementById("reportCardsBody");

    const filtered = reportCards.filter(card => {
        return `${card.first_name} ${card.last_name} ${card.student_name} ${card.overall_grade} ${card.term}`.toLowerCase().includes(search);
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div class="report-card">No report cards found.</div>`;
        return;
    }

    container.innerHTML = filtered.map(card => `
        <div class="report-card">
            <h3>${safe(card.student_name || fullName(card))}</h3>
            <div class="report-row"><span>Class</span><strong>${safe(card.class_number && card.section ? `${card.class_number}-${card.section}` : getClassName(card.class_id))}</strong></div>
            <div class="report-row"><span>Academic Year</span><strong>${safe(card.academic_year)}</strong></div>
            <div class="report-row"><span>Term</span><strong>${safe(card.term)}</strong></div>
            <div class="report-row"><span>Marks</span><strong>${safe(card.overall_obtained_marks)}/${safe(card.overall_total_marks)}</strong></div>
            <div class="report-row"><span>Percentage</span><strong>${safe(card.overall_percentage)}%</strong></div>
            <div class="report-row"><span>Grade</span><strong class="grade">${safe(card.overall_grade)}</strong></div>
            <div class="report-row"><span>Position</span><strong>${safe(card.overall_position || "N/A")}</strong></div>
        </div>
    `).join("");
}


// ===============================
// ATTENDANCE
// ===============================

function renderAttendance() {
    renderAttendanceSummary();
    renderAttendanceTable();
    renderAttendanceMarksTable();
    renderAttendanceCharts();
}

function renderAttendanceSummary() {
    const present = attendance.filter(item => String(item.status).toLowerCase() === "present").length;
    const absent = attendance.filter(item => String(item.status).toLowerCase() === "absent").length;

    const totalMarks = attendanceMarks.reduce((sum, item) => {
        return sum + Number(item.total_attendance_marks || 0);
    }, 0);

    const avgMarks = attendanceMarks.length ? (totalMarks / attendanceMarks.length).toFixed(2) : 0;

    const presentEl = document.getElementById("presentCount");
    const absentEl = document.getElementById("absentCount");
    const avgEl = document.getElementById("averageAttendanceMarks");

    if (presentEl) presentEl.textContent = present;
    if (absentEl) absentEl.textContent = absent;
    if (avgEl) avgEl.textContent = avgMarks;
}

function renderAttendanceTable() {
    const body = document.getElementById("attendanceBody");
    if (!body) return;

    if (attendance.length === 0) {
        body.innerHTML = `<tr><td colspan="6">No attendance records found.</td></tr>`;
        return;
    }

    body.innerHTML = attendance.map(item => `
        <tr>
            <td data-label="ID">${safe(item.attendance_id)}</td>
            <td data-label="Student">${safe(item.student_name || getStudentName(item.student_id))}</td>
            <td data-label="Schedule">${safe(item.schedule_id)}</td>
            <td data-label="Status">${safe(item.status)}</td>
            <td data-label="Reason">${safe(item.reason || "N/A")}</td>
            <td data-label="Re-Exam">${safe(item.re_exam_eligibility || "N/A")}</td>
        </tr>
    `).join("");
}

function renderAttendanceMarksTable() {
    const body = document.getElementById("attendanceMarksBody");
    if (!body) return;

    if (attendanceMarks.length === 0) {
        body.innerHTML = `<tr><td colspan="8">No attendance marks found.</td></tr>`;
        return;
    }

    body.innerHTML = attendanceMarks.map(item => `
        <tr>
            <td data-label="ID">${safe(item.attendance_marks_id)}</td>
            <td data-label="Student">${safe(item.student_name || getStudentName(item.student_id))}</td>
            <td data-label="Class">${safe(item.class_number && item.section ? `${item.class_number}-${item.section}` : getClassName(item.class_id))}</td>
            <td data-label="Report Card">${safe(item.report_card_id)}</td>
            <td data-label="Term">${safe(item.term)}</td>
            <td data-label="Marks">${safe(item.total_attendance_marks)}</td>
            <td data-label="Leaves">${safe(item.leaves)}</td>
            <td data-label="Absents">${safe(item.absents)}</td>
        </tr>
    `).join("");
}

function renderAttendanceCharts() {
    const statusCanvas = document.getElementById("attendanceStatusChart");
    const marksCanvas = document.getElementById("attendanceMarksChart");

    if (!statusCanvas || !marksCanvas) return;

    const present = attendance.filter(item => String(item.status).toLowerCase() === "present").length;
    const absent = attendance.filter(item => String(item.status).toLowerCase() === "absent").length;
    const other = attendance.length - present - absent;

    if (attendanceStatusChart) attendanceStatusChart.destroy();

    attendanceStatusChart = new Chart(statusCanvas, {
        type: "doughnut",
        data: {
            labels: ["Present", "Absent", "Other"],
            datasets: [{
                data: [present, absent, other]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    const termGroups = {};

    attendanceMarks.forEach(item => {
        const term = item.term || "Unknown";
        if (!termGroups[term]) {
            termGroups[term] = [];
        }
        termGroups[term].push(Number(item.total_attendance_marks || 0));
    });

    const labels = Object.keys(termGroups);
    const averages = labels.map(term => {
        const list = termGroups[term];
        const total = list.reduce((sum, value) => sum + value, 0);
        return list.length ? (total / list.length).toFixed(2) : 0;
    });

    if (attendanceMarksChart) attendanceMarksChart.destroy();

    attendanceMarksChart = new Chart(marksCanvas, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Average Attendance Marks",
                data: averages
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// ===============================
// REUSABLE MODAL FORM
// ===============================

function openModal(title, fields, onSubmit) {
    const modal = document.getElementById("formModal");
    const modalTitle = document.getElementById("modalTitle");
    const form = document.getElementById("dynamicForm");

    modalTitle.textContent = title;

    form.innerHTML = fields.map(field => createFormField(field)).join("") + `
        <div class="form-actions">
            <button type="button" class="btn light" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn primary">
                <i class="fa-solid fa-floppy-disk"></i> Save
            </button>
        </div>
    `;

    form.onsubmit = async event => {
        event.preventDefault();

        const formData = {};
        fields.forEach(field => {
            const input = form.querySelector(`[name="${field.name}"]`);
            if (input && !field.disabled) {
                formData[field.name] = input.value;
            }
        });

        try {
            await onSubmit(formData);
        } catch (error) {
            showToast(error.message, "error");
        }
    };

    modal.classList.add("show");
}

function createFormField(field) {
    const type = field.type || "text";
    const required = field.required ? "required" : "";
    const disabled = field.disabled ? "disabled" : "";
    const value = field.value ?? "";

    if (type === "select") {
        const options = Array.isArray(field.options) ? field.options : [];

        const optionHtml = options.map(option => {
            if (typeof option === "object") {
                return `<option value="${option.value}" ${String(option.value) === String(value) ? "selected" : ""}>${option.label}</option>`;
            }

            return `<option value="${option}" ${String(option) === String(value) ? "selected" : ""}>${option}</option>`;
        }).join("");

        return `
            <div class="form-group">
                <label>${field.label}</label>
                <select name="${field.name}" ${required} ${disabled}>
                    <option value="">Select ${field.label}</option>
                    ${optionHtml}
                </select>
            </div>
        `;
    }

    return `
        <div class="form-group">
            <label>${field.label}</label>
            <input 
                type="${type}" 
                name="${field.name}" 
                value="${safe(value)}" 
                ${required} 
                ${disabled}
            >
        </div>
    `;
}

function closeModal() {
    document.getElementById("formModal").classList.remove("show");
}

// Pick selected keys from object
function pick(obj, keys) {
    const newObj = {};
    keys.forEach(key => {
        newObj[key] = obj[key];
    });
    return newObj;
}

// ===============================
// DROPDOWNS
// ===============================

function classOptions() {
    return classes.map(cls => ({
        value: cls.class_id,
        label: `${cls.class_number}-${cls.section} (${cls.academic_year})`
    }));
}

function fillClassDropdowns() {
    const studentFilter = document.getElementById("studentClassFilter");
    const resultFilter = document.getElementById("resultClassFilter");

    const options = classes.map(cls => `
        <option value="${cls.class_id}">${cls.class_number}-${cls.section} (${cls.academic_year})</option>
    `).join("");

    studentFilter.innerHTML = `<option value="">All Classes</option>${options}`;
    resultFilter.innerHTML = `<option value="">All Classes</option>${options}`;
}

// ===============================
// MARKS EDIT REQUEST
// ===============================

// get full name from request data
function requestStudentName(item) {
    return `${item.student_first_name || ""} ${item.student_last_name || ""}`.trim() || "N/A";
}

// get teacher name from request data
function requestTeacherName(item) {
    return `${item.teacher_first_name || ""} ${item.teacher_last_name || ""}`.trim() || "N/A";
}

// show marks edit request records, cards and chart
function renderMarksEditRequests() {
    const pending = marksEditRequests.filter(item => {
        return String(item.approval_status).toLowerCase() === "pending";
    }).length;

    const approved = marksEditRequests.filter(item => {
        return String(item.approval_status).toLowerCase() === "approved";
    }).length;

    const rejected = marksEditRequests.filter(item => {
        return String(item.approval_status).toLowerCase() === "rejected";
    }).length;

    document.getElementById("pendingRequests").textContent = pending;
    document.getElementById("approvedRequests").textContent = approved;
    document.getElementById("rejectedRequests").textContent = rejected;

    renderMarksRequestsTable();
    renderMarksRequestsChart(pending, approved, rejected);
}

// show marks edit request table
function renderMarksRequestsTable() {
    const body = document.getElementById("marksRequestsBody");

    if (!body) return;

    if (marksEditRequests.length === 0) {
        body.innerHTML = `<tr><td colspan="10">No marks edit requests found.</td></tr>`;
        return;
    }

    body.innerHTML = marksEditRequests.map(item => `
        <tr>
            <td data-label="ID">${safe(item.edit_request_id)}</td>
            <td data-label="Student">${safe(requestStudentName(item))}</td>
            <td data-label="Teacher">${safe(requestTeacherName(item))}</td>
            <td data-label="Subject">${safe(item.subject_name || "N/A")}</td>
            <td data-label="Exam">${safe(item.exam_name || "N/A")}</td>
            <td data-label="Old">${safe(item.old_marks)}</td>
            <td data-label="New">${safe(item.new_marks)}</td>
            <td data-label="Reason">${safe(item.reason)}</td>
            <td data-label="Status">${safe(item.approval_status)}</td>
            <td data-label="Request Date">${formatDate(item.request_date)}</td>
        </tr>
    `).join("");
}

// show marks request chart
function renderMarksRequestsChart(pending, approved, rejected) {
    const canvas = document.getElementById("marksRequestChart");

    if (!canvas) return;

    if (marksRequestChart) {
        marksRequestChart.destroy();
    }

    marksRequestChart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: ["Pending", "Approved", "Rejected"],
            datasets: [{
                data: [pending, approved, rejected]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// ===============================
// START APP
// ===============================

loadAllData();
