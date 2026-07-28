const FirestoreService = require('../services/firestoreService');
const characterStore = new FirestoreService('characters');
const coinService = require('../services/coinService');

const ITEM_CATALOG = {
  hat_ribbon:    { type: 'hat', value: 'ribbon', price: 50 },
  hat_bunny:     { type: 'hat', value: 'bunny', price: 70 },
  hat_cat:       { type: 'hat', value: 'cat', price: 90 },
  hat_flower:    { type: 'hat', value: 'flower', price: 100 },
  hat_halo:      { type: 'hat', value: 'halo', price: 120 },
  hat_crown:     { type: 'hat', value: 'crown', price: 150 },

  effect_bubbles:  { type: 'effect', value: 'bubbles', price: 35 },
  effect_sparkles: { type: 'effect', value: 'sparkles', price: 60 },
  effect_flowers:  { type: 'effect', value: 'flowers', price: 80 },
  color_gold:      { type: 'effect', value: 'gold', price: 200 },

  expression_smile:  { type: 'expression', value: 'smile', price: 30 },
  expression_wink:   { type: 'expression', value: 'wink', price: 20 },
  expression_heart:  { type: 'expression', value: 'heart', price: 35 },
  expression_sleepy: { type: 'expression', value: 'sleepy', price: 45 },

  bg_cave:  { type: 'background', value: 'cave', price: 40 },
  bg_coral: { type: 'background', value: 'coral', price: 60 },
  bg_beach: { type: 'background', value: 'beach', price: 80 },
  bg_ring:  { type: 'background', value: 'ring', price: 100 },
  bg_shell: { type: 'background', value: 'shell', price: 120 },
};

const DEFAULT_CHARACTER = {
  hat: '',
  effect: '',
  expression: 'normal',
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
    const { hat, effect, expression } = req.body;
    const character = await getOrCreateCharacter(req.user.uid);
    const updated = await characterStore.update(req.user.uid, {
      hat: hat ?? character.hat,
      effect: effect ?? character.effect,
      expression: expression ?? character.expression,
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
      return res.json({
        character,
        coins: await coinService.getCoins(req.user.uid),
        alreadyOwned: true,
      });
    }

    const remainingCoins = await coinService.spendCoins(req.user.uid, item.price);

    const updated = await characterStore.update(req.user.uid, {
      ownedItems: [...(character.ownedItems || []), itemId],
    });

    res.json({ character: updated, coins: remainingCoins });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyCharacter, updateCharacter, purchaseItem };
