const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getCrews,
  getCrewById,
  createCrew,
  joinCrew,
  leaveCrew,
  getCrewMembers,
} = require('../controllers/crewController');

router.use(authMiddleware);

router.get('/', getCrews);
router.get('/:id', getCrewById);
router.get('/:id/members', getCrewMembers);
router.post('/', createCrew);
router.post('/:id/join', joinCrew);
router.post('/:id/leave', leaveCrew);

module.exports = router;