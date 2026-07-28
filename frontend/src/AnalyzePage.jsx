import React from 'react';

// props로 부모(App.js)가 보내준 데이터를 받습니다.
function AnalyzePage({ goal, isLoading, result, onBack }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      {/* 1. 로딩 중일 때 보여줄 화면 */}
      {isLoading ? (
        <div>
          <div className="loader" style={spinnerStyle}></div>
          <h2 style={{ color: '#333' }}>
            ⏳ 제미나이가 "{goal}" 분석 중...
          </h2>
          <p>64개의 계획을 세우고 있어요. 잠시만 기다려주세요!</p>
        </div>
      ) : (
        /* 2. 로딩이 끝났을 때(결과) 보여줄 화면 */
        <div>
          <button onClick={onBack} style={backButtonStyle}>← 다시 입력하기</button>
          <h1>✨ 분석 완료!</h1>
          <p>"{goal}"을(를) 위한 만다라트 계획표입니다.</p>
          
          <div style={resultBoxStyle}>
            {/* 결과가 있으면 보여주고, 없으면 대기 문구 */}
            {result ? (
              <p>{JSON.stringify(result.message)}</p> 
            ) : (
              <p>데이터를 불러오는 중입니다...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 스타일 모음 (민서님이 원하는 대로 고쳐보세요!)
const spinnerStyle = {
  width: '50px',
  height: '50px',
  border: '5px solid #f3f3f3',
  borderTop: '5px solid #ccc',
  borderRadius: '50%',
  margin: '0 auto 20px',
  // 실제 회전 애니메이션은 App.css에 넣어야 하지만, 일단 모양만 잡아둡니다.
};

const resultBoxStyle = {
  border: '1px solid #ddd',
  padding: '20px',
  borderRadius: '10px',
  backgroundColor: '#f9f9f9',
  width: '80%',
  margin: '20px auto'
};

const backButtonStyle = {
  padding: '10px 20px',
  cursor: 'pointer',
  backgroundColor: '#eee',
  border: 'none',
  borderRadius: '5px',
  marginBottom: '20px'
};

export default AnalyzePage;