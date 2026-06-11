import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {}
  return config;
});

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (username, email, password, promo_code) =>
    api.post('/auth/register', { username, email, password, promo_code }),
  profile: () => api.get('/auth/profile'),
};

export const predictionAPI = {
  getLeagues: () => api.get('/predictions/leagues'),
  getMatches: (league) => api.get('/predictions/matches', { params: { league } }),
  getAIPredictions: () => api.get('/predict-all'),
  getCoupon: (league, minReliability, maxMatches) =>
    api.get('/coupon', { params: { league, min_reliability: minReliability, max_matches: maxMatches } }),
};

export const promoAPI = {
  validate: (code, bookmaker) => api.post('/promo/validate', { code, bookmaker }),
  getBookmakers: () => api.get('/promo/bookmakers'),
};

// Local favorites storage (AsyncStorage-like via SecureStore)
export const favoritesAPI = {
  getFavorites: async () => {
    try {
      const data = await SecureStore.getItemAsync('favorites');
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  },
  addFavorite: async (prediction) => {
    try {
      const faves = await favoritesAPI.getFavorites();
      const exists = faves.find(f => f.match === prediction.match);
      if (!exists) {
        faves.push({ ...prediction, added_at: new Date().toISOString() });
        await SecureStore.setItemAsync('favorites', JSON.stringify(faves));
      }
      return faves;
    } catch (e) { return []; }
  },
  removeFavorite: async (match) => {
    try {
      let faves = await favoritesAPI.getFavorites();
      faves = faves.filter(f => f.match !== match);
      await SecureStore.setItemAsync('favorites', JSON.stringify(faves));
      return faves;
    } catch (e) { return []; }
  },
};

export const highlightsAPI = {
  getHighlights: (params = {}) => api.get('/highlights', { params }),
  getTodaysHighlights: (limit = 20) => api.get('/highlights/today', { params: { limit } }),
  getHighlightMatches: (params = {}) => api.get('/highlights/matches', { params }),
  getUpcomingFixtures: (days = 7) => api.get('/fixtures/upcoming', { params: { days } }),
};

export default api;
