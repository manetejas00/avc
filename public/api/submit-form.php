<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
function callbackReply(int $status, array $data): void { http_response_code($status); echo json_encode($data); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { callbackReply(405, ['error' => 'Use the callback form to submit a request.']); }
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== explode(':', $_SERVER['HTTP_HOST'] ?? '')[0]) { callbackReply(403, ['error' => 'Cross-site request rejected.']); }
$raw = file_get_contents('php://input', false, null, 0, 32769);
if (!is_string($raw) || strlen($raw) > 32768) { callbackReply(400, ['error' => 'Request too large.']); }
$data = json_decode($raw, true);
if (!is_array($data)) { callbackReply(400, ['error' => 'Invalid form data.']); }
$values = [];
foreach (['name' => 120, 'phone' => 25, 'email' => 254, 'interest' => 150, 'preferredTime' => 150, 'message' => 5000] as $field => $max) {
    if (isset($data[$field]) && !is_string($data[$field])) { callbackReply(400, ['error' => 'Form fields must be text.']); }
    $values[$field] = trim($data[$field] ?? '');
    if (strlen($values[$field]) > $max) { callbackReply(400, ['error' => 'A form field is too long.']); }
}
if ($values['name'] === '' || !preg_match('/^\+?[\d\s()\-]{7,25}$/', $values['phone']) || strlen(preg_replace('/\D/', '', $values['phone'])) < 7 || ($values['email'] !== '' && !filter_var($values['email'], FILTER_VALIDATE_EMAIL))) { callbackReply(400, ['error' => 'Enter a valid name and phone. Email is optional.']); }
// Static hosting must never report success without a configured delivery destination.
$recipient = getenv('CALLBACK_TO_EMAIL') ?: '';
$sender = getenv('CALLBACK_FROM_EMAIL') ?: '';
if (!filter_var($recipient, FILTER_VALIDATE_EMAIL) || !filter_var($sender, FILTER_VALIDATE_EMAIL) || !function_exists('mail')) { callbackReply(503, ['error' => 'Online callback delivery is not available. Please send these details on WhatsApp or call +91 7030247878.']); }
$lock = @fopen(sys_get_temp_dir() . '/avc-callback-' . hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown'), 'c+');
if (!$lock || !flock($lock, LOCK_EX)) { callbackReply(503, ['error' => 'Please use WhatsApp or call to request a callback.']); }
$state = json_decode(stream_get_contents($lock), true) ?: ['start' => time(), 'count' => 0];
if ($state['start'] < time() - 900) { $state = ['start' => time(), 'count' => 0]; }
if ($state['count'] >= 3) { flock($lock, LOCK_UN); fclose($lock); callbackReply(429, ['error' => 'Too many requests. Please call or try again later.']); }
$state['count']++; rewind($lock); ftruncate($lock, 0); fwrite($lock, json_encode($state)); flock($lock, LOCK_UN); fclose($lock);
$text = "Callback request\n";
foreach ($values as $field => $value) { $text .= $field . ': ' . $value . "\n"; }
if (!mail($recipient, 'Website callback request', $text, ['From' => $sender, 'Content-Type' => 'text/plain; charset=UTF-8'])) { callbackReply(503, ['error' => 'Delivery was not accepted. Please send your request on WhatsApp or call.']); }
callbackReply(200, ['success' => true, 'delivery' => 'mail_accepted']);
