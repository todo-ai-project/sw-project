const dailyRewardService = require('../services/dailyRewardService');
const { ATTENDANCE_COINS, ROOM_ENTRY_COINS, PHOTO_COINS } = require('../constants/coins');

const MISSION_COINS = {
  attendance: ATTENDANCE_COINS,
  'enter-room': ROOM_ENTRY_COINS,
  'room-photo': PHOTO_COINS,
};


async function claimMission(req, res, next) {
  try {
    const { missionId } = req.body;

    const amount = MISSION_COINS[missionId];

    if (!amount) {
      return res.status(400).json({
        message: '유효하지 않은 미션입니다.'
      });
    }

    const claimed = await dailyRewardService.claimOnce(
      req.user.uid,
      missionId,
      amount
    );

    res.json({
      claimed,
      coinsEarned: claimed ? amount : 0
    });

  } catch (err) {
    next(err);
  }
}


async function getMissionStatus(req, res, next) {
  try {
    const status = await dailyRewardService.getTodayClaims(req.user.uid);

    res.json(status);

  } catch(err) {
    next(err);
  }
}


module.exports = {
  claimMission,
  getMissionStatus
};