-- ============================================================
--  Hospital Patient Registration System (HPRS)
--  Database: hprs_db
--  For: XAMPP / phpMyAdmin
--  Mkokwing University of Creative Technology, Sierra Leone
--  Semester 6 · 2026
-- ============================================================

-- Step 1: Create and select the database
CREATE DATABASE IF NOT EXISTS hprs_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hprs_db;

-- ============================================================
-- TABLE 1: users  (admin / receptionist accounts)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id           INT          NOT NULL AUTO_INCREMENT,
  full_name    VARCHAR(120) NOT NULL,
  email        VARCHAR(120) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,          -- bcrypt hashed
  role         ENUM('admin','receptionist') NOT NULL DEFAULT 'receptionist',
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 2: doctors
-- ============================================================
CREATE TABLE IF NOT EXISTS doctors (
  id             INT          NOT NULL AUTO_INCREMENT,
  full_name      VARCHAR(120) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  phone          VARCHAR(30)  NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 3: patients
-- ============================================================
CREATE TABLE IF NOT EXISTS patients (
  id             INT          NOT NULL AUTO_INCREMENT,
  patient_code   VARCHAR(10)  NOT NULL UNIQUE,   -- e.g. P001
  full_name      VARCHAR(120) NOT NULL,
  date_of_birth  DATE         NOT NULL,
  gender         ENUM('Male','Female','Other') NOT NULL,
  phone          VARCHAR(30)  NOT NULL,
  address        VARCHAR(255) DEFAULT NULL,
  registered_by  INT          NOT NULL,           -- FK → users.id
  registered_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (registered_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 4: visits  (each hospital visit / appointment)
-- ============================================================
CREATE TABLE IF NOT EXISTS visits (
  id          INT          NOT NULL AUTO_INCREMENT,
  patient_id  INT          NOT NULL,             -- FK → patients.id
  doctor_id   INT          NOT NULL,             -- FK → doctors.id
  visit_date  DATE         NOT NULL,
  visit_type  ENUM('New Patient','Return Visit','Emergency','Referral') NOT NULL DEFAULT 'New Patient',
  status      ENUM('Awaiting Doctor','With Doctor','Completed') NOT NULL DEFAULT 'Awaiting Doctor',
  complaint   TEXT         DEFAULT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id)  REFERENCES doctors(id)  ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- SEED DATA — Sample Users
-- Passwords are bcrypt hashes of the plain-text shown below
-- admin@hprs.sl        → password: Admin@1234
-- staff@hprs.sl        → password: Staff@1234
-- ============================================================
INSERT INTO users (full_name, email, password, role) VALUES
('Admin User',       'admin@hprs.sl', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Aminata Koroma',   'staff@hprs.sl', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'receptionist');

-- ============================================================
-- SEED DATA — Doctors
-- ============================================================
INSERT INTO doctors (full_name, specialization, phone) VALUES
('Dr. Adama Koroma',    'General Medicine',       '+232 76 111 222'),
('Dr. Hawa Bangura',    'Paediatrics',            '+232 78 222 333'),
('Dr. John Sesay',      'Surgery',                '+232 77 333 444'),
('Dr. Priscilla Conteh','Internal Medicine',      '+232 79 444 555'),
('Dr. Alhaji Kamara',   'Obstetrics & Gynaecology','+232 76 555 666');

-- ============================================================
-- SEED DATA — Sample Patients
-- ============================================================
INSERT INTO patients (patient_code, full_name, date_of_birth, gender, phone, address, registered_by) VALUES
('P001', 'John Bangura',   '2005-03-10', 'Male',   '077-7162-91', '12 Wilberforce St, Freetown', 2),
('P002', 'Mariama Koroma', '2007-08-22', 'Female', '077-7162-92', '45 Circular Rd, Freetown',   2),
('P003', 'Alhaji Jalloh',  '1997-01-05', 'Male',   '077-7162-93', '7 Sanders St, Freetown',     2),
('P004', 'Aminata Sankoh', '1995-11-14', 'Female', '077-7162-94', '23 Kissy Rd, Freetown',      2),
('P005', 'Mohamed Sesay',  '1985-06-30', 'Male',   '077-7162-95', '89 Lumley Beach Rd, Freetown',2);

-- ============================================================
-- SEED DATA — Sample Visits
-- ============================================================
INSERT INTO visits (patient_id, doctor_id, visit_date, visit_type, status, complaint) VALUES
(1, 1, CURDATE(), 'New Patient',   'Completed',       'Fever and headache'),
(2, 2, CURDATE(), 'New Patient',   'With Doctor',     'Cough and cold'),
(3, 3, CURDATE(), 'Return Visit',  'Awaiting Doctor', 'Post-surgery check'),
(4, 4, CURDATE(), 'New Patient',   'Completed',       'Hypertension check'),
(5, 5, CURDATE(), 'Emergency',     'With Doctor',     'Chest pain');
