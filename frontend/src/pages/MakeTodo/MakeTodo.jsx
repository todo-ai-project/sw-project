import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles } from 'lucide-react';
import Jelly from '../Auth/components/Jelly';
import Bubbles from '../Auth/components/Bubbles';
import Card from '../Auth/components/Card';
import PrimaryBtn from '../Auth/components/PrimaryBtn';
import { C, PAGE_BG } from '../Auth/components/tokens';
import AnalyzePage from './AnalyzePage';

const EXAMPLES = ['토익 900점 달성', '3개월 안에 5kg 감량', '개발자로 취업하기', '매일 책 30분 읽기'];

function MakeTodo() {
  const navigate = useNavigate();
  const [goal, setGoal] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('idToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  const CURRENT_USER_ID = localStorage.getItem('userID') || 'test_user_1';

  const handleSubmit = async () => {
    if (!goal.trim()) return;
    setIsAnalyzing(true);
    setIsLoading(true);
    setResult(null);

    try {
      const response = await axios.post('http://localhost:5001/api/todos/generate', {
        userGoal: goal,
        userID: CURRENT_USER_ID,
        goalID: `goal_${Date.now()}`
      }, { headers: getAuthHeaders() });

      if (response.data.success) {
        setResult(response.data.data);
      } else {
        alert('AI 플랜 생성에 실패했습니다.');
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error('AI 요청 에러:', error);
      alert('백엔드 서버 연결에 실패했습니다.');
      setIsAnalyzing(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAnalyzing) {
    return (
      <AnalyzePage
        isLoading={isLoading}
        result={result}
        userGoal={goal}
        onGoToList={() => navigate('/goals')}
        onReset={() => { setIsAnalyzing(false); setResult(null); setGoal(''); }}
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
            <Jelly bellColor="#BAE6FD" glowColor="#38BDF8" accessory="✏️" size={1} float />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px', color: C.deep, fontFamily: "'Nunito', sans-serif" }}>
            어떤 목표를 이루고 싶어요?
          </h1>
          <p style={{ fontSize: '14px', color: C.muted, fontFamily: "'Nunito', sans-serif", margin: 0 }}>
            막연해도 괜찮아요 — AI 해파리가 도와줄게요 🪼
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
