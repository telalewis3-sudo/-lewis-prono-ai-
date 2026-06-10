const express = require('express');
const { getDB } = require('../models/db');

const router = express.Router();

const BOOKMAKERS = {
  '1xbet': { prefix: '1XBET', name: '1xBet', bonus_days: 7 },
  'betpawa': { prefix: 'BETPAWA', name: 'BetPawa', bonus_days: 7 },
  'melbet': { prefix: 'MELBET', name: 'Melbet', bonus_days: 7 },
};

router.post('/validate', (req, res) => {
  const { code, bookmaker } = req.body;
  if (!code || !bookmaker) {
    return res.status(400).json({ error: 'Code et bookmaker requis' });
  }

  const bk = BOOKMAKERS[bookmaker.toLowerCase()];
  if (!bk) {
    return res.status(400).json({ error: 'Bookmaker non supporte. Utilisez: 1xbet, betpawa, melbet' });
  }

  const codeUpper = code.toUpperCase();
  const db = getDB();

  const result = db.exec(`SELECT * FROM promo_codes WHERE code = '${codeUpper.replace(/'/g, "''")}' AND bookmaker = '${bookmaker.toLowerCase().replace(/'/g, "''")}'`);

  if (!result.length || !result[0].values.length) {
    if (codeUpper.startsWith(bk.prefix) && codeUpper.length >= 8) {
      return res.json({
        valid: true,
        bookmaker: bk.name,
        bonus: `${bk.bonus_days} jours d'acces premium`,
        bonus_days: bk.bonus_days,
        message: `Code ${bk.name} valide ! Bienvenue.`
      });
    }
    return res.status(400).json({ valid: false, message: 'Code promo invalide ou epuise' });
  }

  const promoData = result[0].values[0];
  const columns = result[0].columns;
  const promo = {};
  columns.forEach((col, i) => { promo[col] = promoData[i]; });

  if (promo.used >= promo.max_uses) {
    return res.status(400).json({ valid: false, message: 'Code promo epuise' });
  }

  res.json({
    valid: true,
    bookmaker: bk.name,
    bonus: `${bk.bonus_days} jours d'acces premium`,
    bonus_days: bk.bonus_days,
    message: `Code ${bk.name} valide ! ${bk.bonus_days} jours premium offerts.`
  });
});

router.get('/bookmakers', (req, res) => {
  res.json({
    bookmakers: Object.values(BOOKMAKERS).map(b => ({
      name: b.name,
      key: b.name.toLowerCase()
    }))
  });
});

module.exports = router;
