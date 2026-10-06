<?php
require __DIR__ . '/_store.php';
$in = body();
$username = trim($in['username'] ?? '');

if (($in['action'] ?? '') === 'contact') {
  $email = trim($in['email'] ?? '');
  $phone = trim($in['phone'] ?? '');
  session_start();
  if (strtolower($_SESSION['username'] ?? '') !== strtolower($username) || !in_array($_SESSION['role'] ?? '', ['client', 'fundi'], true)) {
    respond(false, ['message' => 'Please sign in to update your contact details.']);
  }
  if ($username === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^(?:\+?250|0)?7[0-9]{8}$/', $phone)) {
    respond(false, ['message' => 'Enter a valid email address and phone number.']);
  }

  $sources = ['registered-users.json', 'users.json'];
  foreach ($sources as $source) {
    $users = read_json($source);
    foreach ($users as $user) {
      if (strtolower($user['username']) === strtolower($username)) {
        update_json($source, function ($all) use ($username, $email, $phone) {
          foreach ($all as &$item) {
            if (strtolower($item['username']) === strtolower($username)) {
              $item['email'] = $email;
              $item['phone'] = $phone;
            }
          }
          return $all;
        });
        respond(true);
      }
    }
  }
  respond(false, ['message' => 'Account not found.']);
}

$rate = (int)($in['rate'] ?? 0);
$availability = trim($in['availability'] ?? '');
$bio = trim($in['bio'] ?? '');
if ($username === '' || $rate < 500 || $availability === '' || strlen($bio) < 10) respond(false, ['message' => 'Invalid profile details.']);
update_json('profiles.json', function ($all) use ($username, $rate, $availability, $bio) {
  $all[$username] = ['rate' => $rate, 'availability' => $availability, 'bio' => $bio];
  return $all;
});
respond(true);
