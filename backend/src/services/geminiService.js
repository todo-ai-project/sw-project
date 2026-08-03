const geminiModel = require('../config/gemini');
const { validateMandalart } = require('../utils/mandalartParser');

async function generateMandalart(goalText) {
  const prompt = `
당신은 다정하고 현실적인 목표 관리 코치입니다. 사용자가 입력한 목표를 분석해서
만다라트 형식의 세부 목표(실천 항목) 8개를 만들어주세요.

[기간 처리 규칙 - 반드시 지킬 것]
1. 사용자 문장에 "3개월", "6주", "올해 안에", "12월까지"처럼 구체적인 기한/기간이
   드러나 있다면, 그 기간에 맞춰 실천 항목의 난이도와 분량을 조절하세요.
   (예: "3개월 안에 5kg 감량" -> 3개월에 걸쳐 단계적으로 진행할 수 있는 항목들)
2. 기한이 전혀 언급되지 않았다면, 별도 안내 없이 "한 달(1개월)"을 기본 기간으로
   가정하고 그 안에 끝낼 수 있는 현실적인 항목들로 구성하세요.
3. 각 항목은 실제로 실행 가능한 행동 단위여야 하며, "열심히 하기" 같은 추상적인
   구호는 피하세요.
4. 각 항목 앞에 "1개월차:", "2주차:", "3일차:", "D-10:"처럼 시간/기간을 나타내는
   접두어를 붙이지 마세요. 화면에서 각 항목의 예상 마감일(디데이)이 별도 뱃지로
   이미 표시되기 때문에, 텍스트에는 실천 내용만 담아주세요.
   (예: "1개월차: 매일 토익 어휘 50개 암기하기" ❌ -> "매일 토익 어휘 50개 암기하기" ✅)

사용자 목표: "${goalText}"

반드시 아래 JSON 형식으로만 응답하세요 (설명, 마크다운, 코드블록 없이 JSON 객체만):
{
  "mainGoal": "string",
  "subGoals": ["string", "string", "string", "string", "string", "string", "string", "string"]
}
`;

  console.time('gemini-call');
  const result = await Promise.race([
    geminiModel.generateContent(prompt),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('GEMINI_TIMEOUT: 10초 내 응답 없음')), 10000)
    ),
  ]);
  console.timeEnd('gemini-call');
  const text = result.response.text().replace(/```json|```/g, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error('Gemini 응답을 JSON으로 파싱하는 데 실패했습니다: ' + err.message);
  }

  validateMandalart(parsed); // mainGoal 문자열 + subGoals 8개 형식인지 검증
  return parsed;
}

module.exports = { generateMandalart };