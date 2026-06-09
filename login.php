<?php
// ============================================================
//  Login Handler
//  File: php/login.php
//  Accepts POST: email, password
// ============================================================
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Invalid request method.');
}

$email    = trim($_POST['email']    ?? '');
$password = trim($_POST['password'] ?? '');

if (empty($email) || empty($password)) {
    jsonResponse(false, 'Email and password are required.');
}

$db   = getDB();
$stmt = $db->prepare('SELECT id, full_name, email, password, role FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    jsonResponse(false, 'Invalid email or password.');
}

// Set session
$_SESSION['user_id']   = $user['id'];
$_SESSION['user_name'] = $user['full_name'];
$_SESSION['user_role'] = $user['role'];
$_SESSION['user_email']= $user['email'];

jsonResponse(true, 'Login successful.', [
    'name' => $user['full_name'],
    'role' => $user['role'],
]);
