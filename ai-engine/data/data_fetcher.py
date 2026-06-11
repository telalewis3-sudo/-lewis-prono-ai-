import json
import os
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

# Sports API integration (optional)
from .api_sports import fetch_live_matches, fetch_matches_by_date, fetch_matches_by_league

def get_matches(live_only=False):
    try:
        api_matches = fetch_matches_by_date() if not live_only else fetch_live_matches()
        if api_matches and len(api_matches) > 0:
            return api_matches
        for lid in [61, 39, 140, 135, 78, 88, 94, 144, 203]:
            league_matches = fetch_matches_by_league(lid)
            if league_matches and len(league_matches) > 0:
                return league_matches
    except Exception:
        pass
    return get_mock_matches()

LEAGUES = {
    "Ligue 1": "FR",
    "Ligue 2": "FR2",
    "Premier League": "GB",
    "Championship": "GB2",
    "La Liga": "ES",
    "La Liga 2": "ES2",
    "Serie A": "IT",
    "Serie B": "IT2",
    "Bundesliga": "DE",
    "Bundesliga 2": "DE2",
    "Liga Portugal": "PT",
    "Eredivisie": "NL",
    "Jupiler Pro League": "BE",
    "Süper Lig": "TR",
    "Scottish Premiership": "SC",
    "Serie A Brazil": "BR",
    "Primeira Argentina": "AR",
    "MLS": "US",
    "Champions League": "UCL",
    "Europa League": "UEL",
    "Africa Cup of Nations": "AFCON",
    "Coupe du Monde 2026": "WC2026",
}

