<?php
require __DIR__ . '/_store.php';
$in = body();
$action = $in['action'] ?? 'list';

if ($action === 'add') {
  $b = $in['booking'] ?? [];
  foreach (['clientUsername', 'fundiUsername', 'category', 'date', 'description'] as $k) {
    if (empty($b[$k])) respond(false, ['message' => 'Missing booking details.']);
  }
  $b = ['id' => 'b' . round(microtime(true) * 1000), 'clientUsername' => $b['clientUsername'], 'fundiUsername' => $b['fundiUsername'],
        'category' => $b['category'], 'date' => $b['date'], 'description' => $b['description'], 'status' => 'pending'];
  update_json('bookings.json', function ($all) use ($b) { $all[] = $b; return $all; });
  respond(true, ['booking' => $b]);
}

if ($action === 'status') {
  $id = $in['id'] ?? ''; $status = $in['status'] ?? ''; $actingUsername = $in['actingUsername'] ?? '';
  $allowed = ['accepted', 'declined', 'pending', 'completed', 'cancelled'];
  if (!in_array($status, $allowed, true)) respond(false, ['message' => 'Bad status.']);

  // Lightweight ownership check: a fundi may only act on their own bookings,
  // a client may only cancel their own pending booking. No login tokens
  // exist in this app, so this trusts the username the client sends - the
  // same trust level as the rest of this JSON-file backend.
  $target = null;
  foreach (read_json('bookings.json') as $x) if ($x['id'] === $id) { $target = $x; break; }
  if (!$target) respond(false, ['message' => 'Booking not found.']);
  if ($status === 'cancelled' && $target['clientUsername'] !== $actingUsername) respond(false, ['message' => 'Not your booking.']);
  if (in_array($status, ['accepted', 'declined', 'completed'], true) && $target['fundiUsername'] !== $actingUsername) respond(false, ['message' => 'Not your booking.']);

  update_json('bookings.json', function ($all) use ($id, $status) {
    foreach ($all as &$x) if ($x['id'] === $id) $x['status'] = $status;
    return $all;
  });
  respond(true);
}

$viewerUsername = strtolower(trim($in['viewerUsername'] ?? ''));
$bookings = read_json('bookings.json');
$viewerRole = '';
if ($viewerUsername !== '') {
  session_start();
  if (strtolower($_SESSION['username'] ?? '') === $viewerUsername) $viewerRole = $_SESSION['role'] ?? '';
}
if ($viewerUsername !== '' && in_array($viewerRole, ['client', 'fundi'], true)) {
  $users = array_merge(read_json('registered-users.json'), read_json('users.json'));
  foreach ($bookings as &$booking) {
    if (($booking['status'] ?? '') !== 'accepted') continue;
    $client = strtolower($booking['clientUsername'] ?? '');
    $fundi = strtolower($booking['fundiUsername'] ?? '');
    if (($viewerRole === 'client' && $viewerUsername !== $client) || ($viewerRole === 'fundi' && $viewerUsername !== $fundi)) continue;
    $otherUsername = $viewerUsername === $client ? $booking['fundiUsername'] : $booking['clientUsername'];
    foreach ($users as $user) {
      if (strtolower($user['username']) !== strtolower($otherUsername)) continue;
      $booking['otherContact'] = [
        'name' => $user['name'] ?? $otherUsername,
        'email' => $user['email'] ?? '',
        'phone' => $user['phone'] ?? '',
      ];
      break;
    }
  }
  unset($booking);
}
respond(true, ['bookings' => $bookings]);
