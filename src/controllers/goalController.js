const { createGoalWithMandalart, goalStore } = require('../services/goalService');

// 목표 입력 → Gemini 분석 → Goal + Todo(만다라트) 자동 생성
async function createGoal(req, res, next) {
  try {
    const { goalText } = req.body;
    if (!goalText) return res.status(400).json({ message: 'goalText는 필수입니다.' });

    const result = await createGoalWithMandalart(req.user.uid, goalText);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// 내 목표 전체 목록 조회
async function getMyGoals(req, res, next) {
  try {
    const goals = await goalStore.getAllByField('uid', req.user.uid);
    res.json(goals);
  } catch (err) {
    next(err);
  }
}

async function getGoalById(req, res, next) {
  try {
    const goal = await goalStore.getById(req.params.id);
    if (!goal) return res.status(404).json({ message: '목표를 찾을 수 없습니다.' });
    res.json(goal);
  } catch (err) {
    next(err);
  }
}

async function updateGoal(req, res, next) {
  try {
    const updated = await goalStore.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// 목표 완료 체크 토글
async function toggleGoal(req, res, next) {
  try {
    const goal = await goalStore.getById(req.params.id);
    if (!goal) return res.status(404).json({ message: '목표를 찾을 수 없습니다.' });

    const updated = await goalStore.update(req.params.id, { completed: !goal.completed });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteGoal(req, res, next) {
  try {
    await goalStore.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { createGoal, getMyGoals, getGoalById, updateGoal, toggleGoal, deleteGoal };