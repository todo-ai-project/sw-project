const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getTodosByGoal,
  getMyTodos,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
} = require('../controllers/todoController');

router.use(authMiddleware);

router.get('/goal/:goalId', getTodosByGoal); // 특정 목표의 할 일 목록 (order순)
router.get('/', getMyTodos);                 // 내 전체 할 일
router.post('/', createTodo);
router.put('/:id', updateTodo);
router.patch('/:id/toggle', toggleTodo);     // 완료 체크 토글
router.delete('/:id', deleteTodo);

module.exports = router;