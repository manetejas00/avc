<?php
declare(strict_types=1);
error_reporting(0);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$cache = sys_get_temp_dir().'/avc-publisher-news-v3-'.hash('sha256', __DIR__).'.json';
if (is_file($cache) && time()-filemtime($cache)<300) { readfile($cache); exit; }
$articles = [];

// Tier 1: Indian API Live News
$apiKey = getenv('INDIAN_API_KEY') ?: '';
if ($apiKey) {
    $curl = curl_init('https://stock.indianapi.in/news');
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        CURLOPT_HTTPHEADER => [
            'Accept: application/json',
            'x-api-key: ' . $apiKey
        ]
    ]);
    $res = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    curl_close($curl);

    if ($status === 200 && $res) {
        $json = json_decode($res, true);
        if (is_array($json) && count($json) > 0) {
            foreach (array_slice($json, 0, 8) as $index => $item) {
                if (!empty($item['title'])) {
                    $articles[] = [
                        'title' => trim((string)$item['title']),
                        'summary' => trim((string)($item['summary'] ?? $item['title'])),
                        'url' => (string)($item['url'] ?? '#'),
                        'image_url' => (string)($item['image_url'] ?? ''),
                        'pub_date' => (string)($item['pub_date'] ?? ''),
                        'source' => (string)($item['source'] ?? 'Market Live / Indian News'),
                        'topics' => !empty($item['topics']) && is_array($item['topics']) ? $item['topics'] : ['Markets']
                    ];
                }
            }
        }
    }
}

// Tier 2: Marketaux Financial News Fallback
if (count($articles) < 3) {
    $marketauxKey = getenv('MARKETAUX_API_KEY') ?: '';
    if ($marketauxKey) {
        $curl = curl_init('https://api.marketaux.com/v1/news/all?language=en&limit=6&search=Indian+stock+market&api_token=' . urlencode($marketauxKey));
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_USERAGENT => 'Mozilla/5.0'
        ]);
        $res = curl_exec($curl);
        $status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        curl_close($curl);

        if ($status === 200 && $res) {
            $json = json_decode($res, true);
            if (!empty($json['data']) && is_array($json['data'])) {
                foreach (array_slice($json['data'], 0, 6) as $index => $item) {
                    if (!empty($item['title'])) {
                        $articles[] = [
                            'title' => trim((string)$item['title']),
                            'summary' => trim((string)($item['description'] ?? $item['snippet'] ?? $item['title'])),
                            'url' => (string)($item['url'] ?? '#'),
                            'image_url' => (string)($item['image_url'] ?? ''),
                            'pub_date' => (string)($item['published_at'] ?? ''),
                            'source' => (string)($item['source'] ?? 'Marketaux Global'),
                            'topics' => ['Equities']
                        ];
                    }
                }
            }
        }
    }
}

// Official publisher feeds attach the image to its own article; never rotate generic art.
if (count($articles) < 3 && function_exists('curl_multi_init')) {
    $feeds = [
        'BusinessLine' => 'https://www.thehindubusinessline.com/markets/feeder/default.rss',
        'Livemint' => 'https://www.livemint.com/rss/markets'
    ];
    $multi=curl_multi_init(); $handles=[];
    foreach($feeds as $publisher=>$url) {
        $curl=curl_init($url);
        curl_setopt_array($curl,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_CONNECTTIMEOUT=>2,CURLOPT_TIMEOUT=>8,CURLOPT_FOLLOWLOCATION=>true,CURLOPT_MAXREDIRS=>3,CURLOPT_REDIR_PROTOCOLS=>CURLPROTO_HTTPS,CURLOPT_USERAGENT=>'Mozilla/5.0',CURLOPT_SSL_VERIFYPEER=>true]);
        $handles[$publisher]=$curl;curl_multi_add_handle($multi,$curl);
    }
    do {$status=curl_multi_exec($multi,$active);if($active)curl_multi_select($multi,0.2);}while($active&&$status===CURLM_OK);
    foreach($handles as $publisher=>$curl) {
        $body=curl_multi_getcontent($curl);
        if(curl_getinfo($curl,CURLINFO_RESPONSE_CODE)===200 && $body) {
            libxml_use_internal_errors(true);
            $xml=simplexml_load_string($body,'SimpleXMLElement',LIBXML_NONET);
            $count=0;
            if($xml && isset($xml->channel->item))foreach($xml->channel->item as $item) {
                if($count>=4)break;
                $link=trim((string)$item->link);$date=strtotime((string)$item->pubDate);
                if(!preg_match('#^https://#',$link)||!$date)continue;
                $media=$item->children('http://search.yahoo.com/mrss/');
                $image=isset($media->content)?(string)$media->content->attributes()->url:'';
                if(!$image && isset($media->thumbnail))$image=(string)$media->thumbnail->attributes()->url;
                $articles[]=['title'=>trim((string)$item->title),'summary'=>trim(html_entity_decode(strip_tags((string)$item->description),ENT_QUOTES|ENT_HTML5,'UTF-8')),'url'=>$link,'image_url'=>preg_match('#^https://#',$image)?$image:'','pub_date'=>date(DATE_ATOM,$date),'source'=>$publisher,'topics'=>['Markets']];
                $count++;
            }
        }
        curl_multi_remove_handle($multi,$curl);
    }
}

// Tier 3: Google News RSS for Indian Stock Market
if (count($articles) < 3) {
    $curl = curl_init('https://news.google.com/rss/search?q=Indian+Stock+Market+Sensex+Nifty&hl=en-IN&gl=IN&ceid=IN:en');
    curl_setopt_array($curl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    ]);
    $xmlString = curl_exec($curl);
    $status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    curl_close($curl);

    if ($status === 200 && $xmlString) {
        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($xmlString);
        if ($xml && isset($xml->channel->item)) {
            $idx = 0;
            foreach ($xml->channel->item as $item) {
                if ($idx >= 6) break;
                $title = trim((string)$item->title);
                $link = (string)$item->link;
                $pubDate = (string)$item->pubDate;
                $source = (string)($item->source ?? 'Google News India');

                $articles[] = [
                    'title' => $title,
                    'summary' => $title,
                    'url' => $link ?: '#',
                    'image_url' => '',
                    'pub_date' => $pubDate ? date(DATE_ATOM, strtotime($pubDate)) : '',
                    'source' => $source,
                    'topics' => ['Markets']
                ];
                $idx++;
            }
        }
    }
}

usort($articles,fn($a,$b)=>(strtotime($b['pub_date'])?:0)<=>(strtotime($a['pub_date'])?:0));
$seen=[];
$articles=array_values(array_filter($articles,function($item)use(&$seen){if(isset($seen[$item['url']]))return false;$seen[$item['url']]=true;return true;}));
$articles=array_slice($articles,0,6);
http_response_code(200);
$json = json_encode([
    'success' => true,
    'count' => count($articles),
    'data' => $articles
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

if ($articles && $json && count(array_filter($articles,fn($a)=>!empty($a['image_url'])))>=3) {
    $tmp=tempnam(sys_get_temp_dir(),'avc-news-');
    if($tmp!==false){file_put_contents($tmp,$json,LOCK_EX);chmod($tmp,0600);rename($tmp,$cache);}
}
echo $json;
