<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');

$token = $_GET['api_token'] ?? '';
if ($token === '') {
  http_response_code(400);
  echo json_encode(['error' => 'News provider token missing']);
  exit;
}
$params = [
  'api_token' => $token,
  'language' => $_GET['language'] ?? 'en',
  'limit' => min(max((int) ($_GET['limit'] ?? 12), 1), 12),
  'search' => $_GET['search'] ?? 'stock market',
];
$curl = curl_init('https://api.marketaux.com/v1/news/all?' . http_build_query($params));
curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15, CURLOPT_USERAGENT => 'AVC-Dhanam/1.0']);
$body = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
curl_close($curl);
http_response_code($status ?: 502);
echo $body ?: json_encode(['error' => 'News provider unavailable']);
