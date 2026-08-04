const FirestoreService = require('../services/firestoreService');
const dailyRewardService = require('../services/dailyRewardService');
const coinService = require('../services/coinService');
const { ROOM_ENTRY_COINS, PHOTO_COINS } = require('../constants/coins');

const crewStore = new FirestoreService('crews');
const crewMemberStore = new FirestoreService('crewMembers'); // {uid, crewId, goalId} - 문서 id: `${uid}_${crewId}`
const userStore = new FirestoreService('users');
const todoStore = new FirestoreService('todos');
const goalStore = new FirestoreService('goals');

async function getCrews(req, res, next) {
  try {
    const snapshot = await crewStore.collection.get();
    const crews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const memberSnapshot = await crewMemberStore.collection.get();
    const membersByCrewId = {};
    const deleteOrphans = [];
    for (const doc of memberSnapshot.docs) {
      const { crewId, uid } = doc.data();
      if (!crewId || !uid) continue;
      const user = await userStore.getById(uid);
      if (!user) {
        deleteOrphans.push(doc.id);
        continue;
      }
      if (!membersByCrewId[crewId]) membersByCrewId[crewId] = [];
      membersByCrewId[crewId].push(uid);
    }
    if (deleteOrphans.length) {
      await Promise.all(deleteOrphans.map((id) => crewMemberStore.collection.doc(id).delete()));
    }

    const emptyCrewIds = crews
      .filter((c) => !membersByCrewId[c.id]?.length)
      .map((c) => c.id);
    if (emptyCrewIds.length) {
      await Promise.all(emptyCrewIds.map((id) => crewStore.delete(id)));
    }

    const result = crews
      .filter((c) => !emptyCrewIds.includes(c.id))
      .map((c) => ({
        ...c,
        members: membersByCrewId[c.id].length,
        memberUids: membersByCrewId[c.id],
      }));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getCrewById(req, res, next) {
  try {
    const crew = await crewStore.getById(req.params.id);
    if (!crew) return res.status(404).json({ message: '크루를 찾을 수 없습니다.' });
    res.json(crew);
  } catch (err) {
    next(err);
  }
}

async function createCrew(req, res, next) {
  try {
    const { name, description, goalId, emoji } = req.body;
    if (!name) return res.status(400).json({ message: 'name은 필수입니다.' });

    const crew = await crewStore.create({
      name,
      description: description || '',
      emoji: emoji || '🌊',
      ownerId: req.user.uid,
    });

    // 방을 만든 사람도 자동으로 멤버로 등록 (goalId를 같이 보냈다면 바로 반영)
    await crewMemberStore.createWithId(`${req.user.uid}_${crew.id}`, {
      uid: req.user.uid,
      crewId: crew.id,
      goalId: goalId || '',
    });

    res.status(201).json(crew);
  } catch (err) {
    next(err);
  }
}

// 크루 가입 - 함께할 목표(goalId)를 반드시 선택. 한 사람이 여러 방에 동시 가입 가능.
async function joinCrew(req, res, next) {
  try {
    const crew = await crewStore.getById(req.params.id);
    if (!crew) return res.status(404).json({ message: '크루를 찾을 수 없습니다.' });

    const { goalId } = req.body;
    if (!goalId) return res.status(400).json({ message: '함께할 목표(goalId)를 선택해주세요.' });

    const member = await crewMemberStore.createWithId(`${req.user.uid}_${req.params.id}`, {
      uid: req.user.uid,
      crewId: req.params.id,
      goalId,
    });

    // 방마다 하루 1회 입장 보너스 (방 단위로 키를 나눔)
    const claimed = await dailyRewardService.claimOnce(
      req.user.uid,
      `roomEntry_${req.params.id}`,
      ROOM_ENTRY_COINS
    );
    res.json({ ...member, coinsEarned: claimed ? ROOM_ENTRY_COINS : 0 });
  } catch (err) {
    next(err);
  }
}

// 특정 방에서만 탈퇴 (다른 참여 중인 방은 그대로 유지됨)
// 탈퇴 후 남은 멤버가 0명이면 방을 자동 삭제
async function leaveCrew(req, res, next) {
  try {
    await crewMemberStore.delete(`${req.user.uid}_${req.params.id}`);

    const remaining = await crewMemberStore.getAllByField('crewId', req.params.id);
    if (remaining.length === 0) {
      await crewStore.delete(req.params.id);
    }

    res.json({ crewId: req.params.id, left: true, deleted: remaining.length === 0 });
  } catch (err) {
    next(err);
  }
}

async function getCrewMembers(req, res, next) {
  try {
    const members = await crewMemberStore.getAllByField('crewId', req.params.id);
    const withProfiles = [];
    const toDelete = [];
    for (const m of members) {
      const user = await userStore.getById(m.uid);
      if (!user) {
        toDelete.push(m);
        continue;
      }
      withProfiles.push({
        uid: m.uid,
        goalId: m.goalId,
        nickname: user.nickname || user.email || '익명',
      });
    }
    if (toDelete.length) {
      await Promise.all(toDelete.map(m => crewMemberStore.delete(`${m.uid}_${req.params.id}`)));
    }
    res.json(withProfiles);
  } catch (err) {
    next(err);
  }
}

// 크루원들이 각자 고른 목표의 할 일 조회
async function getCrewTodayTodos(req, res, next) {
  try {
    const members = await crewMemberStore.getAllByField('crewId', req.params.id);

    const result = [];
    for (const member of members) {
      const user = await userStore.getById(member.uid);
      if (!user) continue;
      if (!member.goalId) {
        result.push({ uid: member.uid, nickname: user.nickname || user.email, todos: [] });
        continue;
      }
      const [goal, todos] = await Promise.all([
        goalStore.getById(member.goalId),
        todoStore.getAllByField('goalId', member.goalId),
      ]);
      todos.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      result.push({ uid: member.uid, nickname: user.nickname || user.email, goalId: member.goalId, goalTitle: goal?.title || '', todos });
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function updateMemberGoal(req, res, next) {
  try {
    const { goalId } = req.body;
    if (!goalId) return res.status(400).json({ message: 'goalId는 필수입니다.' });
    const docId = `${req.user.uid}_${req.params.id}`;
    await crewMemberStore.update(docId, { goalId });
    res.json({ crewId: req.params.id, goalId });
  } catch (err) {
    next(err);
  }
}

// 친구와 사진 촬영 -> 친구 1명당 하루 1회 코인
async function addPhotoReward(req, res, next) {
  try {
    const { friendUid } = req.body;
    if (!friendUid) return res.status(400).json({ message: 'friendUid는 필수입니다.' });
    if (friendUid === req.user.uid) {
      return res.status(400).json({ message: '본인과는 사진을 찍을 수 없습니다.' });
    }

    const claimed = await dailyRewardService.claimOnce(req.user.uid, `photo_${friendUid}`, PHOTO_COINS);
    const coins = await coinService.getCoins(req.user.uid);
    res.json({ alreadyClaimed: !claimed, coinsEarned: claimed ? PHOTO_COINS : 0, coins });
  } catch (err) {
    next(err);
  }
}

/**
 * DB를 전수조사하여 멤버가 0명인 크루를 찾아 일괄 삭제하는 함수
 */
async function cleanupEmptyCrews() {
  try {
    const snapshot = await crewStore.collection.get();
    const crews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const memberSnapshot = await crewMemberStore.collection.get();
    const memberCounts = {};
    memberSnapshot.docs.forEach((doc) => {
      const { crewId } = doc.data();
      if (crewId) {
        memberCounts[crewId] = (memberCounts[crewId] || 0) + 1;
      }
    });

    const emptyCrewIds = crews
      .filter((c) => !memberCounts[c.id] || memberCounts[c.id] === 0)
      .map((c) => c.id);

    if (emptyCrewIds.length > 0) {
      await Promise.all(emptyCrewIds.map((id) => crewStore.delete(id)));
      console.log(`🧹 [자동 청소] 멤버가 0명인 빈 소셜방 ${emptyCrewIds.length개}가 삭제되었습니다.`);
    }
  } catch (err) {
    console.error('❌ 빈 크루 청소 중 에러 발생:', err);
  }
}

module.exports = {
  getCrews, getCrewById, createCrew, joinCrew, leaveCrew,
  getCrewMembers, getCrewTodayTodos, updateMemberGoal, addPhotoReward, cleanupEmptyCrews,
};