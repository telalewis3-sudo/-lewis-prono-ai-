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

export default api;
