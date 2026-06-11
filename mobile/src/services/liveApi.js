import axios from 'axios';
import { FOOTBALL_API_KEY, FOOTBALL_API_BASE } from '../utils/constants';

const api = axios.create({
  baseURL: FOOTBALL_API_BASE,
  timeout: 10000,
  headers: {
    'x-apisports-key': FOOTBALL_API_KEY,
  },
});

const TOP_LEAGUES = [39, 140, 135, 78, 61, 2, 94, 144, 179, 203, 262, 71, 62, 40, 169, 536];

export async function getLiveFixtures() {
  try {
    const res = await api.get('/fixtures', { params: { live: 'all' } });
    return res.data.response || [];
  } catch (e) {
    return [];
  }
}

export async function getFixturesByDate(date) {
  try {
    const res = await api.get('/fixtures', { params: { date, timezone: 'Africa/Douala' } });
    return res.data.response || [];
  } catch (e) {
    return [];
  }
}

export async function getLeagueStandings(leagueId, season = 2025) {
  try {
    const res = await api.get('/standings', { params: { league: leagueId, season } });
    return res.data.response?.[0]?.league?.standings?.[0] || [];
  } catch (e) {
    return [];
  }
}

export async function getTopLeagues() {
  const results = [];
  for (const id of TOP_LEAGUES.slice(0, 5)) {
    try {
      const res = await api.get('/leagues', { params: { id } });
      if (res.data.response?.length) results.push(res.data.response[0]);
    } catch (e) {}
  }
  return results;
}

export function formatFixture(f) {
  const home = f.teams?.home?.name || '';
  const away = f.teams?.away?.name || '';
  const score = f.goals;
  const status = f.fixture?.status?.short || '';
  const elapsed = f.fixture?.status?.elapsed || 0;
  const date = f.fixture?.date || '';
  const league = f.league?.name || '';
  const leagueLogo = f.league?.logo || '';
  const homeLogo = f.teams?.home?.logo || '';
  const awayLogo = f.teams?.away?.logo || '';

  return {
    id: f.fixture?.id,
    match: `${home} vs ${away}`,
    home,
    away,
    scoreHome: score?.home ?? '-',
    scoreAway: score?.away ?? '-',
    minute: elapsed,
    status,
    date,
    league,
    leagueLogo,
    homeLogo,
    awayLogo,
    isLive: status === '1H' || status === '2H' || status === 'HT' || status === 'ET',
    isUpcoming: status === 'NS' || status === 'TBD',
    isFinished: status === 'FT' || status === 'AET' || status === 'PEN',
  };
}

export default api;
