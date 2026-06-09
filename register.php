<?php
// ============================================================
//  Register New Staff Account
//  File: php/register.php
//  Accepts POST: full_name, email, password, confirm_password, role
// ============================================================
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method.');
}

$full_name = trim($_POST['full_name']        ?? '');
$email     = trim($_POST['email']             ?? '');
$password  = trim($_POST['password']          ?? '');
$confirm   = trim($_POST['confirm_password']  ?? '');
$role      = trim($_POST['role']              ?? 'receptionist');

// Validate
if (empty($full_name) || empty($email) || empty($password) || empty($confirm)) {
    jsonResponse(false, 'All fields are required.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(false, 'Please enter a valid email address.');
}
if (strlen($password) < 6) {
    jsonResponse(false, 'Password must be at least 6 characters.');
}
if ($password !== $confirm) {
    jsonResponse(false, 'Passwords do not match.');
}
if (!in_array($role, ['admin', 'receptionist'])) {
    jsonResponse(false, 'Invalid role selected.');
}

$db = getDB();

// Check email not already used
$check = $db->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$check->execute([$email]);
if ($check->fetch()) {
    jsonResponse(false, 'An account with this email already exists.');
}

// Insert
$hash = password_hash($password, PASSWORD_BCRYPT);
$stmt = $db->prepare('INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)');
$stmt->execute([$full_name, $email, $hash, $role]);

jsonResponse(true, 'Account created successfully! You can now log in.');
