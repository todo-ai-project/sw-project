const FirestoreService = require('../services/firestoreService');
const dailyRewardService = require('../services/dailyRewardService');
const coinService = require('../services/coinService');
const { ROOM_ENTRY_COINS, PHOTO_COINS } = require('../constants/coins');

const crewStore = new FirestoreService('crews');
const userStore = new FirestoreService('users');
const todoStore = new FirestoreService('todos');

async function getCrews(req, res, next) {
  try {
    const snapshot = await crewStore.collection.get();
    const crews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(crews);
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
    const { name, description, goalId } = req.body;
    if (!name) return res.status(400).json({ message: 'name은 필수입니다.' });

    const crew = await crewStore.create({
      name,
      description: description || '',
      ownerId: req.user.uid,
    });

    const userUpdate = { crewId: crew.id };
    if (goalId) userUpdate.crewGoalId = goalId;
    await userStore.update(req.user.uid, userUpdate);

    res.status(201).json(crew);
  } catch (err) {
    next(err);
  }
}

// 크루 가입 - 함께할 목표(goalId)를 반드시 선택
async function joinCrew(req, res, next) {
  try {
    const crew = await crewStore.getById(req.params.id);
    if (!crew) return res.status(404).json({ message: '크루를 찾을 수 없습니다.' });

    const { goalId } = req.body;
    if (!goalId) return res.status(400).json({ message: '함께할 목표(goalId)를 선택해주세요.' });

    const user = await userStore.update(req.user.uid, {
      crewId: req.params.id,
      crewGoalId: goalId,
    });

    const claimed = await dailyRewardService.claimOnce(req.user.uid, 'roomEntry', ROOM_ENTRY_COINS);
    res.json({ ...user, coinsEarned: claimed ? ROOM_ENTRY_COINS : 0 });
  } catch (err) {
    next(err);
  }
}

async function leaveCrew(req, res, next) {
  try {
    const user = await userStore.update(req.user.uid, { crewId: '', crewGoalId: '' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function getCrewMembers(req, res, next) {
  try {
    const members = await userStore.getAllByField('crewId', req.params.id);
    res.json(members);
  } catch (err) {
    next(err);
  }
}

// 크루원들이 각자 고른 목표의 할 일(=오늘 할 일) 조회
async function getCrewTodayTodos(req, res, next) {
  try {
    const members = await userStore.getAllByField('crewId', req.params.id);

    const result = [];
    for (const member of members) {
      if (!member.crewGoalId) {
        result.push({ uid: member.id, nickname: member.nickname || member.email, todos: [] });
        continue;
      }
      const todos = await todoStore.getAllByField('goalId', member.crewGoalId);
      todos.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      result.push({ uid: member.id, nickname: member.nickname || member.email, goalId: member.crewGoalId, todos });
    }

    res.json(result);
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

module.exports = {
  getCrews, getCrewById, createCrew, joinCrew, leaveCrew,
  getCrewMembers, getCrewTodayTodos, addPhotoReward,
};