
-- ==========================================
-- AUTOMATIC DAILY TOKEN NUMBER
-- ==========================================

-- 1. Create a function to generate token numbers

CREATE OR REPLACE FUNCTION assign_daily_token()
RETURNS TRIGGER AS $$
BEGIN
    -- Lock token generation for this doctor and date
    PERFORM pg_advisory_xact_lock(
        hashtextextended(
            NEW.doctor_id::TEXT || ':' || NEW.appointment_date::TEXT,
            0
        )
    );

    -- Find the next token number
    SELECT COALESCE(MAX(token_number), 0) + 1
    INTO NEW.token_number
    FROM appointments
    WHERE doctor_id = NEW.doctor_id
      AND appointment_date = NEW.appointment_date;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 2. Create a trigger

DROP TRIGGER IF EXISTS trg_assign_daily_token
ON appointments;

CREATE TRIGGER trg_assign_daily_token
BEFORE INSERT ON appointments
FOR EACH ROW
EXECUTE FUNCTION assign_daily_token();



-- BUSINESS RULE: Allow consultation only for
-- appointments that are In Progress or Completed

CREATE OR REPLACE FUNCTION validate_consultation_status()
RETURNS TRIGGER AS $$
DECLARE
    appointment_status VARCHAR(20);
BEGIN
    SELECT status
    INTO appointment_status
    FROM appointments
    WHERE appointment_id = NEW.appointment_id;

    IF appointment_status NOT IN ('In Progress', 'Completed') THEN
        RAISE EXCEPTION
        'Consultation can only be recorded for appointments that are In Progress or Completed';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_validate_consultation
BEFORE INSERT ON consultations
FOR EACH ROW
EXECUTE FUNCTION validate_consultation_status();

