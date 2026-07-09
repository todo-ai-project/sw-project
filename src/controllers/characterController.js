const FirestoreService = require('../services/firestoreService');
const characterStore = new FirestoreService('characters');
const userStore = new FirestoreService('users');

// 내 캐릭터 조회 (실제 DB 구조상 characters 문서엔 userId가 없고,
// users.characterID 필드가 캐릭터 문서를 가리키는 방식)
async function getMyCharacter(req, res, next) {
  try {
    const user = await userStore.getById(req.user.uid);
    if (!user) return res.status(404).json({ message: '사용자 정보를 찾을 수 없습니다.' });

    if (user.characterID) {
      const character = await characterStore.getById(user.characterID);
      if (character) return res.json(character);
    }

    // characterID가 없거나, 가리키는 캐릭터가 없으면 기본 캐릭터 생성 후 연결
    const character = await characterStore.create({
      accessory: '',
      color: '',
      hat: '',
    });
    await userStore.update(req.user.uid, { characterID: character.id });

    res.status(201).json(character);
  } catch (err) {
    next(err);
  }
}

// 캐릭터 꾸미기 (아이템, 색상 변경)
async function updateCharacter(req, res, next) {
  try {
    const { accessory, color, hat } = req.body;
    const updated = await characterStore.update(req.params.id, { accessory, color, hat });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyCharacter, updateCharacter };