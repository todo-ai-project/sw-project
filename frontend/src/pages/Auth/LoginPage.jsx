import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import axios from 'axios';
import AuthWrap from './components/AuthWrap';
import Jelly from './components/Jelly';
import Card from './components/Card';
import Field from './components/Field';
import PrimaryBtn from './components/PrimaryBtn';
import { C } from './components/tokens';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !pw.trim()) return;
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pw);
      const idToken = await userCredential.user.getIdToken();

      localStorage.setItem('idToken', idToken);
      localStorage.setItem('userID', userCredential.user.uid);
      localStorage.setItem('userEmail', userCredential.user.email);

      try {
        const res = await axios.post('http://localhost:5001/api/auth/login', { idToken });
        if (res.data.nickname) {
          localStorage.setItem('userName', res.data.nickname);
        }
      } catch (backendErr) {
        console.warn('백엔드 연동 실패 (무시):', backendErr.message);
      }

      navigate('/goals');
    } catch (err) {
      console.error('Login error:', err.code, err.message, err);
      const code = err.code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (code === 'auth/invalid-email') {
        setError('유효하지 않은 이메일 형식입니다.');
      } else if (code === 'auth/configuration-not-found') {
        setError('Firebase 인증이 설정되지 않았습니다. 관리자에게 문의하세요.');
      } else {
        setError(`로그인 실패: ${code || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrap>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <Jelly colorIndex={0} size={1.1} float />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px', color: C.deep, fontFamily: "'Nunito', sans-serif" }}>
          다시 오셨군요!
        </h1>
        <p style={{ fontSize: '14px', color: C.muted, fontFamily: "'Nunito', sans-serif", margin: 0 }}>
          오늘도 목표를 향해 둥실둥실~
        </p>
      </div>

      <Card>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field label="이메일" type="email" value={email} onChange={setEmail} placeholder="example@email.com" />
          <Field label="비밀번호" type="password" value={pw} onChange={setPw} placeholder="비밀번호 입력" />
          {error && (
            <p style={{ color: '#F43F5E', fontSize: '13px', margin: 0, fontFamily: "'Nunito', sans-serif" }}>{error}</p>
          )}
          <div style={{ paddingTop: '4px' }}>
            <PrimaryBtn type="submit" disabled={loading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              {loading ? '로그인 중...' : '로그인'}
            </PrimaryBtn>
          </div>
        </form>
        <p style={{
          marginTop: '20px', paddingTop: '16px',
          borderTop: `1px solid ${C.border}`,
          textAlign: 'center', fontSize: '14px',
          color: C.muted, fontFamily: "'Nunito', sans-serif"
        }}>
          계정이 없으신가요?{' '}
          <button onClick={() => navigate('/signup')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: 800, color: C.ocean, fontFamily: "'Nunito', sans-serif", fontSize: '14px'
          }}>
            회원가입
          </button>
        </p>
      </Card>
    </AuthWrap>
  );
}

export default LoginPage;
