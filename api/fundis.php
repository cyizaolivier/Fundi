<?php
// Public list of fundis: demo fundis + everyone who registered as a fundi,
// with any profile edits (rate, availability, bio) applied on top, and a
// live average rating computed from data/reviews.json where available.
require __DIR__ . '/_store.php';
$profiles = read_json('profiles.json');
$reviews = read_json('reviews.json');
$list = read_json('fundis.json');
$have = array_map(fn($f) => strtolower($f['username']), $list);

foreach (read_json('registered-users.json') as $u) {
  if ($u['role'] !== 'fundi' || in_array(strtolower($u['username']), $have, true)) continue;
  $list[] = ['id' => 'r-' . $u['username'], 'username' => $u['username'], 'name' => $u['name'],
             'trade' => $u['trade'] ?? 'Other', 'location' => $u['location'] ?? '',
             'rate' => null, 'rateUnit' => 'per hour', 'rating' => null, 'bio' => ''];
}

foreach ($list as &$f) {
  if (isset($profiles[$f['username']])) $f = array_merge($f, $profiles[$f['username']]);
  $mine = array_values(array_filter($reviews, fn($r) => $r['fundiUsername'] === $f['username']));
  if (count($mine) > 0) {
    $f['rating'] = round(array_sum(array_map(fn($r) => $r['rating'], $mine)) / count($mine), 1);
    $f['reviewCount'] = count($mine);
  } else {
    $f['reviewCount'] = 0;
  }
}
respond(true, ['fundis' => $list]);
