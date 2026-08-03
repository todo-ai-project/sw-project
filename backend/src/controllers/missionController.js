const dailyRewardService = require('../services/dailyRewardService');
const { ATTENDANCE_COINS, ROOM_ENTRY_COINS, PHOTO_COINS } = require('../constants/coins');

// 코인이 0인 항목(todo-done, goal-complete, team-complete)은
// todoController / goalController / crewService에서 이미 코인을 지급하고 있어서
// 여기서는 "미션 체크(완료 표시)"용으로만 기록하고 코인은 중복 지급하지 않음
const MISSION_COINS = {
  attendance: ATTENDANCE_COINS,
  'enter-room': ROOM_ENTRY_COINS,
  'room-photo': PHOTO_COINS,
  'todo-done': 0,
  'goal-complete': 0,
  'team-complete': 0,
};


async function claimMission(req, res, next) {
  try {
    const { missionId } = req.body;

    // MISSION_COINS[missionId]가 0일 수도 있으므로 !amount가 아니라 in 연산자로 검증
    if (!(missionId in MISSION_COINS)) {
      return res.status(400).json({
        message: '유효하지 않은 미션입니다.'
      });
    }

    const amount = MISSION_COINS[missionId];

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