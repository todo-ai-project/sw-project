const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY 가 설정되지 않았습니다. .env 파일을 확인하세요.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 목표 분석 및 만다라트 생성에 사용할 모델
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

module.exports = geminiModel;