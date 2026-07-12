const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { getMyCharacter, updateCharacter } = require('../controllers/characterController');

router.use(authMiddleware);

router.get('/me', getMyCharacter);
router.put('/:id', updateCharacter);

module.exports = router;