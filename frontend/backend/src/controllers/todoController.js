const FirestoreService = require('../services/firestoreService');
const dailyRewardService = require('../services/dailyRewardService');
const crewService = require('../services/crewService');
const { TODO_DAILY_COINS } = require('../constants/coins');
const todoStore = new FirestoreService('todos');

async function getTodosByGoal(req, res, next) {
  try {
    const todos = await todoStore.getAllByField('goalId', req.params.goalId);
    todos.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    res.json(todos);
  } catch (err) {
    next(err);
  }
}

async function getMyTodos(req, res, next) {
  try {
    const todos = await todoStore.getAllByField('uid', req.user.uid);
    res.json(todos);
  } catch (err) {
    next(err);
  }
}

async function createTodo(req, res, next) {
  try {
    const { goalId, title, order } = req.body;
    if (!goalId || !title) {
      return res.status(400).json({ message: 'goalId, title은 필수입니다.' });
    }
    const todo = await todoStore.create({
      uid: req.user.uid,
      goalId,
      title,
      order: order ?? 0,
      completed: false,
    });
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
}

async function updateTodo(req, res, next) {
  try {
    const updated = await todoStore.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// 완료 체크 토글 - 같은 목표에서 하루에 여러 개 완료해도 코인은 1개만
async function toggleTodo(req, res, next) {
  try {
    const todo = await todoStore.getById(req.params.id);
    if (!todo) return res.status(404).json({ message: '할 일을 찾을 수 없습니다.' });

    const willComplete = !todo.completed;
    const updated = await todoStore.update(req.params.id, { completed: willComplete });

    let coinsEarned = 0;
    if (willComplete) {
      const claimed = await dailyRewardService.claimOnce(
        req.user.uid,
        `todo_${todo.goalId}`,
        TODO_DAILY_COINS
      );
      coinsEarned = claimed ? TODO_DAILY_COINS : 0;

      // 크루 전원 완료 여부 체크는 완료 처리 자체를 막으면 안 되니 실패해도 무시
      crewService.maybeAwardCrewAllDoneBonus(req.user.uid).catch(console.error);
    }

    res.json({ ...updated, coinsEarned });
  } catch (err) {
    next(err);
  }
}

async function deleteTodo(req, res, next) {
  try {
    await todoStore.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getTodosByGoal, getMyTodos, createTodo, updateTodo, toggleTodo, deleteTodo };