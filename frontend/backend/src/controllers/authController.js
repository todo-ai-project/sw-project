const authService = require("../services/authService");

// 회원가입
const signup = async (req, res) => {
  try {
    const { uid, email, nickname } = req.body;

    const user = await authService.createUser({
      uid,
      email,
      nickname,
    });

    res.status(201).json({
      success: true,
      message: "회원가입 완료",
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 로그인
const login = async (req, res) => {
  try {
    const { idToken } = req.body;

    const decodedToken = await authService.verifyUser(idToken);

    res.status(200).json({
      success: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      nickname: decodedToken.nickname || '',
    });
  } catch (error) {
    console.error(error);

    res.status(401).json({
      success: false,
      message: "유효하지 않은 토큰입니다.",
    });
  }
};

module.exports = {
  signup,
  login,
};