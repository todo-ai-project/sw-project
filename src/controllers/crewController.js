const FirestoreService = require('../services/firestoreService');
const crewStore = new FirestoreService('crews');
const userStore = new FirestoreService('users');

// 전체 크루(소셜 방) 목록
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

// 크루 생성 (생성자가 바로 ownerId + 소속 크루가 됨)
async function createCrew(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'name은 필수입니다.' });

    const crew = await crewStore.create({
      name,
      description: description || '',
      ownerId: req.user.uid,
    });

    await userStore.update(req.user.uid, { crewId: crew.id });

    res.status(201).json(crew);
  } catch (err) {
    next(err);
  }
}

// 크루 가입 (실제 DB 구조상 멤버 목록은 crews가 아니라 users.crewId로 관리)
async function joinCrew(req, res, next) {
  try {
    const crew = await crewStore.getById(req.params.id);
    if (!crew) return res.status(404).json({ message: '크루를 찾을 수 없습니다.' });

    const user = await userStore.update(req.user.uid, { crewId: req.params.id });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// 크루 탈퇴
async function leaveCrew(req, res, next) {
  try {
    const user = await userStore.update(req.user.uid, { crewId: '' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// 특정 크루에 속한 멤버 목록 (users에서 crewId로 역조회)
async function getCrewMembers(req, res, next) {
  try {
    const members = await userStore.getAllByField('crewId', req.params.id);
    res.json(members);
  } catch (err) {
    next(err);
  }
}

module.exports = { getCrews, getCrewById, createCrew, joinCrew, leaveCrew, getCrewMembers };