<?php
require __DIR__ . '/_store.php';
session_start();
$in = body();
$username = trim($in['username'] ?? '');
$password = $in['password'] ?? '';
$role = $in['role'] ?? '';

// The admin account lives in data/admin.json, never in users.json - that
// file is imported directly into the React bundle as offline fallback data
// (see src/lib/seedData.js), so anything in it ships to every visitor's
// browser. Keeping admin credentials out of it means they're never sent to
// the client at all, hashed or not. This is also why admin login has no
// offline fallback: it only works with this PHP endpoint running.
if ($role === 'admin') {
  foreach (read_json('admin.json') as $u) {
    if (($u['username'] ?? '') === $username && !empty($u['password']) && password_verify($password, $u['password'])) {
      session_regenerate_id(true);
      $_SESSION['username'] = $u['username'];
      $_SESSION['role'] = $u['role'];
      unset($u['password']); respond(true, ['user' => $u]);
    }
  }
  respond(false, ['message' => 'Incorrect admin username or password.']);
}

// Optional local seed accounts may use plain passwords; registered users use a hash.
foreach (read_json('users.json') as $u) {
  if (($u['username'] ?? '') === $username && ($u['role'] ?? '') === $role && isset($u['password']) && $u['password'] === $password) {
    session_regenerate_id(true);
    $_SESSION['username'] = $u['username'];
    $_SESSION['role'] = $u['role'];
    unset($u['password']); respond(true, ['user' => $u]);
  }
}
foreach (read_json('registered-users.json') as $u) {
  if (strtolower($u['username'] ?? '') === strtolower($username) && ($u['role'] ?? '') === $role && !empty($u['password']) && password_verify($password, $u['password'])) {
    session_regenerate_id(true);
    $_SESSION['username'] = $u['username'];
    $_SESSION['role'] = $u['role'];
    unset($u['password']); respond(true, ['user' => $u]);
  }
}
respond(false, ['message' => 'Incorrect username, password, or account type.']);
