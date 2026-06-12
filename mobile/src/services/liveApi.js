import axios from 'axios';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export async function getLiveFixtures() {
  try {
    const res = await api.get('/live');
    return res.data.response || [];
  } catch (e) {
    return [];
  }
}

export async function getFixturesByDate(date) {
  try {
    const res = await api.get('/fixtures/upcoming', { params: { days: 14 } });
    const fixtures = res.data.fixtures || [];
    const day = fixtures.find(f => f.date === date);
    return day ? day.matches : [];
  } catch (e) {
    return [];
  }
}

export async function getLeagueStandings(leagueId, season = 2025) {
  return [];
}

export async function getTopLeagues() {
  return [];
}

export default api;
