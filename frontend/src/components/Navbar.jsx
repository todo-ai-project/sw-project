import { useNavigate, useLocation } from 'react-router-dom';
import { Target, Users, User, LogOut } from 'lucide-react';
import { C, GRAD } from '../pages/Auth/components/tokens';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const page = location.pathname;

  const isLoggedIn = !!localStorage.getItem('idToken');
  const isAuthPage = page === '/login' || page === '/signup';

  const tabs = [
    { path: '/goals', icon: <Target size={15} />, label: '목표' },
    { path: '/social', icon: <Users size={15} />, label: '소셜 방' },
    { path: '/profile', icon: <User size={15} />, label: '프로필' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      height: '56px', display: 'flex', alignItems: 'center', padding: '0 16px',
      background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(14px)',
      borderBottom: `1px solid ${C.border}`
    }}>
      <div style={{
        maxWidth: '768px', margin: '0 auto', width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <button onClick={() => navigate(isLoggedIn ? '/goals' : '/login')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <span style={{ fontSize: 20, display: 'inline-block', animation: 'jellyFloat 3s ease-in-out infinite' }}>🪼</span>
          <span style={{ fontSize: '16px', fontWeight: 800, color: C.deep, fontFamily: "'Nunito', sans-serif" }}>투둥실</span>
        </button>

        {isLoggedIn && !isAuthPage && (
          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'rgba(224,247,255,0.5)', borderRadius: '16px',
            padding: '4px', gap: '2px'
          }}>
            {tabs.map(t => {
              const isActive = page === t.path;
              return (
                <button key={t.path} onClick={() => navigate(t.path)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 14px', borderRadius: '12px',
                    fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer',
                    transition: 'all 0.2s', fontFamily: "'Nunito', sans-serif",
                    ...(isActive
                      ? { background: GRAD, color: '#fff', boxShadow: '0 2px 8px rgba(14,165,233,0.25)' }
                      : { background: 'transparent', color: C.muted })
                  }}>
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              );
            })}
            <div style={{ width: '1px', height: '20px', background: C.border, margin: '0 2px' }} />
            <button onClick={() => {
              localStorage.removeItem('idToken');
              localStorage.removeItem('userID');
              localStorage.removeItem('userEmail');
              localStorage.removeItem('userName');
              navigate('/login');
            }} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '12px',
              fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer',
              background: 'transparent', color: '#F43F5E',
              fontFamily: "'Nunito', sans-serif", transition: 'all 0.2s'
            }}>
              <LogOut size={14} />
              <span>로그아웃</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
