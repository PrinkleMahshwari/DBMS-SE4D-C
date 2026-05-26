-- 1. PERSON (Parent Table)
CREATE TABLE person (
    email VARCHAR(100) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    dob DATE NOT NULL,
    father_name VARCHAR(100),
    phone VARCHAR(15),
    street VARCHAR(100),
    area VARCHAR(100),
    postal_code VARCHAR(10),
    city VARCHAR(50),
    province VARCHAR(50),
    country VARCHAR(50) DEFAULT 'Pakistan'
);

-- 2. ADMIN
CREATE TABLE admin (
    admin_id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE REFERENCES person(email) ON DELETE CASCADE,
    joining_date DATE DEFAULT CURRENT_DATE,
    resign_date DATE,
    status VARCHAR(20) DEFAULT 'Active'
);

-- 3. PRINCIPAL
CREATE TABLE principal (
    principal_id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE REFERENCES person(email) ON DELETE CASCADE,
    qualification VARCHAR(100),
    experience_years INTEGER,
    joining_date DATE DEFAULT CURRENT_DATE,
    resign_date DATE,
    status VARCHAR(20) DEFAULT 'Active'
);

-- 4. TEACHER
CREATE TABLE teacher (
    teacher_id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE REFERENCES person(email) ON DELETE CASCADE,
    qualification VARCHAR(100),
    experience_years INTEGER,
    teacher_type VARCHAR(50), -- ClassTeacher, SubjectTeacher, LabTeacher, Invigilator
    joining_date DATE DEFAULT CURRENT_DATE,
    resign_date DATE,
    status VARCHAR(20) DEFAULT 'Active'
);

-- 5. CLASS (Needed before Student)
CREATE TABLE class (
    class_id SERIAL PRIMARY KEY,
    class_number INTEGER NOT NULL,
    section VARCHAR(10) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    UNIQUE(class_number, section, academic_year) -- Prevents duplicate classes
);

-- 6. STUDENT
CREATE TABLE student (
    student_id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE REFERENCES person(email) ON DELETE CASCADE,
    roll_no INTEGER NOT NULL,
    emergency_phone VARCHAR(15),
    class_id INTEGER REFERENCES class(class_id)
);
-- 7. SUBJECT
CREATE TABLE subject (
    subject_id SERIAL PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    subject_code VARCHAR(20) UNIQUE NOT NULL
);

-- 8. CLASS_SUBJECT (Many-to-Many resolution)
CREATE TABLE class_subject (
    class_subject_id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES class(class_id),
    subject_id INTEGER REFERENCES subject(subject_id),
    UNIQUE(class_id, subject_id) -- A subject can only be assigned once to a class
);

-- 9. TEACHING_ASSIGNMENT (Who teaches what to whom)
CREATE TABLE teaching_assignment (
    assignment_id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES teacher(teacher_id),
    class_id INTEGER REFERENCES class(class_id),
    subject_id INTEGER REFERENCES subject(subject_id),
    UNIQUE(class_id, subject_id) -- One class + one subject = only one teacher
);

-- 10. CLASS_TEACHER_ASSIGNMENT (Who manages the class)
CREATE TABLE class_teacher_assignment (
    class_teacher_assignment_id SERIAL PRIMARY KEY,
    teacher_id INTEGER UNIQUE REFERENCES teacher(teacher_id), -- One teacher manages only one class
    class_id INTEGER UNIQUE REFERENCES class(class_id)        -- One class has only one class teacher
);
-- 11. EXAM
CREATE TABLE exam (
    exam_id SERIAL PRIMARY KEY,
    exam_name VARCHAR(100) NOT NULL,
    exam_type VARCHAR(50) NOT NULL, -- Quiz, GT, Mid, Final, etc.
    exam_date DATE NOT NULL,
    total_marks INTEGER NOT NULL DEFAULT 100
);

-- 12. CLASSROOM
CREATE TABLE classroom (
    room_id SERIAL PRIMARY KEY,
    class_number INTEGER NOT NULL,
    section VARCHAR(10),
    capacity INTEGER NOT NULL
);

-- 13. LAB
CREATE TABLE lab (
    lab_id SERIAL PRIMARY KEY,
    lab_name VARCHAR(100) NOT NULL,
    lab_type VARCHAR(50),
    capacity INTEGER NOT NULL,
    location VARCHAR(100)
);

-- 14. EXAM_SCHEDULE
CREATE TABLE exam_schedule (
    schedule_id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exam(exam_id),
    class_id INTEGER REFERENCES class(class_id),
    subject_id INTEGER REFERENCES subject(subject_id),
    room_id INTEGER REFERENCES classroom(room_id),
    lab_id INTEGER REFERENCES lab(lab_id),
    scheduled_by_admin_id INTEGER REFERENCES admin(admin_id),
    approved_by_principal_id INTEGER REFERENCES principal(principal_id),
    schedule_day VARCHAR(20),
    schedule_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' -- Pending, Approved, Rejected, Distributed
);

