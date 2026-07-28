const { auth, db } = require("../config/firebase");
const { FieldValue } = require("firebase-admin/firestore");

// 회원가입 후 Firestore에 사용자 정보 저장
const createUser = async ({ uid, email, nickname }) => {
  await db.collection("users").doc(uid).set({
    email,
    nickname,
    crewId: "",
    coins: 0,
    createdAt: FieldValue.serverTimestamp(),
  });

  return {
    uid,
    email,
    nickname,
  };
};

// 로그인 토큰 검증 + 사용자 정보 조회
const verifyUser = async (idToken) => {
  const decodedToken = await auth.verifyIdToken(idToken);
  const userDoc = await db.collection("users").doc(decodedToken.uid).get();
  if (userDoc.exists) {
    decodedToken.nickname = userDoc.data().nickname || '';
  }
  return decodedToken;
};

module.exports = {
  createUser,
  verifyUser,
};