#!/usr/bin/env bash
# ==============================================================================
# AVC Dhanam Solutions - Post-Migration Verification Script (Bash / cURL)
# ==============================================================================
set -u

PRIMARY_DOMAIN="avcdhanam.com"
LEGACY_DOMAIN="test1.avinyacarefoundation.org"

echo "========================================================"
echo "Starting Migration Verification"
echo "Primary Domain: https://${PRIMARY_DOMAIN}"
echo "Legacy Domain:  https://${LEGACY_DOMAIN}"
echo "========================================================"

pass_count=0
fail_count=0

check_redirect() {
    local url="$1"
    local expected_pattern="$2"
    echo -n "Checking 301 redirect: ${url} ... "
    local location
    location=$(curl -s -o /dev/null -w "%{redirect_url}" "${url}" || true)
    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" "${url}" || true)

    if [[ "$status" =~ ^30[1278]$ ]] && [[ "$location" =~ $expected_pattern ]]; then
        echo "PASS ($status -> $location)"
        ((pass_count++))
    else
        echo "FAIL (Got status: $status, Location: $location, Expected: $expected_pattern)"
        ((fail_count++))
    fi
}

check_http_200() {
    local url="$1"
    echo -n "Checking endpoint: ${url} ... "
    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" -L "${url}" || true)
    if [[ "$status" == "200" ]]; then
        echo "PASS (HTTP 200)"
        ((pass_count++))
    else
        echo "FAIL (HTTP $status)"
        ((fail_count++))
    fi
}

echo ""
echo "--- 1. Testing Redirects ---"
check_redirect "http://${LEGACY_DOMAIN}/" "https://${PRIMARY_DOMAIN}/"
check_redirect "https://${LEGACY_DOMAIN}/" "https://${PRIMARY_DOMAIN}/"
check_redirect "https://${LEGACY_DOMAIN}/services/investments" "https://${PRIMARY_DOMAIN}/services/investments"
check_redirect "https://${LEGACY_DOMAIN}/resources?tab=calc" "https://${PRIMARY_DOMAIN}/resources\?tab=calc"
check_redirect "http://${PRIMARY_DOMAIN}/" "https://${PRIMARY_DOMAIN}/"
check_redirect "https://www.${PRIMARY_DOMAIN}/" "https://${PRIMARY_DOMAIN}/"

echo ""
echo "--- 2. Testing Core Endpoints ---"
check_http_200 "https://${PRIMARY_DOMAIN}/"
check_http_200 "https://${PRIMARY_DOMAIN}/services/investments"
check_http_200 "https://${PRIMARY_DOMAIN}/services/loans"
check_http_200 "https://${PRIMARY_DOMAIN}/services/insurance"
check_http_200 "https://${PRIMARY_DOMAIN}/services/tax"
check_http_200 "https://${PRIMARY_DOMAIN}/robots.txt"
check_http_200 "https://${PRIMARY_DOMAIN}/sitemap.xml"

echo ""
echo "========================================================"
echo "Verification Summary: ${pass_count} passed, ${fail_count} failed"
echo "========================================================"

if [ "$fail_count" -gt 0 ]; then
    exit 1
fi
exit 0