-- 15. EXAM_COMPONENT (Only for Mid & Final)
CREATE TABLE exam_component (
    component_id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exam(exam_id),
    subject_id INTEGER REFERENCES subject(subject_id),
    component_type VARCHAR(50) NOT NULL, -- Written, Practical, Viva
    max_marks INTEGER NOT NULL,
    conducted_in VARCHAR(50) -- Classroom or Lab
);

-- 16. VIVA_ASSIGNMENT
CREATE TABLE viva_assignment (
    viva_assignment_id SERIAL PRIMARY KEY,
    component_id INTEGER REFERENCES exam_component(component_id),
    teacher_id INTEGER REFERENCES teacher(teacher_id),
    schedule_id INTEGER REFERENCES exam_schedule(schedule_id),
    viva_date DATE NOT NULL,
    viva_time TIME NOT NULL
);

-- 17. SEAT_ALLOCATION
CREATE TABLE seat_allocation (
    seat_allocation_id SERIAL PRIMARY KEY,
    schedule_id INTEGER REFERENCES exam_schedule(schedule_id),
    student_id INTEGER REFERENCES student(student_id),
    seat_no VARCHAR(20) NOT NULL, -- e.g., 08A23
    UNIQUE(schedule_id, student_id), -- One seat per student per schedule
    UNIQUE(schedule_id, seat_no)      -- No duplicate seats in the same schedule
);

-- 18. INVIGILATION
CREATE TABLE invigilation (
    invigilation_id SERIAL PRIMARY KEY,
    schedule_id INTEGER REFERENCES exam_schedule(schedule_id),
    teacher_id INTEGER REFERENCES teacher(teacher_id),
    role VARCHAR(50) -- Invigilator
);

