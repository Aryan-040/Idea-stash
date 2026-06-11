#!/bin/bash
set -euo pipefail

BASE="http://localhost:3000/api/v1"
TESTUSER="tu$(date +%s | tail -c 6)"
FAIL=0

check() {
  local name="$1"
  local expected="$2"
  local actual="$3"
  if [ "$actual" = "$expected" ]; then
    echo "PASS: $name (HTTP $actual)"
  else
    echo "FAIL: $name (expected HTTP $expected, got $actual)"
    FAIL=1
  fi
}

echo "=== E2E API Verification ==="
echo "Username: $TESTUSER"

CODE=$(curl -s -o /tmp/signup.json -w "%{http_code}" -X POST "$BASE/signup" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TESTUSER\",\"password\":\"pass123\"}")
check "Signup" "201" "$CODE"

CODE=$(curl -s -o /tmp/signin.json -w "%{http_code}" -X POST "$BASE/signin" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TESTUSER\",\"password\":\"pass123\"}")
check "Signin" "200" "$CODE"
TOKEN=$(python3 -c "import json; print(json.load(open('/tmp/signin.json'))['token'])")

CODE=$(curl -s -o /tmp/preview.json -w "%{http_code}" -X GET "$BASE/content/preview?url=https://github.com/facebook/react" \
  -H "Authorization: $TOKEN")
check "Link preview (GitHub)" "200" "$CODE"

CODE=$(curl -s -o /tmp/create.json -w "%{http_code}" -X POST "$BASE/content" \
  -H "Content-Type: application/json" \
  -H "Authorization: $TOKEN" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","tags":["test","demo"]}')
check "Create content (auto-detect)" "200" "$CODE"
python3 -c "import json; d=json.load(open('/tmp/create.json')); assert d['content']['contentType']=='youtube'"

CODE=$(curl -s -o /tmp/get.json -w "%{http_code}" -X GET "$BASE/content" \
  -H "Authorization: $TOKEN")
check "Get content" "200" "$CODE"
CONTENT_ID=$(python3 -c "import json; print(json.load(open('/tmp/get.json'))['content'][0]['_id'])")

CODE=$(curl -s -o /tmp/coll.json -w "%{http_code}" -X POST "$BASE/collections" \
  -H "Content-Type: application/json" \
  -H "Authorization: $TOKEN" \
  -d '{"name":"DSA"}')
check "Create collection" "201" "$CODE"
COLL_ID=$(python3 -c "import json; print(json.load(open('/tmp/coll.json'))['collection']['_id'])")

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/content/move" \
  -H "Content-Type: application/json" \
  -H "Authorization: $TOKEN" \
  -d "{\"contentId\":\"$CONTENT_ID\",\"collectionId\":\"$COLL_ID\"}")
check "Move content to collection" "200" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE/tags" \
  -H "Authorization: $TOKEN")
check "Get tags" "200" "$CODE"

CODE=$(curl -s -o /tmp/search.json -w "%{http_code}" -X GET "$BASE/search?q=test" \
  -H "Authorization: $TOKEN")
check "Text search" "200" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE/dashboard/stats" \
  -H "Authorization: $TOKEN")
check "Dashboard stats" "200" "$CODE"

CODE=$(curl -s -o /tmp/share.json -w "%{http_code}" -X POST "$BASE/share" \
  -H "Content-Type: application/json" \
  -H "Authorization: $TOKEN" \
  -d '{"share":true}')
check "Share brain" "200" "$CODE"
HASH=$(python3 -c "import json; print(json.load(open('/tmp/share.json'))['hash'])")

CODE=$(curl -s -o /tmp/shared.json -w "%{http_code}" -X GET "$BASE/share/$HASH")
check "Shared content (no auth)" "200" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE/content" \
  -H "Authorization: badtoken")
check "JWT middleware rejects bad token" "403" "$CODE"

CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/delete" \
  -H "Content-Type: application/json" \
  -H "Authorization: $TOKEN" \
  -d "{\"contentId\":\"$CONTENT_ID\"}")
check "Delete content" "200" "$CODE"

if [ "$FAIL" -eq 0 ]; then
  echo ""
  echo "=== ALL E2E TESTS PASSED ==="
else
  echo ""
  echo "=== SOME TESTS FAILED ==="
  exit 1
fi
