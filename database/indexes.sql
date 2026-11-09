-- ==========================================
-- INDEXES FOR FASTER SEARCHING
-- ==========================================

-- 1. Search appointments by date
CREATE INDEX idx_appointment_date
ON appointments(appointment_date);

-- 2. Search appointments by status
CREATE INDEX idx_appointment_status
ON appointments(status);

-- 3. Search appointments by patient
CREATE INDEX idx_appointment_patient
ON appointments(patient_id);

-- 4. Search appointments by doctor and date
CREATE INDEX idx_doctor_appointment_date
ON appointments(doctor_id, appointment_date);