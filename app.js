/* ============================================================
   app.js — Dashboard Logic (connects to PHP/MySQL backend)
   Hospital Patient Registration System
   ============================================================ */

/* ── HELPERS ── */
function today() { return new Date().toISOString().split('T')[0]; }

function age(dob) {
  if (!dob) return '—';
  return Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600 * 1000));
}

function fmtDate(d) {
  if (!d) return '—';
  var p = (d.split('T')[0] || d).split('-');
  return (p[2] || '') + '/' + (p[1] || '') + '/' + (p[0] || '');
}

function statusBadge(s) {
  if (s === 'Completed')       return '<span class="badge b-green">Completed</span>';
  if (s === 'With Doctor')     return '<span class="badge b-blue">With Doctor</span>';
  if (s === 'Awaiting Doctor') return '<span class="badge b-orange">Awaiting Doctor</span>';
  return '<span class="badge">' + (s || '—') + '</span>';
}

function api(url, opts) {
  return fetch(url, opts).then(function (r) { return r.json(); });
}

/* ── NAVIGATION ── */
function showPage(name, el) {
  document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
  document.querySelectorAll('.nav-item').forEach(function (n) { n.classList.remove('active'); });
  document.getElementById('page-' + name).classList.add('active');
  if (el) el.classList.add('active');
  if (name === 'dashboard') renderDash();
  if (name === 'records')   renderRecords();
  if (name === 'reports')   renderReports();
  if (name === 'register')  loadDoctors();
}

/* ── DASHBOARD ── */
function renderDash() {
  api('php/patients.php?action=stats').then(function (data) {
    if (!data.success) return;
    document.getElementById('s-total').textContent    = data.total;
    document.getElementById('s-today').textContent    = data.today;
    document.getElementById('s-appt').textContent     = data.total;
    document.getElementById('s-pending').textContent  = data.awaiting;
  });

  api('php/patients.php?action=list').then(function (data) {
    var tb = document.getElementById('dash-tbody');
    if (!data.success || !data.patients.length) {
      tb.innerHTML = '<tr><td class="empty-td" colspan="8">No patients yet. ' +
        '<a href="#" onclick="showPage(\'register\', document.querySelectorAll(\'.nav-item\')[1]); return false;" ' +
        'style="color:#3498db">Register first patient →</a></td></tr>';
      return;
    }
    tb.innerHTML = data.patients.slice(0, 8).map(function (p) {
      return '<tr>' +
        '<td><b>' + p.patient_code + '</b></td>' +
        '<td>' + p.full_name + '</td>' +
        '<td>' + age(p.date_of_birth) + '</td>' +
        '<td>' + p.gender + '</td>' +
        '<td>' + p.phone + '</td>' +
        '<td>' + fmtDate(p.registered_at) + '</td>' +
        '<td>' + statusBadge(p.status) + '</td>' +
        '<td><button class="btn btn-ghost btn-sm" onclick="openModal(' + JSON.stringify(p) + ')">View</button></td>' +
      '</tr>';
    }).join('');
  });
}

/* ── LOAD DOCTORS INTO FORM ── */
function loadDoctors() {
  var sel = document.getElementById('f-doctor');
  if (sel.options.length > 1) return; // already loaded
  api('php/patients.php?action=doctors').then(function (data) {
    if (!data.success) return;
    data.doctors.forEach(function (d) {
      var opt = document.createElement('option');
      opt.value = d.id;
      opt.textContent = d.full_name + ' — ' + d.specialization;
      sel.appendChild(opt);
    });
  });
}

