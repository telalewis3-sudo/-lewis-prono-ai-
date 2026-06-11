import sqlite3, os, uuid, jwt as pyjwt, bcrypt as pybcrypt
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
from predictors.football_predictor import FootballPredictor
from data.data_fetcher import get_matches, get_mock_matches, get_historical_data

app = Flask(__name__)
CORS(app)

JWT_SECRET = 'apk-ai-secret-key-2026'
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'backend', 'apk_ai.db')

os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
init_db()
predictor = FootballPredictor()

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute('''CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
        promo_code TEXT, bookmaker TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        premium_until DATETIME)''')
    conn.execute('''CREATE TABLE IF NOT EXISTS coupons (
        id TEXT PRIMARY KEY, user_id TEXT,
        matches TEXT NOT NULL, total_odds REAL NOT NULL,
        combined_reliability REAL NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id))''')
    conn.execute('''CREATE TABLE IF NOT EXISTS predictions (
        id TEXT PRIMARY KEY, match_home TEXT NOT NULL,
        match_away TEXT NOT NULL, league TEXT,
        prediction TEXT NOT NULL, reliability REAL NOT NULL,
        odds_h REAL, odds_d REAL, odds_a REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    conn.execute('''CREATE TABLE IF NOT EXISTS promo_codes (
        id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL,
        bookmaker TEXT NOT NULL, bonus_days INTEGER DEFAULT 7,
        used INTEGER DEFAULT 0, max_uses INTEGER DEFAULT 100,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP)''')
    count = conn.execute("SELECT COUNT(*) FROM promo_codes").fetchone()[0]
    if count == 0:
        import uuid
        conn.execute("INSERT INTO promo_codes (id, code, bookmaker, max_uses) VALUES (?, ?, ?, ?)",
                     (str(uuid.uuid4()), '1XBET2026', '1xbet', 100))
        conn.execute("INSERT INTO promo_codes (id, code, bookmaker, max_uses) VALUES (?, ?, ?, ?)",
                     (str(uuid.uuid4()), 'BETPAWA2026', 'betpawa', 100))
        conn.execute("INSERT INTO promo_codes (id, code, bookmaker, max_uses) VALUES (?, ?, ?, ?)",
                     (str(uuid.uuid4()), 'MELBET2026', 'melbet', 100))
    conn.commit()
    conn.close()

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "Lewis Prono AI - Pronostics Sportifs Intelligents", "version": "2.0.0"})

@app.route("/api/auth/register", methods=["POST"])
def auth_register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    promo_code = data.get("promo_code")
    if not username or not email or not password:
        return jsonify({"error": "Champs requis: username, email, password"}), 400
    conn = get_db()
    try:
        existing = conn.execute("SELECT id FROM users WHERE email = ? OR username = ?", (email, username)).fetchone()
        if existing:
            return jsonify({"error": "Utilisateur deja existant"}), 409
        hashed = pybcrypt.hashpw(password.encode(), pybcrypt.gensalt()).decode()
        user_id = str(uuid.uuid4())
        bookmaker = None
        if promo_code:
            promo = conn.execute("SELECT * FROM promo_codes WHERE code = ? AND used < max_uses", (promo_code.upper(),)).fetchone()
            if promo:
                bookmaker = promo["bookmaker"]
                conn.execute("UPDATE promo_codes SET used = used + 1 WHERE code = ?", (promo["code"],))
        premium_until = (datetime.utcnow() + timedelta(days=7)).isoformat() if bookmaker else None
        conn.execute("INSERT INTO users (id, username, email, password, promo_code, bookmaker, premium_until) VALUES (?, ?, ?, ?, ?, ?, ?)",
                     (user_id, username, email, hashed, promo_code or None, bookmaker, premium_until))
        conn.commit()
        token = pyjwt.encode({"id": user_id, "username": username}, JWT_SECRET, algorithm="HS256")
        return jsonify({"token": token, "user": {"id": user_id, "username": username, "email": email, "bookmaker": bookmaker, "premium": bool(premium_until)}}), 201
    finally:
        conn.close()

@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"error": "Champs requis: email, password"}), 400
    conn = get_db()
    try:
        user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        if not user or not pybcrypt.checkpw(password.encode(), user["password"].encode()):
            return jsonify({"error": "Email ou mot de passe incorrect"}), 401
        token = pyjwt.encode({"id": user["id"], "username": user["username"]}, JWT_SECRET, algorithm="HS256")
        return jsonify({"token": token, "user": {"id": user["id"], "username": user["username"], "email": user["email"], "bookmaker": user["bookmaker"], "premium": bool(user["premium_until"])}})
    finally:
        conn.close()

@app.route("/api/auth/profile", methods=["GET"])
def auth_profile():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return jsonify({"error": "Token requis"}), 401
    try:
        payload = pyjwt.decode(auth_header[7:], JWT_SECRET, algorithms=["HS256"])
    except:
        return jsonify({"error": "Token invalide"}), 401
    conn = get_db()
    try:
        user = conn.execute("SELECT id, username, email, bookmaker, premium_until, created_at FROM users WHERE id = ?", (payload["id"],)).fetchone()
        if not user:
            return jsonify({"error": "Utilisateur non trouve"}), 404
        return jsonify({"user": {"id": user["id"], "username": user["username"], "email": user["email"], "bookmaker": user["bookmaker"], "premium": bool(user["premium_until"])}})
    finally:
        conn.close()

@app.route("/api/train", methods=["POST"])
def train():
    data = get_historical_data()
    accuracy = predictor.train(data)
    return jsonify({"status": "success", "accuracy": accuracy})

@app.route("/api/matches", methods=["GET"])
def get_matches():
    matches = get_mock_matches()
    league = request.args.get("league")
    if league:
        matches = [m for m in matches if m["league"] == league]
    return jsonify({"matches": matches, "count": len(matches)})

@app.route("/api/leagues", methods=["GET"])
def get_leagues():
    from data.data_fetcher import LEAGUES
    leagues = [{"name": k, "code": v} for k, v in LEAGUES.items()]
    return jsonify({"leagues": leagues})

@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json()
    match_id = data.get("match_id")
    matches = get_mock_matches()
    historical = get_historical_data()

    match = next((m for m in matches if m["id"] == match_id), None)
    if not match:
        return jsonify({"error": "Match non trouve"}), 404

    if predictor.model is None:
        predictor.train(historical)

    result = predictor.predict(match, historical)
    return jsonify(result)

@app.route("/api/predict-all", methods=["GET"])
def predict_all():
    matches = get_matches(live_only=False)
    if not matches:
        matches = get_matches(live_only=False)
    if not matches:
        matches = get_mock_matches()
    historical = get_historical_data()

    if predictor.model is None:
        predictor.train(historical)

    predictions = []
    for match in matches:
        pred = predictor.predict(match, historical)
        if pred:
            predictions.append(pred)

    return jsonify({"predictions": predictions, "count": len(predictions)})

@app.route("/api/coupon", methods=["GET"])
def generate_coupon():
    league = request.args.get("league")
    min_reliability = int(request.args.get("min_reliability", 60))
    max_matches = int(request.args.get("max_matches", 5))

    matches = get_matches(live_only=False)
    if not matches:
        matches = get_mock_matches()
    historical = get_historical_data()

    if league:
        matches = [m for m in matches if m["league"] == league]

    if predictor.model is None:
        predictor.train(historical)

    predictions = []
    for match in matches:
        pred = predictor.predict(match, historical)
        if pred:
            predictions.append(pred)

    coupon = predictor.generate_coupon(predictions, min_reliability, max_matches)
    if not coupon:
        return jsonify({"error": "Aucun coupon disponible avec ces criteres"}), 400

    return jsonify(coupon)

@app.route("/api/promo/bookmakers", methods=["GET"])
def promo_bookmakers():
    return jsonify({"bookmakers": [
        {"id": "1xbet", "name": "1xBet"},
        {"id": "betpawa", "name": "BetPawa"},
        {"id": "melbet", "name": "Melbet"},
        {"id": "betwinner", "name": "BetWinner"},
        {"id": "22bet", "name": "22Bet"}
    ]})

# Alias routes for mobile app compatibility
@app.route("/api/predictions/leagues", methods=["GET"])
def predictions_leagues():
    from data.data_fetcher import LEAGUES
    leagues = [{"name": k, "code": v} for k, v in LEAGUES.items()]
    return jsonify({"leagues": leagues})

@app.route("/api/predictions/matches", methods=["GET"])
def predictions_matches():
    live_only = request.args.get("live", "false").lower() == "true"
    matches = get_matches(live_only=live_only)
    if not matches:
        matches = get_mock_matches()
    league = request.args.get("league")
    if league:
        matches = [m for m in matches if m["league"] == league]
    return jsonify({"matches": matches, "count": len(matches)})

@app.route("/api/promo/validate", methods=["POST"])
def validate_promo():
    data = request.get_json()
    code = data.get("code", "").upper()
    bookmaker = data.get("bookmaker", "").lower()

    valid_prefixes = {"1XBET": "1XBET", "BETPAWA": "BETPAWA", "MELBET": "MELBET", "BETWINNER": "BETWINNER", "22BET": "22BET"}
    if bookmaker in valid_prefixes:
        expected_prefix = valid_prefixes[bookmaker]
        if code.startswith(expected_prefix) and len(code) >= 8:
            return jsonify({
                "valid": True,
                "bookmaker": bookmaker.upper(),
                "bonus": "Acces premium 7 jours offert",
                "message": f"Code promo {bookmaker.upper()} valide !"
            })

    return jsonify({"valid": False, "message": "Code promo invalide"}), 400

if __name__ == "__main__":
    print("=== Lewis Prono AI - Moteur de Pronostics Sportifs ===")
    print("Demarrage du serveur sur http://localhost:5000")
    print(f"Ligues disponibles: 22 championnats + Coupe du Monde 2026")
    app.run(host="0.0.0.0", port=5000, debug=True)
