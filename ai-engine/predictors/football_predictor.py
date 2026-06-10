import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os
import json

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")

class FootballPredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.model_path = os.path.join(MODEL_DIR, "predictor_model.pkl")
        self.scaler_path = os.path.join(MODEL_DIR, "scaler.pkl")

    def _extract_features(self, match, historical_data):
        home = match["home"]
        away = match["away"]
        features = []

        home_matches = [m for m in historical_data if m["home"] == home or m["away"] == home]
        away_matches = [m for m in historical_data if m["home"] == away or m["away"] == away]

        home_wins = sum(1 for m in home_matches if (m["home"] == home and m["home_goals"] > m["away_goals"]) or (m["away"] == home and m["away_goals"] > m["home_goals"]))
        home_losses = sum(1 for m in home_matches if (m["home"] == home and m["home_goals"] < m["away_goals"]) or (m["away"] == home and m["away_goals"] < m["home_goals"]))
        home_draws = sum(1 for m in home_matches if m["home_goals"] == m["away_goals"])
        home_total = len(home_matches) or 1

        away_wins = sum(1 for m in away_matches if (m["home"] == away and m["home_goals"] > m["away_goals"]) or (m["away"] == away and m["away_goals"] > m["home_goals"]))
        away_losses = sum(1 for m in away_matches if (m["home"] == away and m["home_goals"] < m["away_goals"]) or (m["away"] == away and m["away_goals"] < m["home_goals"]))
        away_draws = sum(1 for m in away_matches if m["home_goals"] == m["away_goals"])
        away_total = len(away_matches) or 1

        h2h_matches = [m for m in historical_data if (m["home"] == home and m["away"] == away) or (m["home"] == away and m["away"] == home)]
        h2h_home_wins = sum(1 for m in h2h_matches if m["home"] == home and m["home_goals"] > m["away_goals"])
        h2h_away_wins = sum(1 for m in h2h_matches if m["away"] == home and m["away_goals"] > m["home_goals"])
        h2h_draws = sum(1 for m in h2h_matches if m["home_goals"] == m["away_goals"])

        home_goals_scored = sum(m["home_goals"] for m in home_matches if m["home"] == home) + sum(m["away_goals"] for m in home_matches if m["away"] == home)
        home_goals_conceded = sum(m["away_goals"] for m in home_matches if m["home"] == home) + sum(m["home_goals"] for m in home_matches if m["away"] == home)
        away_goals_scored = sum(m["away_goals"] for m in away_matches if m["away"] == away) + sum(m["home_goals"] for m in away_matches if m["home"] == away)
        away_goals_conceded = sum(m["home_goals"] for m in away_matches if m["away"] == away) + sum(m["away_goals"] for m in away_matches if m["home"] == away)

        features.extend([
            home_wins / home_total,
            home_draws / home_total,
            home_losses / home_total,
            away_wins / away_total,
            away_draws / away_total,
            away_losses / away_total,
            home_goals_scored / home_total if home_total > 0 else 0,
            home_goals_conceded / home_total if home_total > 0 else 0,
            away_goals_scored / away_total if away_total > 0 else 0,
            away_goals_conceded / away_total if away_total > 0 else 0,
            max(0, home_wins - away_losses) / max(home_total, away_total),
            len(h2h_matches),
            h2h_home_wins,
            h2h_away_wins,
            h2h_draws,
            match.get("odds_h", 2.0),
            match.get("odds_d", 3.5),
            match.get("odds_a", 4.0),
            1.0 / match.get("odds_h", 2.0) if match.get("odds_h") else 0.5,
            1.0 / match.get("odds_d", 3.5) if match.get("odds_d") else 0.28,
            1.0 / match.get("odds_a", 4.0) if match.get("odds_a") else 0.25,
        ])
        return features

    def _get_label(self, match):
        if match["home_goals"] > match["away_goals"]:
            return 0
        elif match["home_goals"] == match["away_goals"]:
            return 1
        return 2

    def train(self, historical_data):
        X, y = [], []
        for match in historical_data:
            features = self._extract_features(match, historical_data)
            X.append(features)
            y.append(self._get_label(match))

        X = np.array(X)
        y = np.array(y)

        X_scaled = self.scaler.fit_transform(X)

        self.model = GradientBoostingClassifier(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        self.model.fit(X_scaled, y)

        os.makedirs(MODEL_DIR, exist_ok=True)
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)

        y_pred = self.model.predict(X_scaled)
        acc = accuracy_score(y, y_pred)
        return round(acc * 100, 1)

    def load_model(self):
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            return True
        return False

    def predict(self, match, historical_data):
        if self.model is None:
            if not self.load_model():
                return None

        features = self._extract_features(match, historical_data)
        features_array = np.array(features).reshape(1, -1)
        features_scaled = self.scaler.transform(features_array)

        prediction = self.model.predict(features_scaled)[0]
        probabilities = self.model.predict_proba(features_scaled)[0]

        labels = {0: "1 (Domicile)", 1: "N (Nul)", 2: "2 (Exterieur)"}

        if len(probabilities) < 3:
            probs = [0, 0, 0]
            for i, p in enumerate(probabilities):
                probs[i] = round(p * 100, 1)
        else:
            probs = [round(p * 100, 1) for p in probabilities]

        reliability = max(probs)

        return {
            "match": f"{match['home']} vs {match['away']}",
            "prediction": labels[int(prediction)],
            "probabilities": {
                "home": probs[0] if len(probs) > 0 else 0,
                "draw": probs[1] if len(probs) > 1 else 0,
                "away": probs[2] if len(probs) > 2 else 0,
            },
            "reliability": round(reliability, 1),
            "confidence_level": self._get_confidence_level(reliability),
        }

    def _get_confidence_level(self, reliability):
        if reliability >= 75:
            return "Tres eleve"
        elif reliability >= 60:
            return "Eleve"
        elif reliability >= 45:
            return "Moyen"
        return "Faible"

    def generate_coupon(self, predictions, min_reliability=60, max_matches=5):
        filtered = [p for p in predictions if p["reliability"] >= min_reliability]
        filtered.sort(key=lambda x: x["reliability"], reverse=True)
        selected = filtered[:max_matches]

        if not selected:
            return None

        combined_reliability = round(
            sum(p["reliability"] for p in selected) / len(selected), 1
        )

        total_odds = 1.0
        for p in selected:
            if "1" in p["prediction"]:
                total_odds *= 1.5
            elif "N" in p["prediction"]:
                total_odds *= 3.4
            else:
                total_odds *= 4.0

        return {
            "matches": selected,
            "total_odds": round(total_odds, 2),
            "combined_reliability": combined_reliability,
            "total_matches": len(selected),
            "coupon_id": f"CPN-{np.random.randint(10000, 99999)}",
        }
