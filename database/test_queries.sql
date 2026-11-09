-- ==========================================
-- DATABASE TEST QUERIES
-- ==========================================

-- 1. Display all patients
SELECT * FROM patients;

-- 2. Display all doctors
SELECT * FROM doctors;

-- 3. Display all appointments
SELECT * FROM appointments;

-- 4. Display all consultations
SELECT * FROM consultations;

-- 5. Test automatic token generation
-- Insert a new appointment and check its token
INSERT INTO appointments
(patient_id, doctor_id, appointment_date, appointment_time, status)
VALUES
(3, 1, CURRENT_DATE, '11:00:00', 'Waiting');

-- 6. Check generated token
SELECT *
FROM appointments
WHERE doctor_id = 1
AND appointment_date = CURRENT_DATE
ORDER BY token_number;

-- 7. Test the queue view
SELECT *
FROM live_doctor_queue_view;

-- 8. Test invalid age constraint
-- Uncomment only when testing:
-- INSERT INTO patients (name, phone, age, gender)
-- VALUES ('Test Patient', '9000000000', 150, 'Male');

-- 9. Test invalid appointment status
-- Uncomment only when testing:
-- UPDATE appointments
-- SET status = 'Unknown'
-- WHERE appointment_id = 1;