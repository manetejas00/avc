<?php
declare(strict_types=1);
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=3600');

function failDirectory(int $status): void {
    http_response_code($status);
    header('Cache-Control: no-store');
    echo json_encode(['error' => 'Company directory is temporarily unavailable.']);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') failDirectory(405);
$cache = sys_get_temp_dir() . '/avc-directory-' . hash('sha256', __DIR__) . '.json';
if (is_file($cache) && time() - filemtime($cache) < 3600) { readfile($cache); exit; }
if (!function_exists('curl_init')) failDirectory(503);
$curl = curl_init('https://scanner.tradingview.com/india/scan');
curl_setopt_array($curl, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 3,
    CURLOPT_TIMEOUT => 8,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode([
        'filter' => [
            ['left' => 'type', 'operation' => 'equal', 'right' => 'stock'],
            ['left' => 'exchange', 'operation' => 'in_range', 'right' => ['BSE']],
        ],
        'options' => ['lang' => 'en'],
        'symbols' => ['query' => ['types' => []], 'tickers' => []],
        'columns' => ['name', 'description', 'exchange'],
        'sort' => ['sortBy' => 'name', 'sortOrder' => 'asc'],
        'range' => [0, 10000],
    ]),
    CURLOPT_SSL_VERIFYPEER => true,
]);
$body = curl_exec($curl);
$status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
curl_close($curl);
$payload = is_string($body) ? json_decode($body, true) : null;
if ($status !== 200 || !is_array($payload['data'] ?? null) || !$payload['data']) failDirectory(503);
$json = json_encode($payload);
if ($json === false) failDirectory(503);
$temporary = tempnam(sys_get_temp_dir(), 'avc-directory-');
if ($temporary !== false) {
    file_put_contents($temporary, $json, LOCK_EX);
    chmod($temporary, 0600);
    rename($temporary, $cache);
}
echo $json;
