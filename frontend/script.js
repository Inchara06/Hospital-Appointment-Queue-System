
const API = "/api";

// ==========================================
// SET TODAY'S DATE
// ==========================================

const todayDate = document.getElementById("today-date");

if (todayDate) {
    todayDate.textContent = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


// ==========================================
// DASHBOARD
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
        console.error("Dashboard error:", error);
    }
}


// ==========================================
// LOAD PATIENTS
// ==========================================

async function loadPatients() {
    try {
        const response = await fetch(`${API}/patients`);

        if (!response.ok) {
            throw new Error("Unable to load patients");
        }

        const patients = await response.json();

        const patientDropdown =
            document.getElementById("appointment-patient");

        if (patientDropdown) {
            patientDropdown.innerHTML =
                '<option value="">Select Patient</option>';

            patients.forEach(patient => {
                patientDropdown.innerHTML += `
                    <option value="${patient.patient_id}">
                        ${patient.name}
                    </option>
                `;
            });
        }

    } catch (error) {
        console.error("Patient loading error:", error);
    }
}


// ==========================================
// LOAD DOCTORS
// ==========================================

async function loadDoctors() {
    try {
        const response = await fetch(`${API}/doctors`);

        if (!response.ok) {
            throw new Error("Unable to load doctors");
        }

        const doctors = await response.json();

        const doctorDropdown =
            document.getElementById("appointment-doctor");

        if (doctorDropdown) {
            doctorDropdown.innerHTML =
                '<option value="">Select Doctor</option>';

            doctors.forEach(doctor => {
                doctorDropdown.innerHTML += `
                    <option value="${doctor.doctor_id}">
                        ${doctor.name} - ${doctor.department}
                    </option>
                `;
            });
        }

    } catch (error) {
        console.error("Doctor loading error:", error);
    }
}


// ==========================================
// REGISTER PATIENT
// ==========================================

const patientForm = document.getElementById("patient-form");

if (patientForm) {
    patientForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const patient = {
            name: document.getElementById("patient-name").value.trim(),
            phone: document.getElementById("patient-phone").value.trim(),
            age: document.getElementById("patient-age").value,
            gender: document.getElementById("patient-gender").value
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
                throw new Error(result.error || "Patient registration failed");
            }

            alert("Patient registered successfully!");

            patientForm.reset();

            await loadPatients();
            await loadDashboard();

        } catch (error) {
            alert(error.message);
        }
    });
}


// ==========================================
// BOOK APPOINTMENT
// ==========================================

const appointmentForm = document.getElementById("appointment-form");

