const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getMyCharacter,
  updateCharacter,
  purchaseItem,
} = require('../controllers/characterController');

router.use(authMiddleware);

// 내 캐릭터 조회
router.get('/me', getMyCharacter);

// 내 캐릭터 저장 (색상/모자/악세서리)
router.put('/me', updateCharacter);

// 아이템 구매 (코인 차감 + 자동 착용)
router.post('/purchase', purchaseItem);

module.exports = router;