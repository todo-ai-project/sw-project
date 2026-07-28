const FirestoreService = require('./firestoreService');
const dailyRewardService = require('./dailyRewardService');
const { CREW_ALL_DONE_COINS } = require('../constants/coins');

const userStore = new FirestoreService('users');
const todoStore = new FirestoreService('todos');

/**
 * 할 일 완료 직후 호출.
 * 완료한 사람이 속한 크루의 멤버 전원이(각자 크루 가입 시 고른 목표 기준)
 * 오늘의 할 일을 다 끝냈으면 -> 크루원 전체에게 하루 1회 보너스 지급
 */
async function maybeAwardCrewAllDoneBonus(uid) {
  const user = await userStore.getById(uid);
  if (!user?.crewId || !user?.crewGoalId) return;

  const members = await userStore.getAllByField('crewId', user.crewId);
  const activeMembers = members.filter((m) => m.crewGoalId);
  if (activeMembers.length === 0) return;

  for (const member of activeMembers) {
    const todos = await todoStore.getAllByField('goalId', member.crewGoalId);
    if (todos.length === 0 || todos.some((t) => !t.completed)) {
      return; // 아직 안 끝낸 멤버 있음 -> 보너스 없음
    }
  }

  await Promise.all(
    activeMembers.map((member) =>
      dailyRewardService.claimOnce(member.id, `crewAllDone_${user.crewId}`, CREW_ALL_DONE_COINS)
    )
  );
}

module.exports = { maybeAwardCrewAllDoneBonus };