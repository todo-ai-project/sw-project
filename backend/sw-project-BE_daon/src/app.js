const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const goalRoutes = require('./routes/goalRoutes');
const todoRoutes = require('./routes/todoRoutes');
const crewRoutes = require('./routes/crewRoutes');
const characterRoutes = require('./routes/characterRoutes');

const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// ── Routes ──────────────────────────────────────────
app.use('/api/auth', authRoutes);         // 로그인/인증
app.use('/api/goals', goalRoutes);        // 목표 (goals)
app.use('/api/todos', todoRoutes);        // 할 일 (todos, 세부목표 포함)
app.use('/api/crews', crewRoutes);        // 크루/소셜 방 (crews) 
app.use('/api/characters', characterRoutes); // 캐릭터 꾸미기 (characters) 

app.get('/', (req, res) => {
  res.json({ message: '목표 관리 서비스 API 서버가 정상 동작 중입니다.' });
});

// 공통 에러 핸들러 (항상 마지막에 등록)
app.use(errorHandler);

module.exports = app;