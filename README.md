# APK AI - Pronostics Sportifs Intelligent

Application mobile de pronostics sportifs footballistiques avec IA. Propose des coupons à haute fiabilité. Système de codes promo bookmakers (1xBet, BetPawa, Melbet).

## Architecture

```
apk-ai/
├── ai-engine/       # Moteur IA Python (Flask + scikit-learn)
├── backend/         # API Node.js (Express + SQLite)
├── mobile/          # App React Native (Expo)
└── README.md
```

## Installation

### 1. Moteur IA
```bash
cd ai-engine
pip install -r requirements.txt
python main.py
# API sur http://localhost:5000
```

### 2. Backend
```bash
cd backend
npm install
npm start
# API sur http://localhost:3000
```

### 3. Mobile
```bash
cd mobile
npm install
npx expo start
# Scanner le QR code avec Expo Go
```

## Compiler l'APK
```bash
cd mobile
npx eas build --platform android --local
```

## Fonctionnalités

- Pronostics IA avec indice de fiabilité
- Génération de coupons optimisés
- Authentification avec codes promo bookmakers
- Support 1xBet, BetPawa, Melbet
- Analyse statistique des matchs
