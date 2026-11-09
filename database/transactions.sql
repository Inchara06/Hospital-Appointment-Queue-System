-- ==========================================
-- TRANSACTION MANAGEMENT
-- ==========================================

-- Example 1: COMMIT
BEGIN;

UPDATE appointments
SET status = 'In Progress'
WHERE appointment_id = 1;

COMMIT;


-- Example 2: ROLLBACK
BEGIN;

UPDATE appointments
SET status = 'Cancelled'
WHERE appointment_id = 1;

ROLLBACK;