/* ── REGISTER PATIENT ── */
function registerPatient() {
  var fields = {
    full_name:  document.getElementById('f-name').value.trim(),
    dob:        document.getElementById('f-dob').value,
    gender:     document.getElementById('f-gender').value,
    phone:      document.getElementById('f-phone').value.trim(),
    address:    document.getElementById('f-address').value.trim(),
    doctor_id:  document.getElementById('f-doctor').value,
    visit_date: document.getElementById('f-vdate').value,
    visit_type: document.getElementById('f-vtype').value,
    status:     document.getElementById('f-status').value,
    complaint:  document.getElementById('f-complaint').value.trim(),
  };

  var al = document.getElementById('reg-alert');
  al.classList.remove('show');

  if (!fields.full_name || !fields.dob || !fields.gender || !fields.phone || !fields.doctor_id || !fields.visit_date) {
    al.className = 'alert alert-error show';
    al.innerHTML = '⚠ Please fill in all required fields marked with *.';
    al.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }

  var btn = document.getElementById('reg-submit-btn');
  btn.disabled = true;
  btn.textContent = '⏳ Saving...';

  var form = new FormData();
  form.append('action', 'register');
  Object.keys(fields).forEach(function (k) { form.append(k, fields[k]); });

  api('php/patients.php', { method: 'POST', body: form }).then(function (data) {
    btn.disabled = false;
    btn.textContent = '✔ Register Patient';
    if (data.success) {
      al.className = 'alert alert-success show';
      al.innerHTML = '✔ Patient registered! ID: <b>' + data.patient_code + '</b>';
      clearForm();
    } else {
      al.className = 'alert alert-error show';
      al.innerHTML = '✖ ' + data.message;
    }
    al.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(function () { al.classList.remove('show'); }, 6000);
  });
}

function clearForm() {
  ['f-name', 'f-phone', 'f-address', 'f-complaint'].forEach(function (id) {
    document.getElementById(id).value = '';
  });
  ['f-gender', 'f-doctor', 'f-vtype', 'f-status'].forEach(function (id) {
    document.getElementById(id).selectedIndex = 0;
  });
  document.getElementById('f-dob').value   = '';
  document.getElementById('f-vdate').value = today();
}

/* ── RECORDS ── */
function renderRecords() {
  var q  = (document.getElementById('srch').value || '').trim();
  var fs = document.getElementById('fltr-status').value;
  var fg = document.getElementById('fltr-gender').value;

  var url = 'php/patients.php?action=list';
  if (q)  url += '&search=' + encodeURIComponent(q);
  if (fs) url += '&status='  + encodeURIComponent(fs);
  if (fg) url += '&gender='  + encodeURIComponent(fg);

  api(url).then(function (data) {
    var tb = document.getElementById('rec-tbody');
    if (!data.success || !data.patients.length) {
      tb.innerHTML = '<tr><td class="empty-td" colspan="10">No records found.</td></tr>';
      return;
    }
    tb.innerHTML = data.patients.map(function (p) {
      return '<tr>' +
        '<td><b>' + p.patient_code + '</b></td>' +
        '<td>' + p.full_name + '</td>' +
        '<td>' + age(p.date_of_birth) + '</td>' +
        '<td>' + p.gender + '</td>' +
        '<td>' + p.phone + '</td>' +
        '<td style="font-size:12px">' + (p.doctor_name || '—') + '</td>' +
        '<td><span class="badge b-blue" style="font-size:11px">' + (p.visit_type || '—') + '</span></td>' +
        '<td>' + fmtDate(p.visit_date) + '</td>' +
        '<td>' + statusBadge(p.status) + '</td>' +
        '<td style="white-space:nowrap">' +
          '<button class="btn btn-ghost btn-sm" onclick="openModal(' + JSON.stringify(p) + ')">View</button> ' +
          '<button class="btn btn-danger btn-sm" onclick="delPatient(' + p.id + ')">Delete</button>' +
        '</td>' +
      '</tr>';
    }).join('');
  });
}

function delPatient(id) {
  if (!confirm('Delete this patient record? This cannot be undone.')) return;
  var form = new FormData();
  form.append('action', 'delete');
  form.append('patient_id', id);
  api('php/patients.php', { method: 'POST', body: form }).then(function (data) {
    if (data.success) { renderRecords(); renderDash(); }
    else alert('Error: ' + data.message);
  });
}

/* ── REPORTS ── */
function barChart(cid, data, colors) {
  var el = document.getElementById(cid);
  if (!el) return;
  var total = data.reduce(function (a, b) { return a + b[1]; }, 0);
  if (!total) { el.innerHTML = '<p style="color:#aaa;font-size:13px;padding:8px 0">No data yet.</p>'; return; }
  el.innerHTML = data.map(function (d, i) {
    var pct = Math.round((d[1] / total) * 100);
    return '<div class="bar-row">' +
      '<div class="bar-meta"><span>' + d[0] + '</span><span>' + d[1] + ' (' + pct + '%)</span></div>' +
      '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:' + colors[i % colors.length] + '"></div></div>' +
    '</div>';
  }).join('');
}

