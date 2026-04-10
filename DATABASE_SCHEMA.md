# Orthopedic Surgical Logbook - Database Schema

This document outlines the relational database schema (e.g., for PostgreSQL / Supabase) required for the application.

## 1. `users` Table
Stores both Admin and Doctor accounts.

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Login username |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt/Argon2 hashed password |
| `role` | VARCHAR(20) | NOT NULL, CHECK (role IN ('admin', 'doctor')) | User role |
| `full_name` | VARCHAR(100) | NOT NULL | Doctor's or Admin's full name |
| `must_change_password` | BOOLEAN | DEFAULT true | Forces password change on first login |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Record update timestamp |

## 2. `patients` Table
Stores anonymized patient data.

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `display_id` | VARCHAR(20) | UNIQUE, NOT NULL | Anonymized ID (e.g., PT-2023-001) |
| `age` | INTEGER | NOT NULL | Patient age at registration |
| `gender` | VARCHAR(10) | NOT NULL | Male, Female, Other |
| `medical_history` | TEXT | | Current and past medical history |
| `past_surgeries` | TEXT | | Previous surgical interventions |
| `created_by` | UUID | REFERENCES users(id) | Doctor who registered the patient |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |

## 3. `surgical_cases` Table
Stores the detailed surgical documentation.

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `patient_id` | UUID | REFERENCES patients(id) ON DELETE CASCADE | Associated patient |
| `doctor_id` | UUID | REFERENCES users(id) ON DELETE CASCADE | Surgeon who performed/logged it |
| `surgery_date` | DATE | NOT NULL | Date of the surgery |
| `diagnosis` | VARCHAR(255) | NOT NULL | Pre-op diagnosis |
| `comorbidities` | TEXT | | Pre-op comorbidities |
| `current_medications` | TEXT | | Pre-op medications |
| `surgical_plan` | TEXT | NOT NULL | Planned surgical steps |
| `trauma_classification` | VARCHAR(100) | | e.g., AO/OTA, Gustilo-Anderson |
| `joints_classification` | VARCHAR(100) | | e.g., Kellgren-Lawrence |
| `anesthesia_type` | VARCHAR(100) | NOT NULL | General, Regional, Local, etc. |
| `surgical_approach` | VARCHAR(255) | NOT NULL | e.g., Anterior, Lateral, Posterior |
| `implants_used` | TEXT | | Plates, Screws, Nails, Prosthesis details |
| `weight_bearing_status` | VARCHAR(100) | NOT NULL | NWB, TTWB, PWB, FWB |
| `physiotherapy_plan` | TEXT | | Post-op rehab plan |
| `post_op_medications` | TEXT | | Post-op prescriptions |
| `is_shared` | BOOLEAN | DEFAULT false | Toggle for Community Feed (The Atlas) |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Record update timestamp |

## 4. `case_media` Table
Stores metadata for uploaded images and PDFs (actual files stored in S3/Supabase Storage).

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `case_id` | UUID | REFERENCES surgical_cases(id) ON DELETE CASCADE | Associated surgical case |
| `media_url` | VARCHAR(512) | NOT NULL | Storage URL |
| `media_type` | VARCHAR(50) | NOT NULL | 'image/jpeg', 'application/pdf', etc. |
| `description` | VARCHAR(255) | | Optional caption (e.g., "Pre-op X-ray AP view") |
| `uploaded_at` | TIMESTAMPTZ | DEFAULT now() | Upload timestamp |

## 5. `community_comments` Table (Optional for Social Feed)
Allows doctors to discuss shared cases.

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `case_id` | UUID | REFERENCES surgical_cases(id) ON DELETE CASCADE | The shared case being discussed |
| `doctor_id` | UUID | REFERENCES users(id) ON DELETE CASCADE | The doctor commenting |
| `comment_text` | TEXT | NOT NULL | The discussion text |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Timestamp |

## Password Reset Logic (Application Level)
1. Admin creates a doctor account with a temporary password and `must_change_password = true`.
2. Doctor logs in. The backend verifies credentials.
3. If `must_change_password` is true, the backend returns a specific status code (e.g., 403 Forbidden with a custom error code `PASSWORD_CHANGE_REQUIRED`) or a session token with restricted scope.
4. The frontend redirects the doctor to a `/change-password` route.
5. The doctor submits a new password. The backend hashes it, updates `password_hash`, sets `must_change_password = false`, and issues a full-access session token.
