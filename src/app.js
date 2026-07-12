const authRoutes = require('./routes/authRoutes');
const express = require('express');
const cors = require('cors');

// authRoutes는 백엔드2(로그인/인증 담당)가 따로 구현 예정 → 여기서는 연결하지 않음
const goalRoutes = require('./routes/goalRoutes');
const todoRoutes = require('./routes/todoRoutes');
const crewRoutes = require('./routes/crewRoutes');
const characterRoutes = require('./routes/characterRoutes');

const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// ── Routes ──────────────────────────────────────────
// app.use('/api/auth', authRoutes);      // TODO: 백엔드2가 구현하면 여기 연결
app.use('/api/auth', authRoutes);

app.use('/api/goals', goalRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/crews', crewRoutes);
app.use('/api/characters', characterRoutes);

app.get('/', (req, res) => {
  res.json({ message: '목표 관리 서비스 API 서버가 정상 동작 중입니다.' });
});

// 공통 에러 핸들러 (항상 마지막에 등록)
app.use(errorHandler);

module.exports = app;