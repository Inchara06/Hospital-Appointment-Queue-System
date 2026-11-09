
-- ==========================================
-- SAMPLE DATA FOR HOSPITAL DATABASE
-- ==========================================

-- 1. INSERT PATIENTS

INSERT INTO patients (name, phone, age, gender)
VALUES
('Arun Kumar', '9876543210', 22, 'Male'),
('Priya Shetty', '9876543211', 25, 'Female'),
('Rahul Sharma', '9876543212', 30, 'Male'),
('Sneha Rao', '9876543213', 28, 'Female'),
('Kiran Kumar', '9876543214', 35, 'Male');


-- 2. INSERT DOCTORS

INSERT INTO doctors (name, department, room_number, consultation_fee)
VALUES
('Dr. Anil Kumar', 'Cardiology', '101', 500.00),
('Dr. Meera Rao', 'Dermatology', '102', 400.00),
('Dr. Rajesh Shetty', 'Orthopedics', '103', 450.00),
('Dr. Kavya Nair', 'General Medicine', '104', 300.00),
('Dr. Sunil Pai', 'Pediatrics', '105', 350.00);


-- 3. DISPLAY PATIENTS

SELECT * FROM patients;


-- 4. DISPLAY DOCTORS

SELECT * FROM doctors;
