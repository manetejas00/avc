# ==============================================================================
# AVC Dhanam Solutions - Post-Migration Verification & Smoke Test Script
# ==============================================================================
[CmdletBinding()]
param (
    [string]$PrimaryDomain = "avcdhanam.com",
    [string]$LegacyDomain = "test1.avinyacarefoundation.org"
)

$ErrorActionPreference = "Continue"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Running Post-Migration Verification" -ForegroundColor Cyan
Write-Host "Primary Domain: https://$PrimaryDomain" -ForegroundColor Cyan
Write-Host "Legacy Domain:  https://$LegacyDomain" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

function Test-Redirect {
    param (
        [string]$Url,
        [string]$ExpectedLocationPattern,
        [int]$ExpectedStatusCode = 301
    )
    Write-Host "Testing redirect for: $Url" -ForegroundColor Yellow
    try {
        $req = [System.Net.HttpWebRequest]::Create($Url)
        $req.AllowAutoRedirect = $false
        $req.Timeout = 10000
        $req.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) VerificationScript/1.0"
        
        $res = $req.GetResponse()
        $status = [int]$res.StatusCode
        $location = $res.Headers["Location"]
        $res.Close()

        if ($status -eq $ExpectedStatusCode -and $location -match $ExpectedLocationPattern) {
            Write-Host "  [PASS] Status $status -> Location: $location" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  [FAIL] Expected $ExpectedStatusCode -> $ExpectedLocationPattern, got $status -> $location" -ForegroundColor Red
            return $false
        }
    } catch [System.Net.WebException] {
        $resp = $_.Exception.Response
        if ($resp) {
            $status = [int]$resp.StatusCode
            $location = $resp.Headers["Location"]
            if ($status -eq $ExpectedStatusCode -and $location -match $ExpectedLocationPattern) {
                Write-Host "  [PASS] Status $status -> Location: $location" -ForegroundColor Green
                return $true
            } else {
                Write-Host "  [FAIL] Status $status -> Location: $location" -ForegroundColor Red
                return $false
            }
        } else {
            Write-Host "  [ERROR] Connection error: $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  [ERROR] $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Test-UrlStatus {
    param (
        [string]$Url,
        [int]$ExpectedStatusCode = 200,
        [string]$ContentPattern = ""
    )
    Write-Host "Testing endpoint: $Url" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 15
        if ($response.StatusCode -eq $ExpectedStatusCode) {
            if ($ContentPattern -and ($response.Content -notmatch $ContentPattern)) {
                Write-Host "  [FAIL] Status 200 but content did not match: $ContentPattern" -ForegroundColor Red
                return $false
            }
            Write-Host "  [PASS] Status $($response.StatusCode)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "  [FAIL] Expected $ExpectedStatusCode, got $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  [FAIL] Request failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "`n--- 1. Testing Domain 301 Redirects ---" -ForegroundColor Cyan
Test-Redirect -Url "http://$LegacyDomain/" -ExpectedLocationPattern "https://$PrimaryDomain/" -ExpectedStatusCode 301
Test-Redirect -Url "https://$LegacyDomain/" -ExpectedLocationPattern "https://$PrimaryDomain/" -ExpectedStatusCode 301
Test-Redirect -Url "https://$LegacyDomain/services/investments" -ExpectedLocationPattern "https://$PrimaryDomain/services/investments" -ExpectedStatusCode 301
Test-Redirect -Url "https://$LegacyDomain/resources?tab=calc" -ExpectedLocationPattern "https://$PrimaryDomain/resources\?tab=calc" -ExpectedStatusCode 301
Test-Redirect -Url "http://$PrimaryDomain/" -ExpectedLocationPattern "https://$PrimaryDomain/" -ExpectedStatusCode 301
Test-Redirect -Url "https://www.$PrimaryDomain/" -ExpectedLocationPattern "https://$PrimaryDomain/" -ExpectedStatusCode 301

Write-Host "`n--- 2. Testing Core Pages & Assets ---" -ForegroundColor Cyan
Test-UrlStatus -Url "https://$PrimaryDomain/" -ContentPattern "AVC Dhanam Solutions"
Test-UrlStatus -Url "https://$PrimaryDomain/services/investments" -ContentPattern "AVC Dhanam Solutions"
Test-UrlStatus -Url "https://$PrimaryDomain/services/loans" -ContentPattern "AVC Dhanam Solutions"
Test-UrlStatus -Url "https://$PrimaryDomain/services/insurance" -ContentPattern "AVC Dhanam Solutions"
Test-UrlStatus -Url "https://$PrimaryDomain/services/tax" -ContentPattern "AVC Dhanam Solutions"
Test-UrlStatus -Url "https://$PrimaryDomain/robots.txt" -ContentPattern "Sitemap: https://$PrimaryDomain/sitemap.xml"
Test-UrlStatus -Url "https://$PrimaryDomain/sitemap.xml" -ContentPattern "https://$PrimaryDomain/"

Write-Host "`n--- 3. Testing Public API Fallbacks ---" -ForegroundColor Cyan
Test-UrlStatus -Url "https://$PrimaryDomain/api/mutual-funds.php?action=search&q=HDFC" -ExpectedStatusCode 200

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "Verification run finished." -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
