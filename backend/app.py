from flask import Flask, request, jsonify, send_from_directory
from pathlib import Path
from datetime import date, datetime, time
from decimal import Decimal

from psycopg2.extras import RealDictCursor
from db import get_db_connection


BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

app = Flask(
    __name__,
    static_folder=str(FRONTEND_DIR),
    static_url_path="/static"
)


# Convert PostgreSQL values into JSON-friendly values
def make_json_safe(row):
    if row is None:
        return None

    result = dict(row)

    for key, value in result.items():

        if isinstance(value, datetime):
            result[key] = value.isoformat()

        elif isinstance(value, date):
            result[key] = value.isoformat()

        elif isinstance(value, time):
            result[key] = value.strftime("%H:%M")

        elif isinstance(value, Decimal):
            result[key] = float(value)

    return result


# HOME PAGE
@app.route("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")


# DASHBOARD
@app.route("/api/dashboard")
def dashboard():

    conn = get_db_connection()

    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute("""
                SELECT
                    (SELECT COUNT(*) FROM patients) AS total_patients,
                    (SELECT COUNT(*) FROM doctors) AS total_doctors,
                    (SELECT COUNT(*) FROM appointments) AS total_appointments,
                    (SELECT COUNT(*) FROM appointments
                     WHERE status = 'Waiting') AS waiting_appointments
            """)

            result = cur.fetchone()

            return jsonify(make_json_safe(result))

    finally:
        conn.close()


# GET ALL PATIENTS
@app.route("/api/patients")
def get_patients():

    conn = get_db_connection()

    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute("""
                SELECT *
                FROM patients
                ORDER BY patient_id
            """)

            patients = cur.fetchall()

            return jsonify([make_json_safe(p) for p in patients])

    finally:
        conn.close()


# ADD NEW PATIENT
@app.route("/api/patients", methods=["POST"])
def add_patient():

    data = request.get_json(silent=True) or {}

    name = data.get("name")
    phone = data.get("phone")
    age = data.get("age")
    gender = data.get("gender")

    if not name or not phone:
        return jsonify({"error": "Name and phone are required"}), 400

    conn = get_db_connection()

    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute("""
                INSERT INTO patients (name, phone, age, gender)
                VALUES (%s, %s, %s, %s)
                RETURNING *
            """, (name, phone, age, gender))

            patient = make_json_safe(cur.fetchone())

        conn.commit()

        return jsonify(patient), 201

    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 400

    finally:
        conn.close()


# GET ALL DOCTORS
@app.route("/api/doctors")
def get_doctors():

    conn = get_db_connection()

    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute("""
                SELECT *
                FROM doctors
                ORDER BY doctor_id
            """)

            doctors = cur.fetchall()

            return jsonify([make_json_safe(d) for d in doctors])

    finally:
        conn.close()


# GET TODAY'S DOCTOR QUEUE
@app.route("/api/queue")
def get_queue():

    conn = get_db_connection()

    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute("""
                SELECT *
                FROM live_doctor_queue_view
                WHERE appointment_date = CURRENT_DATE
                ORDER BY doctor_id, token_number
            """)

            queue = cur.fetchall()

            return jsonify([make_json_safe(q) for q in queue])

    finally:
        conn.close()


# BOOK APPOINTMENT
@app.route("/api/appointments", methods=["POST"])
def book_appointment():

    data = request.get_json(silent=True) or {}

    patient_id = data.get("patient_id")
    doctor_id = data.get("doctor_id")
    appointment_date = data.get("appointment_date")
    appointment_time = data.get("appointment_time")

    if not all([
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time
    ]):
        return jsonify({
            "error": "Please provide all appointment details"
        }), 400

    conn = get_db_connection()

    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute("""
                INSERT INTO appointments
                (
                    patient_id,
                    doctor_id,
                    appointment_date,
                    appointment_time,
                    status
                )
                VALUES (%s, %s, %s, %s, 'Waiting')
                RETURNING *
            """, (
                patient_id,
                doctor_id,
                appointment_date,
                appointment_time
            ))

            appointment = make_json_safe(cur.fetchone())

        conn.commit()

        return jsonify(appointment), 201

    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 400

    finally:
        conn.close()


