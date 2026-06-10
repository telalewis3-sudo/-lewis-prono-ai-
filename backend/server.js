const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./models/db');
const authRoutes = require('./routes/auth');
const predictionRoutes = require('./routes/predictions');
const promoRoutes = require('./routes/promo');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

initDB();

app.use('/api/auth', authRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/promo', promoRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'APK AI Backend', version: '1.0.0' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=== APK AI Backend demarre sur http://localhost:${PORT} ===`);
});
