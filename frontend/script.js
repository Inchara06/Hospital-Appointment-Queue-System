
const API = "/api";


// ==========================================
// SET TODAY'S DATE
// ==========================================

document.getElementById("today-date").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });


// ==========================================
// LOAD DASHBOARD
// ==========================================

async function loadDashboard() {
    try {
        const response = await fetch(`${API}/dashboard`);

        if (!response.ok) {
            throw new Error("Dashboard loading failed");
        }

        const data = await response.json();

        document.getElementById("total-patients").textContent =
            data.total_patients;

        document.getElementById("total-doctors").textContent =
            data.total_doctors;

        document.getElementById("total-appointments").textContent =
            data.total_appointments;

        document.getElementById("waiting-appointments").textContent =
            data.waiting_appointments;

    } catch (error) {
        console.error(error);
        alert("Could not load dashboard details.");
    }
}


// ==========================================
// LOAD PATIENTS
// ==========================================

async function loadPatients() {
    try {
        const response = await fetch(`${API}/patients`);

        if (!response.ok) {
            throw new Error("Patient loading failed");
        }

        const patients = await response.json();

        const select = document.getElementById("appointment-patient");

        select.innerHTML =
            '<option value="">Select patient</option>';

        patients.forEach(patient => {
            const option = document.createElement("option");

            option.value = patient.patient_id;

            option.textContent =
                `${patient.name} (${patient.phone})`;

            select.appendChild(option);
        });

    } catch (error) {
        console.error(error);
        alert("Could not load patients.");
    }
}


// ==========================================
// LOAD DOCTORS
// ==========================================

async function loadDoctors() {
    try {
        const response = await fetch(`${API}/doctors`);

        if (!response.ok) {
            throw new Error("Doctor loading failed");
        }

        const doctors = await response.json();

        const select = document.getElementById("appointment-doctor");

        select.innerHTML =
            '<option value="">Select doctor</option>';

        doctors.forEach(doctor => {
            const option = document.createElement("option");

            option.value = doctor.doctor_id;

            option.textContent =
                `${doctor.name} - ${doctor.department}`;

            select.appendChild(option);
        });

    } catch (error) {
        console.error(error);
        alert("Could not load doctors.");
    }
}


// ==========================================
// REGISTER PATIENT
// ==========================================

document.getElementById("patient-form")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const patient = {
            name: document.getElementById("patient-name").value.trim(),

            phone: document.getElementById("patient-phone").value.trim(),

            age: document.getElementById("patient-age").value || null,

            gender: document.getElementById("patient-gender").value || null
        };

        try {
            const response = await fetch(`${API}/patients`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(patient)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Registration failed");
            }

            alert("Patient registered successfully!");

            this.reset();

            await loadPatients();
            await loadDashboard();

        } catch (error) {
            alert(error.message);
        }
    });


// ==========================================
// BOOK APPOINTMENT
// ==========================================

document.getElementById("appointment-form")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const appointment = {
            patient_id: document.getElementById("appointment-patient").value,

            doctor_id: document.getElementById("appointment-doctor").value,

            appointment_date: document.getElementById("appointment-date").value,

            appointment_time: document.getElementById("appointment-time").value
        };

        try {
            const response = await fetch(`${API}/appointments`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(appointment)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Booking failed");
            }

            document.getElementById("booking-result").textContent =
                `Appointment booked successfully! Your token number is ${result.token_number}.`;

            this.reset();

            await loadDashboard();
            await loadQueue();

        } catch (error) {
            document.getElementById("booking-result").textContent =
                error.message;
        }
    });


// ==========================================
// LOAD DOCTOR QUEUE
// ==========================================

async function loadQueue() {
    try {
        const response = await fetch(`${API}/queue`);

        if (!response.ok) {
            throw new Error("Queue loading failed");
        }

        const appointments = await response.json();

        const tbody = document.getElementById("queue-body");

        tbody.innerHTML = "";

        if (appointments.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="7">No appointments for today.</td></tr>';

            return;
        }

        appointments.forEach(appointment => {

            const row = document.createElement("tr");

            const values = [
                appointment.token_number,
                appointment.patient_name,
                appointment.doctor_name,
                appointment.department,
                appointment.appointment_time,
                appointment.status
            ];

            values.forEach(value => {
                const cell = document.createElement("td");

                cell.textContent = value;

                row.appendChild(cell);
            });

            const actionCell = document.createElement("td");

            if (appointment.status === "Waiting") {

                const button = document.createElement("button");

                button.textContent = "Call Patient";

                button.addEventListener("click", () =>
                    updateAppointmentStatus(
                        appointment.appointment_id,
                        "In Progress"
                    )
                );

                actionCell.appendChild(button);

            } else if (appointment.status === "In Progress") {

                const button = document.createElement("button");

                button.textContent = "Complete";

                button.addEventListener("click", () =>
                    updateAppointmentStatus(
                        appointment.appointment_id,
                        "Completed"
                    )
                );

                actionCell.appendChild(button);

            } else {

                actionCell.textContent = "-";
            }

            row.appendChild(actionCell);

            tbody.appendChild(row);
        });

    } catch (error) {
        console.error(error);

        document.getElementById("queue-body").innerHTML =
            '<tr><td colspan="7">Unable to load queue.</td></tr>';
    }
}