function countBy(patients, key) {
  var m = {};
  patients.forEach(function (p) { var v = p[key] || 'Unknown'; m[v] = (m[v] || 0) + 1; });
  return Object.keys(m).map(function (k) { return [k, m[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
}

function renderReports() {
  api('php/patients.php?action=list').then(function (data) {
    if (!data.success) return;
    var pts = data.patients;
    document.getElementById('r-total').textContent     = pts.length;
    document.getElementById('r-completed').textContent = pts.filter(function (p) { return p.status === 'Completed'; }).length;
    document.getElementById('r-waiting').textContent   = pts.filter(function (p) { return p.status === 'Awaiting Doctor'; }).length;
    document.getElementById('r-with').textContent      = pts.filter(function (p) { return p.status === 'With Doctor'; }).length;
    barChart('rpt-gender', countBy(pts, 'gender'),     ['#3498db', '#e91e8c', '#f39c12']);
    barChart('rpt-status', countBy(pts, 'status'),     ['#f39c12', '#3498db', '#27ae60']);
    barChart('rpt-vtype',  countBy(pts, 'visit_type'), ['#27ae60', '#3498db', '#e74c3c', '#8e44ad']);
    var docD = countBy(pts, 'doctor_name').map(function (d) { return [d[0].split('—')[0].trim(), d[1]]; });
    barChart('rpt-doctor', docD, ['#1abc9c', '#3498db', '#e74c3c', '#f39c12', '#8e44ad']);
  });
}

/* ── MODAL ── */
function openModal(p) {
  document.getElementById('modal-title').textContent = p.full_name + ' — ' + p.patient_code;
  var rows = [
    ['Patient ID',      p.patient_code],
    ['Full Name',       p.full_name],
    ['Date of Birth',   fmtDate(p.date_of_birth)],
    ['Age',             age(p.date_of_birth) + ' years'],
    ['Gender',          p.gender],
    ['Phone',           p.phone || '—'],
    ['Address',         p.address || '—'],
    ['Assigned Doctor', (p.doctor_name || '—') + (p.specialization ? ' (' + p.specialization + ')' : '')],
    ['Visit Date',      fmtDate(p.visit_date)],
    ['Visit Type',      p.visit_type || '—'],
    ['Status',          p.status || '—'],
    ['Complaint',       p.complaint || '—'],
    ['Registered On',   fmtDate(p.registered_at)],
  ];
  document.getElementById('modal-body').innerHTML = rows.map(function (r) {
    return '<div class="drow"><span class="dlbl">' + r[0] + '</span><span class="dval">' + r[1] + '</span></div>';
  }).join('');

  document.getElementById('m-update').onclick = function () { cycleStatus(p); };
  document.getElementById('m-delete').onclick = function () { delPatient(p.id); closeModal(); };
  document.getElementById('overlay').classList.add('open');
}

function cycleStatus(p) {
  var opts = ['Awaiting Doctor', 'With Doctor', 'Completed'];
  var next = opts[(opts.indexOf(p.status) + 1) % opts.length];
  if (!confirm('Change status to "' + next + '"?')) return;
  var form = new FormData();
  form.append('action',   'update_status');
  form.append('visit_id', p.visit_id);
  form.append('status',   next);
  api('php/patients.php', { method: 'POST', body: form }).then(function (data) {
    if (data.success) { closeModal(); renderDash(); renderRecords(); renderReports(); }
    else alert('Error: ' + data.message);
  });
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('overlay')) return;
  document.getElementById('overlay').classList.remove('open');
}

/* ── EXPORT ── */
function exportData() {
  api('php/patients.php?action=list').then(function (data) {
    if (!data.success) return;
    var blob = new Blob([JSON.stringify(data.patients, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'patients_backup_' + today() + '.json';
    a.click();
  });
}

/* ── INIT ── */
document.getElementById('f-vdate').value = today();
renderDash();
