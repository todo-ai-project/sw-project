const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getCrews, getCrewById, createCrew, joinCrew, leaveCrew,
  getCrewMembers, getCrewTodayTodos, addPhotoReward,
} = require('../controllers/crewController');

router.use(authMiddleware);

router.get('/', getCrews);
router.get('/:id', getCrewById);
router.get('/:id/members', getCrewMembers);
router.get('/:id/today-todos', getCrewTodayTodos);
router.post('/', createCrew);
router.post('/:id/join', joinCrew);
router.post('/:id/leave', leaveCrew);
router.post('/:id/photo', addPhotoReward);

module.exports = router;