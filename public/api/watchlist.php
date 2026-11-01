<?php
declare(strict_types=1);
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=180');
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') { http_response_code(405); exit; }
$symbols=['RELIANCE.NS','TCS.NS','HDFCBANK.NS','ICICIBANK.NS','INFY.NS','ITC.NS','SBIN.NS','BHARTIARTL.NS','HINDUNILVR.NS','KOTAKBANK.NS','AXISBANK.NS','HCLTECH.NS'];
$cache=sys_get_temp_dir().'/avc-watchlist-'.hash('sha256',__DIR__).'.json';
if(is_file($cache)&&time()-filemtime($cache)<180){readfile($cache);exit;}
if(!function_exists('curl_multi_init')) {http_response_code(503);echo '{"error":"Data unavailable"}';exit;}
$multi=curl_multi_init();$handles=[];
foreach($symbols as $symbol){
 $curl=curl_init('https://query1.finance.yahoo.com/v8/finance/chart/'.rawurlencode($symbol).'?range=5d&interval=1d');
 curl_setopt_array($curl,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_CONNECTTIMEOUT=>3,CURLOPT_TIMEOUT=>9,CURLOPT_USERAGENT=>'Mozilla/5.0',CURLOPT_SSL_VERIFYPEER=>true]);
 $handles[$symbol]=$curl;curl_multi_add_handle($multi,$curl);
}
do { $status=curl_multi_exec($multi,$active); if($active)curl_multi_select($multi,0.2); }while($active&&$status===CURLM_OK);
$data=[];
foreach($handles as $symbol=>$curl){
 if(curl_getinfo($curl,CURLINFO_RESPONSE_CODE)===200){
  $value=json_decode(curl_multi_getcontent($curl),true);
  if(!empty($value['chart']['result'][0]['meta']['regularMarketPrice'])&&($value['chart']['result'][0]['meta']['symbol']??'')===$symbol)$data[]=['symbol'=>$symbol,'result'=>$value['chart']['result'][0]];
 }
 curl_multi_remove_handle($multi,$curl);
}
if(!$data){http_response_code(503);header('Cache-Control: no-store');echo '{"error":"Data unavailable"}';exit;}
$json=json_encode(['source'=>'Yahoo Finance','watchlist'=>$symbols,'data'=>$data]);
$tmp=tempnam(sys_get_temp_dir(),'avc-watchlist-');
if($tmp!==false){file_put_contents($tmp,$json,LOCK_EX);chmod($tmp,0600);rename($tmp,$cache);}
echo $json;
