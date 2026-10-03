<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');

$query = $_GET['q'] ?? 'stock market India';
$curl = curl_init('https://query1.finance.yahoo.com/v1/finance/search?q=' . rawurlencode($query) . '&newsCount=12');
curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15, CURLOPT_USERAGENT => 'AVC-Dhanam/1.0']);
$body = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
curl_close($curl);
http_response_code($status ?: 502);
echo $body ?: json_encode(['error' => 'News provider unavailable']);
