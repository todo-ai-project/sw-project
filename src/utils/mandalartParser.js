/**
 * Gemini가 반환한 만다라트 JSON이 예상한 형태(대목표 1개 + 세부목표 8개)인지 검증
 * 실제 DB에는 SubGoal이 없어서, subGoals는 문자열 배열(각각 하나의 Todo가 됨)
 */
function validateMandalart(data) {
  if (!data || typeof data.mainGoal !== 'string') {
    throw new Error('mainGoal 필드가 없습니다.');
  }
  if (!Array.isArray(data.subGoals) || data.subGoals.length === 0) {
    throw new Error('subGoals 배열이 비어있거나 없습니다.');
  }
  data.subGoals.forEach((title, idx) => {
    if (typeof title !== 'string') {
      throw new Error(`subGoals[${idx}] 는 문자열이어야 합니다.`);
    }
  });
  return true;
}

module.exports = { validateMandalart };