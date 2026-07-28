import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Check,
  Coins,
  Pencil,
  Save,
  ShoppingBag,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import Jelly, { JELLY_IMAGES } from '../Auth/components/Jelly';
import Card from '../Auth/components/Card';
import PrimaryBtn from '../Auth/components/PrimaryBtn';
import { C, GRAD, PAGE_BG } from '../Auth/components/tokens';
import { getMyCharacter, getGoals, getTodos } from '../../services/api';
import { useCoins } from '../../context/CoinContext';

const JELLY_COLORS = [
  { name: '하늘', preview: '#BAE6FD' },
  { name: '핑크', preview: '#F9A8D4' },
  { name: '민트', preview: '#99F6E4' },
  { name: '선샤인', preview: '#FDE68A' },
  { name: '보라', preview: '#C4B5FD' },
  { name: '그레이', preview: '#D1D5DB' },
];

const CUSTOMIZE_TABS = [
  ['color', '색상'],
  ['hat', '모자'],
  ['effect', '효과'],
  ['expression', '표정'],
];

const PROFILE_ITEMS = [
  { id: 'none-hat', cat: 'hat', name: '기본', value: '', free: true },
  { id: 'hat_partyhat', cat: 'hat', name: '파티 모자', value: 'partyhat' },
  { id: 'hat_crown', cat: 'hat', name: '왕관', value: 'crown' },
  { id: 'hat_ribbon', cat: 'hat', name: '리본', value: 'ribbon' },
  { id: 'hat_beret', cat: 'hat', name: '베레모', value: 'beret' },

  { id: 'none-effect', cat: 'effect', name: '기본', value: '', free: true },
  { id: 'effect_bubbles', cat: 'effect', name: '물방울', value: 'bubbles' },
  { id: 'effect_sparkles', cat: 'effect', name: '반짝임', value: 'sparkles' },
  { id: 'effect_flowers', cat: 'effect', name: '꽃가루', value: 'flowers' },
  { id: 'color_gold', cat: 'effect', name: '골드 오라', value: 'gold' },

  {
    id: 'expression_normal',
    cat: 'expression',
    name: '기본 표정',
    value: 'normal',
    free: true,
  },
  {
    id: 'expression_smile',
    cat: 'expression',
    name: '활짝 웃음',
    value: 'smile',
  },
  {
    id: 'expression_heart',
    cat: 'expression',
    name: '하트 눈',
    value: 'heart',
  },
  {
    id: 'expression_sleepy',
    cat: 'expression',
    name: '졸린 표정',
    value: 'sleepy',
  },
  {
    id: 'expression_wink',
    cat: 'expression',
    name: '윙크',
    value: 'wink',
  },
];

const DEFAULT_OWNED_ITEMS = [
  'none-hat',
  'none-effect',
  'expression_normal',
];

const DEFAULT_OUTFIT = {
  hat: '',
  effect: '',
  expression: 'normal',
};

const readLocal = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