def get_mock_matches():
    today = datetime.now()
    return [
        # Ligue 1
        {"id": 1, "home": "PSG", "away": "Marseille", "league": "Ligue 1", "date": (today + timedelta(days=1)).isoformat(), "odds_h": 1.45, "odds_d": 4.50, "odds_a": 6.00},
        {"id": 2, "home": "Lyon", "away": "Monaco", "league": "Ligue 1", "date": (today + timedelta(days=2)).isoformat(), "odds_h": 2.30, "odds_d": 3.40, "odds_a": 3.00},
        {"id": 3, "home": "Lille", "away": "Nice", "league": "Ligue 1", "date": (today + timedelta(days=1)).isoformat(), "odds_h": 2.10, "odds_d": 3.20, "odds_a": 3.60},
        {"id": 4, "home": "Rennes", "away": "Lens", "league": "Ligue 1", "date": (today + timedelta(days=3)).isoformat(), "odds_h": 2.00, "odds_d": 3.30, "odds_a": 3.50},
        # Ligue 2
        {"id": 5, "home": "Metz", "away": "Bordeaux", "league": "Ligue 2", "date": (today + timedelta(days=1)).isoformat(), "odds_h": 2.15, "odds_d": 3.10, "odds_a": 3.40},
        {"id": 6, "home": "Saint-Etienne", "away": "Caen", "league": "Ligue 2", "date": (today + timedelta(days=2)).isoformat(), "odds_h": 1.95, "odds_d": 3.30, "odds_a": 3.80},
        # Premier League
        {"id": 7, "home": "Manchester City", "away": "Arsenal", "league": "Premier League", "date": (today + timedelta(days=2)).isoformat(), "odds_h": 1.70, "odds_d": 4.00, "odds_a": 4.50},
        {"id": 8, "home": "Liverpool", "away": "Chelsea", "league": "Premier League", "date": (today + timedelta(days=1)).isoformat(), "odds_h": 1.80, "odds_d": 3.70, "odds_a": 4.00},
        {"id": 9, "home": "Manchester United", "away": "Tottenham", "league": "Premier League", "date": (today + timedelta(days=3)).isoformat(), "odds_h": 2.40, "odds_d": 3.40, "odds_a": 2.90},
        {"id": 10, "home": "Newcastle", "away": "Aston Villa", "league": "Premier League", "date": (today + timedelta(days=2)).isoformat(), "odds_h": 2.00, "odds_d": 3.50, "odds_a": 3.40},
        # Championship
        {"id": 11, "home": "Leeds", "away": "Southampton", "league": "Championship", "date": (today + timedelta(days=1)).isoformat(), "odds_h": 2.20, "odds_d": 3.30, "odds_a": 3.20},
        {"id": 12, "home": "Leicester", "away": "West Brom", "league": "Championship", "date": (today + timedelta(days=2)).isoformat(), "odds_h": 1.65, "odds_d": 3.80, "odds_a": 4.80},
        # La Liga
        {"id": 13, "home": "Real Madrid", "away": "Barcelona", "league": "La Liga", "date": (today + timedelta(days=1)).isoformat(), "odds_h": 2.10, "odds_d": 3.40, "odds_a": 3.50},
        {"id": 14, "home": "Atletico Madrid", "away": "Sevilla", "league": "La Liga", "date": (today + timedelta(days=1)).isoformat(), "odds_h": 1.75, "odds_d": 3.60, "odds_a": 4.50},
        {"id": 15, "home": "Barcelona", "away": "Real Sociedad", "league": "La Liga", "date": (today + timedelta(days=3)).isoformat(), "odds_h": 1.50, "odds_d": 4.20, "odds_a": 5.50},
        # Serie A
        {"id": 16, "home": "Inter Milan", "away": "AC Milan", "league": "Serie A", "date": (today + timedelta(days=2)).isoformat(), "odds_h": 2.20, "odds_d": 3.30, "odds_a": 3.20},
        {"id": 17, "home": "Juventus", "away": "Napoli", "league": "Serie A", "date": (today + timedelta(days=1)).isoformat(), "odds_h": 2.50, "odds_d": 3.10, "odds_a": 2.90},
        {"id": 18, "home": "AS Roma", "away": "Lazio", "league": "Serie A", "date": (today + timedelta(days=4)).isoformat(), "odds_h": 2.30, "odds_d": 3.20, "odds_a": 3.10},
        # Bundesliga
        {"id": 19, "home": "Bayern Munich", "away": "Dortmund", "league": "Bundesliga", "date": (today + timedelta(days=1)).isoformat(), "odds_h": 1.50, "odds_d": 4.20, "odds_a": 5.50},
        {"id": 20, "home": "Leipzig", "away": "Leverkusen", "league": "Bundesliga", "date": (today + timedelta(days=2)).isoformat(), "odds_h": 2.10, "odds_d": 3.50, "odds_a": 3.20},
        # Liga Portugal
        {"id": 21, "home": "Benfica", "away": "Porto", "league": "Liga Portugal", "date": (today + timedelta(days=1)).isoformat(), "odds_h": 1.80, "odds_d": 3.60, "odds_a": 4.00},
        {"id": 22, "home": "Sporting", "away": "Braga", "league": "Liga Portugal", "date": (today + timedelta(days=2)).isoformat(), "odds_h": 1.70, "odds_d": 3.70, "odds_a": 4.50},
        # Eredivisie
        {"id": 23, "home": "Ajax", "away": "Feyenoord", "league": "Eredivisie", "date": (today + timedelta(days=3)).isoformat(), "odds_h": 2.05, "odds_d": 3.50, "odds_a": 3.30},
        {"id": 24, "home": "PSV", "away": "AZ Alkmaar", "league": "Eredivisie", "date": (today + timedelta(days=1)).isoformat(), "odds_h": 1.60, "odds_d": 4.00, "odds_a": 4.80},
        # Jupiler Pro League
        {"id": 25, "home": "Anderlecht", "away": "Club Brugge", "league": "Jupiler Pro League", "date": (today + timedelta(days=1)).isoformat(), "odds_h": 2.50, "odds_d": 3.20, "odds_a": 2.80},
        {"id": 26, "home": "Genk", "away": "Standard", "league": "Jupiler Pro League", "date": (today + timedelta(days=2)).isoformat(), "odds_h": 1.90, "odds_d": 3.50, "odds_a": 3.70},
        # Süper Lig
        {"id": 27, "home": "Galatasaray", "away": "Fenerbahce", "league": "Süper Lig", "date": (today + timedelta(days=1)).isoformat(), "odds_h": 2.20, "odds_d": 3.30, "odds_a": 3.10},
        {"id": 28, "home": "Besiktas", "away": "Trabzonspor", "league": "Süper Lig", "date": (today + timedelta(days=2)).isoformat(), "odds_h": 1.85, "odds_d": 3.50, "odds_a": 4.00},
        # Champions League
        {"id": 29, "home": "Manchester City", "away": "Real Madrid", "league": "Champions League", "date": (today + timedelta(days=5)).isoformat(), "odds_h": 1.90, "odds_d": 3.60, "odds_a": 3.80},
        {"id": 30, "home": "Bayern Munich", "away": "PSG", "league": "Champions League", "date": (today + timedelta(days=6)).isoformat(), "odds_h": 1.70, "odds_d": 4.10, "odds_a": 4.50},
        # Coupe du Monde 2026
        {"id": 31, "home": "France", "away": "Bresil", "league": "Coupe du Monde 2026", "date": (today + timedelta(days=10)).isoformat(), "odds_h": 2.40, "odds_d": 3.20, "odds_a": 3.00},
        {"id": 32, "home": "Argentine", "away": "Allemagne", "league": "Coupe du Monde 2026", "date": (today + timedelta(days=10)).isoformat(), "odds_h": 2.10, "odds_d": 3.30, "odds_a": 3.50},
        {"id": 33, "home": "Angleterre", "away": "Espagne", "league": "Coupe du Monde 2026", "date": (today + timedelta(days=11)).isoformat(), "odds_h": 2.30, "odds_d": 3.10, "odds_a": 3.20},
        {"id": 34, "home": "Portugal", "away": "Pays-Bas", "league": "Coupe du Monde 2026", "date": (today + timedelta(days=11)).isoformat(), "odds_h": 2.15, "odds_d": 3.30, "odds_a": 3.40},
        {"id": 35, "home": "Maroc", "away": "Senegal", "league": "Coupe du Monde 2026", "date": (today + timedelta(days=12)).isoformat(), "odds_h": 2.50, "odds_d": 3.00, "odds_a": 3.00},
        {"id": 36, "home": "Cote d'Ivoire", "away": "Nigeria", "league": "Africa Cup of Nations", "date": (today + timedelta(days=8)).isoformat(), "odds_h": 2.30, "odds_d": 3.10, "odds_a": 3.20},
        {"id": 37, "home": "Egypte", "away": "Cameroun", "league": "Africa Cup of Nations", "date": (today + timedelta(days=9)).isoformat(), "odds_h": 2.00, "odds_d": 3.20, "odds_a": 3.70},
    ]

