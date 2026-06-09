# HPRS — XAMPP Setup Guide
## Hospital Patient Registration System

---

## STEP 1 — Copy Files to XAMPP

1. Open your **XAMPP** installation folder (usually `C:\xampp\`)
2. Go into the `htdocs` folder
3. Create a new folder called **`hprs`**
4. Copy **ALL files and folders** from this zip into `C:\xampp\htdocs\hprs\`

Your final folder structure should look like:
```
C:\xampp\htdocs\hprs\
├── index.html
├── login.html
├── register.html
├── css\
│   ├── style.css
│   └── auth.css
├── js\
│   └── app.js
├── php\
│   ├── config.php
│   ├── login.php
│   ├── register.php
│   ├── patients.php
│   └── logout.php
└── sql\
    └── hprs_database.sql
```

---

## STEP 2 — Start XAMPP

1. Open **XAMPP Control Panel**
2. Click **Start** next to **Apache**
3. Click **Start** next to **MySQL**
4. Both should show green "Running" status

---

## STEP 3 — Import the Database

1. Open your browser and go to: **http://localhost/phpmyadmin**
2. Click **"New"** on the left sidebar to create a new database
3. Type `hprs_db` as the name → click **Create**
4. Click on `hprs_db` in the left sidebar to select it
5. Click the **"Import"** tab at the top
6. Click **"Choose File"** → navigate to `sql/hprs_database.sql`
7. Click **"Go"** at the bottom

✅ You should see: "Import has been successfully finished"

The database will now contain 5 tables:
- `users` — staff accounts
- `doctors` — hospital doctors
- `patients` — registered patients
- `visits` — patient visits/appointments

---

## STEP 4 — Open the System

Go to: **http://localhost/hprs/login.html**

### Default Login Credentials:
| Role          | Email             | Password    |
|---------------|-------------------|-------------|
| Admin         | admin@hprs.sl     | Admin@1234  |
| Receptionist  | staff@hprs.sl     | Staff@1234  |

---

## STEP 5 — Create Your Own Account (Optional)

Go to: **http://localhost/hprs/register.html**

Fill in your name, email, password, and select your role.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Database connection failed" | Make sure MySQL is running in XAMPP |
| Blank page on login | Check that Apache is running |
| "Table not found" error | Re-import the SQL file in phpMyAdmin |
| Login fails with correct password | Re-import SQL (passwords are pre-hashed) |
| Files not found | Make sure folder is named exactly `hprs` in htdocs |

---

## Default Password Note

The sample passwords in the SQL file are **bcrypt hashes** of:
- `Admin@1234` (for admin)
- `Staff@1234` (for staff)

These use the standard bcrypt hash `$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi`
which is the Laravel/PHP default test hash for `password`.

If login fails, register a new account at `/register.html` and use that instead.