if (appointmentForm) {
    appointmentForm.addEventListener("submit", async function (event) {
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
                throw new Error(result.error || "Appointment booking failed");
            }

            document.getElementById("booking-result").textContent =
                `Appointment booked successfully! Your token number is ${result.token_number}.`;

            appointmentForm.reset();

            await loadDashboard();
            await loadQueue();

        } catch (error) {
            document.getElementById("booking-result").textContent =
                error.message;
        }
    });
}


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

        const queueBody = document.getElementById("queue-body");

        if (!queueBody) return;

        queueBody.innerHTML = "";

        if (appointments.length === 0) {
            queueBody.innerHTML = `
                <tr>
                    <td colspan="7">No appointments in today's queue.</td>
                </tr>
            `;
            return;
        }

        appointments.forEach(appointment => {
            let actionButtons = "";

            if (appointment.status === "Waiting") {
                actionButtons = `
                    <button onclick="updateAppointmentStatus(
                        ${appointment.appointment_id}, 'In Progress'
                    )">Start</button>

                    <button onclick="updateAppointmentStatus(
                        ${appointment.appointment_id}, 'Cancelled'
                    )">Cancel</button>
                `;
            } else if (appointment.status === "In Progress") {
                actionButtons = `
                    <button onclick="updateAppointmentStatus(
                        ${appointment.appointment_id}, 'Completed'
                    )">Complete</button>
                `;
            }

            queueBody.innerHTML += `
                <tr>
                    <td>${appointment.token_number}</td>
                    <td>${appointment.patient_name}</td>
                    <td>${appointment.doctor_name}</td>
                    <td>${appointment.department}</td>
                    <td>${appointment.appointment_time}</td>
                    <td>${appointment.status}</td>
                    <td>${actionButtons}</td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Queue loading error:", error);
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
                body: JSON.stringify({ status: status })
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
// LOAD APPOINTMENTS FOR CONSULTATIONS
// ==========================================

async function loadConsultationAppointments() {
    try {
        const response =
            await fetch(`${API}/consultation-appointments`);

        if (!response.ok) {
            throw new Error("Unable to load consultation appointments");
        }

        const appointments = await response.json();

        const dropdown =
            document.getElementById("consultation-appointment");

        if (!dropdown) return;

        dropdown.innerHTML =
            '<option value="">Select Appointment</option>';

        appointments.forEach(appointment => {
            dropdown.innerHTML += `
                <option value="${appointment.appointment_id}">
                    Token ${appointment.token_number} -
                    ${appointment.patient_name} -
                    ${appointment.doctor_name}
                </option>
            `;
        });

    } catch (error) {
        console.error("Consultation appointments error:", error);
    }
}


// ==========================================
// SAVE CONSULTATION
// ==========================================

const consultationForm =
    document.getElementById("consultation-form");

if (consultationForm) {
    consultationForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const consultation = {
            appointment_id:
                document.getElementById("consultation-appointment").value,

            diagnosis:
                document.getElementById("consultation-diagnosis").value.trim(),

            prescription:
                document.getElementById("consultation-prescription").value.trim()
        };

        try {
            const response = await fetch(`${API}/consultations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(consultation)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Consultation saving failed");
            }

            document.getElementById("consultation-result").textContent =
                "Consultation saved successfully!";

            consultationForm.reset();

            await loadConsultations();
            await loadConsultationAppointments();

        } catch (error) {
            document.getElementById("consultation-result").textContent =
                error.message;
        }
    });
}


// ==========================================
// LOAD SAVED CONSULTATIONS
// ==========================================

async function loadConsultations() {
    try {
        const response = await fetch(`${API}/consultations`);

        if (!response.ok) {
            throw new Error("Unable to load consultations");
        }

        const consultations = await response.json();

        const consultationBody =
            document.getElementById("consultation-body");

        if (!consultationBody) return;

        consultationBody.innerHTML = "";

        if (consultations.length === 0) {
            consultationBody.innerHTML = `
                <tr>
                    <td colspan="5">No consultations recorded yet.</td>
                </tr>
            `;
            return;
        }

        consultations.forEach(consultation => {
            consultationBody.innerHTML += `
                <tr>
                    <td>${consultation.consultation_id}</td>
                    <td>${consultation.patient_name}</td>
                    <td>${consultation.doctor_name}</td>
                    <td>${consultation.diagnosis}</td>
                    <td>${consultation.prescription || "-"}</td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Consultation loading error:", error);
    }
}


// ==========================================
// SIDEBAR PAGE NAVIGATION
// ==========================================

const navigationButtons = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page-section");
const pageTitle = document.getElementById("page-title");

navigationButtons.forEach(button => {
    button.addEventListener("click", () => {

        const selectedPage = button.dataset.page;

        pages.forEach(page => {
            page.classList.remove("active");
        });

        navigationButtons.forEach(nav => {
            nav.classList.remove("active");
        });

        const targetPage = document.getElementById(selectedPage);

        if (targetPage) {
            targetPage.classList.add("active");
        }

        button.classList.add("active");

        if (pageTitle) {
            pageTitle.textContent = button.textContent.trim();
        }

        if (selectedPage === "dashboard") {
            loadDashboard();
        }

        if (selectedPage === "patients") {
            loadPatients();
        }

        if (selectedPage === "booking") {
            loadPatients();
            loadDoctors();
        }

        if (selectedPage === "queue") {
            loadQueue();
        }

        if (selectedPage === "consultations") {
            loadConsultationAppointments();
            loadConsultations();
        }

        window.scrollTo(0, 0);
    });
});


// ==========================================
// INITIAL PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
    loadPatients();
    loadDoctors();
    loadQueue();
    loadConsultationAppointments();
    loadConsultations();
});
