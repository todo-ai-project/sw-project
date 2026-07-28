const FirestoreService = require('../services/firestoreService');
const characterStore = new FirestoreService('characters');
const coinService = require('../services/coinService');

const ITEM_CATALOG = {
  hat_partyhat: { type: 'hat', value: 'partyhat', price: 50 },
  hat_crown: { type: 'hat', value: 'crown', price: 150 },
  accessory_scarf: { type: 'accessory', value: 'scarf', price: 80 },
  color_gold: { type: 'color', value: 'gold', price: 200 },
};

const DEFAULT_CHARACTER = {
  accessory: '',
  color: '',
  hat: '',
  ownedItems: [],
};

async function getOrCreateCharacter(uid) {
  const existing = await characterStore.getById(uid);
  if (existing) return existing;
  return characterStore.createWithId(uid, DEFAULT_CHARACTER);
}

async function getMyCharacter(req, res, next) {
  try {
    const character = await getOrCreateCharacter(req.user.uid);
    res.json(character);
  } catch (err) {
    next(err);
  }
}

async function updateCharacter(req, res, next) {
  try {
    const character = await getOrCreateCharacter(req.user.uid);

    const updated = await characterStore.update(req.user.uid, {
      accessory: req.body.accessory ?? character.accessory,
      color: req.body.color ?? character.color,
      hat: req.body.hat ?? character.hat,
      ownedItems: req.body.ownedItems ?? character.ownedItems,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function purchaseItem(req, res, next) {
  try {
    const { itemId } = req.body;
    const item = ITEM_CATALOG[itemId];

    if (!item) {
      return res.status(400).json({ message: '존재하지 않는 아이템입니다.' });
    }

    const character = await getOrCreateCharacter(req.user.uid);

    if ((character.ownedItems || []).includes(itemId)) {
      const updated = await characterStore.update(req.user.uid, {
        [item.type]: item.value,
      });

      return res.json({
        character: updated,
        coins: await coinService.getCoins(req.user.uid),
      });
    }

    const remainingCoins = await coinService.spendCoins(
      req.user.uid,
      item.price
    );

    const updated = await characterStore.update(req.user.uid, {
      [item.type]: item.value,
      ownedItems: [...(character.ownedItems || []), itemId],
    });

    res.json({
      character: updated,
      coins: remainingCoins,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyCharacter,
  updateCharacter,
  purchaseItem,
};