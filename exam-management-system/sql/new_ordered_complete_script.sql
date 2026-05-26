-- ==========================================
-- STEP 1: CLEAN SLATE (Run below 2 queries if you have run old unordered script)
-- ==========================================
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- ==========================================
-- STEP 2: CREATE TABLES (PERFECTED) --> Actual script start from here
-- ==========================================

-- 1. PERSON (Added religion column directly)
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
    country VARCHAR(50) DEFAULT 'Pakistan',
    religion VARCHAR(50)
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
    teacher_type VARCHAR(50),
    joining_date DATE DEFAULT CURRENT_DATE,
    resign_date DATE,
    status VARCHAR(20) DEFAULT 'Active'
);

-- 5. CLASS (Changed class_number to VARCHAR directly)
CREATE TABLE class (
    class_id SERIAL PRIMARY KEY,
    class_number VARCHAR(10) NOT NULL,
    section VARCHAR(10) NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    UNIQUE(class_number, section, academic_year)
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

-- 8. CLASS_SUBJECT
CREATE TABLE class_subject (
    class_subject_id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES class(class_id),
    subject_id INTEGER REFERENCES subject(subject_id),
    UNIQUE(class_id, subject_id)
);

-- 9. TEACHING_ASSIGNMENT
CREATE TABLE teaching_assignment (
    assignment_id SERIAL PRIMARY KEY,
    teacher_id INTEGER REFERENCES teacher(teacher_id),
    class_id INTEGER REFERENCES class(class_id),
    subject_id INTEGER REFERENCES subject(subject_id),
    UNIQUE(class_id, subject_id)
);

-- 10. CLASS_TEACHER_ASSIGNMENT
CREATE TABLE class_teacher_assignment (
    class_teacher_assignment_id SERIAL PRIMARY KEY,
    teacher_id INTEGER UNIQUE REFERENCES teacher(teacher_id),
    class_id INTEGER UNIQUE REFERENCES class(class_id)
);

-- 11. EXAM
CREATE TABLE exam (
    exam_id SERIAL PRIMARY KEY,
    exam_name VARCHAR(100) NOT NULL,
    exam_type VARCHAR(50) NOT NULL,
    exam_date DATE NOT NULL,
    total_marks INTEGER NOT NULL DEFAULT 100
);

-- 12. CLASSROOM (Changed class_number to VARCHAR directly)
CREATE TABLE classroom (
    room_id SERIAL PRIMARY KEY,
    class_number VARCHAR(10) NOT NULL,
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
    status VARCHAR(20) DEFAULT 'Pending'
);

-- 15. EXAM_COMPONENT
CREATE TABLE exam_component (
    component_id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exam(exam_id),
    subject_id INTEGER REFERENCES subject(subject_id),
    component_type VARCHAR(50) NOT NULL,
    max_marks INTEGER NOT NULL,
    conducted_in VARCHAR(50)
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
    seat_no VARCHAR(20) NOT NULL,
    UNIQUE(schedule_id, student_id),
    UNIQUE(schedule_id, seat_no)
);

-- 18. INVIGILATION
CREATE TABLE invigilation (
    invigilation_id SERIAL PRIMARY KEY,
    schedule_id INTEGER REFERENCES exam_schedule(schedule_id),
    teacher_id INTEGER REFERENCES teacher(teacher_id),
    role VARCHAR(50)
);

-- 19. STUDENT_ATTENDANCE
CREATE TABLE student_attendance (
    attendance_id SERIAL PRIMARY KEY,
    schedule_id INTEGER REFERENCES exam_schedule(schedule_id),
    student_id INTEGER REFERENCES student(student_id),
    invigilation_id INTEGER REFERENCES invigilation(invigilation_id),
    status VARCHAR(20) NOT NULL,
    reason VARCHAR(100),
    re_exam_eligibility VARCHAR(20),
    UNIQUE(schedule_id, student_id)
);

-- 20. MARKS
CREATE TABLE marks (
    marks_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES student(student_id),
    exam_id INTEGER REFERENCES exam(exam_id),
    subject_id INTEGER REFERENCES subject(subject_id),
    schedule_id INTEGER REFERENCES exam_schedule(schedule_id),
    component_id INTEGER REFERENCES exam_component(component_id),
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
    approval_status VARCHAR(20) DEFAULT 'Pending',
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP
);

-- 22. RESULT
CREATE TABLE result (
    result_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES student(student_id),
    subject_id INTEGER REFERENCES subject(subject_id),
    class_id INTEGER REFERENCES class(class_id),
    term VARCHAR(20),
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
    term VARCHAR(20),
    overall_total_marks INTEGER,
    overall_obtained_marks INTEGER,
    overall_percentage DECIMAL(5,2),
    overall_grade VARCHAR(5),
    overall_position INTEGER,
    issue_date DATE,
    parent_signature_name VARCHAR(100),
    class_teacher_signature_name VARCHAR(100),
    student_signature_name VARCHAR(100),
    UNIQUE(student_id, term, academic_year)
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
    UNIQUE(report_card_id, subject_id)
);

-- 25. ATTENDANCE_MARKS
CREATE TABLE attendance_marks (
    attendance_marks_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES student(student_id),
    class_id INTEGER REFERENCES class(class_id),
    report_card_id INTEGER REFERENCES report_card(report_card_id),
    term VARCHAR(20),
    total_attendance_marks DECIMAL(5,2),
    leaves INTEGER DEFAULT 0,
    absents INTEGER DEFAULT 0
);


-- ==========================================
-- STEP 3: INSERT CORE PERSONS (Admin & Principal)
-- ==========================================
INSERT INTO person (email, first_name, last_name, gender, dob, father_name, phone, street, area, postal_code, city, province, country, religion) 
VALUES ('admin@school.edu.pk', 'Syed', 'Admin', 'Male', '1980-05-15', 'Syed Senior', '03001234567', '42-B, Block 6', 'PECHS', '75400', 'Karachi', 'Sindh', 'Pakistan', 'Islam');

INSERT INTO admin (email, joining_date, status) VALUES ('admin@school.edu.pk', '2020-04-01', 'Active');

INSERT INTO person (email, first_name, last_name, gender, dob, father_name, phone, street, area, postal_code, city, province, country, religion) 
VALUES ('principal@school.edu.pk', 'Ahmed', 'Khan', 'Male', '1975-08-20', 'Khan Senior', '03219876543', '15-C, DHA Phase 5', 'DHA', '75500', 'Karachi', 'Sindh', 'Pakistan', 'Islam');

INSERT INTO principal (email, qualification, experience_years, joining_date, status) 
VALUES ('principal@school.edu.pk', 'MPhil English', 20, '2015-04-01', 'Active');


-- ==========================================
-- STEP 4: INSERT INFRASTRUCTURE (Classes, Rooms, Labs, Subjects)
-- ==========================================
-- Classes (Notice Class 1 is now in the correct order!)
INSERT INTO class (class_number, section, academic_year) VALUES
('Nursery', 'A', '2026-27'), ('Nursery', 'B', '2026-27'),
('KG', 'A', '2026-27'), ('KG', 'B', '2026-27'),
('1', 'A', '2026-27'), ('1', 'B', '2026-27'),
('2', 'A', '2026-27'), ('2', 'B', '2026-27'),
('3', 'A', '2026-27'), ('3', 'B', '2026-27'),
('4', 'A', '2026-27'), ('4', 'B', '2026-27'),
('5', 'A', '2026-27'), ('5', 'B', '2026-27'),
('6', 'A', '2026-27'), ('6', 'B', '2026-27'),
('7', 'A', '2026-27'), ('7', 'B', '2026-27'),
('8', 'A', '2026-27'), ('8', 'B', '2026-27'),
('9', 'A', '2026-27'), ('9', 'B', '2026-27'), ('9', 'C', '2026-27'),
('10', 'A', '2026-27'), ('10', 'B', '2026-27'), ('10', 'C', '2026-27');

-- Classrooms
INSERT INTO classroom (class_number, section, capacity) VALUES
('Nursery', 'A', 30), ('Nursery', 'B', 30),
('KG', 'A', 30), ('KG', 'B', 30),
('1', 'A', 35), ('1', 'B', 35),
('2', 'A', 35), ('2', 'B', 35),
('3', 'A', 35), ('3', 'B', 35),
('4', 'A', 35), ('4', 'B', 35),
('5', 'A', 35), ('5', 'B', 35),
('6', 'A', 40), ('6', 'B', 40),
('7', 'A', 40), ('7', 'B', 40),
('8', 'A', 40), ('8', 'B', 40),
('9', 'A', 40), ('9', 'B', 40), ('9', 'C', 40),
('10', 'A', 40), ('10', 'B', 40), ('10', 'C', 40);

-- Labs
INSERT INTO lab (lab_name, lab_type, capacity, location) VALUES
('Computer Lab 1', 'Computer', 30, '2nd Floor, Room 201'),
('Computer Lab 2', 'Computer', 30, '2nd Floor, Room 202'),
('Science Lab 1', 'Science', 25, '3rd Floor, Room 301'),
('Science Lab 2', 'Biology/Physics/Chemistry(9th & 10th Class)', 25, '3rd Floor, Room 302');

-- Subjects
INSERT INTO subject (subject_name, subject_code) VALUES
('English', 'ENG101'), ('Sindhi', 'SIN101'), ('Urdu', 'URD101'), ('Mathematics', 'MTH101'), 
('General Knowledge', 'GK101'), ('Science', 'SCI101'), ('Social Studies', 'SST101'), 
('Computer', 'CMP101'), ('Drawing', 'DRW101'), ('Islamiyat', 'ISL101'), ('Ethics', 'ETH101'), 
('Pakistan Studies', 'PAK101'), ('Biology', 'BIO101'), ('Physics', 'PHY101'), 
('Chemistry', 'CHE101'), ('Computer Science', 'CSC101');


-- ==========================================
-- STEP 5: INSERT TEACHERS (Including previously missing Alishba, Nida, Ayesha, Hina)
-- ==========================================
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
('alishba.kamran@school.edu.pk', 'Alishba', 'Kamran', 'Female', '1991-11-23', 'Kamran Mirza', '03181234519', '90-R, Garden', 'Garden', '74500', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('rizwan.anwar@school.edu.pk', 'Rizwan', 'Anwar', 'Male', '1984-08-07', 'Anwar Hussain', '03191234520', '12-S, Jehangir Road', 'Jehangir Road', '74600', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('iqra.shakeel@school.edu.pk', 'Iqra', 'Shakeel', 'Female', '1989-02-16', 'Shakeel Ahmed', '03201234521', '45-T, Burns Garden', 'Burns Garden', '74400', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('faisal.malik@school.edu.pk', 'Faisal', 'Malik', 'Male', '1982-12-29', 'Malik Aslam', '03211234522', '78-U, Frere Town', 'Frere Town', '75500', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('deepak.malhotra@school.edu.pk', 'Deepak', 'Malhotra', 'Male', '1990-06-04', 'Ashok Malhotra', '03221234523', '23-V, Cantt', 'Cantt', '75200', 'Karachi', 'Sindh', 'Pakistan', 'Hinduism'),
('saad.akhtar@school.edu.pk', 'Saad', 'Akhtar', 'Male', '1986-04-09', 'Akhtar Raza', '03231234524', '56-W, PECHS Block 6', 'PECHS', '75400', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('hira.nasir@school.edu.pk', 'Hira', 'Nasir', 'Female', '1992-10-31', 'Nasir Javed', '03241234525', '89-X, Tariq Road', 'Tariq Road', '75400', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('wahab.rajput@school.edu.pk', 'Wahab', 'Rajput', 'Male', '1983-03-22', 'Rajput Khan', '03251234526', '12-Y, Bihar Colony', 'Bihar Colony', '75700', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('nida.zahid@school.edu.pk', 'Nida', 'Zahid', 'Female', '1990-06-04', 'Zahid Iqbal', '03261234527', '24-W, Cantt', 'Cantt', '75200', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('ayesha.siddiqui@school.edu.pk', 'Ayesha', 'Siddiqui', 'Female', '1988-01-15', 'Siddiqui Ahmed', '03271234528', '25-X, North Nazimabad', 'North Nazimabad', '74700', 'Karachi', 'Sindh', 'Pakistan', 'Islam'),
('hina.pervez@school.edu.pk', 'Hina', 'Pervez', 'Female', '1992-04-20', 'Pervez Akhtar', '03281234529', '26-Y, Gulshan', 'Gulshan', '75300', 'Karachi', 'Sindh', 'Pakistan', 'Islam');

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
('alishba.kamran@school.edu.pk', 'MA Education', 3, 'ClassTeacher', 'Active'),
('rizwan.anwar@school.edu.pk', 'MCom', 9, 'ClassTeacher', 'Active'),
('iqra.shakeel@school.edu.pk', 'MSc Home Econ', 5, 'ClassTeacher', 'Active'),
('faisal.malik@school.edu.pk', 'MBA', 8, 'ClassTeacher', 'Active'),
('deepak.malhotra@school.edu.pk', 'MA Education', 2, 'ClassTeacher', 'Active'),
('saad.akhtar@school.edu.pk', 'MSc Science', 7, 'LabTeacher', 'Active'),
('hira.nasir@school.edu.pk', 'MSc Computer', 4, 'LabTeacher', 'Active'),
('wahab.rajput@school.edu.pk', 'MSc Science', 6, 'Invigilator', 'Active'),
('nida.zahid@school.edu.pk', 'MA Sindhi', 5, 'SubjectTeacher', 'Active'),
('ayesha.siddiqui@school.edu.pk', 'MSc Mathematics', 4, 'SubjectTeacher', 'Active'),
('hina.pervez@school.edu.pk', 'MSc Science', 3, 'SubjectTeacher', 'Active');

-- Add the Principal as an English Teacher (Overlapping Role!)
INSERT INTO teacher (email, qualification, experience_years, teacher_type, status) 
VALUES ('principal@school.edu.pk', 'MPhil English', 20, 'SubjectTeacher', 'Active');


-- ==========================================
-- STEP 6: LINK SUBJECTS TO CLASSES
-- ==========================================
-- 1. Nursery & KG
INSERT INTO class_subject (class_id, subject_id)
SELECT c.class_id, s.subject_id FROM class c CROSS JOIN subject s
WHERE c.class_number IN ('Nursery', 'KG') AND s.subject_code IN ('ENG101', 'SIN101', 'MTH101', 'DRW101');

-- 2. Classes 1 to 3
INSERT INTO class_subject (class_id, subject_id)
SELECT c.class_id, s.subject_id FROM class c CROSS JOIN subject s
WHERE c.class_number IN ('1', '2', '3') AND s.subject_code IN ('ENG101', 'SIN101', 'URD101', 'MTH101', 'SCI101', 'GK101', 'DRW101');

-- 3. Classes 4 & 5
INSERT INTO class_subject (class_id, subject_id)
SELECT c.class_id, s.subject_id FROM class c CROSS JOIN subject s
WHERE c.class_number IN ('4', '5') AND s.subject_code IN ('ENG101', 'SIN101', 'URD101', 'MTH101', 'SCI101', 'GK101', 'CMP101', 'SST101', 'DRW101');

-- 4. Classes 6 to 8
INSERT INTO class_subject (class_id, subject_id)
SELECT c.class_id, s.subject_id FROM class c CROSS JOIN subject s
WHERE c.class_number IN ('6', '7', '8') AND s.subject_code IN ('ENG101', 'SIN101', 'URD101', 'MTH101', 'SCI101', 'GK101', 'CMP101', 'SST101', 'ISL101', 'ETH101', 'DRW101');

-- 5. Class 9
INSERT INTO class_subject (class_id, subject_id)
SELECT c.class_id, s.subject_id FROM class c CROSS JOIN subject s
WHERE c.class_number = '9' AND s.subject_code IN ('ENG101', 'SIN101', 'MTH101', 'PHY101', 'CHE101', 'BIO101', 'CSC101', 'ISL101', 'ETH101');

-- 6. Class 10
INSERT INTO class_subject (class_id, subject_id)
SELECT c.class_id, s.subject_id FROM class c CROSS JOIN subject s
WHERE c.class_number = '10' AND s.subject_code IN ('ENG101', 'URD101', 'MTH101', 'PHY101', 'CHE101', 'BIO101', 'CSC101', 'PAK101');


-- ==========================================
-- STEP 7: ASSIGN TEACHERS TO SUBJECTS (Teaching Assignments)
-- ==========================================
-- 9th & 10th Grade Teachers
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'principal@school.edu.pk' AND c.class_number IN ('9', '10') AND s.subject_code = 'ENG101';
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'fatima.noor@school.edu.pk' AND c.class_number IN ('9', '10') AND s.subject_code = 'MTH101';
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'ahmed.ali@school.edu.pk' AND c.class_number IN ('9', '10') AND s.subject_code = 'PHY101';
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'bilal.khan@school.edu.pk' AND c.class_number IN ('9', '10') AND s.subject_code = 'CHE101';
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'zainab.hassan@school.edu.pk' AND c.class_number IN ('9', '10') AND s.subject_code = 'BIO101';
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'hassan.rafiq@school.edu.pk' AND c.class_number IN ('9', '10') AND s.subject_code = 'CSC101';
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'taha.mehmood@school.edu.pk' AND c.class_number = '10' AND s.subject_code = 'PAK101';
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'imran.shahid@school.edu.pk' AND c.class_number IN ('9', '10') AND s.subject_code = 'ISL101';
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'rajesh.kumar@school.edu.pk' AND c.class_number IN ('9', '10') AND s.subject_code = 'ETH101';
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'ali.zafar@school.edu.pk' AND c.class_number IN ('9', '10') AND s.subject_code = 'SIN101';

-- Middle & Primary(1 to 8), Nursery & KG School Teachers
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'sana.bilal@school.edu.pk' AND c.class_number IN ('6', '7', '8') AND s.subject_code = 'ENG101';
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'ayesha.siddiqui@school.edu.pk' AND c.class_number IN ('1', '2', '3', '4', '5') AND s.subject_code = 'MTH101';
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'omar.farooq@school.edu.pk' AND c.class_number IN ('1', '2', '3', '4', '5') AND s.subject_code = 'ENG101';
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'david.masih@school.edu.pk' AND c.class_number IN ('6', '7', '8') AND s.subject_code = 'SCI101';
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'hina.pervez@school.edu.pk' AND c.class_number IN ('1', '2', '3', '4', '5') AND s.subject_code = 'SCI101';
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'usman.tariq@school.edu.pk' AND c.class_number IN ('4', '5', '6', '7', '8') AND s.subject_code = 'SST101';
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'sara.waqar@school.edu.pk' AND c.class_number IN ('1', '2', '3', '4', '5', '6', '7', '8') AND s.subject_code = 'URD101';
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'priya.sharma@school.edu.pk' AND c.class_number IN ('4', '5', '6', '7', '8') AND s.subject_code = 'CMP101';
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'iqra.shakeel@school.edu.pk' AND c.class_number IN ('1', '2', '3', '4', '5', '6', '7', '8') AND s.subject_code = 'GK101';
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'nida.zahid@school.edu.pk' AND c.class_number IN ('Nursery', 'KG', '1') AND s.subject_code = 'SIN101';
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'wahab.rajput@school.edu.pk' AND c.class_number IN ('Nursery', 'KG', '1', '2', '3', '4', '5', '6', '7', '8') AND s.subject_code = 'DRW101';
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'mariam.joseph@school.edu.pk' AND c.class_number IN ('Nursery', 'KG') AND s.subject_code IN ('ENG101', 'SCI101', 'GK101');
INSERT INTO teaching_assignment (teacher_id, class_id, subject_id) SELECT t.teacher_id, c.class_id, s.subject_id FROM teacher t, class c, subject s WHERE t.email = 'nida.zahid@school.edu.pk' AND c.class_number IN ('Nursery', 'KG') AND s.subject_code IN ('URD101', 'MTH101');

-- ==========================================
-- STEP 8: ASSIGN CLASS TEACHERS
-- ==========================================
INSERT INTO class_teacher_assignment (teacher_id, class_id) VALUES
((SELECT teacher_id FROM teacher WHERE email='hamza.yousuf@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='Nursery' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='alishba.kamran@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='Nursery' AND section='B')),((SELECT teacher_id FROM teacher WHERE email='sarah.john@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='KG' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='rizwan.anwar@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='KG' AND section='B')),
((SELECT teacher_id FROM teacher WHERE email='fatima.noor@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='1' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='ahmed.ali@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='1' AND section='B')),
((SELECT teacher_id FROM teacher WHERE email='iqra.shakeel@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='2' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='faisal.malik@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='2' AND section='B')),
((SELECT teacher_id FROM teacher WHERE email='nida.zahid@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='3' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='deepak.malhotra@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='3' AND section='B')),
((SELECT teacher_id FROM teacher WHERE email='saad.akhtar@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='4' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='hira.nasir@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='4' AND section='B')),
((SELECT teacher_id FROM teacher WHERE email='wahab.rajput@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='5' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='mariam.joseph@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='5' AND section='B')),
((SELECT teacher_id FROM teacher WHERE email='omar.farooq@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='6' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='sana.bilal@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='6' AND section='B')),
((SELECT teacher_id FROM teacher WHERE email='taha.mehmood@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='7' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='rajesh.kumar@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='7' AND section='B')),
((SELECT teacher_id FROM teacher WHERE email='imran.shahid@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='8' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='david.masih@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='8' AND section='B')),
((SELECT teacher_id FROM teacher WHERE email='usman.tariq@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='9' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='sara.waqar@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='9' AND section='B')),
((SELECT teacher_id FROM teacher WHERE email='ali.zafar@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='9' AND section='C')),
((SELECT teacher_id FROM teacher WHERE email='priya.sharma@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='10' AND section='A')),
((SELECT teacher_id FROM teacher WHERE email='hassan.rafiq@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='10' AND section='B')),
((SELECT teacher_id FROM teacher WHERE email='zainab.hassan@school.edu.pk'), (SELECT class_id FROM class WHERE class_number='10' AND section='C'));


-- ==========================================
-- STEP 9: INSERT 370 STUDENTS (Real Names, Exact Counts)
-- ==========================================

-- Nursery, 1, 3, 5, 7 (10 Students per section)
INSERT INTO person (email, first_name, last_name, gender, dob, father_name, phone, street, area, postal_code, city, province, country, religion)
SELECT 
    lower((ARRAY['Ali','Ahmed','Fatima','Sara','Usman','Bilal','Zainab','Aisha','Hassan','Omar','Zain','Hamza','Maria','David','Priya','Rajesh','Sana','Hira','Kashif','Taha'])[(gs.idx % 20) + 1]) || '.' || 
    lower((ARRAY['Khan','Ahmed','Ali','Hassan','Raza','Malik','Shah','Siddiqui','Masih','John','Kumar','Sharma','Patel','Gupta','Noor','Bilal','Farooq','Yousuf','Javed','Iqbal'])[(gs.idx % 20) + 1]) || 
    (gs.idx + c.class_id * 100) || '@school.pk',
    
    (ARRAY['Ali','Ahmed','Fatima','Sara','Usman','Bilal','Zainab','Aisha','Hassan','Omar','Zain','Hamza','Maria','David','Priya','Rajesh','Sana','Hira','Kashif','Taha'])[(gs.idx % 20) + 1],
    
    (ARRAY['Khan','Ahmed','Ali','Hassan','Raza','Malik','Shah','Siddiqui','Masih','John','Kumar','Sharma','Patel','Gupta','Noor','Bilal','Farooq','Yousuf','Javed','Iqbal'])[(gs.idx % 20) + 1],
    
    CASE WHEN gs.idx % 2 = 0 THEN 'Female' ELSE 'Male' END,
    (CASE c.class_number WHEN 'Nursery' THEN '2021-01-01' WHEN '1' THEN '2019-01-01' WHEN '3' THEN '2017-01-01' WHEN '5' THEN '2015-01-01' WHEN '7' THEN '2013-01-01' END)::DATE,
    'Father ' || (gs.idx + c.class_id * 100),
    '03' || (10000000 + gs.idx + c.class_id * 1000),
    'Street ' || gs.idx, 'Gulshan', '75300', 'Karachi', 'Sindh', 'Pakistan',
    CASE WHEN gs.idx % 3 = 0 THEN 'Hinduism' WHEN gs.idx % 3 = 1 THEN 'Christianity' ELSE 'Islam' END
FROM class c
CROSS JOIN generate_series(1, 10) AS gs(idx)
WHERE c.class_number IN ('Nursery', '1', '3', '5', '7');

INSERT INTO student (email, roll_no, emergency_phone, class_id)
SELECT 
    lower((ARRAY['Ali','Ahmed','Fatima','Sara','Usman','Bilal','Zainab','Aisha','Hassan','Omar','Zain','Hamza','Maria','David','Priya','Rajesh','Sana','Hira','Kashif','Taha'])[(gs.idx % 20) + 1]) || '.' || 
    lower((ARRAY['Khan','Ahmed','Ali','Hassan','Raza','Malik','Shah','Siddiqui','Masih','John','Kumar','Sharma','Patel','Gupta','Noor','Bilal','Farooq','Yousuf','Javed','Iqbal'])[(gs.idx % 20) + 1]) || 
    (gs.idx + c.class_id * 100) || '@school.pk',
    gs.idx,
    '03' || (10000000 + gs.idx + c.class_id * 1000),
    c.class_id
FROM class c
CROSS JOIN generate_series(1, 10) AS gs(idx)
WHERE c.class_number IN ('Nursery', '1', '3', '5', '7');


-- KG, 2, 4, 6, 8 (15 Students per section)
INSERT INTO person (email, first_name, last_name, gender, dob, father_name, phone, street, area, postal_code, city, province, country, religion)
SELECT 
    lower((ARRAY['Ali','Ahmed','Fatima','Sara','Usman','Bilal','Zainab','Aisha','Hassan','Omar','Zain','Hamza','Maria','David','Priya','Rajesh','Sana','Hira','Kashif','Taha'])[(gs.idx % 20) + 1]) || '.' || 
    lower((ARRAY['Khan','Ahmed','Ali','Hassan','Raza','Malik','Shah','Siddiqui','Masih','John','Kumar','Sharma','Patel','Gupta','Noor','Bilal','Farooq','Yousuf','Javed','Iqbal'])[(gs.idx % 20) + 1]) || 
    (gs.idx + c.class_id * 100) || '@school.pk',
    
    (ARRAY['Ali','Ahmed','Fatima','Sara','Usman','Bilal','Zainab','Aisha','Hassan','Omar','Zain','Hamza','Maria','David','Priya','Rajesh','Sana','Hira','Kashif','Taha'])[(gs.idx % 20) + 1],
    
    (ARRAY['Khan','Ahmed','Ali','Hassan','Raza','Malik','Shah','Siddiqui','Masih','John','Kumar','Sharma','Patel','Gupta','Noor','Bilal','Farooq','Yousuf','Javed','Iqbal'])[(gs.idx % 20) + 1],
    
    CASE WHEN gs.idx % 2 = 0 THEN 'Female' ELSE 'Male' END,
    (CASE c.class_number WHEN 'KG' THEN '2020-01-01' WHEN '2' THEN '2018-01-01' WHEN '4' THEN '2016-01-01' WHEN '6' THEN '2014-01-01' WHEN '8' THEN '2012-01-01' END)::DATE,
    'Father ' || (gs.idx + c.class_id * 100),
    '04' || (10000000 + gs.idx + c.class_id * 1000),
    'Street ' || gs.idx, 'DHA', '75500', 'Karachi', 'Sindh', 'Pakistan',
    CASE WHEN gs.idx % 3 = 0 THEN 'Hinduism' WHEN gs.idx % 3 = 1 THEN 'Christianity' ELSE 'Islam' END
FROM class c
CROSS JOIN generate_series(1, 15) AS gs(idx)
WHERE c.class_number IN ('KG', '2', '4', '6', '8');

INSERT INTO student (email, roll_no, emergency_phone, class_id)
SELECT 
    lower((ARRAY['Ali','Ahmed','Fatima','Sara','Usman','Bilal','Zainab','Aisha','Hassan','Omar','Zain','Hamza','Maria','David','Priya','Rajesh','Sana','Hira','Kashif','Taha'])[(gs.idx % 20) + 1]) || '.' || 
    lower((ARRAY['Khan','Ahmed','Ali','Hassan','Raza','Malik','Shah','Siddiqui','Masih','John','Kumar','Sharma','Patel','Gupta','Noor','Bilal','Farooq','Yousuf','Javed','Iqbal'])[(gs.idx % 20) + 1]) || 
    (gs.idx + c.class_id * 100) || '@school.pk',
    gs.idx,
    '04' || (10000000 + gs.idx + c.class_id * 1000),
    c.class_id
FROM class c
CROSS JOIN generate_series(1, 15) AS gs(idx)
WHERE c.class_number IN ('KG', '2', '4', '6', '8');


-- 9, 10 (20 Students per section)
INSERT INTO person (email, first_name, last_name, gender, dob, father_name, phone, street, area, postal_code, city, province, country, religion)
SELECT 
    lower((ARRAY['Ali','Ahmed','Fatima','Sara','Usman','Bilal','Zainab','Aisha','Hassan','Omar','Zain','Hamza','Maria','David','Priya','Rajesh','Sana','Hira','Kashif','Taha'])[(gs.idx % 20) + 1]) || '.' || 
    lower((ARRAY['Khan','Ahmed','Ali','Hassan','Raza','Malik','Shah','Siddiqui','Masih','John','Kumar','Sharma','Patel','Gupta','Noor','Bilal','Farooq','Yousuf','Javed','Iqbal'])[(gs.idx % 20) + 1]) || 
    (gs.idx + c.class_id * 100) || '@school.pk',
    
    (ARRAY['Ali','Ahmed','Fatima','Sara','Usman','Bilal','Zainab','Aisha','Hassan','Omar','Zain','Hamza','Maria','David','Priya','Rajesh','Sana','Hira','Kashif','Taha'])[(gs.idx % 20) + 1],
    
    (ARRAY['Khan','Ahmed','Ali','Hassan','Raza','Malik','Shah','Siddiqui','Masih','John','Kumar','Sharma','Patel','Gupta','Noor','Bilal','Farooq','Yousuf','Javed','Iqbal'])[(gs.idx % 20) + 1],
    
    CASE WHEN gs.idx % 2 = 0 THEN 'Female' ELSE 'Male' END,
    (CASE c.class_number WHEN '9' THEN '2011-01-01' WHEN '10' THEN '2010-01-01' END)::DATE,
    'Father ' || (gs.idx + c.class_id * 100),
    '05' || (10000000 + gs.idx + c.class_id * 1000),
    'Street ' || gs.idx, 'Nazimabad', '74600', 'Karachi', 'Sindh', 'Pakistan',
    CASE WHEN gs.idx % 3 = 0 THEN 'Hinduism' WHEN gs.idx % 3 = 1 THEN 'Christianity' ELSE 'Islam' END
FROM class c
CROSS JOIN generate_series(1, 20) AS gs(idx)
WHERE c.class_number IN ('9', '10');

INSERT INTO student (email, roll_no, emergency_phone, class_id)
SELECT 
    lower((ARRAY['Ali','Ahmed','Fatima','Sara','Usman','Bilal','Zainab','Aisha','Hassan','Omar','Zain','Hamza','Maria','David','Priya','Rajesh','Sana','Hira','Kashif','Taha'])[(gs.idx % 20) + 1]) || '.' || 
    lower((ARRAY['Khan','Ahmed','Ali','Hassan','Raza','Malik','Shah','Siddiqui','Masih','John','Kumar','Sharma','Patel','Gupta','Noor','Bilal','Farooq','Yousuf','Javed','Iqbal'])[(gs.idx % 20) + 1]) || 
    (gs.idx + c.class_id * 100) || '@school.pk',
    gs.idx,
    '05' || (10000000 + gs.idx + c.class_id * 1000),
    c.class_id
FROM class c
CROSS JOIN generate_series(1, 20) AS gs(idx)
WHERE c.class_number IN ('9', '10');

-- ==========================================
-- STEP 10: CREATE EXAM & EXAM SCHEDULE
-- ==========================================
INSERT INTO exam (exam_name, exam_type, exam_date, total_marks) 
VALUES ('Unit Test 1 - Mathematics', 'UnitTest', '2026-08-15', 25);

-- Schedule the exam (Using DISTINCT ON class_id to prevent duplicate schedules)
INSERT INTO exam_schedule (exam_id, class_id, subject_id, room_id, scheduled_by_admin_id, schedule_date, start_time, end_time, status)
SELECT DISTINCT ON (c.class_id)
    (SELECT exam_id FROM exam WHERE exam_name = 'Unit Test 1 - Mathematics'), 
    c.class_id, 
    (SELECT subject_id FROM subject WHERE subject_code = 'MTH101'), 
    cr.room_id, 
    (SELECT admin_id FROM admin LIMIT 1), 
    '2026-08-15', '09:00:00', '10:00:00', 'Approved'
FROM class c
JOIN classroom cr ON c.class_number = cr.class_number AND c.section = cr.section
WHERE c.class_number IN ('1', '2', '3', '4', '5', '6', '7', '8', '9', '10')
ORDER BY c.class_id, cr.room_id;


-- ==========================================
-- STEP 11: INVIGILATION & ATTENDANCE
-- ==========================================
-- Assign Class Teachers as Invigilators
INSERT INTO invigilation (schedule_id, teacher_id, role)
SELECT es.schedule_id, cta.teacher_id, 'Invigilator'
FROM exam_schedule es
JOIN class_teacher_assignment cta ON es.class_id = cta.class_id
WHERE es.exam_id = (SELECT exam_id FROM exam WHERE exam_name = 'Unit Test 1 - Mathematics');

-- Mark ALL students Present (Using DISTINCT ON to prevent duplicate attendance)
INSERT INTO student_attendance (schedule_id, student_id, invigilation_id, status, reason, re_exam_eligibility)
SELECT DISTINCT ON (s.student_id, es.schedule_id)
    es.schedule_id, s.student_id, i.invigilation_id, 'Present', NULL, NULL
FROM exam_schedule es
JOIN student s ON es.class_id = s.class_id
JOIN invigilation i ON es.schedule_id = i.schedule_id
WHERE es.exam_id = (SELECT exam_id FROM exam WHERE exam_name = 'Unit Test 1 - Mathematics')
ORDER BY s.student_id, es.schedule_id;


-- ==========================================
-- STEP 12: ENTER MARKS (Randomized between 5 and 25)
-- ==========================================
-- Using DISTINCT ON to guarantee 1 mark per student per schedule
INSERT INTO marks (student_id, exam_id, subject_id, schedule_id, component_id, attendance_id, submitted_by_teacher_id, marks_obtained, is_absent)
SELECT DISTINCT ON (s.student_id, es.schedule_id)
    s.student_id, 
    (SELECT exam_id FROM exam WHERE exam_name = 'Unit Test 1 - Mathematics'), 
    (SELECT subject_id FROM subject WHERE subject_code = 'MTH101'), 
    es.schedule_id, 
    NULL, 
    sa.attendance_id, 
    (SELECT teacher_id FROM teaching_assignment WHERE class_id = es.class_id AND subject_id = (SELECT subject_id FROM subject WHERE subject_code = 'MTH101') LIMIT 1),
    FLOOR(RANDOM() * 21) + 5, -- Random marks between 5 and 25
    FALSE
FROM student s
JOIN exam_schedule es ON s.class_id = es.class_id AND es.exam_id = (SELECT exam_id FROM exam WHERE exam_name = 'Unit Test 1 - Mathematics')
JOIN student_attendance sa ON s.student_id = sa.student_id AND es.schedule_id = sa.schedule_id
ORDER BY s.student_id, es.schedule_id;


-- ==========================================
-- STEP 13: GENERATE RESULTS
-- ==========================================
INSERT INTO result (student_id, subject_id, class_id, term, total_marks, obtained_marks, percentage, grade)
SELECT 
    m.student_id, 
    m.subject_id, 
    es.class_id, 
    'UnitTest', 
    25, 
    m.marks_obtained, 
    ROUND((m.marks_obtained::DECIMAL / 25) * 100, 2),
    CASE 
        WHEN (m.marks_obtained::DECIMAL / 25) * 100 >= 80 THEN 'A1'
        WHEN (m.marks_obtained::DECIMAL / 25) * 100 >= 70 THEN 'A'
        WHEN (m.marks_obtained::DECIMAL / 25) * 100 >= 60 THEN 'B'
        WHEN (m.marks_obtained::DECIMAL / 25) * 100 >= 50 THEN 'C'
        WHEN (m.marks_obtained::DECIMAL / 25) * 100 >= 40 THEN 'D'
        WHEN (m.marks_obtained::DECIMAL / 25) * 100 >= 33 THEN 'E'
        ELSE 'F'
    END
FROM marks m
JOIN exam_schedule es ON m.schedule_id = es.schedule_id
WHERE m.exam_id = (SELECT exam_id FROM exam WHERE exam_name = 'Unit Test 1 - Mathematics');


-- ==========================================
-- STEP 14: GENERATE REPORT CARDS (FIXED!)
-- ==========================================
-- THE FIX: DISTINCT ON (r.student_id) ensures we only create ONE report card per student!
INSERT INTO report_card (student_id, class_id, academic_year, term, overall_total_marks, overall_obtained_marks, overall_percentage, overall_grade, parent_signature_name, class_teacher_signature_name, student_signature_name)
SELECT DISTINCT ON (r.student_id)
    r.student_id, 
    r.class_id, 
    '2026-27', 
    'UnitTest', 
    25, 
    r.obtained_marks, 
    r.percentage, 
    r.grade,
    p.father_name,
    (SELECT p2.first_name || ' ' || p2.last_name FROM class_teacher_assignment cta JOIN teacher t ON cta.teacher_id = t.teacher_id JOIN person p2 ON t.email = p2.email WHERE cta.class_id = r.class_id),
    p.first_name || ' ' || p.last_name
FROM result r
JOIN student s ON r.student_id = s.student_id
JOIN person p ON s.email = p.email
WHERE r.term = 'UnitTest'
ORDER BY r.student_id, r.subject_id;

-- Add Attendance Marks (Full marks for this short term)
INSERT INTO attendance_marks (student_id, class_id, report_card_id, term, total_attendance_marks, leaves, absents)
SELECT rc.student_id, rc.class_id, rc.report_card_id, 'UnitTest', 25.00, 0, 0
FROM report_card rc WHERE rc.term = 'UnitTest';

-- Add Subject to Report Card
INSERT INTO report_card_subject (report_card_id, subject_id, subject_teacher_id, result_id, subject_percentage, subject_grade, remarks)
SELECT 
    rc.report_card_id, 
    r.subject_id, 
    (SELECT teacher_id FROM teaching_assignment WHERE class_id = rc.class_id AND subject_id = r.subject_id LIMIT 1),
    r.result_id, 
    r.percentage, 
    r.grade,
    CASE WHEN r.percentage::DECIMAL >= 80 THEN 'Excellent' WHEN r.percentage::DECIMAL >= 50 THEN 'Good' ELSE 'Needs Improvement' END
FROM report_card rc
JOIN result r ON rc.student_id = r.student_id AND rc.class_id = r.class_id
WHERE rc.term = 'UnitTest' AND r.term = 'UnitTest';


-- ==========================================
-- STEP 15: MARKS EDIT REQUESTS (4 Approved, 1 Pending)
-- ==========================================
-- 4 Approved Requests
INSERT INTO marks_edit_request (marks_id, teacher_id, principal_id, old_marks, new_marks, reason, approval_status, request_date, approval_date)
SELECT m.marks_id, m.submitted_by_teacher_id, (SELECT principal_id FROM principal LIMIT 1), m.marks_obtained, m.marks_obtained + 2, 'Calculation error in totaling', 'Approved', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '1 day'
FROM marks m LIMIT 4;

-- Update the actual marks for the 4 approved requests
UPDATE marks SET marks_obtained = marks_obtained + 2 
WHERE marks_id IN (SELECT marks_id FROM marks_edit_request WHERE approval_status = 'Approved');

-- Update the results to reflect the new marks!
UPDATE result r
SET obtained_marks = m.marks_obtained, 
    percentage = ROUND((m.marks_obtained::DECIMAL / 25) * 100, 2),
    grade = CASE 
        WHEN (m.marks_obtained::DECIMAL / 25) * 100 >= 80 THEN 'A1'
        WHEN (m.marks_obtained::DECIMAL / 25) * 100 >= 70 THEN 'A'
        WHEN (m.marks_obtained::DECIMAL / 25) * 100 >= 60 THEN 'B'
        WHEN (m.marks_obtained::DECIMAL / 25) * 100 >= 50 THEN 'C'
        WHEN (m.marks_obtained::DECIMAL / 25) * 100 >= 40 THEN 'D'
        WHEN (m.marks_obtained::DECIMAL / 25) * 100 >= 33 THEN 'E'
        ELSE 'F'
    END
FROM marks m
JOIN marks_edit_request mer ON m.marks_id = mer.marks_id
WHERE r.student_id = m.student_id AND r.subject_id = m.subject_id AND mer.approval_status = 'Approved';

-- 1 Pending Request
INSERT INTO marks_edit_request (marks_id, teacher_id, principal_id, old_marks, new_marks, reason, approval_status, request_date)
SELECT m.marks_id, m.submitted_by_teacher_id, (SELECT principal_id FROM principal LIMIT 1), m.marks_obtained, m.marks_obtained + 5, 'Rechecking requested by parent', 'Pending', CURRENT_TIMESTAMP
FROM marks m OFFSET 4 LIMIT 1;
