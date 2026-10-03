<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, x-api-key');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$apiKey = $_SERVER['HTTP_X_API_KEY'] ?? $_GET['api_key'] ?? 'sk-live-LBoaUhnmhsSPCe3J6kof1SQGTGJgWqQoYq87VL3l';
$endpoint = $_GET['endpoint'] ?? 'ipo';

// Allowed endpoints for Indian API proxy
$allowedEndpoints = ['ipo', 'stock', 'market'];
if (!in_array($endpoint, $allowedEndpoints, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Unsupported endpoint']);
    exit;
}

$url = 'https://stock.indianapi.in/' . rawurlencode($endpoint);

$curl = curl_init($url);
curl_setopt_array($curl, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_USERAGENT => 'AVC-Dhanam/1.0',
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
        'x-api-key: ' . $apiKey
    ]
]);

$body = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
curl_close($curl);

if ($status >= 200 && $status < 300 && $body) {
    http_response_code($status);
    echo $body;
} else {
    // Try fallback dev endpoint if primary fails
    $fallbackUrl = 'https://dev.indianapi.in/' . rawurlencode($endpoint);
    $curl2 = curl_init($fallbackUrl);
    curl_setopt_array($curl2, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_USERAGENT => 'AVC-Dhanam/1.0',
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'x-api-key: ' . $apiKey
        ]
    ]);
    $body2 = curl_exec($curl2);
    $status2 = curl_getinfo($curl2, CURLINFO_RESPONSE_CODE);
    curl_close($curl2);

    http_response_code($status2 ?: 502);
    echo $body2 ?: json_encode(['error' => 'Indian API provider unavailable']);
}
