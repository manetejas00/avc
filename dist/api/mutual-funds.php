<?php
declare(strict_types=1);
ini_set('display_errors','0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');
function unavailable(): void { http_response_code(503); header('Cache-Control: no-store'); echo json_encode(['error'=>'Data unavailable']); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') { http_response_code(405); exit; }
if (!function_exists('curl_init')) unavailable();
function cachedFetch(string $url, int $ttl): string {
    $dir = sys_get_temp_dir() . '/avc-public-fund-data-v1';
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    $path = $dir . '/' . hash('sha256', $url);
    if (is_file($path) && time() - filemtime($path) < $ttl) return (string)file_get_contents($path);
    $curl = curl_init($url);
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER=>true, CURLOPT_CONNECTTIMEOUT=>4, CURLOPT_TIMEOUT=>12, CURLOPT_FOLLOWLOCATION=>false, CURLOPT_USERAGENT=>'AVC Dhanam public NAV lookup', CURLOPT_SSL_VERIFYPEER=>true]);
    $body = curl_exec($curl); $status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE); curl_close($curl);
    if ($status !== 200 || !is_string($body) || strlen($body) > 10000000) throw new RuntimeException('Unavailable');
    if (is_dir($dir)) {
        $files = glob($dir . '/*') ?: [];
        if (count($files) >= 100) { usort($files, fn($a,$b)=>filemtime($a)<=>filemtime($b)); foreach(array_slice($files,0,count($files)-99) as $old) @unlink($old); }
        $tmp = tempnam($dir, 'pending-');
        if ($tmp !== false) { file_put_contents($tmp, $body, LOCK_EX); chmod($tmp, 0600); rename($tmp, $path); }
    }
    return $body;
}
try {
    if (isset($_GET['q']) && is_string($_GET['q'])) {
        $query = trim($_GET['q']);
        if (strlen($query)<3 || strlen($query)>80) { http_response_code(400); echo json_encode(['error'=>'Enter 3–80 characters']); exit; }
        $data = json_decode(cachedFetch('https://api.mfapi.in/mf/search?q='.rawurlencode($query),3600),true,512,JSON_THROW_ON_ERROR);
        if (!is_array($data) || !array_is_list($data)) unavailable();
        echo json_encode(array_slice($data,0,30)); exit;
    }
    $code = $_GET['code'] ?? '';
    if (!is_string($code) || !preg_match('/^\d{5,8}$/D',$code)) { http_response_code(400); echo json_encode(['error'=>'Invalid scheme code']); exit; }
    $data = json_decode(cachedFetch('https://api.mfapi.in/mf/'.$code,3600),true,512,JSON_THROW_ON_ERROR);
    if (empty($data['meta']['scheme_name']) || empty($data['data']) || (string)($data['meta']['scheme_code'] ?? '') !== $code) unavailable();
    $data['source'] = 'MFapi.in';
    $data['amfi'] = ['status'=>'unavailable','source'=>'https://portal.amfiindia.com/spages/NAVAll.txt'];
    try {
        $text = cachedFetch('https://portal.amfiindia.com/spages/NAVAll.txt',3600);
        foreach (explode("\n",$text) as $row) {
            $fields=explode(';',trim($row));
            if (count($fields)>=6 && $fields[0]===$code && is_numeric($fields[count($fields)-2])) {
                $data['amfi'] = ['status'=>'available','nav'=>(float)$fields[count($fields)-2], 'date'=>$fields[count($fields)-1], 'source'=>'https://portal.amfiindia.com/spages/NAVAll.txt']; break;
            }
        }
    } catch (Throwable $ignored) { /* A failed cross-check is reported, never implied to have passed. */ }
    echo json_encode($data,JSON_THROW_ON_ERROR);
} catch (Throwable $error) { unavailable(); }
