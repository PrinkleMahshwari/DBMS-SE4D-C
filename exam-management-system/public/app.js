// vanilla javascript frontend

const API_BASE = "";

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
let seatAllocations = [];

let studentsChart = null;
let passFailChart = null;
let subjectAverageChart = null;
let teacherTypeChart = null;
let attendanceStatusChart = null;
let attendanceMarksChart = null;
let marksRequestChart = null;
let seatAllocationChart = null;

// get data array from API response
function extractData(responseJson) {
    if (Array.isArray(responseJson)) return responseJson;
    if (responseJson && Array.isArray(responseJson.data)) return responseJson.data;
    if (responseJson && responseJson.data) return responseJson.data;
    return [];
}

// fetch data from API
async function apiGet(endpoint) {
    const response = await fetch(`${API_BASE}${endpoint}`);
    const json = await response.json();

    if (!response.ok) {
        throw new Error(json.message || "Failed to fetch data");
    }

    return extractData(json);
}

// send post request
async function apiPost(endpoint, body) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    const json = await response.json();

    if (!response.ok) {
        throw new Error(json.message || "Failed to add record");
    }

    return json;
}

// send put request
async function apiPut(endpoint, body) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    const json = await response.json();

    if (!response.ok) {
        throw new Error(json.message || "Failed to update record");
    }

    return json;
}

// send delete request
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

// show small message
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");

    if (!toast) return;

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

// format date for table and input
function formatDate(dateValue) {
    if (!dateValue) return "";
    return String(dateValue).split("T")[0];
}

// get full name
function fullName(item) {
    const first = item.first_name || "";
    const last = item.last_name || "";
    return `${first} ${last}`.trim() || "N/A";
}

// get class name by class id
function getClassName(classId) {
    const cls = classes.find(c => String(c.class_id) === String(classId));

    if (!cls) return classId || "N/A";

    return `${cls.class_number}-${cls.section}`;
}

// get subject name by subject id
function getSubjectName(subjectId) {
    const subject = subjects.find(s => String(s.subject_id) === String(subjectId));

    return subject ? subject.subject_name : subjectId || "N/A";
}

// get exam name by exam id
function getExamName(examId) {
    const exam = exams.find(e => String(e.exam_id) === String(examId));

    return exam ? exam.exam_name : examId || "N/A";
}

// get student name by student id
function getStudentName(studentId) {
    const student = students.find(s => String(s.student_id) === String(studentId));

    return student ? fullName(student) : studentId || "N/A";
}

// make text safe before showing in html
function safe(value) {
    if (value === null || value === undefined) return "";

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// setup sidebar navigation
document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();

        const page = link.dataset.page;
        const pageSection = document.getElementById(page);

        if (!pageSection) {
            showToast(`Page "${page}" not found`, "error");
            return;
        }

        document.querySelectorAll(".nav-link").forEach(nav => {
            nav.classList.remove("active");
        });

        link.classList.add("active");

        document.querySelectorAll(".page").forEach(section => {
            section.classList.remove("active");
        });

        pageSection.classList.add("active");

        const pageTitle = document.getElementById("pageTitle");
        const pageSubtitle = document.getElementById("pageSubtitle");

        if (pageTitle) {
            pageTitle.textContent = link.textContent.trim();
        }

        if (pageSubtitle) {
            pageSubtitle.textContent = getSubtitle(page);
        }

        closeSidebar();
    });
});

// get page subtitle
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
        marksRequests: "View marks correction requests and approval status",
        seatAllocation: "Allocate seats to students for scheduled exams"
    };

    return subtitles[page] || "";
}

// open sidebar on mobile
const hamburgerBtn = document.getElementById("hamburgerBtn");
const overlay = document.getElementById("overlay");

if (hamburgerBtn) {
    hamburgerBtn.addEventListener("click", () => {
        document.getElementById("sidebar").classList.add("show");
        document.getElementById("overlay").classList.add("show");
    });
}

if (overlay) {
    overlay.addEventListener("click", closeSidebar);
}

