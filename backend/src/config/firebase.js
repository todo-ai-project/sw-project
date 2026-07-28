const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');

let db = null;
let auth = null;
let firebaseReady = false;

try {
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : path.resolve(__dirname, '../../serviceAccountKey.json');

  const serviceAccount = require(keyPath);

  const app = initializeApp({
    credential: cert(serviceAccount),
  });

  db = getFirestore(app);
  auth = getAuth(app);
  firebaseReady = true;
} catch (err) {
  console.warn('⚠️ Firebase 초기화를 건너뜁니다 (아직 연결 전): ' + err.message);
}

module.exports = {
  db,
  auth,
  firebaseReady,
  FieldValue,
};