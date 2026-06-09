<?php
// ============================================================
//  Patients API
//  File: php/patients.php
//  GET  ?action=list|stats
//  POST action=register|update_status|delete
// ============================================================
require_once 'config.php';
requireLogin();

$db     = getDB();
$action = $_REQUEST['action'] ?? 'list';

// ── GET: list all patients with latest visit ──
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'list') {
    $search = trim($_GET['search'] ?? '');
    $status = trim($_GET['status'] ?? '');
    $gender = trim($_GET['gender'] ?? '');

    $sql  = 'SELECT p.id, p.patient_code, p.full_name, p.date_of_birth, p.gender,
                    p.phone, p.address, p.registered_at,
                    v.id AS visit_id, v.visit_date, v.visit_type, v.status, v.complaint,
                    d.full_name AS doctor_name, d.specialization
             FROM patients p
             LEFT JOIN visits v ON v.id = (
                 SELECT id FROM visits WHERE patient_id = p.id ORDER BY created_at DESC LIMIT 1
             )
             LEFT JOIN doctors d ON d.id = v.doctor_id
             WHERE 1=1';
    $params = [];

    if ($search) {
        $sql .= ' AND (p.full_name LIKE ? OR p.patient_code LIKE ? OR p.phone LIKE ?)';
        $like = "%$search%";
        $params = array_merge($params, [$like, $like, $like]);
    }
    if ($status) {
        $sql .= ' AND v.status = ?';
        $params[] = $status;
    }
    if ($gender) {
        $sql .= ' AND p.gender = ?';
        $params[] = $gender;
    }
    $sql .= ' ORDER BY p.registered_at DESC';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    jsonResponse(true, 'OK', ['patients' => $stmt->fetchAll()]);
}

// ── GET: dashboard stats ──
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'stats') {
    $today = date('Y-m-d');
    $total       = $db->query('SELECT COUNT(*) FROM patients')->fetchColumn();
    $today_count = $db->prepare('SELECT COUNT(*) FROM patients WHERE DATE(registered_at) = ?');
    $today_count->execute([$today]);
    $awaiting    = $db->query("SELECT COUNT(*) FROM visits WHERE status = 'Awaiting Doctor'")->fetchColumn();
    $completed   = $db->prepare("SELECT COUNT(*) FROM visits WHERE status = 'Completed' AND visit_date = ?");
    $completed->execute([$today]);

    jsonResponse(true, 'OK', [
        'total'     => $total,
        'today'     => $today_count->fetchColumn(),
        'awaiting'  => $awaiting,
        'completed' => $completed->fetchColumn(),
    ]);
}

// ── POST: register new patient + visit ──
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'register') {
    $full_name = trim($_POST['full_name']  ?? '');
    $dob       = trim($_POST['dob']        ?? '');
    $gender    = trim($_POST['gender']     ?? '');
    $phone     = trim($_POST['phone']      ?? '');
    $address   = trim($_POST['address']    ?? '');
    $doctor_id = intval($_POST['doctor_id']?? 0);
    $vdate     = trim($_POST['visit_date'] ?? '');
    $vtype     = trim($_POST['visit_type'] ?? 'New Patient');
    $status    = trim($_POST['status']     ?? 'Awaiting Doctor');
    $complaint = trim($_POST['complaint']  ?? '');

    if (!$full_name || !$dob || !$gender || !$phone || !$doctor_id || !$vdate) {
        jsonResponse(false, 'Please fill in all required fields.');
    }

    // Generate next patient code
    $last = $db->query("SELECT patient_code FROM patients ORDER BY id DESC LIMIT 1")->fetchColumn();
    $num  = $last ? intval(substr($last, 1)) + 1 : 1;
    $code = 'P' . str_pad($num, 3, '0', STR_PAD_LEFT);

    $db->beginTransaction();
    try {
        $ins = $db->prepare(
            'INSERT INTO patients (patient_code, full_name, date_of_birth, gender, phone, address, registered_by)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $ins->execute([$code, $full_name, $dob, $gender, $phone, $address, $_SESSION['user_id']]);
        $patient_id = $db->lastInsertId();

        $vis = $db->prepare(
            'INSERT INTO visits (patient_id, doctor_id, visit_date, visit_type, status, complaint)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $vis->execute([$patient_id, $doctor_id, $vdate, $vtype, $status, $complaint]);
        $db->commit();
        jsonResponse(true, 'Patient registered successfully.', ['patient_code' => $code]);
    } catch (Exception $e) {
        $db->rollBack();
        jsonResponse(false, 'Registration failed: ' . $e->getMessage());
    }
}

// ── POST: update visit status ──
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'update_status') {
    $visit_id = intval($_POST['visit_id'] ?? 0);
    $status   = trim($_POST['status']     ?? '');
    if (!$visit_id || !in_array($status, ['Awaiting Doctor', 'With Doctor', 'Completed'])) {
        jsonResponse(false, 'Invalid data.');
    }
    $stmt = $db->prepare('UPDATE visits SET status = ? WHERE id = ?');
    $stmt->execute([$status, $visit_id]);
    jsonResponse(true, 'Status updated.');
}

// ── POST: delete patient ──
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'delete') {
    $patient_id = intval($_POST['patient_id'] ?? 0);
    if (!$patient_id) { jsonResponse(false, 'Invalid patient ID.'); }
    $stmt = $db->prepare('DELETE FROM patients WHERE id = ?');
    $stmt->execute([$patient_id]);
    jsonResponse(true, 'Patient record deleted.');
}


// ── GET: list doctors (for registration form) ──
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'doctors') {
    $stmt = $db->query('SELECT id, full_name, specialization FROM doctors ORDER BY full_name');
    jsonResponse(true, 'OK', ['doctors' => $stmt->fetchAll()]);
}

jsonResponse(false, 'Unknown action.');
