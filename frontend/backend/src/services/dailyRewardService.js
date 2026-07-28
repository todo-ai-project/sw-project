const { db } = require('../config/firebase');
const coinService = require('./coinService');
const { getTodayKey } = require('../utils/date');

const dailyRewardsCollection = () => db.collection('dailyRewards');


/**
 * uid + claimKey 조합으로 오늘 이미 받았는지 확인 후,
 * 처음이면 기록 남기고 코인 지급
 */
async function claimOnce(uid, claimKey, coinAmount) {
  const dateKey = getTodayKey();

  const docRef = dailyRewardsCollection().doc(`${uid}_${dateKey}`);


  const claimed = await db.runTransaction(async (tx) => {

    const doc = await tx.get(docRef);

    const claims = doc.exists
      ? (doc.data().claims || {})
      : {};


    if (claims[claimKey]) {
      return false;
    }


    tx.set(
      docRef,
      {
        uid,
        dateKey,
        claims: {
          ...claims,
          [claimKey]: true
        }
      },
      {
        merge: true
      }
    );


    return true;
  });


  if (claimed && coinAmount > 0) {
    await coinService.addCoins(uid, coinAmount);
  }


  return claimed;
}



/**
 * 오늘 완료한 미션 상태 조회
 */
async function getTodayStatus(uid) {

  const dateKey = getTodayKey();

  const docRef = dailyRewardsCollection()
    .doc(`${uid}_${dateKey}`);


  const doc = await docRef.get();


  if (!doc.exists) {
    return {};
  }


  return doc.data().claims || {};
}

module.exports = {
  claimOnce,
  getTodayStatus
};

async function getTodayClaims(uid) {
  const dateKey = getTodayKey();

  const docRef = dailyRewardsCollection()
    .doc(`${uid}_${dateKey}`);

  const doc = await docRef.get();

  if (!doc.exists) {
    return [];
  }

  const claims = doc.data().claims || {};

  return Object.keys(claims);
}