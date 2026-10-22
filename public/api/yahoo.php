<?php
declare(strict_types=1);
error_reporting(0);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=180');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$symbol = trim($_GET['symbol'] ?? '^NSEI');
if (!preg_match('/^[A-Za-z0-9\.\^\=\-_]{1,15}$/', $symbol)) {
  http_response_code(400);
  echo json_encode(['error' => 'Unsupported market symbol format']);
  exit;
}

$range = $_GET['range'] ?? '3mo';
$interval = $_GET['interval'] ?? '1d';
$url = 'https://query1.finance.yahoo.com/v8/finance/chart/' . rawurlencode($symbol) . '?range=' . rawurlencode($range) . '&interval=' . rawurlencode($interval);

$curl = curl_init($url);
curl_setopt_array($curl, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_TIMEOUT => 15,
  CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
]);
$body = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
curl_close($curl);

http_response_code($status ?: 502);
echo $body ?: json_encode(['error' => 'Market provider unavailable']);
