const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');

const usersCollection = () => db.collection('users');

// 코인 적립 (동시 요청에도 안전 - Firestore 원자적 증가 사용)
async function addCoins(uid, amount) {
  console.log("addCoins:", uid, amount);

  await usersCollection().doc(uid).update({
    coins: FieldValue.increment(amount),
  });

  const doc = await usersCollection().doc(uid).get();
  console.log("현재 코인:", doc.data().coins);
}

// 코인 조회
async function getCoins(uid) {
  const doc = await usersCollection().doc(uid).get();
  if (!doc.exists) return 0;
  return doc.data().coins ?? 0;
}

// 코인 차감 (잔액 부족 시 에러) - 트랜잭션으로 이중 차감 방지
async function spendCoins(uid, amount) {
  const userRef = usersCollection().doc(uid);

  return db.runTransaction(async (tx) => {
    const doc = await tx.get(userRef);
    const currentCoins = doc.exists ? (doc.data().coins ?? 0) : 0;

    if (currentCoins < amount) {
      const err = new Error('코인이 부족합니다.');
      err.status = 400;
      throw err;
    }

    tx.update(userRef, { coins: currentCoins - amount });
    return currentCoins - amount;
  });
}

module.exports = { addCoins, getCoins, spendCoins };