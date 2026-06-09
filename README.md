# 🏥 Hospital Patient Registration System (HPRS)

**Freetown General Hospital, Sierra Leone**
Mkokwing University of Creative Technology · Faculty of ICT · Semester 6 · 2026

---

## What This System Does

The Hospital Patient Registration System (HPRS) is a fully working web-based digital solution that replaces the manual, paper-based patient registration process used in hospitals across Sierra Leone. It allows hospital staff to register patients, assign doctors, track visit statuses, search records, and generate summary reports — all from a simple browser-based interface backed by a MySQL database.

**Core features:**
- Staff login and account registration (role-based: Admin / Receptionist)
- Register new patients with personal and visit details
- View, search, and filter all patient records
- Update visit status (Awaiting Doctor → With Doctor → Completed)
- Dashboard with live statistics (total patients, today's visits, queue size)
- Reports and statistics (gender, doctor workload, visit types, status)
- Export patient data as JSON backup
- Admin tools: manage accounts, delete records

---

## How to Set It Up (XAMPP)

### Requirements
- XAMPP (Apache + MySQL + PHP 8.x)
- Any modern web browser

### Steps

**1. Copy files**
```
C:\xampp\htdocs\hprs\
```
Place all project files inside this folder.

**2. Start XAMPP**
Open XAMPP Control Panel → Start **Apache** and **MySQL**.

**3. Import the database**
- Go to `http://localhost/phpmyadmin`
- Click **New** → name it `hprs_db` → click **Create**
- Click **Import** → choose `sql/hprs_database.sql` → click **Go**

**4. Open the system**
```
http://localhost/hprs/login.html
```

### Default login credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hprs.sl | Admin@1234 |
| Receptionist | staff@hprs.sl | Staff@1234 |

---

## Project Structure

```
hprs/
├── index.html              ← Main dashboard
├── login.html              ← Login page
├── register.html           ← Staff registration page
├── css/
│   ├── style.css           ← Dashboard styles
│   └── auth.css            ← Login/register styles
├── js/
│   └── app.js              ← Dashboard logic (PHP API calls)
├── php/
│   ├── config.php          ← Database connection & session helpers
│   ├── login.php           ← Login handler (bcrypt password verify)
│   ├── register.php        ← Staff account registration
│   ├── patients.php        ← Patient CRUD API
│   └── logout.php          ← Session destroy & redirect
└── sql/
    └── hprs_database.sql   ← Full database schema + seed data
```

---

## 🔒 Data Privacy & Security Statement

- All patient data is stored **locally on the hospital's own server** (XAMPP/MySQL). No data is transmitted to any external server or third party.
- Passwords are hashed using **PHP bcrypt** (`password_hash` / `password_verify`) — plain-text passwords are never stored.
- Role-based access control restricts sensitive actions (account deletion, record deletion) to Admin users only.
- Sessions are managed server-side via PHP sessions. Logout destroys the session completely.
- In a production deployment, the system should be served over **HTTPS** with TLS encryption, and the database should be protected with a strong password.
- Only the minimum necessary patient information is collected, in line with the principle of **data minimisation**.

---

## 🌍 SDG Alignment

### SDG 3 — Good Health and Well-being
HPRS directly improves healthcare delivery by digitising patient registration at Freetown General Hospital. Faster, more accurate registration reduces waiting times, eliminates manual data entry errors, and gives doctors immediate access to patient records — enabling better clinical decisions and continuity of care.

### SDG 10 — Reduced Inequalities
By operating on standard XAMPP infrastructure (which runs on low-cost hardware) and requiring no internet connection, HPRS ensures that hospitals in under-resourced communities across Sierra Leone — not just urban centres — can benefit from digital health administration. The system is fully open-source under the MIT Licence, removing all financial barriers to adoption.

---

## 📜 Open-Source Licence

This project is licensed under the **MIT Licence** — see `LICENSE.txt` for details.

---

## 🤝 How to Contribute

1. Fork this repository on GitHub
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add: description"`
4. Push and open a Pull Request

Contributions improving Krio/Temne/Mende language support, offline-first capabilities, or accessibility are especially welcome.

---

## 🛠 Built With

- HTML5, CSS3, Vanilla JavaScript
- PHP 8.x (PDO / prepared statements)
- MySQL via XAMPP
- Google Fonts (Poppins)

---

*Systems Analysis & Design Final Project · Mkokwing University of Creative Technology, Sierra Leone · 2026*
