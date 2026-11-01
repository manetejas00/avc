<?php
declare(strict_types=1);
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache');
if(($_SERVER['REQUEST_METHOD']??'GET')!=='GET'){http_response_code(405);echo json_encode(['error'=>'Use GET']);exit;}
$cache=sys_get_temp_dir().'/avc-nse-ipos-'.hash('sha256',__DIR__).'.json';
if(is_file($cache)&&time()-filemtime($cache)<300){readfile($cache);exit;}
$paths=['upcoming'=>'all-upcoming-issues?category=ipo','current'=>'ipo-current-issue','past'=>'public-past-issues'];
$multi=curl_multi_init();$handles=[];
foreach($paths as$key=>$path){$c=curl_init('https://www.nseindia.com/api/'.$path);curl_setopt_array($c,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_CONNECTTIMEOUT=>4,CURLOPT_TIMEOUT=>12,CURLOPT_HTTP_VERSION=>CURL_HTTP_VERSION_1_1,CURLOPT_USERAGENT=>'Mozilla/5.0',CURLOPT_HTTPHEADER=>['Accept: application/json'],CURLOPT_SSL_VERIFYPEER=>true]);curl_multi_add_handle($multi,$c);$handles[$key]=$c;}
do{$status=curl_multi_exec($multi,$running);if($running)curl_multi_select($multi,0.5);}while($running&&$status===CURLM_OK);
$feeds=[];$warnings=[];
foreach($handles as$key=>$c){$body=curl_multi_getcontent($c);$data=json_decode($body,true);if(curl_getinfo($c,CURLINFO_RESPONSE_CODE)===200&&is_array($data)&&array_is_list($data))$feeds[$key]=$data;else$warnings[]=$key.' feed is temporarily unreachable';curl_multi_remove_handle($multi,$c);curl_close($c);}curl_multi_close($multi);
if(!$feeds){if(is_file($cache)&&time()-filemtime($cache)<86400){$old=json_decode(file_get_contents($cache),true);$old['stale']=true;$old['warnings']=$warnings;echo json_encode($old);exit;}http_response_code(503);echo json_encode(['error'=>'The official NSE IPO feed is temporarily unreachable. Please retry.']);exit;}
function isoDate($value): ?string {if(!is_string($value)||!preg_match('/^\d{2}-[a-z]{3}-\d{4}$/i',$value))return null;$d=DateTimeImmutable::createFromFormat('!d-M-Y',$value);return $d?$d->format('Y-m-d'):null;}
function positive($value): ?float {return is_numeric($value)&&is_finite((float)$value)&&(float)$value>0?(float)$value:null;}
$today=(new DateTimeImmutable('now',new DateTimeZone('Asia/Kolkata')))->format('Y-m-d');$cutoff=date('Y-m-d',strtotime($today.' -90 days'));$checked=gmdate(DATE_ATOM);$records=[];
foreach(['past','upcoming','current']as$feed){foreach($feeds[$feed]??[]as$row){
 $symbol=$row['symbol']??'';$name=$row['companyName']??$row['company']??'';$series=$row['series']??$row['securityType']??'';
 if(!is_string($symbol)||!preg_match('/^[A-Z0-9&._-]{1,30}$/D',$symbol)||!is_string($name)||!in_array(strtoupper($series),['EQ','SME'],true))continue;
 $open=isoDate($row['issueStartDate']??$row['ipoStartDate']??null);$close=isoDate($row['issueEndDate']??$row['ipoEndDate']??null);$listing=isoDate($row['listingDate']??null);
 if(!$open||!$close||$open>$close||($feed==='past'&&$close<$cutoff))continue;
 $band=$row['priceBand']??$row['priceRange']??$row['issuePrice']??'';preg_match_all('/\d+(?:\.\d+)?/',str_replace(',','',(string)$band),$matches);$numbers=$matches[0];$min=isset($numbers[0])?positive($numbers[0]):null;$max=isset($numbers[1])?positive($numbers[1]):$min;
 $record=$records[$symbol]??['id'=>strtolower($symbol),'symbol'=>$symbol,'name'=>$name,'issueType'=>strtoupper($series)==='SME'?'SME':'Mainboard','exchanges'=>[!empty($row['isBse'])?'BSE':'NSE'],'openDate'=>$open,'closeDate'=>$close,'minPrice'=>0,'maxPrice'=>0];
 if($min&&$max&&$max>=$min){$record['minPrice']=$min;$record['maxPrice']=$max;}
 if($listing)$record['listingDate']=$listing;
 $record['status']=isset($record['listingDate'])&&$record['listingDate']<=$today?'listed':($today<$open?'upcoming':($today<=$close?'open':'closed'));
 $lot=positive($row['lotSize']??null);if($lot&&floor($lot)===$lot){$record['lotSize']=(int)$lot;}
 $record['sourceUrl']=!empty($row['isBse'])?'https://www.bseindia.com/markets/PublicIssues/IPOIssues_new.aspx?id=1&Type=p':'https://www.nseindia.com/market-data/issue-information?symbol='.rawurlencode($symbol);$record['verifiedAt']=$checked;
 $record['verificationNote']='Source: NSE public issue feeds. Refreshed every five minutes. Bid figures, where supplied, are exchange-reported bid ratios and may differ from final subscription. Missing terms are not estimated. The list covers records returned by NSE, including BSE issues carried in its current-issue feed.';

 $records[$symbol]=$record;
}}
// Enrich active/upcoming terms using the symbol-matched official issue notice.
$multi=curl_multi_init();$details=[];
foreach($records as$symbol=>$record){if(!in_array($record['status'],['open','upcoming'],true)||count($details)>=12)continue;$c=curl_init('https://www.nseindia.com/api/ipo-detail?symbol='.rawurlencode($symbol));curl_setopt_array($c,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_CONNECTTIMEOUT=>3,CURLOPT_TIMEOUT=>8,CURLOPT_HTTP_VERSION=>CURL_HTTP_VERSION_1_1,CURLOPT_USERAGENT=>'Mozilla/5.0',CURLOPT_SSL_VERIFYPEER=>true]);curl_multi_add_handle($multi,$c);$details[$symbol]=$c;}
do{$status=curl_multi_exec($multi,$running);if($running)curl_multi_select($multi,0.5);}while($running&&$status===CURLM_OK);
foreach($details as$symbol=>$c){$detail=json_decode(curl_multi_getcontent($c),true);$info=$detail['issueInfo']??[];
 if(curl_getinfo($c,CURLINFO_RESPONSE_CODE)===200&&($info['symbol']??'')===$symbol){foreach($info['dataList']??[]as$item){$title=$item['title']??'';$value=$item['value']??'';if(!is_string($value))continue;
  if($title==='Bid Lot'&&preg_match('/^([\d,]+)\s+(?:Equity\s+)?Shares/i',$value,$m))$records[$symbol]['lotSize']=(int)str_replace(',','',$m[1]);
  if($title==='Price Range'&&preg_match('/(?:Rs\.?|₹)\s*([\d,.]+)\s*(?:\/-)?\s*to\s*(?:Rs\.?|₹)\s*([\d,.]+)/i',$value,$m)){$records[$symbol]['minPrice']=(float)str_replace(',','',$m[1]);$records[$symbol]['maxPrice']=(float)str_replace(',','',$m[2]);}
  if($title==='Red Herring Prospectus'&&preg_match('~^https://(?:nsearchives|archives)\.nseindia\.com/[^\s<>]+$~D',$value))$records[$symbol]['documents']['rhpUrl']=$value;
  if($title==='Name of the Registrar')$records[$symbol]['registrar']['name']=strip_tags($value);
 }}curl_multi_remove_handle($multi,$c);curl_close($c);
}curl_multi_close($multi);
$list=array_values($records);usort($list,fn($a,$b)=>strcmp($b['openDate'],$a['openDate']));
$json=json_encode(['source'=>'NSE','checkedAt'=>$checked,'stale'=>false,'warnings'=>$warnings,'coverage'=>'Current/upcoming issues and past issues closed within 90 days, as returned by NSE. Not all BSE-only issues are covered.','data'=>$list]);
if(count($feeds)===3&&count($list)>0){$tmp=tempnam(sys_get_temp_dir(),'avc-ipo-');if($tmp){file_put_contents($tmp,$json,LOCK_EX);chmod($tmp,0600);rename($tmp,$cache);}}
echo $json;
