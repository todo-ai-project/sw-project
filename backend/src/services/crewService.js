//crewService.js
const FirestoreService = require('./firestoreService');
const dailyRewardService = require('./dailyRewardService');
const { CREW_ALL_DONE_COINS } = require('../constants/coins');

const crewMemberStore = new FirestoreService('crewMembers');
const todoStore = new FirestoreService('todos');

/**
 * 할 일 완료 직후 호출.
 * 완료한 사람이 참여 중인 "모든" 방에 대해 각각 검사 ->
 * 그 방의 멤버 전원이(각자 고른 목표 기준) 할 일을 다 끝냈으면
 * 해당 방 멤버 전체에게 하루 1회 보너스 지급
 */
async function maybeAwardCrewAllDoneBonus(uid) {
  const myMemberships = await crewMemberStore.getAllByField('uid', uid);
  if (myMemberships.length === 0) return;

  for (const membership of myMemberships) {
    const { crewId } = membership;
    if (!crewId) continue;

    const crewMembers = await crewMemberStore.getAllByField('crewId', crewId);
    const activeMembers = crewMembers.filter((m) => m.goalId);
    if (activeMembers.length === 0) continue;

    let allDone = true;
    for (const member of activeMembers) {
      const todos = await todoStore.getAllByField('goalId', member.goalId);
      if (todos.length === 0 || todos.some((t) => !t.completed)) {
        allDone = false;
        break;
      }
    }
    if (!allDone) continue;

    await Promise.all(
      activeMembers.map((member) =>
        dailyRewardService.claimOnce(member.uid, `crewAllDone_${crewId}`, CREW_ALL_DONE_COINS)
      )
    );
  }
}

module.exports = { maybeAwardCrewAllDoneBonus };