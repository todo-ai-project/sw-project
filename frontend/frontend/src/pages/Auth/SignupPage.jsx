import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import axios from 'axios';
import AuthWrap from './components/AuthWrap';
import Jelly from './components/Jelly';
import Card from './components/Card';
import Field from './components/Field';
import PrimaryBtn from './components/PrimaryBtn';
import { C } from './components/tokens';

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !pw.trim()) return;
    if (pw.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (pw !== pwConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pw);
      const user = userCredential.user;

      await axios.post('http://localhost:5001/api/auth/signup', {
        uid: user.uid,
        email: user.email,
        nickname: name,
      });

      const idToken = await user.getIdToken();
      localStorage.setItem('idToken', idToken);
      localStorage.setItem('userID', user.uid);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', name);

      navigate('/goals');
    } catch (err) {
      console.error('Signup error:', err.code, err.message, err);
      const code = err.code;
      if (code === 'auth/email-already-in-use') {
        setError('이미 사용 중인 이메일입니다.');
      } else if (code === 'auth/weak-password') {
        setError('비밀번호가 너무 약합니다. 8자 이상 입력해주세요.');
      } else if (code === 'auth/invalid-email') {
        setError('유효하지 않은 이메일 형식입니다.');
      } else {
        setError('회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrap>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <Jelly colorIndex={4} size={1.1} float />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px', color: C.deep, fontFamily: "'Nunito', sans-serif" }}>
          함께 헤엄쳐봐요!
        </h1>
        <p style={{ fontSize: '14px', color: C.muted, fontFamily: "'Nunito', sans-serif", margin: 0 }}>
          가입하고 첫 목표를 세워봐요
        </p>
      </div>

      <Card>
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field label="이름" type="text" value={name} onChange={setName} placeholder="이름 입력" />
          <Field label="이메일" type="email" value={email} onChange={setEmail} placeholder="example@email.com" />
          <Field label="비밀번호" type="password" value={pw} onChange={setPw} placeholder="8자 이상" />
          <Field label="비밀번호 확인" type="password" value={pwConfirm} onChange={setPwConfirm} placeholder="비밀번호 재입력" />
          {error && (
            <p style={{ color: '#F43F5E', fontSize: '13px', margin: 0, fontFamily: "'Nunito', sans-serif" }}>{error}</p>
          )}
          <div style={{ paddingTop: '4px' }}>
            <PrimaryBtn type="submit" disabled={loading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              {loading ? '가입 중...' : '회원가입'}
            </PrimaryBtn>
          </div>
        </form>
        <p style={{
          marginTop: '20px', paddingTop: '16px',
          borderTop: `1px solid ${C.border}`,
          textAlign: 'center', fontSize: '14px',
          color: C.muted, fontFamily: "'Nunito', sans-serif"
        }}>
          이미 계정이 있으신가요?{' '}
          <button onClick={() => navigate('/login')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: 800, color: C.ocean, fontFamily: "'Nunito', sans-serif", fontSize: '14px'
          }}>
            로그인
          </button>
        </p>
      </Card>
    </AuthWrap>
  );
}

export default SignupPage;
