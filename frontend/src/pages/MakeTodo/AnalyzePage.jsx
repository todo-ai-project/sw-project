import { useState, useEffect } from 'react';
import { CheckCircle2, PartyPopper } from 'lucide-react';
import Jelly from '../Auth/components/Jelly';
import Bubbles from '../Auth/components/Bubbles';
import Card from '../Auth/components/Card';
import PrimaryBtn from '../Auth/components/PrimaryBtn';
import { C, PAGE_BG } from '../Auth/components/tokens';

const STEPS = ['목표 분석 중...', '세부 목표 생성 중...', '할 일 목록 구성 중...', '마무리 중...'];

function AnalyzePage({ userGoal, isLoading, result, error, onGoToList, onReset }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isLoading) {
      const timers = STEPS.map((_, i) => setTimeout(() => setStep(i), i * 900));
      return () => timers.forEach(clearTimeout);
    }
    return undefined;
  }, [isLoading]);

  let displayData = [];
  if (Array.isArray(result)) {
    displayData = result;
  } else if (result?.todos && Array.isArray(result.todos)) {
    displayData = result.todos;
  } else if (result && typeof result === 'object') {
    displayData = Object.values(result).flat().filter(item => typeof item === 'string' || item?.content || item?.title);
  }

  return (
    <div style={{
      minHeight: '100vh', paddingTop: '56px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '56px 16px 16px', position: 'relative', background: PAGE_BG
    }}>
      <Bubbles n={5} />
      <div style={{ width: '100%', maxWidth: '850px', position: 'relative', zIndex: 10, animation: 'fadeInUp .4s ease-out' }}>
        {isLoading ? (
          <Card>
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <Jelly colorIndex={0} size={0.9} float />
              </div>
              <p style={{ fontSize: '12px', marginBottom: '4px', color: C.muted, fontFamily: "'Nunito', sans-serif" }}>분석 중</p>
              <p style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px', color: C.deep, fontFamily: "'Nunito', sans-serif" }}>
                "{userGoal}"
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', maxWidth: '280px', margin: '0 auto' }}>
                {STEPS.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    fontSize: '14px', fontFamily: "'Nunito', sans-serif",
                    color: i <= step ? C.deep : C.border
                  }}>
                    {i < step ? (
                      <CheckCircle2 size={16} style={{ color: '#2DD4BF', flexShrink: 0 }} />
                    ) : i === step ? (
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%',
                        border: '2px solid #38BDF8', borderTopColor: 'transparent',
                        animation: 'spin 1s linear infinite', flexShrink: 0
                      }} />
                    ) : (
                      <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${C.border}`, flexShrink: 0 }} />
                    )}
                    <span style={{ fontWeight: i <= step ? 600 : 400 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ) : error ? (
          <Card>
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🥺</div>
              <p style={{ color: '#F43F5E', fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>{error}</p>
              <button onClick={onReset} style={{
                marginTop: '16px', padding: '8px 16px', borderRadius: '12px',
                border: `2px solid ${C.border}`, background: '#fff',
                color: C.ocean, fontWeight: 700, fontSize: '14px', cursor: 'pointer'
              }}>
                다시 입력하기
              </button>
            </div>
          </Card>
        ) : result ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ marginBottom: '12px' }}><PartyPopper size={42} color={C.ocean} /></div>
              <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px', color: C.deep, fontFamily: "'Nunito', sans-serif" }}>
                완성됐어요!
              </h1>
              <p style={{ fontSize: '14px', color: C.muted, fontFamily: "'Nunito', sans-serif" }}>
                "{userGoal}" 성공을 위한 전략이 준비됐어요
              </p>
            </div>

            <Card>
              <div style={{ padding: '24px' }}>
                {displayData.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {displayData.map((item, index) => {
                      const content = typeof item === 'string' ? item : item.title || item.content;
                      const category = item?.category || `세부 목표 ${index + 1}`;
                      return (
                        <div key={item?.id || index} style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '10px 12px', borderRadius: '12px',
                          background: '#F0FBFF', transition: 'all 0.2s'
                        }}>
                          <CheckCircle2 size={16} style={{ color: C.ocean, flexShrink: 0 }} />
                          <div>
                            <span style={{
                              fontSize: '10px', fontWeight: 700, padding: '2px 6px',
                              borderRadius: '4px', background: '#E0F7FF', color: C.ocean,
                              fontFamily: "'Nunito', sans-serif", marginRight: '8px'
                            }}>{category}</span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: C.deep, fontFamily: "'Nunito', sans-serif" }}>
                              {content}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: C.muted, padding: '20px 0', fontFamily: "'Nunito', sans-serif" }}>
                    데이터를 표시할 수 없습니다.
                  </p>
                )}

                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <PrimaryBtn onClick={onGoToList}>내 투두리스트에서 확인하기</PrimaryBtn>
                  <button onClick={onReset} style={{
                    width: '100%', padding: '10px', borderRadius: '12px',
                    border: `2px solid ${C.border}`, background: '#fff',
                    color: C.muted, fontWeight: 700, fontSize: '14px',
                    cursor: 'pointer', fontFamily: "'Nunito', sans-serif"
                  }}>
                    다시 입력하기
                  </button>
                </div>
              </div>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default AnalyzePage;
