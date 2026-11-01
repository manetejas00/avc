<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');
function mfFail(int $status): void { http_response_code($status); header('Cache-Control: no-store'); echo json_encode(['error' => 'Mutual fund data unavailable']); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') { mfFail(405); }
if (isset($_GET['q']) && !is_string($_GET['q']) || isset($_GET['code']) && !is_string($_GET['code'])) { mfFail(400); }
if (($_GET['action'] ?? '') === 'search') {
    $query = trim((string)($_GET['q'] ?? ''));
    if (strlen($query) < 3 || strlen($query) > 80) { mfFail(400); }
    $path = '/mf/search?q=' . rawurlencode($query);
} else {
    $code = (string)($_GET['code'] ?? '');
    if (!preg_match('/^\d{4,8}$/', $code)) { mfFail(400); }
    $path = '/mf/' . $code;
}
$file = sys_get_temp_dir() . '/avc-mf-' . hash('sha256', $path) . '.json';
if (is_file($file) && filemtime($file) > time() - 3600) { readfile($file); exit; }
if (!function_exists('curl_init')) { mfFail(503); }
$curl = curl_init('https://api.mfapi.in' . $path);
curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => 15, CURLOPT_HTTPHEADER => ['Accept: application/json'], CURLOPT_USERAGENT => 'AVC-Dhanam-Fund-Explorer/1.0']);
$body = curl_exec($curl); $status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE); curl_close($curl);
if ($status !== 200 || !is_string($body)) { mfFail(502); }
$data = json_decode($body, true);
if (!is_array($data) || isset($data['error'])) { mfFail(502); }
// Cache public provider data only; never store enquiry or identity information here.
if (strlen($body) < 5000000) { @file_put_contents($file, $body, LOCK_EX); }
echo $body;
