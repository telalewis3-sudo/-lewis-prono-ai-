import json
import os
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

# Sports API integration (optional)
from .api_sports import fetch_live_matches, fetch_matches_by_date, fetch_matches_by_league, fetch_highlights_matches

TOP_LEAGUE_KEYWORDS = [
    "Premier League", "La Liga", "Serie A", "Bundesliga", "Ligue 1",
    "Championship", "Primeira Liga", "Liga Portugal", "Eredivisie",
    "Jupiler Pro League", "Süper Lig", "Scottish Premiership",
    "Serie A Brazil", "Brasileirão", "MLS", "Ligue 2",
    "Champions League", "Europa League", "Conference League",
    "World Cup", "Coupe du Monde", "Africa Cup", "CAN",
    "Copa América", "Euro", "European Championship",
    "Premier League Women", "FA Cup", "DFB-Pokal", "Coppa Italia",
    "Coupe de France", "Copa del Rey", "League One", "League Two",
    "Championship Women", "Liga MX", "Argentine Primera",
    "Primeira Argentina",
]

def _is_top_league(league_name):
    name_lower = league_name.lower()
    for kw in TOP_LEAGUE_KEYWORDS:
        if kw.lower() in name_lower:
            return True
    return False

def _highlights_to_matches(hl_matches, filter_top=True):
    result = []
    for m in hl_matches:
        try:
            home = m.get("homeTeam", {}).get("name", "")
            away = m.get("awayTeam", {}).get("name", "")
            league = m.get("league", {}).get("name", "International")
            if filter_top and not _is_top_league(league):
                continue
            date = m.get("date", datetime.now().isoformat())
            score = m.get("state", {}).get("score", {}).get("current", None)
            home_goals, away_goals = None, None
            if score and "-" in score:
                parts = score.split("-")
                home_goals = int(parts[0].strip())
                away_goals = int(parts[1].strip())
            result.append({
                "id": m.get("id", 0),
                "home": home, "away": away,
                "league": league, "date": date,
                "odds_h": 2.00, "odds_d": 3.30, "odds_a": 3.50,
                "home_goals": home_goals, "away_goals": away_goals,
                "score": score,
            })
        except Exception:
            continue
    return result

def get_matches(live_only=False):
    try:
        if not live_only:
            today = datetime.now().strftime("%Y-%m-%d")
            hl = fetch_highlights_matches(date=today, limit=100)
            if hl and len(hl) > 0:
                filtered = _highlights_to_matches(hl, filter_top=True)
                if len(filtered) >= 5:
                    return filtered
                return _highlights_to_matches(hl, filter_top=False)
        else:
            today = datetime.now().strftime("%Y-%m-%d")
            hl = fetch_highlights_matches(date=today, limit=100)
            if hl and len(hl) > 0:
                filtered = _highlights_to_matches(hl, filter_top=False)
                live = [m for m in filtered if m.get("score") and m["home_goals"] is not None]
                if live:
                    return live
    except Exception:
        pass
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
    return []

def get_upcoming_fixtures(days=7):
    results = []
    today = datetime.now()
    for i in range(days):
        date = (today + timedelta(days=i)).strftime("%Y-%m-%d")
        try:
            hl = fetch_highlights_matches(date=date, limit=50)
            if hl and len(hl) > 0:
                matches = _highlights_to_matches(hl, filter_top=True)
                if len(matches) < 3:
                    matches = _highlights_to_matches(hl, filter_top=False)
                results.append({"date": date, "matches": matches})
        except Exception:
            continue
    return results

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
