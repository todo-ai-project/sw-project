import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Jelly from '../Auth/components/Jelly';
import Bubbles from '../Auth/components/Bubbles';
import Card from '../Auth/components/Card';
import PrimaryBtn from '../Auth/components/PrimaryBtn';
import { C, PAGE_BG } from '../Auth/components/tokens';
import AnalyzePage from './AnalyzePage';
import { createGoal } from '../../services/api';
import { useMissions } from '../../context/MissionContext';

const EXAMPLES = ['토익 900점 달성', '3개월 안에 5kg 감량', '개발자로 취업하기', '매일 책 30분 읽기'];
const DEADLINE_OPTIONS = [
  { label: '1주', days: 7 },
  { label: '2주', days: 14 },
  { label: '1개월', days: 30 },
  { label: '2개월', days: 60 },
  { label: '3개월', days: 90 },
  { label: '6개월', days: 180 },
];

function MakeTodo() {
  const navigate = useNavigate();
  const { completeMission } = useMissions();
  const [goal, setGoal] = useState('');
  const [deadlineIdx, setDeadlineIdx] = useState(2);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!goal.trim()) return;
    setIsAnalyzing(true);
    setIsLoading(true);
    setResult(null);
    setError('');

    const dl = DEADLINE_OPTIONS[deadlineIdx];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + dl.days);
    const deadlineStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
    const goalWithDeadline = `${goal.trim()} (기한: ${dl.label}, ${deadlineStr}까지. 1일차부터 마지막 날까지 단계별 일일 실천 항목으로 만들어줘)`;

    try {
      const data = await createGoal(goalWithDeadline, deadlineStr);
      setResult(data?.todos || data);
      completeMission('create-goal');
    } catch (requestError) {
      console.error('AI 요청 에러:', requestError);
      setError(requestError.response?.data?.message || '백엔드 서버 연결 또는 AI 분석에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAnalyzing) {
    return (
      <AnalyzePage
        isLoading={isLoading}
        result={result}
        error={error}
        userGoal={goal}
        onGoToList={() => navigate('/goals')}
        onReset={() => { setIsAnalyzing(false); setResult(null); setGoal(''); setError(''); }}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh', paddingTop: '56px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '56px 16px 16px', position: 'relative', background: PAGE_BG
    }}>
      <Bubbles n={5} />
      <div style={{ width: '100%', maxWidth: '448px', position: 'relative', zIndex: 10, animation: 'fadeInUp .4s ease-out' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <Jelly colorIndex={0} size={1} float />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px', color: C.deep, fontFamily: "'Nunito', sans-serif" }}>
            어떤 목표를 이루고 싶어요?
          </h1>
          <p style={{ fontSize: '14px', color: C.muted, fontFamily: "'Nunito', sans-serif", margin: 0 }}>
            막연해도 괜찮아요 — AI 해파리가 도와줄게요
          </p>
        </div>

        <Card>
          <div style={{ padding: '24px' }}>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
              placeholder="예: 6개월 안에 토익 900점 달성하고 싶어요"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '16px',
                fontSize: '14px', resize: 'none', outline: 'none',
                lineHeight: 1.6, marginBottom: '16px',
                background: '#F0FBFF', border: `2px solid ${C.border}`,
                color: C.deep, fontFamily: "'Nunito', sans-serif",
                boxSizing: 'border-box'
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = C.ocean; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = C.border; }}
            />

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: C.subtle, fontFamily: "'Nunito', sans-serif" }}>
                목표 기한
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {DEADLINE_OPTIONS.map((opt, i) => (
                  <button key={opt.label} onClick={() => setDeadlineIdx(i)}
                    style={{
                      padding: '7px 14px', fontSize: '13px', fontWeight: 700,
                      borderRadius: '999px', cursor: 'pointer',
                      fontFamily: "'Nunito', sans-serif", transition: 'all 0.2s',
                      ...(deadlineIdx === i
                        ? { background: C.ocean, color: '#fff', border: '1.5px solid transparent' }
                        : { background: '#E0F7FF', color: C.ocean, border: `1.5px solid ${C.border}` })
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: C.subtle, fontFamily: "'Nunito', sans-serif" }}>
                추천 예시
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {EXAMPLES.map(ex => (
                  <button key={ex} onClick={() => setGoal(ex)}
                    style={{
                      padding: '6px 12px', fontSize: '12px', fontWeight: 700,
                      borderRadius: '999px', cursor: 'pointer',
                      background: '#E0F7FF', color: C.ocean,
                      border: `1.5px solid ${C.border}`,
                      fontFamily: "'Nunito', sans-serif",
                      transition: 'all 0.2s'
                    }}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            <PrimaryBtn onClick={handleSubmit} disabled={!goal.trim()}>
              <Sparkles size={15} />
              AI 해파리한테 부탁하기
            </PrimaryBtn>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default MakeTodo;