// close sidebar
function closeSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    if (sidebar) {
        sidebar.classList.remove("show");
    }

    if (overlay) {
        overlay.classList.remove("show");
    }
}

// close modal with escape key
document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeModal();
    }
});

// load all data from backend
async function loadAllData() {
    try {
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
            apiGet("/api/marks-edit-requests"),
            apiGet("/api/seat-allocations")
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
        seatAllocations = responses[11].status === "fulfilled" ? responses[11].value : [];

        fillClassDropdowns();
        fillSeatScheduleDropdown();
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
        renderSeatAllocations();

    } catch (error) {
        console.error(error);
        showToast("Failed to load data. Check backend routes.", "error");
    }
}

// show dashboard data
function renderDashboard() {
    setText("totalStudents", students.length);
    setText("totalTeachers", teachers.length);
    setText("totalClasses", classes.length);
    setText("totalSubjects", subjects.length);
    setText("totalExams", exams.length);
    setText("totalAttendance", attendance.length);
    setText("totalReportCards", reportCards.length);

    renderStudentsPerClassChart();
    renderPassFailChart();
    renderSubjectAverageChart();
    renderTeacherTypeChart();
}

// set text safely
function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}

// show students per class chart
function renderStudentsPerClassChart() {
    const ctx = document.getElementById("studentsChart");

    if (!ctx) return;

    const labels = classes.map(cls => `${cls.class_number}-${cls.section}`);
    const counts = classes.map(cls => {
        return students.filter(st => String(st.class_id) === String(cls.class_id)).length;
    });

    if (studentsChart) {
        studentsChart.destroy();
    }

    studentsChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Students",
                data: counts
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// show pass fail chart
function renderPassFailChart() {
    const ctx = document.getElementById("passFailChart");

    if (!ctx) return;

    const pass = results.filter(r => Number(r.percentage) >= 33).length;
    const fail = results.filter(r => Number(r.percentage) < 33).length;

    if (passFailChart) {
        passFailChart.destroy();
    }

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

// show subject average chart
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

    if (subjectAverageChart) {
        subjectAverageChart.destroy();
    }

    subjectAverageChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Average %",
                data: averages
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
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

// show teacher type chart
function renderTeacherTypeChart() {
    const ctx = document.getElementById("teacherTypeChart");

    if (!ctx) return;

    const typeCounts = {};

    teachers.forEach(teacher => {
        const type = teacher.teacher_type || "Unknown";
        typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    if (teacherTypeChart) {
        teacherTypeChart.destroy();
    }

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

// show classes table
function renderClasses() {
    const searchInput = document.getElementById("classSearch");
    const body = document.getElementById("classesBody");

    if (!body) return;

    const search = searchInput ? searchInput.value.toLowerCase() : "";

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

// open class form
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
            // Convert class_number to integer just in case it's INT in DB
            const cleaned = cleanFormData(formData, ["class_number"]);

            if (cls) {
                await apiPut(`/api/classes/${classId}`, cleaned);
                showToast("Class updated successfully");
            } else {
                await apiPost("/api/classes", cleaned);
                showToast("Class added successfully");
            }

            closeModal();
            await loadAllData();
        }
    );
}

// delete class
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

// show subjects table
function renderSubjects() {
    const searchInput = document.getElementById("subjectSearch");
    const body = document.getElementById("subjectsBody");

    if (!body) return;

    const search = searchInput ? searchInput.value.toLowerCase() : "";

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

// show subject result recap
function renderSubjectRecap() {
    const recap = document.getElementById("subjectRecap");

    if (!recap) return;

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
                <h3>${safe(getSubjectName(subjectId))}</h3>
                <div class="recap-row"><span>Term</span><strong>${safe(list[0].term)}</strong></div>
                <div class="recap-row"><span>Total Records</span><strong>${safe(list.length)}</strong></div>
                <div class="recap-row"><span>Total Marks</span><strong>${safe(totalObtained)}/${safe(totalMarks)}</strong></div>
                <div class="recap-row"><span>Average</span><strong class="grade">${safe(avg)}%</strong></div>
            </div>
        `;
    }).join("");
}

// open subject form
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

// delete subject
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

// show students table
function renderStudents() {
    const searchInput = document.getElementById("studentSearch");
    const classFilterInput = document.getElementById("studentClassFilter");
    const body = document.getElementById("studentsBody");

    if (!body) return;

    const search = searchInput ? searchInput.value.toLowerCase() : "";
    const classFilter = classFilterInput ? classFilterInput.value : "";

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
            <td data-label="Student">${safe(fullName(student))}</td>
            <td data-label="Email">${safe(student.email)}</td>
            <td data-label="Roll No">${safe(student.roll_no)}</td>
            <td data-label="Class">${safe(getClassName(student.class_id))}</td>
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

// open student form
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
                    delete formData.email;
                    // Convert integers for PostgreSQL
                    const updateData = cleanFormData(formData, ["roll_no", "class_id"]);
                    await apiPut(`/api/students/${studentId}`, updateData);
                    showToast("Student updated successfully");
                } else {
                    const personData = cleanFormData(
                        pick(formData, [
                            "email", "first_name", "last_name", "gender", "dob", "father_name",
                            "phone", "street", "area", "postal_code", "city", "province", "country", "religion"
                        ])
                    );

                    await apiPost("/api/persons", personData);

                    // Convert integers for PostgreSQL
                    const studentData = cleanFormData(
                        pick(formData, ["email", "roll_no", "emergency_phone", "class_id"]),
                        ["roll_no", "class_id"]
                    );

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

// delete student
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

// show teachers table
function renderTeachers() {
    const searchInput = document.getElementById("teacherSearch");
    const body = document.getElementById("teachersBody");

    if (!body) return;

    const search = searchInput ? searchInput.value.toLowerCase() : "";

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
            <td data-label="Teacher">${safe(fullName(teacher))}</td>
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

// open teacher form
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
                    // Convert integers for PostgreSQL
                    const updateData = cleanFormData(formData, ["experience_years"]);
                    await apiPut(`/api/teachers/${teacherId}`, updateData);
                    showToast("Teacher updated successfully");
                } else {
                    const personData = cleanFormData(
                        pick(formData, [
                            "email", "first_name", "last_name", "gender", "dob", "father_name",
                            "phone", "street", "area", "postal_code", "city", "province", "country", "religion"
                        ])
                    );

                    await apiPost("/api/persons", personData);

                    // Convert integers for PostgreSQL
                    const teacherData = cleanFormData(
                        pick(formData, [
                            "email", "qualification", "experience_years", "teacher_type", "status"
                        ]),
                        ["experience_years"]
                    );

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

// delete teacher
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

// show exams table
function renderExams() {
    const searchInput = document.getElementById("examSearch");
    const body = document.getElementById("examsBody");

    if (!body) return;

    const search = searchInput ? searchInput.value.toLowerCase() : "";

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
            <td data-label="Date">${safe(formatDate(exam.exam_date))}</td>
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

// open exam form
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
            // Convert integers for PostgreSQL
            const cleaned = cleanFormData(formData, ["total_marks"]);

            if (exam) {
                await apiPut(`/api/exams/${examId}`, cleaned);
                showToast("Exam updated successfully");
            } else {
                await apiPost("/api/exams", cleaned);
                showToast("Exam added successfully");
            }

            closeModal();
            await loadAllData();
        }
    );
}

// delete exam
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

// show exam schedules
function renderExamSchedules() {
    const body = document.getElementById("examScheduleBody");

    if (!body) return;

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
            <td data-label="Date">${safe(formatDate(schedule.schedule_date))}</td>
            <td data-label="Time">${safe(schedule.start_time)} - ${safe(schedule.end_time)}</td>
            <td data-label="Status">${safe(schedule.status)}</td>
        </tr>
    `).join("");
}

// show results
function renderResults() {
    const searchInput = document.getElementById("resultSearch");
    const classFilterInput = document.getElementById("resultClassFilter");
    const body = document.getElementById("resultsBody");

    if (!body) return;

    const search = searchInput ? searchInput.value.toLowerCase() : "";
    const classFilter = classFilterInput ? classFilterInput.value : "";

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

// show report cards
function renderReportCards() {
    const searchInput = document.getElementById("reportSearch");
    const container = document.getElementById("reportCardsBody");

    if (!container) return;

    const search = searchInput ? searchInput.value.toLowerCase() : "";

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

// show attendance
function renderAttendance() {
    renderAttendanceSummary();
    renderAttendanceTable();
    renderAttendanceMarksTable();
    renderAttendanceCharts();
}

// show attendance cards
function renderAttendanceSummary() {
    const present = attendance.filter(item => String(item.status).toLowerCase() === "present").length;
    const absent = attendance.filter(item => String(item.status).toLowerCase() === "absent").length;

    const totalMarks = attendanceMarks.reduce((sum, item) => {
        return sum + Number(item.total_attendance_marks || 0);
    }, 0);

    const avgMarks = attendanceMarks.length ? (totalMarks / attendanceMarks.length).toFixed(2) : 0;

    setText("presentCount", present);
    setText("absentCount", absent);
    setText("averageAttendanceMarks", avgMarks);
}

// show attendance table
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

// show attendance marks table
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

// show attendance charts
function renderAttendanceCharts() {
    const statusCanvas = document.getElementById("attendanceStatusChart");
    const marksCanvas = document.getElementById("attendanceMarksChart");

    if (!statusCanvas || !marksCanvas) return;

    const present = attendance.filter(item => String(item.status).toLowerCase() === "present").length;
    const absent = attendance.filter(item => String(item.status).toLowerCase() === "absent").length;
    const other = attendance.length - present - absent;

    if (attendanceStatusChart) {
        attendanceStatusChart.destroy();
    }

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

    if (attendanceMarksChart) {
        attendanceMarksChart.destroy();
    }

    attendanceMarksChart = new Chart(marksCanvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Average Attendance Marks",
                data: averages
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// get student name from marks request
function requestStudentName(item) {
    return `${item.student_first_name || ""} ${item.student_last_name || ""}`.trim() || "N/A";
}

// get teacher name from marks request
function requestTeacherName(item) {
    return `${item.teacher_first_name || ""} ${item.teacher_last_name || ""}`.trim() || "N/A";
}

// show marks edit requests
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

    setText("pendingRequests", pending);
    setText("approvedRequests", approved);
    setText("rejectedRequests", rejected);

    renderMarksRequestsTable();
    renderMarksRequestsChart(pending, approved, rejected);
}

// show marks edit requests table
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
            <td data-label="Request Date">${safe(formatDate(item.request_date))}</td>
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

// open reusable modal
function openModal(title, fields, onSubmit) {
    const modal = document.getElementById("formModal");
    const modalTitle = document.getElementById("modalTitle");
    const form = document.getElementById("dynamicForm");

    if (!modal || !modalTitle || !form) {
        showToast("Modal elements are missing", "error");
        return;
    }

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

// create form input fields
function createFormField(field) {
    const type = field.type || "text";
    const required = field.required ? "required" : "";
    const disabled = field.disabled ? "disabled" : "";
    const value = field.value ?? "";

    if (type === "select") {
        const options = Array.isArray(field.options) ? field.options : [];

        const optionHtml = options.map(option => {
            if (typeof option === "object") {
                return `<option value="${safe(option.value)}" ${String(option.value) === String(value) ? "selected" : ""}>${safe(option.label)}</option>`;
            }

            return `<option value="${safe(option)}" ${String(option) === String(value) ? "selected" : ""}>${safe(option)}</option>`;
        }).join("");

        return `
            <div class="form-group">
                <label>${safe(field.label)}</label>
                <select name="${safe(field.name)}" ${required} ${disabled}>
                    <option value="">Select ${safe(field.label)}</option>
                    ${optionHtml}
                </select>
            </div>
        `;
    }

    return `
        <div class="form-group">
            <label>${safe(field.label)}</label>
            <input 
                type="${safe(type)}" 
                name="${safe(field.name)}" 
                value="${safe(value)}" 
                ${required} 
                ${disabled}
            >
        </div>
    `;
}

// close modal
function closeModal() {
    const modal = document.getElementById("formModal");

    if (modal) {
        modal.classList.remove("show");
    }
}

// pick selected fields from object
function pick(obj, keys) {
    const newObj = {};

    keys.forEach(key => {
        newObj[key] = obj[key];
    });

    return newObj;
}

// Clean form data - convert types and remove empty optional fields
function cleanFormData(data, intFields = []) {
    const cleaned = { ...data };

    // Convert specified fields to integers for PostgreSQL
    intFields.forEach(field => {
        if (cleaned[field] !== undefined && cleaned[field] !== "") {
            cleaned[field] = parseInt(cleaned[field], 10);
        }
    });

    // Convert empty strings to null for optional database fields
    // This prevents sending "" to PostgreSQL where it expects NULL
    Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === "") {
            cleaned[key] = null;
        }
    });

    return cleaned;
}

// get class dropdown options
function classOptions() {
    return classes.map(cls => ({
        value: cls.class_id,
        label: `${cls.class_number}-${cls.section} (${cls.academic_year})`
    }));
}

// fill class dropdowns
function fillClassDropdowns() {
    const studentFilter = document.getElementById("studentClassFilter");
    const resultFilter = document.getElementById("resultClassFilter");

    const options = classes.map(cls => `
        <option value="${safe(cls.class_id)}">
            ${safe(cls.class_number)}-${safe(cls.section)} (${safe(cls.academic_year)})
        </option>
    `).join("");

    if (studentFilter) {
        studentFilter.innerHTML = `<option value="">All Classes</option>${options}`;
    }

    if (resultFilter) {
        resultFilter.innerHTML = `<option value="">All Classes</option>${options}`;
    }
}

// get schedule label
function getScheduleLabel(scheduleId) {
    const schedule = schedules.find(item => {
        return String(item.schedule_id) === String(scheduleId);
    });

    if (!schedule) return scheduleId || "N/A";

    const examName = schedule.exam_name || getExamName(schedule.exam_id);
    const subjectName = schedule.subject_name || getSubjectName(schedule.subject_id);
    const className = schedule.class_number && schedule.section
        ? `${schedule.class_number}-${schedule.section}`
        : getClassName(schedule.class_id);

    return `${examName} | ${subjectName} | ${className}`;
}

// fill seat schedule dropdown
function fillSeatScheduleDropdown() {
    const seatScheduleFilter = document.getElementById("seatScheduleFilter");

    if (!seatScheduleFilter) return;

    const options = schedules.map(schedule => `
        <option value="${safe(schedule.schedule_id)}">
            ${safe(getScheduleLabel(schedule.schedule_id))}
        </option>
    `).join("");

    seatScheduleFilter.innerHTML = `<option value="">All Schedules</option>${options}`;
}

// show seat allocation records
function renderSeatAllocations() {
    const body = document.getElementById("seatAllocationBody");
    const searchInput = document.getElementById("seatSearch");
    const scheduleFilterInput = document.getElementById("seatScheduleFilter");

    if (!body) return;

    const search = searchInput ? searchInput.value.toLowerCase() : "";
    const scheduleFilter = scheduleFilterInput ? scheduleFilterInput.value : "";

    const filtered = seatAllocations.filter(item => {
        const studentName = `${item.first_name || ""} ${item.last_name || ""}`;
        const className = item.class_number && item.section
            ? `${item.class_number}-${item.section}`
            : getClassName(item.class_id);

        const text = `
            ${studentName}
            ${item.seat_no}
            ${item.roll_no}
            ${item.exam_name}
            ${item.subject_name}
            ${className}
        `.toLowerCase();

        const matchSearch = text.includes(search);
        const matchSchedule = !scheduleFilter || String(item.schedule_id) === String(scheduleFilter);

        return matchSearch && matchSchedule;
    });

    setText("totalSeats", seatAllocations.length);

    const uniqueSchedules = new Set(seatAllocations.map(item => item.schedule_id));
    const uniqueStudents = new Set(seatAllocations.map(item => item.student_id));

    setText("seatSchedules", uniqueSchedules.size);
    setText("seatedStudents", uniqueStudents.size);

    if (filtered.length === 0) {
        body.innerHTML = `<tr><td colspan="9">No seat allocations found.</td></tr>`;
    } else {
        body.innerHTML = filtered.map(item => `
            <tr>
                <td data-label="ID">${safe(item.seat_allocation_id)}</td>
                <td data-label="Seat No">${safe(item.seat_no)}</td>
                <td data-label="Student">${safe(`${item.first_name || ""} ${item.last_name || ""}`.trim() || getStudentName(item.student_id))}</td>
                <td data-label="Roll No">${safe(item.roll_no)}</td>
                <td data-label="Exam">${safe(item.exam_name || getExamName(item.exam_id))}</td>
                <td data-label="Subject">${safe(item.subject_name || getSubjectName(item.subject_id))}</td>
                <td data-label="Class">${safe(item.class_number && item.section ? `${item.class_number}-${item.section}` : getClassName(item.class_id))}</td>
                <td data-label="Schedule Date">${safe(formatDate(item.schedule_date))}</td>
                <td data-label="Actions">
                    <div class="action-group">
                        <button class="btn light" onclick="openSeatModal(${item.seat_allocation_id})">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn danger" onclick="deleteSeatAllocation(${item.seat_allocation_id})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join("");
    }

    renderSeatAllocationChart();
}

// show seat allocation chart
function renderSeatAllocationChart() {
    const canvas = document.getElementById("seatAllocationChart");

    if (!canvas) return;

    const scheduleGroups = {};

    seatAllocations.forEach(item => {
        const label = getScheduleLabel(item.schedule_id);
        scheduleGroups[label] = (scheduleGroups[label] || 0) + 1;
    });

    if (seatAllocationChart) {
        seatAllocationChart.destroy();
    }

    seatAllocationChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: Object.keys(scheduleGroups),
            datasets: [{
                label: "Allocated Seats",
                data: Object.values(scheduleGroups)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// open seat allocation form
function openSeatModal(seatAllocationId = null) {
    const seat = seatAllocations.find(item => {
        return String(item.seat_allocation_id) === String(seatAllocationId);
    });

    openModal(
        seat ? "Update Seat Allocation" : "Allocate Seat",
        [
            {
                name: "schedule_id",
                label: "Exam Schedule",
                type: "select",
                value: seat?.schedule_id || "",
                options: schedules.map(schedule => ({
                    value: schedule.schedule_id,
                    label: getScheduleLabel(schedule.schedule_id)
                })),
                required: true
            },
            {
                name: "student_id",
                label: "Student",
                type: "select",
                value: seat?.student_id || "",
                options: students.map(student => ({
                    value: student.student_id,
                    label: `${fullName(student)} | Roll No: ${student.roll_no}`
                })),
                required: true
            },
            {
                name: "seat_no",
                label: "Seat No",
                value: seat?.seat_no || "",
                required: true
            }
        ],
        async formData => {
            // Convert integers for PostgreSQL
            const cleaned = cleanFormData(formData, ["schedule_id", "student_id"]);

            if (seat) {
                await apiPut(`/api/seat-allocations/${seatAllocationId}`, cleaned);
                showToast("Seat allocation updated successfully");
            } else {
                await apiPost("/api/seat-allocations", cleaned);
                showToast("Seat allocated successfully");
            }

            closeModal();
            await loadAllData();
        }
    );
}

// delete seat allocation
async function deleteSeatAllocation(seatAllocationId) {
    if (!confirm("Are you sure you want to delete this seat allocation?")) return;

    try {
        await apiDelete(`/api/seat-allocations/${seatAllocationId}`);
        showToast("Seat allocation deleted successfully");
        await loadAllData();
    } catch (error) {
        showToast(error.message, "error");
    }
}

// start app
loadAllData();