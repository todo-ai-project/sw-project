const FirestoreService = require('../services/firestoreService');
const todoStore = new FirestoreService('todos');

// 특정 목표(Goal)에 속한 할 일들, order 순으로 정렬 (만다라트 토글 UI에서 사용)
async function getTodosByGoal(req, res, next) {
  try {
    const todos = await todoStore.getAllByField('goalId', req.params.goalId);
    todos.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    res.json(todos);
  } catch (err) {
    next(err);
  }
}

// 내 전체 할 일 목록
async function getMyTodos(req, res, next) {
  try {
    const todos = await todoStore.getAllByField('uid', req.user.uid);
    res.json(todos);
  } catch (err) {
    next(err);
  }
}

// 새 할 일 추가 (어떤 목표에 속하는지 goalId로 선택)
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

// 완료 체크 토글
async function toggleTodo(req, res, next) {
  try {
    const todo = await todoStore.getById(req.params.id);
    if (!todo) return res.status(404).json({ message: '할 일을 찾을 수 없습니다.' });

    const updated = await todoStore.update(req.params.id, { completed: !todo.completed });
    res.json(updated);
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

module.exports = {
  getTodosByGoal,
  getMyTodos,
  createTodo,
  updateTodo,
  toggleTodo,
  deleteTodo,
};