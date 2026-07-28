const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getMyCoins, checkAttendance } = require('../controllers/coinController');

router.use(authMiddleware);

router.get('/me', getMyCoins);
router.post('/attendance', checkAttendance);

module.exports = router;