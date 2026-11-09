
-- ==========================================
-- HOSPITAL APPOINTMENT AND QUEUE MANAGEMENT
-- Database: hospital_db
-- ==========================================

-- 1. PATIENTS TABLE
CREATE TABLE patients (
    patient_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE,
    age INTEGER CHECK (age BETWEEN 0 AND 120),
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other'))
);


-- 2. DOCTORS TABLE
CREATE TABLE doctors (
    doctor_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    consultation_fee NUMERIC(10,2) NOT NULL CHECK (consultation_fee >= 0)
);


-- 3. APPOINTMENTS TABLE
CREATE TABLE appointments (
    appointment_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    token_number INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Waiting',

    CONSTRAINT fk_appointment_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(patient_id),

    CONSTRAINT fk_appointment_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES doctors(doctor_id),

    CONSTRAINT chk_token
        CHECK (token_number > 0),

    CONSTRAINT chk_appointment_status
        CHECK (status IN ('Waiting', 'In Progress', 'Completed', 'Cancelled')),

    CONSTRAINT unique_doctor_slot
        UNIQUE (doctor_id, appointment_date, appointment_time),

    CONSTRAINT unique_doctor_token
        UNIQUE (doctor_id, appointment_date, token_number)
);


-- 4. CONSULTATIONS TABLE
CREATE TABLE consultations (
    consultation_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    appointment_id INTEGER NOT NULL UNIQUE,
    diagnosis TEXT NOT NULL,
    prescription TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_consultation_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointments(appointment_id)
);


-- Display all four tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
