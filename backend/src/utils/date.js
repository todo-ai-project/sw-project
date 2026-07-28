// KST(한국시간) 기준 날짜 키/라벨 생성 - 자정 기준 하루 1회 보상 체크에 사용
function getTodayKey(date = new Date()) {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

function getTodayLabel(date = new Date()) {
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return `${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일`;
}

module.exports = { getTodayKey, getTodayLabel };