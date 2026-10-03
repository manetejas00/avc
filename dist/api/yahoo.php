<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');

$symbol = $_GET['symbol'] ?? '^NSEI';
$allowed = ['^NSEI', '^BSESN', '^GSPC', '^IXIC', 'GC=F', 'INR=X'];
if (!in_array($symbol, $allowed, true)) {
  http_response_code(400);
  echo json_encode(['error' => 'Unsupported market symbol']);
  exit;
}

$range = $_GET['range'] ?? '3mo';
$interval = $_GET['interval'] ?? '1d';
$url = 'https://query1.finance.yahoo.com/v8/finance/chart/' . rawurlencode($symbol) . '?range=' . rawurlencode($range) . '&interval=' . rawurlencode($interval);
$curl = curl_init($url);
curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15, CURLOPT_USERAGENT => 'AVC-Dhanam/1.0']);
$body = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
curl_close($curl);
http_response_code($status ?: 502);
echo $body ?: json_encode(['error' => 'Market provider unavailable']);
