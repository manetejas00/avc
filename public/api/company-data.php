<?php
declare(strict_types=1);
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');
function failCompany(int $status,string $message): void {http_response_code($status);header('Cache-Control: no-store');echo json_encode(['error'=>$message]);exit;}
if(($_SERVER['REQUEST_METHOD']??'GET')!=='GET')failCompany(405,'Use GET');
$ticker=$_GET['symbol']??'';$exchange=$_GET['exchange']??'BSE';$mode=$_GET['mode']??'profile';
if(!is_string($ticker)||!preg_match('/^[A-Z0-9][A-Z0-9.&_-]{0,24}$/D',$ticker)||!in_array($exchange,['NSE','BSE'],true)||!in_array($mode,['profile','dividends'],true))failCompany(400,'Choose a valid NSE or BSE symbol.');
$symbol=$exchange.':'.$ticker;
$columns=$mode==='profile'?['name','description','exchange','currency','close','RSI','price_earnings_ttm','sector','industry','price_52_week_high','price_52_week_low','update_time','update_mode','volume']:['dividend_ex_date_upcoming','dividend_payment_date_upcoming','dividend_amount_upcoming','dividend_yield_upcoming','dividend_frequency_upcoming','dividend_ex_date_recent','dividend_payment_date_recent','dividend_amount_recent','dividend_yield_recent','dividend_frequency_recent'];
$dir=sys_get_temp_dir().'/avc-company-'.hash('sha256',__DIR__);
if(!is_dir($dir))@mkdir($dir,0700,true);
$cache=$dir.'/'.hash('sha256',$symbol.':'.$mode).'.json';
if(is_file($cache)&&time()-filemtime($cache)<300){readfile($cache);exit;}
if(!function_exists('curl_init'))failCompany(503,'Company feed cannot be reached.');
$curl=curl_init('https://scanner.tradingview.com/india/scan');
curl_setopt_array($curl,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_CONNECTTIMEOUT=>3,CURLOPT_TIMEOUT=>8,CURLOPT_POST=>true,CURLOPT_HTTPHEADER=>['Content-Type: application/json'],CURLOPT_POSTFIELDS=>json_encode(['symbols'=>['tickers'=>[$symbol]],'columns'=>$columns]),CURLOPT_SSL_VERIFYPEER=>true]);
$raw=curl_exec($curl);$status=curl_getinfo($curl,CURLINFO_RESPONSE_CODE);
if($status!==200||!is_string($raw))failCompany(503,'Company feed is temporarily unreachable. Please retry.');
$payload=json_decode($raw,true);$row=$payload['data'][0]??null;
if(!$row||($row['s']??'')!==$symbol||!isset($row['d'])||count($row['d'])!==count($columns))failCompany(404,'The provider has no record for this exchange and symbol.');
$values=array_combine($columns,$row['d']);
$result=['symbol'=>$symbol,'source'=>'TradingView','checkedAt'=>gmdate(DATE_ATOM),'values'=>$values];
$json=json_encode($result);
if($json&&is_dir($dir)){
 $files=glob($dir.'/*.json')?:[];
 if(count($files)>=100){usort($files,fn($a,$b)=>filemtime($a)<=>filemtime($b));foreach(array_slice($files,0,count($files)-99)as$file)@unlink($file);}
 $tmp=tempnam($dir,'pending-');if($tmp!==false){file_put_contents($tmp,$json,LOCK_EX);chmod($tmp,0600);rename($tmp,$cache);}
}
echo $json;
