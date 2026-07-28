const { auth } = require('../config/firebase');

/**
 * 클라이언트가 보낸 Firebase ID 토큰을 검증하여
 * req.user 에 사용자 정보를 담아주는 미들웨어
 * (헤더 예시: Authorization: Bearer <idToken>)
 */
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!idToken) {
      return res.status(401).json({ message: '인증 토큰이 필요합니다.' });
    }

    const decoded = await auth.verifyIdToken(idToken);
    req.user = { uid: decoded.uid, email: decoded.email };
    next();
  } catch (error) {
    return res.status(401).json({ message: '유효하지 않은 인증 토큰입니다.', error: error.message });
  }
}

module.exports = authMiddleware;