const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDB, saveDB } = require('../models/db');

const router = express.Router();

const LEAGUES = [
  'Ligue 1', 'Premier League', 'La Liga', 'Serie A',
  'Bundesliga', 'Liga Portugal', 'Eredivisie', 'Jupiler Pro League'
];

const TEAMS = {
  'Ligue 1': [['PSG', 'Marseille'], ['Lyon', 'Monaco'], ['Lille', 'Rennes'], ['Nice', 'Lens']],
  'Premier League': [['Manchester City', 'Arsenal'], ['Liverpool', 'Chelsea'], ['Tottenham', 'Manchester Utd']],
  'La Liga': [['Real Madrid', 'Barcelona'], ['Atletico Madrid', 'Sevilla'], ['Valencia', 'Athletic Bilbao']],
  'Serie A': [['Inter Milan', 'AC Milan'], ['Juventus', 'Napoli'], ['Roma', 'Lazio']],
  'Bundesliga': [['Bayern Munich', 'Dortmund'], ['Leipzig', 'Leverkusen'], ['Stuttgart', 'Frankfurt']],
  'Liga Portugal': [['Benfica', 'Porto'], ['Sporting', 'Braga']],
  'Eredivisie': [['Ajax', 'Feyenoord'], ['PSV', 'AZ']],
  'Jupiler Pro League': [['Anderlecht', 'Club Brugge'], ['Genk', 'Antwerp']],
};

router.get('/matches', (req, res) => {
  const league = req.query.league;
  const matches = [];
  const leagues = league ? [league] : Object.keys(TEAMS);

  leagues.forEach(l => {
    if (TEAMS[l]) {
      TEAMS[l].forEach((pair, idx) => {
        matches.push({
          id: `${l.replace(/\s/g, '_')}_${idx}`,
          home: pair[0],
          away: pair[1],
          league: l,
          odds_h: +(1.2 + Math.random() * 2).toFixed(2),
          odds_d: +(3.0 + Math.random() * 2).toFixed(2),
          odds_a: +(2.5 + Math.random() * 3).toFixed(2),
          date: new Date(Date.now() + (idx + 1) * 86400000).toISOString()
        });
      });
    }
  });

  res.json({ matches, count: matches.length });
});

router.get('/leagues', (req, res) => {
  res.json({ leagues: LEAGUES.map(l => ({ name: l })) });
});

router.post('/save', (req, res) => {
  const { match_home, match_away, league, prediction, reliability, odds_h, odds_d, odds_a } = req.body;
  const db = getDB();
  const id = uuidv4();

  db.run(
    "INSERT INTO predictions (id, match_home, match_away, league, prediction, reliability, odds_h, odds_d, odds_a) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, match_home, match_away, league, prediction, reliability, odds_h, odds_d, odds_a]
  );
  saveDB();

  res.status(201).json({ id });
});

module.exports = router;
