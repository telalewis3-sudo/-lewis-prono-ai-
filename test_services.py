import urllib.request
import json
import sys
import time

def api(url):
    r = urllib.request.urlopen(url, timeout=10)
    return json.loads(r.read())

def section(title):
    print(f"\n{'='*50}")
    print(f"  {title}")
    print('='*50)

section("TEST AI ENGINE - PRONOSTICS")

try:
    r = api('http://localhost:5000/api/health')
    print(f"[OK] Health: {r}")
except Exception as e:
    print(f"[FAIL] AI Engine not running: {e}")
    sys.exit(1)

r = api('http://localhost:5000/api/leagues')
print(f"[OK] {len(r['leagues'])} ligues disponibles")

r = api('http://localhost:5000/api/matches')
print(f"[OK] {r['count']} matchs du jour")

print("\nEntrainement du modele IA...")
req = urllib.request.Request('http://localhost:5000/api/train', data=b'{}', method='POST', headers={'Content-Type': 'application/json'})
r = json.loads(urllib.request.urlopen(req).read())
print(f"[OK] Precision du modele: {r['accuracy']}%")

r = api('http://localhost:5000/api/predict-all')
print(f"[OK] {r['count']} pronostics generes:")
for p in r['predictions'][:5]:
    conf = p['confidence_level']
    print(f"  - {p['match']}: {p['prediction']} (fiabilite: {p['reliability']}% - {conf})")

r = api('http://localhost:5000/api/coupon?min_reliability=60')
if 'coupon_id' in r:
    print(f"\n[OK] Coupon #{r['coupon_id']}:")
    print(f"     {r['total_matches']} matchs | Fiabilite: {r['combined_reliability']}% | Cote: {r['total_odds']}")
else:
    print(f"\n[INFO] Pas de coupon disponible")

section("TEST BACKEND - API")

try:
    r = api('http://localhost:3000/api/health')
    print(f"[OK] Health: {r}")
except Exception as e:
    print(f"[FAIL] Backend not running: {e}")
    sys.exit(1)

r = api('http://localhost:3000/api/promo/bookmakers')
print(f"[OK] Bookmakers: {[b['name'] for b in r['bookmakers']]}")

r = api('http://localhost:3000/api/predictions/leagues')
print(f"[OK] {len(r['leagues'])} ligues disponibles")

r = api('http://localhost:3000/api/predictions/matches')
print(f"[OK] {r['count']} matchs disponibles")

# Test promo code validation
req = urllib.request.Request(
    'http://localhost:3000/api/promo/validate',
    data=json.dumps({"code": "1XBET2026", "bookmaker": "1xbet"}).encode(),
    headers={'Content-Type': 'application/json'}
)
r = json.loads(urllib.request.urlopen(req).read())
print(f"[OK] Code promo 1xBet: {r['message']}")

# Test registration
req = urllib.request.Request(
    'http://localhost:3000/api/auth/register',
    data=json.dumps({"username": "test_user", "email": "test@test.com", "password": "test123"}).encode(),
    headers={'Content-Type': 'application/json'}
)
r = json.loads(urllib.request.urlopen(req).read())
print(f"[OK] Inscription: compte cree (token: {r['token'][:20]}...)")

section("RESULTAT")
print("  AI Engine: http://localhost:5000  ✅")
print("  Backend:   http://localhost:3000  ✅")
print("  Tout fonctionne!")
