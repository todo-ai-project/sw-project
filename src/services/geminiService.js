const geminiModel = require('../config/gemini');

/**
 * 사용자가 입력한 목표를 Gemini에 전달하여
 * 만다라트 형식(대목표 1 + 세부목표 8)의 JSON 구조로 받아온다.
 *
 * ※ 현재 DB 구조에는 SubGoal 컬렉션이 없고 Goal → Todo 로 바로 연결되기 때문에,
 *   여기서 나오는 subGoals 8개가 각각 하나의 Todo(order 0~7)로 저장된다.
 */
async function generateMandalart(goalText) {
  const prompt = `
당신은 목표 관리 코치입니다. 아래 사용자의 목표를 분석해서
만다라트 형식으로 세부 목표(실천 항목) 8개를 생성해주세요.

사용자 목표: "${goalText}"

반드시 아래 JSON 형식으로만 응답하세요 (설명, 마크다운 없이 JSON만):
{
  "mainGoal": "string",
  "subGoals": ["string", "string", "string", "string", "string", "string", "string", "string"]
}
`;

  const result = await geminiModel.generateContent(prompt);
  const text = result.response.text().replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error('Gemini 응답을 JSON으로 파싱하는 데 실패했습니다: ' + err.message);
  }
}

module.exports = { generateMandalart };