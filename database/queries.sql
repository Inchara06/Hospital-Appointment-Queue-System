-- 1. Display all patients
SELECT * FROM patients;

-- 2. Display all doctors
SELECT * FROM doctors;

-- 3. Display all appointments with patient and doctor names
SELECT
    a.appointment_id,
    p.name AS patient_name,
    d.name AS doctor_name,
    a.appointment_date,
    a.appointment_time,
    a.token_number,
    a.status
FROM appointments a
JOIN patients p ON a.patient_id = p.patient_id
JOIN doctors d ON a.doctor_id = d.doctor_id;

-- 4. Count total appointments
SELECT COUNT(*) AS total_appointments
FROM appointments;

-- 5. Count appointments for each doctor
SELECT
    d.name AS doctor_name,
    COUNT(a.appointment_id) AS total_appointments
FROM doctors d
LEFT JOIN appointments a ON d.doctor_id = a.doctor_id
GROUP BY d.name;

-- 6. Display doctors having at least one appointment
SELECT
    d.name,
    COUNT(a.appointment_id) AS total_appointments
FROM doctors d
JOIN appointments a ON d.doctor_id = a.doctor_id
GROUP BY d.name
HAVING COUNT(a.appointment_id) >= 1;

-- 7. Rank appointments based on token number for each doctor
SELECT
    d.name AS doctor_name,
    p.name AS patient_name,
    a.token_number,
    RANK() OVER (
        PARTITION BY a.doctor_id, a.appointment_date
        ORDER BY a.token_number
    ) AS queue_rank
FROM appointments a
JOIN doctors d ON a.doctor_id = d.doctor_id
JOIN patients p ON a.patient_id = p.patient_id;