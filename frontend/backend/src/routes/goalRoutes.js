const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  createGoal,
  getMyGoals,
  getGoalById,
  updateGoal,
  toggleGoal,
  deleteGoal,
} = require('../controllers/goalController');

router.use(authMiddleware);

router.post('/', createGoal);            // 목표 입력 + AI 분석 + 만다라트(Todo 8개) 생성
router.get('/', getMyGoals);             // 내 목표 목록
router.get('/:id', getGoalById);         // 목표 상세
router.put('/:id', updateGoal);          // 목표 수정
router.patch('/:id/toggle', toggleGoal); // 목표 완료 체크 토글
router.delete('/:id', deleteGoal);       // 목표 삭제

module.exports = router;