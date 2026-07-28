const coinService = require('../services/coinService');
const dailyRewardService = require('../services/dailyRewardService');
const { ATTENDANCE_COINS } = require('../constants/coins');
const { getTodayLabel } = require('../utils/date');

async function getMyCoins(req, res, next) {
  try {
    const coins = await coinService.getCoins(req.user.uid);
    res.json({ coins });
  } catch (err) {
    next(err);
  }
}

// 자정 지나 첫 접속 시 프론트에서 호출 -> 하루 1회 출석 코인
async function checkAttendance(req, res, next) {
  try {
    const claimed = await dailyRewardService.claimOnce(req.user.uid, 'attendance', ATTENDANCE_COINS);
    const coins = await coinService.getCoins(req.user.uid);
    res.json({
      alreadyClaimed: !claimed,
      coinsEarned: claimed ? ATTENDANCE_COINS : 0,
      coins,
      message: claimed ? `${getTodayLabel()} 출석 완료!` : '오늘은 이미 출석했어요.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyCoins, checkAttendance };