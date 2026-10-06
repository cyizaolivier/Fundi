<?php
// Reviews: a client can review a fundi only after a booking between them
// is marked "completed", and only once per booking.
require __DIR__ . '/_store.php';
$in = body();
$action = $in['action'] ?? 'list';

if ($action === 'add') {
  $bookingId = $in['bookingId'] ?? '';
  $clientUsername = trim($in['clientUsername'] ?? '');
  $rating = (int)($in['rating'] ?? 0);
  $comment = trim($in['comment'] ?? '');

  if ($rating < 1 || $rating > 5) respond(false, ['message' => 'Rating must be between 1 and 5.']);

  $booking = null;
  foreach (read_json('bookings.json') as $b) if ($b['id'] === $bookingId) { $booking = $b; break; }
  if (!$booking) respond(false, ['message' => 'Booking not found.']);
  if ($booking['clientUsername'] !== $clientUsername) respond(false, ['message' => 'This booking does not belong to you.']);
  if ($booking['status'] !== 'completed') respond(false, ['message' => 'You can only review a completed booking.']);

  foreach (read_json('reviews.json') as $r) {
    if ($r['bookingId'] === $bookingId) respond(false, ['message' => 'You already reviewed this booking.']);
  }

  $review = ['id' => 'rv' . round(microtime(true) * 1000), 'bookingId' => $bookingId,
    'clientUsername' => $clientUsername, 'fundiUsername' => $booking['fundiUsername'],
    'rating' => $rating, 'comment' => $comment, 'date' => date('Y-m-d')];
  update_json('reviews.json', function ($all) use ($review) { $all[] = $review; return $all; });
  respond(true, ['review' => $review]);
}

$fundiUsername = $in['fundiUsername'] ?? null;
$all = read_json('reviews.json');
if ($fundiUsername) $all = array_values(array_filter($all, fn($r) => $r['fundiUsername'] === $fundiUsername));
respond(true, ['reviews' => $all]);