def get_historical_data():
    filepath = os.path.join(DATA_DIR, "historical_matches.json")
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    return _generate_historical_data()

def _generate_historical_data():
    return [
        # Ligue 1
        {"home": "PSG", "away": "Marseille", "home_goals": 3, "away_goals": 0, "league": "Ligue 1", "date": "2026-05-10"},
        {"home": "PSG", "away": "Lyon", "home_goals": 2, "away_goals": 1, "league": "Ligue 1", "date": "2026-05-03"},
        {"home": "PSG", "away": "Monaco", "home_goals": 4, "away_goals": 1, "league": "Ligue 1", "date": "2026-04-26"},
        {"home": "Marseille", "away": "PSG", "home_goals": 0, "away_goals": 2, "league": "Ligue 1", "date": "2026-04-19"},
        {"home": "Marseille", "away": "Lyon", "home_goals": 2, "away_goals": 2, "league": "Ligue 1", "date": "2026-05-10"},
        {"home": "Lyon", "away": "PSG", "home_goals": 0, "away_goals": 2, "league": "Ligue 1", "date": "2026-04-12"},
        {"home": "Lille", "away": "PSG", "home_goals": 1, "away_goals": 3, "league": "Ligue 1", "date": "2026-05-03"},
        {"home": "Nice", "away": "Marseille", "home_goals": 0, "away_goals": 1, "league": "Ligue 1", "date": "2026-04-26"},
        # Premier League
        {"home": "Manchester City", "away": "Arsenal", "home_goals": 1, "away_goals": 0, "league": "Premier League", "date": "2026-05-10"},
        {"home": "Manchester City", "away": "Liverpool", "home_goals": 2, "away_goals": 2, "league": "Premier League", "date": "2026-05-03"},
        {"home": "Arsenal", "away": "Manchester City", "home_goals": 0, "away_goals": 1, "league": "Premier League", "date": "2026-04-19"},
        {"home": "Liverpool", "away": "Chelsea", "home_goals": 3, "away_goals": 1, "league": "Premier League", "date": "2026-05-10"},
        {"home": "Manchester United", "away": "Liverpool", "home_goals": 0, "away_goals": 3, "league": "Premier League", "date": "2026-04-26"},
        {"home": "Chelsea", "away": "Arsenal", "home_goals": 1, "away_goals": 1, "league": "Premier League", "date": "2026-05-03"},
        # La Liga
        {"home": "Real Madrid", "away": "Barcelona", "home_goals": 2, "away_goals": 0, "league": "La Liga", "date": "2026-05-10"},
        {"home": "Real Madrid", "away": "Atletico Madrid", "home_goals": 1, "away_goals": 1, "league": "La Liga", "date": "2026-05-03"},
        {"home": "Real Madrid", "away": "Sevilla", "home_goals": 3, "away_goals": 1, "league": "La Liga", "date": "2026-04-26"},
        {"home": "Barcelona", "away": "Real Madrid", "home_goals": 1, "away_goals": 2, "league": "La Liga", "date": "2026-04-19"},
        {"home": "Barcelona", "away": "Atletico Madrid", "home_goals": 2, "away_goals": 2, "league": "La Liga", "date": "2026-05-10"},
        {"home": "Atletico Madrid", "away": "Sevilla", "home_goals": 1, "away_goals": 0, "league": "La Liga", "date": "2026-04-12"},
        # Bundesliga
        {"home": "Bayern Munich", "away": "Dortmund", "home_goals": 3, "away_goals": 1, "league": "Bundesliga", "date": "2026-05-10"},
        {"home": "Bayern Munich", "away": "Leipzig", "home_goals": 4, "away_goals": 0, "league": "Bundesliga", "date": "2026-05-03"},
        {"home": "Dortmund", "away": "Bayern Munich", "home_goals": 1, "away_goals": 2, "league": "Bundesliga", "date": "2026-04-19"},
        {"home": "Leipzig", "away": "Leverkusen", "home_goals": 2, "away_goals": 1, "league": "Bundesliga", "date": "2026-05-10"},
        # Serie A
        {"home": "Inter Milan", "away": "AC Milan", "home_goals": 2, "away_goals": 1, "league": "Serie A", "date": "2026-05-10"},
        {"home": "Inter Milan", "away": "Juventus", "home_goals": 1, "away_goals": 0, "league": "Serie A", "date": "2026-05-03"},
        {"home": "AC Milan", "away": "Inter Milan", "home_goals": 1, "away_goals": 2, "league": "Serie A", "date": "2026-04-19"},
        {"home": "Juventus", "away": "Napoli", "home_goals": 2, "away_goals": 2, "league": "Serie A", "date": "2026-05-10"},
        {"home": "Napoli", "away": "AS Roma", "home_goals": 3, "away_goals": 1, "league": "Serie A", "date": "2026-04-26"},
        # Liga Portugal
        {"home": "Benfica", "away": "Porto", "home_goals": 2, "away_goals": 1, "league": "Liga Portugal", "date": "2026-05-10"},
        {"home": "Benfica", "away": "Sporting", "home_goals": 1, "away_goals": 1, "league": "Liga Portugal", "date": "2026-05-03"},
        {"home": "Porto", "away": "Benfica", "home_goals": 0, "away_goals": 2, "league": "Liga Portugal", "date": "2026-04-19"},
        {"home": "Sporting", "away": "Porto", "home_goals": 2, "away_goals": 0, "league": "Liga Portugal", "date": "2026-05-10"},
        # Eredivisie
        {"home": "Ajax", "away": "Feyenoord", "home_goals": 2, "away_goals": 0, "league": "Eredivisie", "date": "2026-05-10"},
        {"home": "PSV", "away": "Ajax", "home_goals": 1, "away_goals": 1, "league": "Eredivisie", "date": "2026-05-03"},
        {"home": "Feyenoord", "away": "PSV", "home_goals": 2, "away_goals": 1, "league": "Eredivisie", "date": "2026-04-26"},
        # Jupiler Pro League
        {"home": "Anderlecht", "away": "Club Brugge", "home_goals": 1, "away_goals": 1, "league": "Jupiler Pro League", "date": "2026-05-10"},
        {"home": "Club Brugge", "away": "Genk", "home_goals": 2, "away_goals": 0, "league": "Jupiler Pro League", "date": "2026-05-03"},
        {"home": "Genk", "away": "Anderlecht", "home_goals": 3, "away_goals": 2, "league": "Jupiler Pro League", "date": "2026-04-26"},
        # Champions League
        {"home": "Manchester City", "away": "Real Madrid", "home_goals": 2, "away_goals": 1, "league": "Champions League", "date": "2026-04-26"},
        {"home": "Bayern Munich", "away": "PSG", "home_goals": 2, "away_goals": 0, "league": "Champions League", "date": "2026-04-26"},
        {"home": "Real Madrid", "away": "Manchester City", "home_goals": 1, "away_goals": 1, "league": "Champions League", "date": "2026-05-03"},
        {"home": "PSG", "away": "Bayern Munich", "home_goals": 1, "away_goals": 0, "league": "Champions League", "date": "2026-05-03"},
        {"home": "Inter Milan", "away": "Arsenal", "home_goals": 1, "away_goals": 0, "league": "Champions League", "date": "2026-04-19"},
        {"home": "Barcelona", "away": "Dortmund", "home_goals": 3, "away_goals": 2, "league": "Champions League", "date": "2026-04-19"},
        # Coupe du Monde 2026 - Matchs de preparation et phase de groupes
        {"home": "France", "away": "Bresil", "home_goals": 2, "away_goals": 1, "league": "Coupe du Monde 2026", "date": "2026-06-01"},
        {"home": "Argentine", "away": "Allemagne", "home_goals": 3, "away_goals": 0, "league": "Coupe du Monde 2026", "date": "2026-06-01"},
        {"home": "Angleterre", "away": "Espagne", "home_goals": 1, "away_goals": 1, "league": "Coupe du Monde 2026", "date": "2026-06-02"},
        {"home": "Portugal", "away": "France", "home_goals": 0, "away_goals": 1, "league": "Coupe du Monde 2026", "date": "2026-06-02"},
        {"home": "Bresil", "away": "Argentine", "home_goals": 1, "away_goals": 1, "league": "Coupe du Monde 2026", "date": "2026-06-05"},
        {"home": "Allemagne", "away": "Angleterre", "home_goals": 2, "away_goals": 2, "league": "Coupe du Monde 2026", "date": "2026-06-05"},
        {"home": "Espagne", "away": "Portugal", "home_goals": 2, "away_goals": 1, "league": "Coupe du Monde 2026", "date": "2026-06-06"},
        {"home": "Pays-Bas", "away": "Belgique", "home_goals": 1, "away_goals": 0, "league": "Coupe du Monde 2026", "date": "2026-06-06"},
        {"home": "Maroc", "away": "France", "home_goals": 0, "away_goals": 2, "league": "Coupe du Monde 2026", "date": "2026-06-03"},
        {"home": "Senegal", "away": "Angleterre", "home_goals": 1, "away_goals": 2, "league": "Coupe du Monde 2026", "date": "2026-06-04"},
    ]
