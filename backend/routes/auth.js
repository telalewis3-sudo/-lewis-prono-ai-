const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDB, saveDB } = require('../models/db');

const router = express.Router();
const JWT_SECRET = 'apk-ai-secret-key-2026';

router.post('/register', (req, res) => {
  const { username, email, password, promo_code } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Champs requis: username, email, password' });
  }

  const db = getDB();
  const existing = db.exec(`SELECT id FROM users WHERE email = '${email.replace(/'/g, "''")}' OR username = '${username.replace(/'/g, "''")}'`);
  if (existing.length && existing[0].values.length) {
    return res.status(409).json({ error: 'Utilisateur deja existant' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = uuidv4();

  let bookmaker = null;
  if (promo_code) {
    const result = db.exec(`SELECT * FROM promo_codes WHERE code = '${promo_code.toUpperCase().replace(/'/g, "''")}' AND used < max_uses`);
    if (result.length && result[0].values.length) {
      const promo = result[0].values[0];
      bookmaker = promo[2];
      db.run(`UPDATE promo_codes SET used = used + 1 WHERE code = '${promo[1].replace(/'/g, "''")}'`);
    }
  }

  const premiumUntil = bookmaker ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null;

  db.run(
    "INSERT INTO users (id, username, email, password, promo_code, bookmaker, premium_until) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [userId, username, email, hashedPassword, promo_code || null, bookmaker, premiumUntil]
  );
  saveDB();

  const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '30d' });

  res.status(201).json({
    token,
    user: { id: userId, username, email, bookmaker, premium: !!premiumUntil }
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et password requis' });
  }

  const db = getDB();
  const result = db.exec(`SELECT * FROM users WHERE email = '${email.replace(/'/g, "''")}'`);
  if (!result.length || !result[0].values.length) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  const userData = result[0].values[0];
  const columns = result[0].columns;
  const user = {};
  columns.forEach((col, i) => { user[col] = userData[i]; });

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Identifiants invalides' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      bookmaker: user.bookmaker,
      premium: user.premium_until && new Date(user.premium_until) > new Date()
    }
  });
});

router.get('/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token requis' });

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const db = getDB();
    const result = db.exec(`SELECT id, username, email, bookmaker, promo_code, premium_until, created_at FROM users WHERE id = '${decoded.id.replace(/'/g, "''")}'`);
    if (!result.length || !result[0].values.length) {
      return res.status(404).json({ error: 'Utilisateur non trouve' });
    }

    const userData = result[0].values[0];
    const columns = result[0].columns;
    const user = {};
    columns.forEach((col, i) => { user[col] = userData[i]; });

    res.json({ ...user, premium: user.premium_until && new Date(user.premium_until) > new Date() });
  } catch (err) {
    res.status(401).json({ error: 'Token invalide' });
  }
});

module.exports = router;
