const FirestoreService = require('./firestoreService');
const { generateMandalart } = require('./geminiService');

const goalStore = new FirestoreService('goals');
const todoStore = new FirestoreService('todos');

/**
 * 목표 입력 → Gemini 분석 → Goal + Todo(8개, order 0~7) 저장까지 한 번에 처리
 * 실제 DB 스키마: goals(completed, title, uid) / todos(completed, goalId, order, title, uid)
 */
async function createGoalWithMandalart(uid, goalText) {
  const mandalart = await generateMandalart(goalText);

  const goal = await goalStore.create({
    uid,
    title: mandalart.mainGoal,
    completed: false,
  });

  const todos = [];
  for (let i = 0; i < mandalart.subGoals.length; i++) {
    const todo = await todoStore.create({
      uid,
      goalId: goal.id,
      title: mandalart.subGoals[i],
      order: i,
      completed: false,
    });
    todos.push(todo);
  }

  return { ...goal, todos };
}

module.exports = { createGoalWithMandalart, goalStore, todoStore };