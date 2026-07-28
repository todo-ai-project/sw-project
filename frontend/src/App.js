import React, { useState } from 'react';
//import './App.css';
import AnalyzePage from './AnalyzePage'; 


function App() {
  const [goal, setGoal] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);     
  const [result, setResult] = useState(null);           

  // 이 함수 하나만 있어야 합니다!
  const handleSubmit = () => { 
    if (!goal) {
      alert("할 일을 입력해주세요!");
      return;
    }

    console.log("버튼 클릭됨! 이제 화면을 바꿉니다.");

    setIsAnalyzing(true); 
    setIsLoading(true);

    setTimeout(() => {
      console.log("3초 지남! 로딩 끝!");
      setIsLoading(false);
      setResult({ message: "가짜 데이터 로딩 성공!" }); 
    }, 3000);
  };

  if (isAnalyzing) {
    return (
      <AnalyzePage 
        goal={goal} 
        result={result} 
        isLoading={isLoading} 
        onBack={() => setIsAnalyzing(false)} 
      />
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <p>2026.3.19(목)</p>
      <h1>목표 설정하기</h1>
      <p style={{ color: 'gray' }}>하나의 목표를 입력하면,<br/>AI가 실행 가능한 할 일을 만들어드려요</p>

      <input 
        type="text" 
        placeholder="새로운 할 일을 입력해보세요"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        style={inputStyle}
      />

      <br />

      <button onClick={handleSubmit} style={buttonStyle}>
        ✨ AI로 할 일을 생성해요
      </button>

      <p style={{ fontSize: '12px', color: '#ccc', marginTop: '20px' }}>
        만다라트 기법을 활용하여 목표를 세분화해요
      </p>
    </div>
  );
}

const inputStyle = {
  width: '400px',
  padding: '15px',
  borderRadius: '10px',
  border: '1px solid #ddd',
  marginBottom: '10px',
  fontSize: '16px'
};

const buttonStyle = {
  width: '430px',
  padding: '15px',
  borderRadius: '10px',
  border: 'none',
  backgroundColor: '#ccc',
  color: 'white',
  fontSize: '16px',
  cursor: 'pointer'
};

export default App;