function ProfilePage() {
  const navigate = useNavigate();
  const { coins } = useCoins();

  const initialColor = Number(localStorage.getItem('jellyColor') || 0);

  const [selColor, setSelColor] = useState(initialColor);
  const [customizeTab, setCustomizeTab] = useState('color');
  const [savedNotice, setSavedNotice] = useState('');
  const [tab, setTab] = useState('stat');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [userName, setUserName] = useState(
    localStorage.getItem('userName') || '사용자',
  );
  const [photoOpen, setPhotoOpen] = useState(false);
  const [owned, setOwned] = useState(() =>
    readLocal('todoongsilOwnedItems', DEFAULT_OWNED_ITEMS),
  );
  const [outfit, setOutfit] = useState(() =>
    readLocal('todoongsilOutfit', DEFAULT_OUTFIT),
  );

  const userEmail = localStorage.getItem('userEmail') || '';
  const [completedGoals, setCompletedGoals] = useState(0);
  const [completedTodos, setCompletedTodos] = useState(0);
  const [totalTodos, setTotalTodos] = useState(0);

  useEffect(() => {
    async function loadCharacter() {
      try {
        const character = await getMyCharacter();
        if (!character) return;

        const localOutfit = localStorage.getItem('todoongsilOutfit');

        if (!localOutfit) {
          const serverOutfit = {
            hat: character.hat || '',
            effect: character.effect || character.color || '',
            expression: character.expression || 'normal',
          };

          setOutfit(serverOutfit);
          localStorage.setItem(
            'todoongsilOutfit',
            JSON.stringify(serverOutfit),
          );
        }

        if (Array.isArray(character.ownedItems)) {
          setOwned((current) => {
            const merged = [
              ...new Set([
                ...DEFAULT_OWNED_ITEMS,
                ...current,
                ...character.ownedItems,
              ]),
            ];
            localStorage.setItem(
              'todoongsilOwnedItems',
              JSON.stringify(merged),
            );
            return merged;
          });
        }
      } catch (error) {
        console.error(error);
      }
    }

    async function loadStats() {
      try {
        const [goals, todos] = await Promise.all([getGoals(), getTodos()]);
        setCompletedGoals(goals.filter((goal) => goal.completed).length);
        setTotalTodos(todos.length);
        setCompletedTodos(
          todos.filter((todo) => todo.completed ?? todo.isDone).length,
        );
      } catch (error) {
        console.error(error);
      }
    }

    loadCharacter();
    loadStats();
  }, []);

  const todoRate = totalTodos
    ? Math.round((completedTodos / totalTodos) * 100)
    : 0;

  const stats = useMemo(
    () => [
      {
        label: '보유 코인',
        value: `${coins}개`,
        icon: <Coins size={19} />,
        color: '#B7791F',
        bg: '#FFF7D6',
      },
      {
        label: '달성한 목표',
        value: `${completedGoals}개`,
        icon: <Trophy size={19} />,
        color: '#F59E0B',
        bg: '#FEF3C7',
      },
      {
        label: '완료한 할 일',
        value: `${completedTodos}개`,
        icon: <Check size={19} />,
        color: '#10B981',
        bg: '#D1FAE5',
      },
    ],
    [coins, completedGoals, completedTodos],
  );

  const saveName = () => {
    const nextName = nameInput.trim();

    if (nextName) {
      setUserName(nextName);
      localStorage.setItem('userName', nextName);
    }

    setEditingName(false);
  };

  const showSavedNotice = (message) => {
    setSavedNotice(message);
    window.setTimeout(() => setSavedNotice(''), 1800);
  };

  const applyColor = (index) => {
    setSelColor(index);
    localStorage.setItem('jellyColor', String(index));
    showSavedNotice('색상이 적용되었습니다!');
  };

  const applyItem = (item) => {
    const next = {
      ...outfit,
      [item.cat]: item.value,
    };

    setOutfit(next);
    localStorage.setItem('todoongsilOutfit', JSON.stringify(next));
    showSavedNotice(`${item.name} 아이템이 적용되었습니다!`);
  };

  const ownedItemsForTab = PROFILE_ITEMS.filter(
    (item) =>
      item.cat === customizeTab && (item.free || owned.includes(item.id)),
  );

  return (
    <div className="profile-page" style={{ background: PAGE_BG }}>
      <style>{`
        .profile-page {
          min-height: 100vh;
          padding-top: 56px;
        }

        .profile-container {
          width: min(1080px, calc(100% - 32px));
          margin: 0 auto;
          padding: 32px 0 56px;
        }

        .profile-page-title {
          margin-bottom: 20px;
        }

        .profile-page-title h1 {
          margin: 0;
          color: ${C.deep};
          font-size: 26px;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .profile-page-title p {
          margin: 7px 0 0;
          color: ${C.muted};
          font-size: 14px;
        }

        .profile-layout {
          display: grid;
          grid-template-columns: 340px minmax(0, 1fr);
          gap: 20px;
          align-items: stretch;
        }

        .profile-card-shell {
          min-width: 0;
          height: 100%;
        }

        .profile-card-shell > div {
          box-sizing: border-box;
          height: 100%;
        }

        .profile-left-content {
          padding: 0;
        }

        .profile-preview {
          min-height: 210px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 22px;
          border: 1px solid ${C.border};
          background: linear-gradient(180deg, #F7FCFF 0%, #EDF9FF 100%);
        }

        .profile-user-area {
          padding: 20px 0 18px;
          text-align: center;
        }

        .profile-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .profile-action-button {
          min-height: 44px;
          border-radius: 14px;
          border: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-weight: 800;
          cursor: pointer;
        }

        .profile-divider {
          height: 1px;
          margin: 24px 0;
          background: ${C.border};
        }

        .profile-section-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .profile-section-heading h2,
        .profile-section-heading h3 {
          margin: 0;
          color: ${C.deep};
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .profile-section-heading h2 {
          font-size: 21px;
        }

        .profile-section-heading h3 {
          font-size: 17px;
        }

        .profile-section-heading p {
          margin: 5px 0 0;
          color: ${C.muted};
          font-size: 12px;
          line-height: 1.5;
        }

        .customize-tabs {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 6px;
          padding: 5px;
          margin-bottom: 12px;
          border: 1px solid ${C.border};
          border-radius: 14px;
          background: #F4FAFD;
        }

        .customize-tab-button {
          min-width: 0;
          padding: 9px 4px;
          border: 0;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .jelly-color-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 9px;
        }

        .jelly-color-button,
        .owned-item-button {
          min-width: 0;
          border-radius: 15px;
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease;
        }

        .jelly-color-button {
          padding: 10px 6px;
        }

        .jelly-color-button:hover,
        .owned-item-button:hover {
          transform: translateY(-2px);
        }

        .owned-item-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
        }

        .owned-item-button {
          position: relative;
          padding: 10px 8px;
          text-align: center;
        }

        .owned-item-preview {
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .owned-item-check {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 21px;
          height: 21px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: ${C.ocean};
          color: #fff;
        }

        .customize-shop-link {
          width: 100%;
          margin-top: 11px;
          padding: 10px;
          border: 1px solid ${C.border};
          border-radius: 13px;
          background: #F8FCFE;
          color: ${C.ocean};
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .profile-right-content {
          height: 100%;
          min-height: 536px;
          padding: 0;
          display: flex;
          flex-direction: column;
        }

        .profile-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          padding: 5px;
          margin-bottom: 26px;
          border: 1px solid ${C.border};
          border-radius: 16px;
          background: #F4FAFD;
        }

        .profile-tab-button {
          min-height: 42px;
          border: 0;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 900;
          transition: all 0.15s ease;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 13px;
        }

        .stat-card {
          min-width: 0;
          padding: 18px;
          border-radius: 20px;
        }

        .stat-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.72);
        }

        .stat-value {
          margin: 17px 0 5px;
          color: ${C.deep};
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .stat-label {
          margin: 0;
          color: ${C.muted};
          font-size: 12px;
          font-weight: 700;
        }

        .progress-panel {
          margin-top: 18px;
          padding: 22px;
          border: 1px solid ${C.border};
          border-radius: 20px;
          background: linear-gradient(135deg, #F8FDFF 0%, #EEF9FF 100%);
        }

        .progress-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 14px;
        }

        .progress-track {
          height: 12px;
          overflow: hidden;
          border-radius: 999px;
          background: #DDF3FB;
        }

        .progress-fill {
          height: 100%;
          border-radius: inherit;
          background: ${GRAD};
          transition: width 0.25s ease;
        }

        .photo-empty-state {
          flex: 1;
          min-height: 360px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px;
          border: 1px dashed ${C.border};
          border-radius: 22px;
          background: linear-gradient(180deg, #FBFEFF 0%, #F2FAFF 100%);
          text-align: center;
        }

        .photo-empty-state h3 {
          margin: 16px 0 8px;
          color: ${C.deep};
          font-size: 20px;
          font-weight: 900;
        }

        .photo-empty-state p {
          max-width: 360px;
          margin: 0 0 20px;
          color: ${C.muted};
          font-size: 13px;
          line-height: 1.6;
        }

        @media (max-width: 900px) {
          .profile-layout {
            grid-template-columns: 1fr;
          }

          .profile-right-content {
            min-height: auto;
          }
        }

        @media (max-width: 620px) {
          .profile-container {
            width: min(100% - 24px, 1080px);
            padding-top: 22px;
          }

          .profile-actions,
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .customize-tabs {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .stat-card {
            display: grid;
            grid-template-columns: 38px 1fr;
            column-gap: 13px;
            align-items: center;
          }

          .stat-value {
            margin: 0 0 3px;
            font-size: 20px;
          }

          .stat-label {
            grid-column: 2;
          }
        }
      `}</style>

      {photoOpen && (
        <div
          onClick={() => setPhotoOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            background: 'rgba(12,74,110,.28)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 390,
              padding: 24,
              borderRadius: 24,
              background: '#fff',
              boxShadow: '0 24px 70px rgba(14, 116, 144, 0.18)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}
            >
              <h3 style={{ margin: 0, color: C.deep }}>
                내 해파리 사진{' '}
                <Camera
                  size={16}
                  style={{ display: 'inline', verticalAlign: 'middle' }}
                />
              </h3>
              <button
                type="button"
                aria-label="사진 촬영 창 닫기"
                onClick={() => setPhotoOpen(false)}
                style={{
                  border: 0,
                  background: 'none',
                  cursor: 'pointer',
                  color: C.muted,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                minHeight: 210,
                borderRadius: 18,
                background: 'linear-gradient(180deg,#E0F7FF,#F0F8FF)',
                border: `2px solid ${C.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Jelly colorIndex={selColor} size={1.55} float {...outfit} />
            </div>

            <div style={{ marginTop: 16 }}>
              <PrimaryBtn
                onClick={() => {
                  alert('사진첩에 저장했어요!');
                  setPhotoOpen(false);
                }}
              >
                <Camera size={15} />
                찰칵!
              </PrimaryBtn>
            </div>
          </div>
        </div>
      )}

      <main className="profile-container">
        <header className="profile-page-title">
          <h1>내 프로필</h1>
          <p>해파리를 꾸미고, 지금까지의 활동 기록을 한눈에 확인해 보세요.</p>
        </header>

        <div className="profile-layout">
          <div className="profile-card-shell">
            <Card>
            <section className="profile-left-content">
              <div className="profile-preview">
                <Jelly colorIndex={selColor} size={1.5} float {...outfit} />
              </div>

              <div className="profile-user-area">
                {editingName ? (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 7,
                    }}
                  >
                    <input
                      autoFocus
                      value={nameInput}
                      onChange={(event) => setNameInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') saveName();
                      }}
                      style={{
                        width: 160,
                        padding: '8px 10px',
                        borderRadius: 10,
                        border: `2px solid ${C.ocean}`,
                        color: C.deep,
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      aria-label="이름 저장"
                      onClick={saveName}
                      style={{
                        width: 38,
                        border: 0,
                        borderRadius: 10,
                        background: GRAD,
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      <Save size={15} />
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 7,
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        color: C.deep,
                        fontSize: 22,
                        fontWeight: 900,
                      }}
                    >
                      {userName}
                    </h2>
                    <button
                      type="button"
                      aria-label="이름 수정"
                      onClick={() => {
                        setNameInput(userName);
                        setEditingName(true);
                      }}
                      style={{
                        width: 28,
                        height: 28,
                        border: 0,
                        borderRadius: 999,
                        background: '#E0F7FF',
                        color: C.ocean,
                        cursor: 'pointer',
                      }}
                    >
                      <Pencil size={13} />
                    </button>
                  </div>
                )}

                <p
                  style={{
                    margin: '6px 0 0',
                    color: C.muted,
                    fontSize: 12,
                  }}
                >
                  {userEmail}
                </p>
              </div>

              <div className="profile-actions">
                <button
                  type="button"
                  onClick={() => navigate('/shop')}
                  className="profile-action-button"
                  style={{
                    border: `2px solid ${C.border}`,
                    background: '#F0FBFF',
                    color: C.ocean,
                  }}
                >
                  <ShoppingBag size={15} />
                  상점 가기
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoOpen(true)}
                  className="profile-action-button"
                  style={{ background: GRAD, color: '#fff' }}
                >
                  <Camera size={15} />
                  사진 찍기
                </button>
              </div>

              <div className="profile-divider" />

              <div className="profile-section-heading">
                <div>
                  <h3>해파리 꾸미기</h3>
                  <p>보유 중인 아이템을 선택하면 위 해파리에 바로 적용돼요.</p>
                </div>
              </div>

              <div className="customize-tabs" role="tablist">
                {CUSTOMIZE_TABS.map(([key, label]) => {
                  const isActive = customizeTab === key;

                  return (
                    <button
                      type="button"
                      key={key}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setCustomizeTab(key)}
                      className="customize-tab-button"
                      style={{
                        background: isActive ? GRAD : 'transparent',
                        color: isActive ? '#fff' : C.muted,
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {customizeTab === 'color' ? (
                <div className="jelly-color-grid">
                  {JELLY_COLORS.map((color, index) => {
                    const isSelected = selColor === index;

                    return (
                      <button
                        type="button"
                        key={color.name}
                        onClick={() => applyColor(index)}
                        className="jelly-color-button"
                        aria-pressed={isSelected}
                        style={{
                          background: isSelected ? '#E8F8FF' : '#F8FAFC',
                          border: isSelected
                            ? `3px solid ${C.ocean}`
                            : '3px solid transparent',
                        }}
                      >
                        <img
                          src={JELLY_IMAGES[index]}
                          alt={`${color.name} 해파리`}
                          style={{ width: 48, maxWidth: '100%' }}
                        />
                        <span
                          style={{
                            display: 'block',
                            marginTop: 3,
                            color: isSelected ? C.deep : C.muted,
                            fontSize: 11,
                            fontWeight: 800,
                          }}
                        >
                          {color.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="owned-item-grid">
                  {ownedItemsForTab.map((item) => {
                    const isSelected = outfit[item.cat] === item.value;

                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => applyItem(item)}
                        className="owned-item-button"
                        aria-pressed={isSelected}
                        style={{
                          background: isSelected ? '#E8F8FF' : '#F8FAFC',
                          border: isSelected
                            ? `3px solid ${C.ocean}`
                            : '3px solid transparent',
                        }}
                      >
                        {isSelected && (
                          <span className="owned-item-check">
                            <Check size={13} />
                          </span>
                        )}

                        <span className="owned-item-preview">
                          <Jelly
                            colorIndex={selColor}
                            size={0.72}
                            {...{ [item.cat]: item.value }}
                          />
                        </span>

                        <span
                          style={{
                            display: 'block',
                            color: isSelected ? C.deep : C.muted,
                            fontSize: 11,
                            fontWeight: 800,
                          }}
                        >
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {savedNotice && (
                <p
                  style={{
                    margin: '9px 0 0',
                    textAlign: 'center',
                    color: '#10B981',
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {savedNotice}
                </p>
              )}

              <button
                type="button"
                className="customize-shop-link"
                onClick={() => navigate('/shop')}
              >
                <ShoppingBag
                  size={13}
                  style={{ display: 'inline', verticalAlign: 'middle' }}
                />{' '}
                상점에서 아이템 더 보기
              </button>
            </section>
            </Card>
          </div>

          <div className="profile-card-shell">
            <Card>
            <section className="profile-right-content">
              <div className="profile-tabs" role="tablist">
                {[
                  ['stat', '통계'],
                  ['photo', '사진첩'],
                ].map(([key, label]) => {
                  const isActive = tab === key;

                  return (
                    <button
                      type="button"
                      key={key}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setTab(key)}
                      className="profile-tab-button"
                      style={{
                        background: isActive ? GRAD : 'transparent',
                        color: isActive ? '#fff' : C.muted,
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {tab === 'stat' && (
                <div>
                  <div className="profile-section-heading">
                    <div>
                      <h2>나의 활동 통계</h2>
                      <p>현재까지 모은 코인과 완료한 기록을 확인할 수 있어요.</p>
                    </div>
                  </div>

                  <div className="stats-grid">
                    {stats.map((stat) => (
                      <article
                        key={stat.label}
                        className="stat-card"
                        style={{ background: stat.bg }}
                      >
                        <div
                          className="stat-icon"
                          style={{ color: stat.color }}
                        >
                          {stat.icon}
                        </div>
                        <p className="stat-value">{stat.value}</p>
                        <p className="stat-label">{stat.label}</p>
                      </article>
                    ))}
                  </div>

                  <div className="progress-panel">
                    <div className="progress-header">
                      <div>
                        <p
                          style={{
                            margin: 0,
                            color: C.deep,
                            fontSize: 15,
                            fontWeight: 900,
                          }}
                        >
                          할 일 완료율
                        </p>
                        <p
                          style={{
                            margin: '5px 0 0',
                            color: C.muted,
                            fontSize: 12,
                          }}
                        >
                          전체 {totalTodos}개 중 {completedTodos}개를 완료했어요.
                        </p>
                      </div>
                      <strong
                        style={{
                          color: C.ocean,
                          fontSize: 24,
                          fontWeight: 900,
                        }}
                      >
                        {todoRate}%
                      </strong>
                    </div>

                    <div
                      className="progress-track"
                      role="progressbar"
                      aria-label="할 일 완료율"
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-valuenow={todoRate}
                    >
                      <div
                        className="progress-fill"
                        style={{ width: `${todoRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {tab === 'photo' && (
                <div className="photo-empty-state">
                  <Sparkles size={32} color={C.ocean} />
                  <h3>해파리 사진첩</h3>
                  <p>
                    지금 꾸민 해파리의 모습을 사진으로 남겨보세요. 촬영한 사진은
                    이 공간에서 모아볼 수 있어요.
                  </p>
                  <div style={{ width: '100%', maxWidth: 250 }}>
                    <PrimaryBtn onClick={() => setPhotoOpen(true)}>
                      <Camera size={15} />
                      새 사진 찍기
                    </PrimaryBtn>
                  </div>
                </div>
              )}
            </section>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;