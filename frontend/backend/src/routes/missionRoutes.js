const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');

const {
  claimMission,
  getMissionStatus
} = require('../controllers/missionController');


router.use(authMiddleware);

router.post('/claim', claimMission);

router.get('/status', getMissionStatus);


module.exports = router;