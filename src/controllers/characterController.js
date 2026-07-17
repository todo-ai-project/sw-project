const FirestoreService = require('../services/firestoreService');

const characterStore = new FirestoreService('characters');

// 내 캐릭터 조회
async function getMyCharacter(req, res, next) {
  try {
    // uid를 문서 ID로 사용
    let character = await characterStore.getById(req.user.uid);

    // 없으면 기본 캐릭터 생성
    if (!character) {
      character = await characterStore.createWithId(req.user.uid, {
        color: "default",
        hat: null,
        accessory: null,
      });

      return res.status(201).json(character);
    }

    res.json(character);
  } catch (err) {
    next(err);
  }
}

// 캐릭터 꾸미기
async function updateCharacter(req, res, next) {
  try {
    const { accessory, color, hat } = req.body;

    const updated = await characterStore.update(req.user.uid, {
      accessory,
      color,
      hat,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyCharacter,
  updateCharacter,
};