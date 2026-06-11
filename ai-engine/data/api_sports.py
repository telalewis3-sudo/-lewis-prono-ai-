import os
import requests
from datetime import datetime, timedelta

RAPIDAPI_KEY = os.environ.get('RAPIDAPI_KEY', '')
API_SPORTS_KEY = os.environ.get('API_SPORTS_KEY', '')
RAPIDAPI_HOST = 'free-api-live-football-data.p.rapidapi.com'
HIGHLIGHTS_HOST = 'football-highlights-api.p.rapidapi.com'

# Use api-sports.io key if available, otherwise fall back to RapidAPI key
ACTIVE_KEY = API_SPORTS_KEY or RAPIDAPI_KEY
ACTIVE_HOST = 'v3.football.api-sports.io' if API_SPORTS_KEY else RAPIDAPI_HOST
ACTIVE_HEADER = 'x-apisports-key' if API_SPORTS_KEY else 'x-rapidapi-key'

LEAGUE_NAMES = {
    39: 'Premier League', 140: 'La Liga', 135: 'Serie A',
    78: 'Bundesliga', 61: 'Ligue 1', 62: 'Ligue 2',
    40: 'Championship', 88: 'Eredivisie', 94: 'Liga Portugal',
    144: 'Jupiler Pro League', 203: 'Süper Lig', 179: 'Scottish Premiership',
    71: 'Serie A Brazil', 253: 'MLS', 2: 'Champions League',
    3: 'Europa League', 1: 'Coupe du Monde 2026',
}

def _api_get(endpoint, params=None):
    if not ACTIVE_KEY:
        return None
    try:
        # Strip version prefix if using api-sports.io (host already has v3)
        ep = endpoint.replace('/v3/', '/').lstrip('/')
        url = f'https://{ACTIVE_HOST}/{ep}'
        headers = {ACTIVE_HEADER: ACTIVE_KEY}
        response = requests.get(url, headers=headers, params=params, timeout=15)
        if response.status_code == 200:
            return response.json()
    except Exception:
        return None
    return None

def fetch_live_matches():
    data = _api_get('/v3/fixtures', {'live': 'all'})
    if data and data.get('results', 0) > 0:
        return _transform_fixtures(data['response'])
    return None

def fetch_matches_by_date(date=None):
    if not date:
        date = datetime.now().strftime('%Y-%m-%d')
    data = _api_get('/v3/fixtures', {'date': date})
    if data and data.get('results', 0) > 0:
        return _transform_fixtures(data['response'])
    return None

def fetch_matches_by_league(league_id):
    # Try 2026, 2025, 2024 seasons in order
    for season in ['2026', '2025', '2024']:
        data = _api_get('/v3/fixtures', {'league': league_id, 'season': season})
        if data and data.get('results', 0) > 0:
            return _transform_fixtures(data['response'])
    return None

def get_standings(league_id):
    for season in ['2026', '2025', '2024']:
        data = _api_get('/v3/standings', {'league': league_id, 'season': season})
        if data and data.get('results', 0) > 0:
            return data['response']
    return None

def get_odds(fixture_id):
    data = _api_get('/v3/odds', {'fixture': fixture_id})
    if data and data.get('results', 0) > 0:
        return data['response']
    return None

def _transform_fixtures(fixtures):
    transformed = []
    for f in fixtures:
        try:
            fixture = f['fixture']
            teams = f['teams']
            league = f.get('league', {})
            goals = f.get('goals', {})

            home = teams['home']['name']
            away = teams['away']['name']
            league_name = league.get('name', 'International')
            date = fixture.get('date', datetime.now().isoformat())
            status = fixture.get('status', {}).get('short', 'NS')

            home_goals = goals.get('home')
            away_goals = goals.get('away')

            score = f"{home_goals}-{away_goals}" if home_goals is not None and away_goals is not None else None

            odds_h, odds_d, odds_a = 2.00, 3.30, 3.50
            home_odds, draw_odds, away_odds = None, None, None
            if f.get('odds') and len(f['odds']) > 0:
                for bet in f['odds'][0].get('bets', []):
                    if bet.get('name') == 'Match Winner':
                        for v in bet.get('values', []):
                            if v.get('value') == 'Home': home_odds = float(v.get('odd', 0))
                            elif v.get('value') == 'Draw': draw_odds = float(v.get('odd', 0))
                            elif v.get('value') == 'Away': away_odds = float(v.get('odd', 0))
                        break
            odds_h = home_odds or odds_h
            odds_d = draw_odds or odds_d
            odds_a = away_odds or odds_a

            transformed.append({
                'id': fixture.get('id', 0),
                'home': home,
                'away': away,
                'league': league_name,
                'date': date,
                'odds_h': odds_h,
                'odds_d': odds_d,
                'odds_a': odds_a,
                'status': status,
                'score': score,
                'home_goals': home_goals,
                'away_goals': away_goals,
            })
        except Exception:
            continue
    return transformed

def _highlights_get(endpoint, params=None):
    if not RAPIDAPI_KEY:
        return None
    try:
        url = f'https://{HIGHLIGHTS_HOST}/{endpoint.lstrip("/")}'
        headers = {'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': HIGHLIGHTS_HOST}
        response = requests.get(url, headers=headers, params=params, timeout=15)
        if response.status_code == 200:
            return response.json()
    except Exception:
        return None
    return None

def fetch_highlights(date=None, league_id=None, match_id=None, team_name=None, limit=20, offset=0):
    params = {'limit': min(limit, 40), 'offset': offset}
    if date: params['date'] = date
    if league_id: params['leagueId'] = league_id
    if match_id: params['matchId'] = match_id
    if team_name: params['homeTeamName'] = team_name
    data = _highlights_get('/highlights', params)
    if data and 'data' in data:
        return data['data']
    return []

def fetch_todays_highlights(limit=20):
    return fetch_highlights(date=datetime.now().strftime('%Y-%m-%d'), limit=limit)

def fetch_highlight_by_id(highlight_id):
    data = _highlights_get(f'/highlights/{highlight_id}')
    if data and isinstance(data, list) and len(data) > 0:
        return data[0]
    return None

def fetch_highlights_matches(date=None, league_id=None, limit=20, offset=0):
    params = {'limit': min(limit, 100), 'offset': offset}
    if date: params['date'] = date
    if league_id: params['leagueId'] = league_id
    data = _highlights_get('/matches', params)
    if data and 'data' in data:
        return data['data']
    return []

def search_teams(query):
    if API_SPORTS_KEY:
        data = _api_get('/v3/teams', {'search': query})
        if data and data.get('results', 0) > 0:
            return data['response']
        return None
    # Fallback to RapidAPI search
    try:
        url = f'https://{RAPIDAPI_HOST}/football-teams-search'
        headers = {'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': RAPIDAPI_HOST, 'Content-Type': 'application/json'}
        resp = requests.get(url, headers=headers, params={'search': query}, timeout=10)
        if resp.status_code == 200:
            return resp.json().get('response', {}).get('suggestions', [])
    except Exception:
        return None
    return None
