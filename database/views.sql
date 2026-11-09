-- ==========================================
-- HOSPITAL APPOINTMENT QUEUE VIEW
-- ==========================================

CREATE OR REPLACE VIEW live_doctor_queue_view AS
SELECT
    a.appointment_id,
    p.name AS patient_name,
    p.phone,
    d.name AS doctor_name,
    d.department,
    d.room_number,
    a.appointment_date,
    a.appointment_time,
    a.token_number,
    a.status
FROM appointments a
JOIN patients p
    ON a.patient_id = p.patient_id
JOIN doctors d
    ON a.doctor_id = d.doctor_id
WHERE a.status IN ('Waiting', 'In Progress');