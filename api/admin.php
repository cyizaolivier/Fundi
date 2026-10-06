<?php
// Read-only overview for the demo/report - lists users, fundis and
// bookings. There is no admin auth in this project (no login tokens
// exist anywhere in the app); this is a demo convenience only.
require __DIR__ . '/_store.php';
$strip = fn($u) => array_diff_key($u, ['password' => 0, 'phone' => 0, 'email' => 0]);
$users = array_merge(
  array_map($strip, read_json('users.json')),
  array_map($strip, read_json('registered-users.json'))
);
respond(true, [
  'users' => $users,
  'bookings' => read_json('bookings.json'),
  'reviews' => read_json('reviews.json'),
]);
