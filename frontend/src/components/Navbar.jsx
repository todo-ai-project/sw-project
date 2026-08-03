import { useNavigate, useLocation } from 'react-router-dom';
import {
  Target,
  Users,
  User,
  LogOut,
  Coins,
  ShoppingBag,
  Trophy,
} from 'lucide-react';

import { C, GRAD } from '../pages/Auth/components/tokens';
import { useCoins } from '../context/CoinContext';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const page = location.pathname;
  const { coins } = useCoins();

  const isLoggedIn = !!localStorage.getItem('idToken');
  const isAuthPage = page === '/login' || page === '/signup';

  const tabs = [
    {
      path: '/goals',
      icon: <Target size={15} />,
      label: '목표',
    },
    {
      path: '/social',
      icon: <Users size={15} />,
      label: '소셜 방',
    },
    {
      path: '/missions',
      icon: <Trophy size={15} />,
      label: '미션',
    },
    {
      path: '/shop',
      icon: <ShoppingBag size={15} />,
      label: '상점',
    },
    {
      path: '/profile',
      icon: <User size={15} />,
      label: '프로필',
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('idToken');
    localStorage.removeItem('userID');
    localStorage.removeItem('userEmail');

    navigate('/login');
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,

        height: '56px',
        display: 'flex',
        alignItems: 'center',

        padding: '0 16px',

        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',

        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          width: '100%',

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',

          gap: '10px',
        }}
      >
        {/* 왼쪽 로고 */}
        <button
          type="button"
          onClick={() => navigate(isLoggedIn ? '/goals' : '/login')}
          style={{
            display: 'flex',
            alignItems: 'center',

            padding: 0,

            background: 'none',
            border: 'none',

            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: '28px',
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: '-1px',

              color: C.deep,

              fontFamily: "'Ownglyph PDH', cursive",
            }}
          >
            투둥실
          </span>
        </button>

        {/* 로그인 후 메뉴 */}
        {isLoggedIn && !isAuthPage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',

              gap: '8px',
              minWidth: 0,
            }}
          >
            {/* 코인 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',

                gap: '5px',
                padding: '6px 10px',

                borderRadius: '12px',

                background: '#FFF7D6',
                color: '#B7791F',

                fontSize: '13px',
                fontWeight: 800,
                fontFamily: "'Nunito', sans-serif",

                flexShrink: 0,
              }}
            >
              <Coins size={14} />
              <span>{coins}</span>
            </div>

            {/* 메뉴 탭 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',

                gap: '2px',
                padding: '4px',

                minWidth: 0,

                background: 'rgba(224, 247, 255, 0.5)',
                borderRadius: '16px',
              }}
            >
              {tabs.map((tab) => {
                const isActive =
                  page === tab.path ||
                  (tab.path === '/social' &&
                    page.startsWith('/social/'));

                return (
                  <button
                    type="button"
                    key={tab.path}
                    onClick={() => navigate(tab.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',

                      gap: '6px',
                      padding: '6px 12px',

                      borderRadius: '12px',
                      border: 'none',

                      fontSize: '14px',
                      fontWeight: 700,
                      fontFamily: "'Nunito', sans-serif",

                      cursor: 'pointer',
                      transition: 'all 0.2s',

                      ...(isActive
                        ? {
                            background: GRAD,
                            color: '#ffffff',
                            boxShadow:
                              '0 2px 8px rgba(14, 165, 233, 0.25)',
                          }
                        : {
                            background: 'transparent',
                            color: C.muted,
                          }),
                    }}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <div
                style={{
                  width: '1px',
                  height: '20px',

                  margin: '0 2px',

                  background: C.border,
                }}
              />

              {/* 로그아웃 */}
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',

                  gap: '6px',
                  padding: '6px 10px',

                  borderRadius: '12px',
                  border: 'none',

                  background: 'transparent',
                  color: '#F43F5E',

                  fontSize: '13px',
                  fontWeight: 700,
                  fontFamily: "'Nunito', sans-serif",

                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <LogOut size={14} />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;