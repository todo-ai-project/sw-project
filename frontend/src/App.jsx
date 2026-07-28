import React, { useState } from 'react';
//import './App.css'; // CSS 파일이 있다면 연결!
import AnalyzePage from "./AnalyzePage"; // 뒤에 .js를 꼭 붙여주세요!

function App() {
  const [goal, setGoal] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false); // 분석 페이지를 보여줄지 결정
  const [isLoading, setIsLoading] = useState(false);     // 로딩 중인지 결정
  const [result, setResult] = useState(null);           // 결과값 저장

  const handleSubmit = async () => {
    if (!goal) return alert("목표를 입력하세요!");

    // 1. 분석 화면으로 즉시 전환
    setIsAnalyzing(true);
    setIsLoading(true);

    try {
      // 2. [테스트용] 3초 동안 가짜로 기다리기 (로딩 화면 확인용)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 3. [중요] 서버 연동은 내일 하민이랑 할 거니까 일단 주석 처리!
      // const response = await axios.post('http://localhost:5000/api/goals', { title: goal });
      
      // 4. 가짜 결과 데이터 넣어주기
      setResult({ message: "성공적으로 계획을 세웠습니다!" });
    } catch (err) {
      console.error(err);
      alert("에러가 발생했어요!");
      setIsAnalyzing(false); // 실패하면 메인으로
    } finally {
      // 5. 로딩 끝! (결과 화면이 보임)
      setIsLoading(false);
    }
  };

  // --- 화면 렌더링 시작 ---

  // 만약 분석 페이지 모드라면?
  if (isAnalyzing) {
    return (
      <AnalyzePage 
        goal={goal} 
        isLoading={isLoading} 
        result={result} 
        onBack={() => setIsAnalyzing(false)} 
      />
    );
  }

  // 기본 메인 화면
  return (
    <div style={{ padding: '100px', textAlign: 'center' }}>
      <p>2026.3.29(일)</p>
      <h1>목표 설정하기</h1>
      <p style={{ color: 'gray' }}>하나의 목표를 입력하면,<br/>AI가 실행 가능한 할 일을 만들어드려요</p>
      
      <div style={{ marginTop: '30px' }}>
        <input 
          style={inputStyle}
          value={goal} 
          onChange={(e) => setGoal(e.target.value)} 
          placeholder="새로운 할 일을 입력해보세요"
        />
        <br />
        <button style={buttonStyle} onClick={handleSubmit}>
          ✨ AI로 할 일을 생성해요
        </button>
      </div>
      
      <p style={{ fontSize: '12px', color: '#ccc', marginTop: '20px' }}>
        만다라트 기법을 활용하여 목표를 세분화해요
      </p>
    </div>
  );
}

// 스타일 (간단히 추가)
const inputStyle = {
  width: '350px', padding: '15px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '10px', fontSize: '16px'
};

const buttonStyle = {
  width: '380px', padding: '15px', borderRadius: '10px', border: 'none', backgroundColor: '#6200ee', color: 'white', fontSize: '16px', cursor: 'pointer'
};

export default App;