-- 19. STUDENT_ATTENDANCE
CREATE TABLE student_attendance (
    attendance_id SERIAL PRIMARY KEY,
    schedule_id INTEGER REFERENCES exam_schedule(schedule_id),
    student_id INTEGER REFERENCES student(student_id),
    invigilation_id INTEGER REFERENCES invigilation(invigilation_id),
    status VARCHAR(20) NOT NULL, -- Present, Leave, Absent
    reason VARCHAR(100),         -- Medical Emergency, Family Issue, No Valid Reason
    re_exam_eligibility VARCHAR(20), -- Eligible, Not Eligible
    UNIQUE(schedule_id, student_id)  -- One attendance record per student per exam
);
-- 20. MARKS
CREATE TABLE marks (
    marks_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES student(student_id),
    exam_id INTEGER REFERENCES exam(exam_id),
    subject_id INTEGER REFERENCES subject(subject_id),
    schedule_id INTEGER REFERENCES exam_schedule(schedule_id),
    component_id INTEGER REFERENCES exam_component(component_id), -- Nullable for non-Mid/Final exams
    attendance_id INTEGER REFERENCES student_attendance(attendance_id),
    submitted_by_teacher_id INTEGER REFERENCES teacher(teacher_id),
    marks_obtained INTEGER NOT NULL,
    is_absent BOOLEAN DEFAULT FALSE,
    submitted_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 21. MARKS_EDIT_REQUEST
CREATE TABLE marks_edit_request (
    edit_request_id SERIAL PRIMARY KEY,
    marks_id INTEGER REFERENCES marks(marks_id),
    teacher_id INTEGER REFERENCES teacher(teacher_id),
    principal_id INTEGER REFERENCES principal(principal_id),
    old_marks INTEGER,
    new_marks INTEGER,
    reason TEXT,
    approval_status VARCHAR(20) DEFAULT 'Pending', -- Pending, Approved, Rejected
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP
);

-- 22. RESULT
CREATE TABLE result (
    result_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES student(student_id),
    subject_id INTEGER REFERENCES subject(subject_id),
    class_id INTEGER REFERENCES class(class_id),
    term VARCHAR(20), -- Mid, Final
    total_marks INTEGER,
    obtained_marks INTEGER,
    percentage DECIMAL(5,2),
    grade VARCHAR(5)
);

-- 23. REPORT_CARD
CREATE TABLE report_card (
    report_card_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES student(student_id),
    class_id INTEGER REFERENCES class(class_id),
    academic_year VARCHAR(10),
    term VARCHAR(20), -- Mid, Final
    overall_total_marks INTEGER,
    overall_obtained_marks INTEGER,
    overall_percentage DECIMAL(5,2),
    overall_grade VARCHAR(5),
    overall_position INTEGER,
    issue_date DATE,
    parent_signature_name VARCHAR(100),
    class_teacher_signature_name VARCHAR(100),
    student_signature_name VARCHAR(100),
    UNIQUE(student_id, term, academic_year) -- One report card per term per year
);

-- 24. REPORT_CARD_SUBJECT
CREATE TABLE report_card_subject (
    report_subject_id SERIAL PRIMARY KEY,
    report_card_id INTEGER REFERENCES report_card(report_card_id),
    subject_id INTEGER REFERENCES subject(subject_id),
    subject_teacher_id INTEGER REFERENCES teacher(teacher_id),
    result_id INTEGER REFERENCES result(result_id),
    subject_percentage DECIMAL(5,2),
    subject_grade VARCHAR(5),
    remarks TEXT,
    UNIQUE(report_card_id, subject_id) -- Each subject appears once per report card
);

-- 25. ATTENDANCE_MARKS
CREATE TABLE attendance_marks (
    attendance_marks_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES student(student_id),
    class_id INTEGER REFERENCES class(class_id),
    report_card_id INTEGER REFERENCES report_card(report_card_id),
    term VARCHAR(20),
    total_attendance_marks DECIMAL(5,2), -- Out of 25
    leaves INTEGER DEFAULT 0,
    absents INTEGER DEFAULT 0
);

-- 1. Admin Person
INSERT INTO person (email, first_name, last_name, gender, dob, father_name, phone, street, area, postal_code, city, province, country) 
VALUES ('admin@school.edu.pk', 'Syed', 'Admin', 'Male', '1980-05-15', 'Syed Senior', '03001234567', '42-B, Block 6', 'PECHS', '75400', 'Karachi', 'Sindh', 'Pakistan');

-- 2. Admin Role
INSERT INTO admin (email, joining_date, status) VALUES ('admin@school.edu.pk', '2020-04-01', 'Active');

-- 3. Principal Person
INSERT INTO person (email, first_name, last_name, gender, dob, father_name, phone, street, area, postal_code, city, province, country) 
VALUES ('principal@school.edu.pk', 'Ahmed', 'Khan', 'Male', '1975-08-20', 'Khan Senior', '03219876543', '15-C, DHA Phase 5', 'DHA', '75500', 'Karachi', 'Sindh', 'Pakistan');

-- 4. Principal Role (He also teaches English to 9th/10th)
INSERT INTO principal (email, qualification, experience_years, joining_date, status) 
VALUES ('principal@school.edu.pk', 'MPhil English', 20, '2015-04-01', 'Active');

-- 1. Change class_number in 'class' table from INT to VARCHAR
ALTER TABLE class ALTER COLUMN class_number TYPE VARCHAR(10);

-- 2. Change class_number in 'classroom' table from INT to VARCHAR
ALTER TABLE classroom ALTER COLUMN class_number TYPE VARCHAR(10);

ALTER TABLE person ADD COLUMN religion VARCHAR(50);
-- Update Admin and Principal
UPDATE person SET religion = 'Islam' WHERE email IN ('admin@school.edu.pk', 'principal@school.edu.pk');

INSERT INTO class (class_number, section, academic_year) VALUES
-- Nursery & KG
('Nursery', 'A', '2026-27'), ('Nursery', 'B', '2026-27'),
('KG', 'A', '2026-27'), ('KG', 'B', '2026-27'),
-- Classes 1 to 8 (Sections A & B)
('2', 'A', '2026-27'), ('2', 'B', '2026-27'),
('3', 'A', '2026-27'), ('3', 'B', '2026-27'),
('4', 'A', '2026-27'), ('4', 'B', '2026-27'),
('5', 'A', '2026-27'), ('5', 'B', '2026-27'),
('6', 'A', '2026-27'), ('6', 'B', '2026-27'),
('7', 'A', '2026-27'), ('7', 'B', '2026-27'),
('8', 'A', '2026-27'), ('8', 'B', '2026-27'),
-- Classes 9 & 10 (Sections A, B, C)
('9', 'A', '2026-27'), ('9', 'B', '2026-27'), ('9', 'C', '2026-27'),
('10', 'A', '2026-27'), ('10', 'B', '2026-27'), ('10', 'C', '2026-27');

INSERT INTO classroom (class_number, section, capacity) VALUES
('Nursery', 'A', 30), ('Nursery', 'B', 30),
('KG', 'A', 30), ('KG', 'B', 30),
('2', 'A', 35), ('2', 'B', 35),
('3', 'A', 35), ('3', 'B', 35),
('4', 'A', 35), ('4', 'B', 35),
('5', 'A', 35), ('5', 'B', 35),
('6', 'A', 40), ('6', 'B', 40),
('7', 'A', 40), ('7', 'B', 40),
('8', 'A', 40), ('8', 'B', 40),
('9', 'A', 40), ('9', 'B', 40), ('9', 'C', 40),
('10', 'A', 40), ('10', 'B', 40), ('10', 'C', 40);

-- Insert Class 1 Sections
INSERT INTO class (class_number, section, academic_year) 
VALUES ('1', 'A', '2026-27'), ('1', 'B', '2026-27');

-- Insert Classrooms for Class 1
INSERT INTO classroom (class_number, section, capacity) 
VALUES ('1', 'A', 35), ('1', 'B', 35);

INSERT INTO lab (lab_name, lab_type, capacity, location) VALUES
('Computer Lab 1', 'Computer', 30, '2nd Floor, Room 201'),
('Computer Lab 2', 'Computer', 30, '2nd Floor, Room 202'),
('Science Lab 1', 'Science', 25, '3rd Floor, Room 301'),
('Science Lab 2', 'Biology/Physics/Chemistry(9th & 10th Class)', 25, '3rd Floor, Room 302');

INSERT INTO subject (subject_name, subject_code) VALUES
('English', 'ENG101'), 
('Sindhi', 'SIN101'), 
('Urdu', 'URD101'), 
('Mathematics', 'MTH101'), 
('General Knowledge', 'GK101'), 
('Science', 'SCI101'), 
('Social Studies', 'SST101'), 
('Computer', 'CMP101'), 
('Drawing', 'DRW101'), 
('Islamiyat', 'ISL101'), 
('Ethics', 'ETH101'), 
('Pakistan Studies', 'PAK101'), 
('Biology', 'BIO101'), 
('Physics', 'PHY101'), 
('Chemistry', 'CHE101'), 
('Computer Science', 'CSC101');

INSERT INTO person (email, first_name, last_name, gender, dob, father_name, phone, street, area, postal_code, city, province, country, religion) VALUES
('fatima.noor@school.edu.pk', 'Fatima', 'Noor', 'Female', '1988-03-15', 'Noor Muhammad', '03011234501', '12-A, Block 3', 'Gulshan-e-Iqbal', '75300', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('ahmed.ali@school.edu.pk', 'Ahmed', 'Ali', 'Male', '1985-07-22', 'Ali Hassan', '03021234502', '45-B, DHA Phase 6', 'DHA', '75500', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('bilal.khan@school.edu.pk', 'Bilal', 'Khan', 'Male', '1990-01-10', 'Khan Zaman', '03031234503', '78-C, Clifton Block 2', 'Clifton', '75600', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('zainab.hassan@school.edu.pk', 'Zainab', 'Hassan', 'Female', '1987-11-05', 'Hassan Raza', '03041234504', '23-D, Nazimabad', 'Nazimabad', '74600', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('hassan.rafiq@school.edu.pk', 'Hassan', 'Rafiq', 'Male', '1982-09-18', 'Rafiq Ahmed', '03051234505', '56-E, North Nazimabad', 'North Nazimabad', '74700', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('priya.sharma@school.edu.pk', 'Priya', 'Sharma', 'Female', '1991-05-30', 'Ramesh Sharma', '03061234506', '89-F, Federal B Area', 'Federal B Area', '75900', 'Karachi', 'Sindh', 'Pakistan', 'Hinduism'),
('ali.zafar@school.edu.pk', 'Ali', 'Zafar', 'Male', '1984-02-14', 'Zafar Iqbal', '03071234507', '34-G, Bahadurabad', 'Bahadurabad', '74800', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('sara.waqar@school.edu.pk', 'Sara', 'Waqar', 'Female', '1989-08-25', 'Waqar Malik', '03081234508', '67-H, PECHS', 'PECHS', '75400', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('usman.tariq@school.edu.pk', 'Usman', 'Tariq', 'Male', '1986-12-03', 'Tariq Mahmood', '03091234509', '90-I, Defence View', 'Defence', '75500', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('david.masih@school.edu.pk', 'David', 'Masih', 'Male', '1992-04-20', 'John Masih', '03101234510', '12-J, Landhi', 'Landhi', '75100', 'Karachi', 'Sindh', 'Pakistan', 'Christianity'),
('imran.shahid@school.edu.pk', 'Imran', 'Shahid', 'Male', '1983-06-12', 'Shahid Nawaz', '03111234511', '45-K, Korangi', 'Korangi', '74900', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('rajesh.kumar@school.edu.pk', 'Rajesh', 'Kumar', 'Male', '1988-10-08', 'Suresh Kumar', '03121234512', '78-L, Malir', 'Malir', '75200', 'Karachi', 'Sindh', 'Pakistan', 'Hinduism'),
('taha.mehmood@school.edu.pk', 'Taha', 'Mehmood', 'Male', '1990-03-28', 'Mehmood Ul Hasan', '03131234513', '23-M, Shah Faisal', 'Shah Faisal', '75300', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('sana.bilal@school.edu.pk', 'Sana', 'Bilal', 'Female', '1987-07-15', 'Bilal Ahmed', '03141234514', '56-N, Orangi', 'Orangi', '75000', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('omar.farooq@school.edu.pk', 'Omar', 'Farooq', 'Male', '1981-09-02', 'Farooq-e-Azam', '03151234515', '89-O, SITE', 'SITE', '75700', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('mariam.joseph@school.edu.pk', 'Mariam', 'Joseph', 'Female', '1993-01-19', 'Joseph Masih', '03161234516', '34-P, Saddar', 'Saddar', '74400', 'Karachi', 'Sindh', 'Pakistan', 'Christianity'),
('hamza.yousuf@school.edu.pk', 'Hamza', 'Yousuf', 'Male', '1985-05-11', 'Yousuf Khan', '03171234517', '67-Q, Liaquatabad', 'Liaquatabad', '75900', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('sarah.john@school.edu.pk', 'Sarah', 'John', 'Female', '1991-11-23', 'Peter John', '03181234518', '90-R, Garden', 'Garden', '74500', 'Karachi', 'Sindh', 'Pakistan', 'Christianity'),
('rizwan.anwar@school.edu.pk', 'Rizwan', 'Anwar', 'Male', '1984-08-07', 'Anwar Hussain', '03191234519', '12-S, Jehangir Road', 'Jehangir Road', '74600', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('iqra.shakeel@school.edu.pk', 'Iqra', 'Shakeel', 'Female', '1989-02-16', 'Shakeel Ahmed', '03201234520', '45-T, Burns Garden', 'Burns Garden', '74400', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('faisal.malik@school.edu.pk', 'Faisal', 'Malik', 'Male', '1982-12-29', 'Malik Aslam', '03211234521', '78-U, Frere Town', 'Frere Town', '75500', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('deepak.malhotra@school.edu.pk', 'Deepak', 'Malhotra', 'Male', '1990-06-04', 'Ashok Malhotra', '03221234522', '23-V, Cantt', 'Cantt', '75200', 'Karachi', 'Sindh', 'Pakistan', 'Hinduism'),
('saad.akhtar@school.edu.pk', 'Saad', 'Akhtar', 'Male', '1986-04-09', 'Akhtar Raza', '03231234523', '56-W, PECHS Block 6', 'PECHS', '75400', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('hira.nasir@school.edu.pk', 'Hira', 'Nasir', 'Female', '1992-10-31', 'Nasir Javed', '03241234524', '89-X, Tariq Road', 'Tariq Road', '75400', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('wahab.rajput@school.edu.pk', 'Wahab', 'Rajput', 'Male', '1983-03-22', 'Rajput Khan', '03251234525', '12-Y, Bihar Colony', 'Bihar Colony', '75700', 'Karachi', 'Sindh', 'Pakistan', 'Islam');

INSERT INTO teacher (email, qualification, experience_years, teacher_type, status) VALUES
('fatima.noor@school.edu.pk', 'MSc Mathematics', 5, 'SubjectTeacher', 'Active'),
('ahmed.ali@school.edu.pk', 'MSc Physics', 10, 'SubjectTeacher', 'Active'),
('bilal.khan@school.edu.pk', 'MSc Chemistry', 7, 'SubjectTeacher', 'Active'),
('zainab.hassan@school.edu.pk', 'MSc Biology', 8, 'SubjectTeacher', 'Active'),
('hassan.rafiq@school.edu.pk', 'MCS', 12, 'SubjectTeacher', 'Active'),
('priya.sharma@school.edu.pk', 'MSc Computer Science', 4, 'SubjectTeacher', 'Active'),
('ali.zafar@school.edu.pk', 'MA Sindhi', 9, 'SubjectTeacher', 'Active'),
('sara.waqar@school.edu.pk', 'MA Urdu', 6, 'SubjectTeacher', 'Active'),
('usman.tariq@school.edu.pk', 'MSc Social Studies', 11, 'SubjectTeacher', 'Active'),
('david.masih@school.edu.pk', 'MSc General Science', 3, 'SubjectTeacher', 'Active'),
('imran.shahid@school.edu.pk', 'MA Islamic Studies', 14, 'SubjectTeacher', 'Active'),
('rajesh.kumar@school.edu.pk', 'MA Ethics', 8, 'SubjectTeacher', 'Active'),
('taha.mehmood@school.edu.pk', 'MA Pakistan Studies', 5, 'SubjectTeacher', 'Active'),
('sana.bilal@school.edu.pk', 'MA English', 10, 'SubjectTeacher', 'Active'),
('omar.farooq@school.edu.pk', 'MSc Science', 7, 'SubjectTeacher', 'Active'),
('mariam.joseph@school.edu.pk', 'MSc Science', 4, 'SubjectTeacher', 'Active'),
('hamza.yousuf@school.edu.pk', 'MBA', 6, 'ClassTeacher', 'Active'),
('sarah.john@school.edu.pk', 'MA Education', 3, 'ClassTeacher', 'Active'),
('rizwan.anwar@school.edu.pk', 'MCom', 9, 'ClassTeacher', 'Active'),
('iqra.shakeel@school.edu.pk', 'MSc Home Econ', 5, 'ClassTeacher', 'Active'),
('faisal.malik@school.edu.pk', 'MBA', 8, 'ClassTeacher', 'Active'),
('deepak.malhotra@school.edu.pk', 'MA Education', 2, 'ClassTeacher', 'Active'),
('saad.akhtar@school.edu.pk', 'MSc Science', 7, 'LabTeacher', 'Active'),
('hira.nasir@school.edu.pk', 'MSc Computer', 4, 'LabTeacher', 'Active'),
('wahab.rajput@school.edu.pk', 'MSc Science', 6, 'Invigilator', 'Active');

-- Add the Principal as an English Teacher (Overlapping Role!)
INSERT INTO teacher (email, qualification, experience_years, teacher_type, status) 
VALUES ('principal@school.edu.pk', 'MPhil English', 20, 'SubjectTeacher', 'Active');

-- Link Subjects to Classes
-- 1. Nursery & KG
INSERT INTO class_subject (class_id, subject_id)
SELECT c.class_id, s.subject_id
FROM class c
CROSS JOIN subject s
WHERE c.class_number IN ('Nursery', 'KG')
AND s.subject_code IN ('ENG101', 'SIN101', 'MTH101', 'DRW101');

-- 2. 1 to 3
INSERT INTO class_subject (class_id, subject_id)
SELECT c.class_id, s.subject_id
FROM class c
CROSS JOIN subject s
WHERE c.class_number IN ('2', '3')
AND s.subject_code IN ('ENG101', 'SIN101', 'URD101', 'MTH101', 'SCI101', 'GK101', 'DRW101');

INSERT INTO class_subject (class_id, subject_id)
SELECT c.class_id, s.subject_id
FROM class c
CROSS JOIN subject s
WHERE c.class_number = '1'
AND s.subject_code IN ('ENG101', 'SIN101', 'URD101', 'MTH101', 'SCI101', 'GK101', 'DRW101');

-- 3. 4 & 5
INSERT INTO class_subject (class_id, subject_id)
SELECT c.class_id, s.subject_id
FROM class c
CROSS JOIN subject s
WHERE c.class_number IN ('4', '5')
AND s.subject_code IN ('ENG101', 'SIN101', 'URD101', 'MTH101', 'SCI101', 'GK101', 'CMP101', 'SST101', 'DRW101');

-- 4. 6 to 8
INSERT INTO class_subject (class_id, subject_id)
SELECT c.class_id, s.subject_id
FROM class c
CROSS JOIN subject s
WHERE c.class_number IN ('6', '7', '8')
AND s.subject_code IN ('ENG101', 'SIN101', 'URD101', 'MTH101', 'SCI101', 'GK101', 'CMP101', 'SST101', 'ISL101', 'ETH101', 'DRW101');

-- 5. 9
INSERT INTO class_subject (class_id, subject_id)
SELECT c.class_id, s.subject_id
FROM class c
CROSS JOIN subject s
WHERE c.class_number = '9'
AND s.subject_code IN ('ENG101', 'SIN101', 'MTH101', 'PHY101', 'CHE101', 'BIO101', 'CSC101', 'ISL101', 'ETH101');

--6. 10
INSERT INTO class_subject (class_id, subject_id)
SELECT c.class_id, s.subject_id
FROM class c
CROSS JOIN subject s
WHERE c.class_number = '10'
AND s.subject_code IN ('ENG101', 'URD101', 'MTH101', 'PHY101', 'CHE101', 'BIO101', 'CSC101', 'PAK101');

-- Assign teachers to their subjects
-- 1. Principal & Core Subject Teachers (9th & 10th)
-- Principal teaches English to 9th & 10th
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'principal@school.edu.pk'
AND c.class_number IN ('9', '10')
AND s.subject_code = 'ENG101';

-- Fatima Noor (Maths) for 9th & 10th
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'fatima.noor@school.edu.pk'
AND c.class_number IN ('9', '10')
AND s.subject_code = 'MTH101';

-- Ahmed Ali (Physics) for 9th & 10th
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'ahmed.ali@school.edu.pk'
AND c.class_number IN ('9', '10')
AND s.subject_code = 'PHY101';

-- Bilal Khan (Chemistry) for 9th & 10th
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'bilal.khan@school.edu.pk'
AND c.class_number IN ('9', '10')
AND s.subject_code = 'CHE101';

-- Zainab Hassan (Biology) for 9th & 10th
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'zainab.hassan@school.edu.pk'
AND c.class_number IN ('9', '10')
AND s.subject_code = 'BIO101';

-- Hassan Rafiq (Computer Science) for 9th & 10th
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'hassan.rafiq@school.edu.pk'
AND c.class_number IN ('9', '10')
AND s.subject_code = 'CSC101';

-- Taha Mehmood (Pakistan Studies) for 10th
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'taha.mehmood@school.edu.pk'
AND c.class_number = '10'
AND s.subject_code = 'PAK101';

-- Imran Shahid (Islamiyat) for 9th & 10th
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'imran.shahid@school.edu.pk'
AND c.class_number IN ('9', '10')
AND s.subject_code = 'ISL101';

-- Rajesh Kumar (Ethics) for 9th & 10th
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'rajesh.kumar@school.edu.pk'
AND c.class_number IN ('9', '10')
AND s.subject_code = 'ETH101';

-- Ali Zafar (Sindhi) for 9th & 10th
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'ali.zafar@school.edu.pk'
AND c.class_number IN ('9', '10')
AND s.subject_code = 'SIN101';

-- 2. Middle & Primary School Teachers (2 to 8)
-- Sana Bilal (English) for 6th, 7th, 8th
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'sana.bilal@school.edu.pk'
AND c.class_number IN ('6', '7', '8')
AND s.subject_code = 'ENG101';

-- Ayesha Siddiqui (Maths) for 2nd to 5th
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'ayesha.siddiqui@school.edu.pk'
AND c.class_number IN ('2', '3', '4', '5')
AND s.subject_code = 'MTH101';

-- Omar Farooq (English) for 2nd to 5th
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'omar.farooq@school.edu.pk'
AND c.class_number IN ('2', '3', '4', '5')
AND s.subject_code = 'ENG101';

-- David Masih (Science) for 6th to 8th
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'david.masih@school.edu.pk'
AND c.class_number IN ('6', '7', '8')
AND s.subject_code = 'SCI101';

-- Hina Pervez (Science) for 2nd to 5th
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'hina.pervez@school.edu.pk'
AND c.class_number IN ('2', '3', '4', '5')
AND s.subject_code = 'SCI101';

-- Usman Tariq (Social Studies) for 4th to 8th
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'usman.tariq@school.edu.pk'
AND c.class_number IN ('4', '5', '6', '7', '8')
AND s.subject_code = 'SST101';

-- Sara Waqar (Urdu) for 2nd to 8th
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'sara.waqar@school.edu.pk'
AND c.class_number IN ('2', '3', '4', '5', '6', '7', '8')
AND s.subject_code = 'URD101';

-- Priya Sharma (Computer) for 4th to 8th
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'priya.sharma@school.edu.pk'
AND c.class_number IN ('4', '5', '6', '7', '8')
AND s.subject_code = 'CMP101';

-- Iqra Shakeel (GK) for 2nd to 8th
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'iqra.shakeel@school.edu.pk'
AND c.class_number IN ('2', '3', '4', '5', '6', '7', '8')
AND s.subject_code = 'GK101';

-- 3. Nursery, KG & Drawing 
-- Mariam Joseph (English, Science, GK) for Nursery & KG
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'mariam.joseph@school.edu.pk'
AND c.class_number IN ('Nursery', 'KG')
AND s.subject_code IN ('ENG101', 'SCI101', 'GK101');

-- Nida Zahid (Sindhi, Urdu, Maths) for Nursery & KG
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'nida.zahid@school.edu.pk'
AND c.class_number IN ('Nursery', 'KG')
AND s.subject_code IN ('SIN101', 'URD101', 'MTH101');

-- Wahab Rajput (Drawing) for Nursery to 8th
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'wahab.rajput@school.edu.pk'
AND c.class_number IN ('Nursery', 'KG', '2', '3', '4', '5', '6', '7', '8')
AND s.subject_code = 'DRW101';

-- Class Teacher Assignment
INSERT INTO class_teacher_assignment (teacher_id, class_id) VALUES
-- Nursery & KG
((SELECT teacher_id FROM teacher WHERE email='hamza.yousuf@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='Nursery' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='alishba.kamran@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='Nursery' AND section='B')),
((SELECT teacher_id FROM teacher WHERE email='sarah.john@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='KG' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='rizwan.anwar@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='KG' AND section='B')),
-- Classes 2 to 5
((SELECT teacher_id FROM teacher WHERE email='iqra.shakeel@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='2' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='faisal.malik@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='2' AND section='B')),
((SELECT teacher_id FROM teacher WHERE email='nida.zahid@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='3' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='deepak.malhotra@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='3' AND section='B')),
((SELECT teacher_id FROM teacher WHERE email='saad.akhtar@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='4' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='hira.nasir@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='4' AND section='B')),
((SELECT teacher_id FROM teacher WHERE email='wahab.rajput@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='5' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='mariam.joseph@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='5' AND section='B')),
-- Classes 6 to 8
((SELECT teacher_id FROM teacher WHERE email='omar.farooq@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='6' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='sana.bilal@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='6' AND section='B')),
((SELECT teacher_id FROM teacher WHERE email='taha.mehmood@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='7' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='rajesh.kumar@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='7' AND section='B')),
((SELECT teacher_id FROM teacher WHERE email='imran.shahid@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='8' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='david.masih@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='8' AND section='B')),
-- Classes 9 & 10 (A, B, C)
((SELECT teacher_id FROM teacher WHERE email='usman.tariq@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='9' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='sara.waqar@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='9' AND section='B')),
((SELECT teacher_id FROM teacher WHERE email='ali.zafar@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='9' AND section='C')),
((SELECT teacher_id FROM teacher WHERE email='priya.sharma@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='10' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='hassan.rafiq@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='10' AND section='B')),
((SELECT teacher_id FROM teacher WHERE email='zainab.hassan@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='10' AND section='C'));

INSERT INTO class_teacher_assignment (teacher_id, class_id) VALUES
((SELECT teacher_id FROM teacher WHERE email='fatima.noor@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='1' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='ahmed.ali@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='1' AND section='B'));

-- English for Class 1 (Omar Farooq)
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'omar.farooq@school.edu.pk'
AND c.class_number = '1'
AND s.subject_code = 'ENG101';

-- Mathematics for Class 1 (Ayesha Siddiqui)
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'ayesha.siddiqui@school.edu.pk'
AND c.class_number = '1'
AND s.subject_code = 'MTH101';

-- Sindhi for Class 1 (Nida Zahid - she teaches Sindhi to Nursery/KG)
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'nida.zahid@school.edu.pk'
AND c.class_number = '1'
AND s.subject_code = 'SIN101';

-- Urdu for Class 1 (Sara Waqar)
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'sara.waqar@school.edu.pk'
AND c.class_number = '1'
AND s.subject_code = 'URD101';

-- Science for Class 1 (Hina Pervez)
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'hina.pervez@school.edu.pk'
AND c.class_number = '1'
AND s.subject_code = 'SCI101';

-- General Knowledge for Class 1 (Iqra Shakeel)
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'iqra.shakeel@school.edu.pk'
AND c.class_number = '1'
AND s.subject_code = 'GK101';

-- Drawing for Class 1 (Wahab Rajput - fixing the missing '1' from earlier)
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id)
SELECT t.teacher_id, c.class_id, s.subject_id
FROM teacher t, class c, subject s
WHERE t.email = 'wahab.rajput@school.edu.pk'
AND c.class_number = '1'
AND s.subject_code = 'DRW101';

-- add missing class teachers
-- 1. Add Alishba Kamran
INSERT INTO person (email, first_name, last_name, gender, dob, father_name, phone, street, area, postal_code, city, province, country, religion) 
VALUES ('alishba.kamran@school.edu.pk', 'Alishba', 'Kamran', 'Female', '1991-11-23', 'Kamran Mirza', '03181234518', '90-R, Garden', 'Garden', '74500', 'Karachi', 'Sindh', 'Pakistan', 'Islam');

INSERT INTO teacher (email, qualification, experience_years, teacher_type, status) 
VALUES ('alishba.kamran@school.edu.pk', 'MA Education', 3, 'ClassTeacher', 'Active');

-- 2. Add Nida Zahid
INSERT INTO person (email, first_name, last_name, gender, dob, father_name, phone, street, area, postal_code, city, province, country, religion) 
VALUES ('nida.zahid@school.edu.pk', 'Nida', 'Zahid', 'Female', '1990-06-04', 'Zahid Iqbal', '03221234522', '23-V, Cantt', 'Cantt', '75200', 'Karachi', 'Sindh', 'Pakistan', 'Islam');

INSERT INTO teacher (email, qualification, experience_years, teacher_type, status) 
VALUES ('nida.zahid@school.edu.pk', 'MA Sindhi', 5, 'SubjectTeacher', 'Active');

-- Assign Alishba to Nursery-B
INSERT INTO class_teacher_assignment (teacher_id, class_id) 
VALUES ((SELECT teacher_id FROM teacher WHERE email='alishba.kamran@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='Nursery' AND section='B'));

-- Assign Nida to 3-A
INSERT INTO class_teacher_assignment (teacher_id, class_id) 
VALUES ((SELECT teacher_id FROM teacher WHERE email='nida.zahid@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='3' AND section='A'));

