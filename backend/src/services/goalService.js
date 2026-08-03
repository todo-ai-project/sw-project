const FirestoreService = require('./firestoreService');
const { generateMandalart } = require('./geminiService');

const goalStore = new FirestoreService('goals');
const todoStore = new FirestoreService('todos');

/**
 * 목표 입력 → Gemini 분석 → Goal + Todo(8개, order 0~7) 저장까지 한 번에 처리
 * 실제 DB 스키마: goals(completed, title, uid, deadline) / todos(completed, goalId, order, title, uid)
 */
async function createGoalWithMandalart(uid, goalText, deadline) {
  const mandalart = await generateMandalart(goalText);

  const goal = await goalStore.create({
    uid,
    title: mandalart.mainGoal,
    completed: false,
    deadline: deadline || null,
  });

  const todos = await Promise.all(
    mandalart.subGoals.map((title, i) =>
      todoStore.create({ uid, goalId: goal.id, title, order: i, completed: false })
    )
  );

  return { ...goal, todos };
}

module.exports = { createGoalWithMandalart, goalStore };