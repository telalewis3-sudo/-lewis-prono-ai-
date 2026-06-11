import { Platform, Dimensions } from 'react-native';

const getApiUrl = () => {
  return 'https://Mrlewis.pythonanywhere.com/api';
};

export const API_URL = getApiUrl();
export const APP_NAME = 'Lewis Prono AI';
export const APP_VERSION = '1.0.0';
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const BOOKMAKERS = [
  { id: '1xbet', name: '1xBet', color: '#1B4F72', accent: '#3A7BD5' },
  { id: 'betpawa', name: 'BetPawa', color: '#1E8449', accent: '#27AE60' },
  { id: 'melbet', name: 'Melbet', color: '#B03A2E', accent: '#E74C3C' },
  { id: 'betwinner', name: 'BetWinner', color: '#6C3483', accent: '#8E44AD' },
  { id: '22bet', name: '22Bet', color: '#1A5276', accent: '#2980B9' },
];

export const COLORS = {
  primary: '#D4A574',
  primaryDark: '#B8864A',
  primaryLight: '#E8C89A',
  secondary: '#2C3E7B',
  background: '#0C0F1A',
  surface: '#1A1F2E',
  card: '#232A3D',
  cardLight: '#2A3248',
  text: '#FFFFFF',
  textSecondary: '#8892A0',
  textMuted: '#5A6478',
  success: '#2ECC71',
  warning: '#F39C12',
  danger: '#E74C3C',
  info: '#3498DB',
  gold: '#D4A574',
  goldLight: '#F0D9B5',
  border: '#2A3248',
  overlay: 'rgba(12, 15, 26, 0.9)',
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
};

export const FOOTBALL_API_KEY = '4fcd095e8284eb9bf1bd23c0bb83a792';
export const FOOTBALL_API_BASE = 'https://v3.football.api-sports.io';
export const RAPIDAPI_KEY = 'a9126e9090msh2e4d9a383218738p11f2f7jsn73c7409a7d28';

export const FONTS = {
  title: 28,
  subtitle: 20,
  body: 16,
  caption: 13,
  small: 11,
};

export const SHARE_TEXT = '📢 {match} — Pronostic: {prediction} (fiabilité: {reliability}%) via Lewis Prono AI 🏆';
export const WORLD_CUP_2026 = new Date('2026-06-11T00:00:00Z');

export const SHOW_WELCOME_ONCE = true;
