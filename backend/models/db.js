const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '..', 'apk_ai.db');
let db;

async function initDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      promo_code TEXT,
      bookmaker TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      premium_until DATETIME
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      matches TEXT NOT NULL,
      total_odds REAL NOT NULL,
      combined_reliability REAL NOT NULL,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS predictions (
      id TEXT PRIMARY KEY,
      match_home TEXT NOT NULL,
      match_away TEXT NOT NULL,
      league TEXT,
      prediction TEXT NOT NULL,
      reliability REAL NOT NULL,
      odds_h REAL,
      odds_d REAL,
      odds_a REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS promo_codes (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      bookmaker TEXT NOT NULL,
      bonus_days INTEGER DEFAULT 7,
      used INTEGER DEFAULT 0,
      max_uses INTEGER DEFAULT 100,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const count = db.exec("SELECT COUNT(*) as count FROM promo_codes");
  if (!count.length || count[0].values[0][0] === 0) {
    db.run("INSERT INTO promo_codes (id, code, bookmaker, max_uses) VALUES (?, ?, ?, ?)", [uuidv4(), '1XBET2026', '1xbet', 100]);
    db.run("INSERT INTO promo_codes (id, code, bookmaker, max_uses) VALUES (?, ?, ?, ?)", [uuidv4(), 'BETPAWA2026', 'betpawa', 100]);
    db.run("INSERT INTO promo_codes (id, code, bookmaker, max_uses) VALUES (?, ?, ?, ?)", [uuidv4(), 'MELBET2026', 'melbet', 100]);
  }

  saveDB();
  console.log('Base de donnees initialisee');
}

function saveDB() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function getDB() {
  return db;
}

module.exports = { initDB, getDB, saveDB };
