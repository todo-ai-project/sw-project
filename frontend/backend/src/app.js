const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const goalRoutes = require('./routes/goalRoutes');
const todoRoutes = require('./routes/todoRoutes');
const crewRoutes = require('./routes/crewRoutes');
const characterRoutes = require('./routes/characterRoutes');
const coinRoutes = require('./routes/coinRoutes');
const missionRoutes = require('./routes/missionRoutes');

const errorHandler = require('./middlewares/errorHandler');

const app = express();

// 반드시 라우터보다 먼저
app.use(cors());
app.use(express.json());

// ── Routes ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/crews', crewRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/coins', coinRoutes);
app.use('/api/missions', missionRoutes);

app.get('/', (req, res) => {
  res.json({ message: '목표 관리 서비스 API 서버가 정상 동작 중입니다.' });
});

// 공통 에러 핸들러
app.use(errorHandler);

module.exports = app;