<?php
// Tiny JSON-file "storage" helpers shared by every endpoint.
header('Content-Type: application/json');

function respond($ok, $payload = []) {
  echo json_encode(array_merge(['ok' => $ok], $payload));
  exit;
}

function body() {
  $d = json_decode(file_get_contents('php://input'), true);
  return is_array($d) ? $d : [];
}

function data_path($name) { return __DIR__ . '/../data/' . $name; }

function read_json($name) {
  $d = json_decode(@file_get_contents(data_path($name)), true);
  return is_array($d) ? $d : [];
}

// Locked read-modify-write so two requests can't overwrite each other.
function update_json($name, $fn) {
  $path = data_path($name);
  $fp = @fopen($path, 'c+');
  if (!$fp) respond(false, ['message' => "Cannot write data/$name - check file permissions."]);
  flock($fp, LOCK_EX);
  $cur = json_decode(stream_get_contents($fp), true);
  if (!is_array($cur)) $cur = [];
  $new = $fn($cur);
  ftruncate($fp, 0);
  rewind($fp);
  fwrite($fp, json_encode($new, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
  fflush($fp);
  flock($fp, LOCK_UN);
  fclose($fp);
  return $new;
}