# UPDATE APPOINTMENT STATUS
@app.route("/api/appointments/<int:appointment_id>/status", methods=["PATCH"])
def update_status(appointment_id):

    data = request.get_json(silent=True) or {}

    status = data.get("status")

    allowed_statuses = [
        "Waiting",
        "In Progress",
        "Completed",
        "Cancelled"
    ]

    if status not in allowed_statuses:
        return jsonify({"error": "Invalid appointment status"}), 400

    conn = get_db_connection()

    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute("""
                UPDATE appointments
                SET status = %s
                WHERE appointment_id = %s
                RETURNING *
            """, (status, appointment_id))

            appointment = cur.fetchone()

        if appointment is None:
            conn.rollback()
            return jsonify({"error": "Appointment not found"}), 404

        conn.commit()

        return jsonify(make_json_safe(appointment))

    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 400

    finally:
        conn.close()
# GET APPOINTMENTS AVAILABLE FOR CONSULTATION
@app.route("/api/consultation-appointments")
def get_consultation_appointments():

    conn = get_db_connection()

    if conn is None:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute("""
                SELECT
                    a.appointment_id,
                    p.name AS patient_name,
                    d.name AS doctor_name,
                    a.token_number,
                    a.status
                FROM appointments a
                JOIN patients p
                    ON a.patient_id = p.patient_id
                JOIN doctors d
                    ON a.doctor_id = d.doctor_id
                LEFT JOIN consultations c
                    ON a.appointment_id = c.appointment_id
                WHERE a.status IN ('In Progress', 'Completed')
                AND c.consultation_id IS NULL
                ORDER BY a.appointment_id
            """)

            appointments = cur.fetchall()

            return jsonify([
                make_json_safe(a) for a in appointments
            ])

    finally:
        conn.close()
# ADD CONSULTATION
@app.route("/api/consultations", methods=["POST"])
def add_consultation():

    data = request.get_json(silent=True) or {}

    appointment_id = data.get("appointment_id")
    diagnosis = data.get("diagnosis")
    prescription = data.get("prescription")

    if not appointment_id or not diagnosis:
        return jsonify({
            "error": "Appointment ID and diagnosis are required"
        }), 400

    conn = get_db_connection()

    if conn is None:
        return jsonify({
            "error": "Database connection failed"
        }), 500

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute("""
                INSERT INTO consultations
                (appointment_id, diagnosis, prescription)
                VALUES (%s, %s, %s)
                RETURNING *
            """, (appointment_id, diagnosis, prescription))

            consultation = make_json_safe(cur.fetchone())

        conn.commit()

        return jsonify(consultation), 201

    except Exception as error:
        conn.rollback()
        return jsonify({"error": str(error)}), 400

    finally:
        conn.close()


# VIEW CONSULTATIONS
@app.route("/api/consultations")
def get_consultations():

    conn = get_db_connection()

    if conn is None:
        return jsonify({
            "error": "Database connection failed"
        }), 500

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute("""
                SELECT
                    c.consultation_id,
                    c.appointment_id,
                    p.name AS patient_name,
                    d.name AS doctor_name,
                    c.diagnosis,
                    c.prescription,
                    c.created_at
                FROM consultations c
                JOIN appointments a
                    ON c.appointment_id = a.appointment_id
                JOIN patients p
                    ON a.patient_id = p.patient_id
                JOIN doctors d
                    ON a.doctor_id = d.doctor_id
                ORDER BY c.consultation_id DESC
            """)

            consultations = cur.fetchall()

            return jsonify([
                make_json_safe(c) for c in consultations
            ])

    finally:
        conn.close()
# RUN FLASK SERVER
if __name__ == "__main__":
    app.run(debug=True)