// ==========================================
// UPDATE APPOINTMENT STATUS
// ==========================================

async function updateAppointmentStatus(appointmentId, status) {

    try {
        const response = await fetch(
            `${API}/appointments/${appointmentId}/status`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({ status })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Status update failed");
        }

        await loadQueue();
        await loadDashboard();
        await loadConsultationAppointments();

    } catch (error) {
        alert(error.message);
    }
}


// ==========================================
// CONSULTATION MANAGEMENT
// ==========================================


// LOAD APPOINTMENTS AVAILABLE FOR CONSULTATION

async function loadConsultationAppointments() {

    try {
        const response = await fetch(
            `${API}/consultation-appointments`
        );

        if (!response.ok) {
            throw new Error("Could not load consultation appointments");
        }

        const appointments = await response.json();

        const select = document.getElementById(
            "consultation-appointment"
        );

        select.innerHTML =
            '<option value="">Select Appointment</option>';

        appointments.forEach(appointment => {

            const option = document.createElement("option");

            option.value = appointment.appointment_id;

            option.textContent =
                `Appointment ${appointment.appointment_id} - ` +
                `${appointment.patient_name} - ` +
                `${appointment.doctor_name} - ` +
                `Token ${appointment.token_number}`;

            select.appendChild(option);
        });

    } catch (error) {
        console.error(error);
    }
}


// LOAD SAVED CONSULTATION RECORDS

async function loadConsultations() {

    try {
        const response = await fetch(`${API}/consultations`);

        if (!response.ok) {
            throw new Error("Could not load consultation records");
        }

        const consultations = await response.json();

        const tbody = document.getElementById("consultation-body");

        tbody.innerHTML = "";

        if (consultations.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No consultation records yet.
                    </td>
                </tr>
            `;

            return;
        }

        consultations.forEach(consultation => {

            const row = document.createElement("tr");

            const values = [
                consultation.patient_name,
                consultation.doctor_name,
                consultation.diagnosis,
                consultation.prescription || "-",
                consultation.created_at
                    ? new Date(
                        consultation.created_at
                    ).toLocaleDateString("en-IN")
                    : "-"
            ];

            values.forEach(value => {

                const cell = document.createElement("td");

                cell.textContent = value;

                row.appendChild(cell);
            });

            tbody.appendChild(row);
        });

    } catch (error) {
        console.error(error);

        document.getElementById("consultation-body").innerHTML =
            '<tr><td colspan="5">Unable to load consultation records.</td></tr>';
    }
}


// SAVE CONSULTATION

document.getElementById("consultation-form")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const appointmentId = document.getElementById(
            "consultation-appointment"
        ).value;

        const diagnosis = document.getElementById(
            "consultation-diagnosis"
        ).value.trim();

        const prescription = document.getElementById(
            "consultation-prescription"
        ).value.trim();

        const result = document.getElementById(
            "consultation-result"
        );

        if (!appointmentId || !diagnosis) {

            result.textContent =
                "Please select an appointment and enter diagnosis.";

            return;
        }

        try {

            const response = await fetch(
                `${API}/consultations`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        appointment_id: appointmentId,
                        diagnosis: diagnosis,
                        prescription: prescription
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to save consultation"
                );
            }

            result.textContent =
                "Consultation saved successfully!";

            result.style.color = "green";

            this.reset();

            await loadConsultations();

            await loadConsultationAppointments();

        } catch (error) {

            result.textContent = error.message;

            result.style.color = "red";
        }
    });


// ==========================================
// LOAD ALL DATA WHEN PAGE OPENS
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    await loadDashboard();

    await loadPatients();

    await loadDoctors();

    await loadQueue();

    await loadConsultationAppointments();

    await loadConsultations();

});
