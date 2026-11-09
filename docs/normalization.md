
# Database Normalization

## Introduction

Normalization is the process of organizing data in database tables to reduce data duplication and avoid insertion, deletion and update anomalies.

Our Hospital Appointment and Queue Management System follows Third Normal Form (3NF).

## 1. First Normal Form (1NF)

A table is in 1NF when:
- Each column contains only atomic (single) values.
- There are no repeating groups.
- Each row can be uniquely identified.

In our project:
- Patient details are stored separately in the patients table.
- Doctor details are stored separately in the doctors table.
- Each appointment is stored as a separate row.
- Each consultation is stored as a separate row.

Therefore, our tables satisfy 1NF.

## 2. Second Normal Form (2NF)

A table is in 2NF when:
- It is already in 1NF.
- Every non-key attribute depends on the entire primary key.
- There are no partial dependencies.

In our project, all four tables use single-column primary keys:
- patients: patient_id
- doctors: doctor_id
- appointments: appointment_id
- consultations: consultation_id

Since each primary key contains only one column, partial dependency does not occur.

Therefore, our tables satisfy 2NF.

## 3. Third Normal Form (3NF)

A table is in 3NF when:
- It is already in 2NF.
- There are no transitive dependencies.
- Non-key attributes depend only on the primary key.

In our project:
- Patient information is stored in the patients table.
- Doctor information is stored in the doctors table.
- Appointment information is stored in the appointments table.
- Diagnosis and prescription are stored in the consultations table.

Patient and doctor details are not repeatedly stored in the appointments table. Instead, foreign keys are used to connect the tables.

Therefore, our database satisfies 3NF.

## Conclusion

The Hospital Appointment and Queue Management System is designed using 3NF to reduce data redundancy, maintain data consistency and improve database organization.
