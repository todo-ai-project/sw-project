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

router.put('/me', updateCharacter);
router.post('/purchase', purchaseItem);

module.exports = router;