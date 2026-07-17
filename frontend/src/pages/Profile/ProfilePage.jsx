import { useState, useEffect } from 'react';
import { Trophy, Flame, Check, Camera, X, Pencil, Save } from 'lucide-react';
import Jelly, { JELLY_IMAGES } from '../Auth/components/Jelly';
import Bubbles from '../Auth/components/Bubbles';
import Card from '../Auth/components/Card';
import PrimaryBtn from '../Auth/components/PrimaryBtn';
import { C, GRAD, PAGE_BG } from '../Auth/components/tokens';

const JELLY_COLORS = [
  { name: '하늘', preview: '#BAE6FD' },
  { name: '핑크', preview: '#F9A8D4' },
  { name: '민트', preview: '#99F6E4' },
  { name: '선샤인', preview: '#FDE68A' },
  { name: '보라', preview: '#C4B5FD' },
  { name: '그레이', preview: '#D1D5DB' },
];

const FRIEND_CHARS = [
  { name: '김채민', colorIndex: 1 },
  { name: '박민서', colorIndex: 4 },
  { name: '오하민', colorIndex: 2 },
  { name: '이준호', colorIndex: 3 },
];
const FRAMES = ['🪼', '🌊', '🐚', '✨', '🌸', '🐠'];

function ProfilePage() {
  const savedColor = parseInt(localStorage.getItem('jellyColor') || '0', 10);
  const [selColor, setSelColor] = useState(savedColor);
  const [customSaved, setCustomSaved] = useState(true);
  const [tab, setTab] = useState('stat');
  const [photoBooth, setPhotoBooth] = useState(false);
  const [selFriend, setSelFriend] = useState(0);
  const [selFrame, setSelFrame] = useState(0);
  const [flash, setFlash] = useState(false);
  const [photos, setPhotos] = useState([
    { id: 1, meColorIdx: 0, friendIdx: 0, frame: '🪼', date: '2026.06.28' },
    { id: 2, meColorIdx: 2, friendIdx: 2, frame: '🌊', date: '2026.07.01' },
  ]);

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const [userName, setUserName] = useState(localStorage.getItem('userName') || '사용자');
  const userEmail = localStorage.getItem('userEmail') || '';

  const startEditName = () => {
    setNameInput(userName);
    setEditingName(true);
  };
  const saveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      setUserName(trimmed);
      localStorage.setItem('userName', trimmed);
    }
    setEditingName(false);
  };

  const takePhoto = () => {
    setFlash(true);
    setTimeout(() => {
      setPhotos(p => [{
        id: Date.now(), meColorIdx: selColor,
        friendIdx: selFriend, frame: FRAMES[selFrame],
        date: new Date().toLocaleDateString('ko-KR').replace(/\. /g, '.'),
      }, ...p]);
      setFlash(false); setPhotoBooth(false);
    }, 400);
  };

  const stats = [
    { label: '달성한 목표', value: '3개', icon: <Trophy size={18} />, color: '#F59E0B', bg: '#FEF3C7' },
    { label: '연속 달성일', value: '12일', icon: <Flame size={18} />, color: '#EF4444', bg: '#FFE4E6' },
    { label: '완료한 할 일', value: '47개', icon: <Check size={18} />, color: '#10B981', bg: '#D1FAE5' },
  ];

  return (
    <div style={{ minHeight: '100vh', paddingTop: '56px', background: PAGE_BG }}>
      {flash && <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: '#fff', pointerEvents: 'none', animation: 'flash .5s ease-out forwards' }} />}

      {/* Photo booth modal */}
      {photoBooth && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px',
          background: 'rgba(12,74,110,0.28)', backdropFilter: 'blur(6px)'
        }} onClick={() => setPhotoBooth(false)}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: 384, boxShadow: '0 24px 80px rgba(14,165,233,.18)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 800, fontSize: '18px', color: C.deep, fontFamily: "'Nunito', sans-serif" }}>📸 사진 찍기</h3>
              <button onClick={() => setPhotoBooth(false)} style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', background: 'transparent', cursor: 'pointer', color: C.muted
              }}><X size={16} /></button>
            </div>

            {/* Viewfinder */}
            <div style={{
              borderRadius: '16px', marginBottom: '16px', minHeight: 170,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 40,
              position: 'relative', overflow: 'hidden',
              background: 'linear-gradient(180deg,#E0F7FF,#F0F8FF)', border: `2px solid ${C.border}`
            }}>
              <Bubbles n={4} />
              <div style={{ position: 'absolute', top: 8, left: 10, fontSize: 24, opacity: 0.4 }}>{FRAMES[selFrame]}</div>
              <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 24, opacity: 0.4 }}>{FRAMES[selFrame]}</div>
              {[
                { ci: selColor, name: '나' },
                { ci: FRIEND_CHARS[selFriend].colorIndex, name: FRIEND_CHARS[selFriend].name },
              ].map((c, i) => (
                <div key={i} style={{ textAlign: 'center', zIndex: 10, paddingBottom: 12 }}>
                  <Jelly colorIndex={c.ci} size={0.82} float />
                  <p style={{ fontSize: '10px', fontWeight: 700, marginTop: 4, color: C.ocean, fontFamily: "'Nunito', sans-serif" }}>{c.name}</p>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: C.muted, fontFamily: "'Nunito', sans-serif" }}>함께 찍을 친구</p>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
              {FRIEND_CHARS.map((f, i) => (
                <button key={i} onClick={() => setSelFriend(i)} style={{
                  flex: 1, padding: '8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700,
                  cursor: 'pointer', border: 'none', transition: 'all 0.2s', fontFamily: "'Nunito', sans-serif",
                  ...(selFriend === i ? { background: GRAD, color: '#fff' } : { background: '#E0F7FF', color: C.ocean })
                }}>{f.name}</button>
              ))}
            </div>

            <p style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: C.muted, fontFamily: "'Nunito', sans-serif" }}>프레임</p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {FRAMES.map((fr, i) => (
                <button key={i} onClick={() => setSelFrame(i)} style={{
                  width: 40, height: 40, borderRadius: '12px', fontSize: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: selFrame === i ? '#E0F7FF' : '#F8FAFC',
                  border: selFrame === i ? '2px solid #0EA5E9' : '2px solid transparent',
                  transform: selFrame === i ? 'scale(1.12)' : undefined
                }}>{fr}</button>
              ))}
            </div>
            <PrimaryBtn onClick={takePhoto}><Camera size={15} />찰칵!</PrimaryBtn>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: '20px' }}>

          {/* Left: Character */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Card>
              <div style={{ padding: '24px', textAlign: 'center', background: `linear-gradient(180deg,${JELLY_COLORS[selColor]?.preview || '#BAE6FD'}12,rgba(255,255,255,0.9) 55%)`, borderRadius: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <Jelly colorIndex={selColor} size={1.3} float />
                </div>
                {editingName ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '2px' }}>
                    <input
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveName()}
                      autoFocus
                      style={{
                        fontSize: '18px', fontWeight: 800, textAlign: 'center', width: '140px',
                        padding: '4px 8px', borderRadius: '10px', border: `2px solid ${C.ocean}`,
                        outline: 'none', color: C.deep, fontFamily: "'Nunito', sans-serif",
                        background: 'rgba(255,255,255,0.8)'
                      }}
                    />
                    <button onClick={saveName} style={{
                      width: 28, height: 28, borderRadius: '50%', border: 'none',
                      background: GRAD, color: '#fff', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}><Check size={14} /></button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '2px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: C.deep, fontFamily: "'Nunito', sans-serif", margin: 0 }}>{userName}</h2>
                    <button onClick={startEditName} style={{
                      width: 24, height: 24, borderRadius: '50%', border: 'none',
                      background: 'rgba(14,165,233,0.1)', color: C.ocean, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}><Pencil size={12} /></button>
                  </div>
                )}
                <p style={{ fontSize: '12px', marginBottom: '16px', color: C.muted, fontFamily: "'Nunito', sans-serif" }}>{userEmail}</p>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: C.muted, fontFamily: "'Nunito', sans-serif" }}>
                    <span>경험치</span><span>240 / 300</span>
                  </div>
                  <div style={{ height: 10, borderRadius: 999, overflow: 'hidden', background: '#E0F7FF' }}>
                    <div style={{ height: '100%', borderRadius: 999, background: GRAD, width: '80%' }} />
                  </div>
                </div>
                <button onClick={() => setPhotoBooth(true)} style={{
                  width: '100%', padding: '10px', color: '#fff', fontSize: '14px', fontWeight: 700,
                  borderRadius: '16px', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: GRAD, fontFamily: "'Nunito', sans-serif", transition: 'all 0.2s'
                }}>
                  <Camera size={14} />사진 찍기
                </button>
              </div>
            </Card>

            {/* Customization */}
            <Card>
              <div style={{ padding: '16px' }}>
                <p style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px', color: C.deep, fontFamily: "'Nunito', sans-serif" }}>꾸미기</p>
                <p style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: C.muted, fontFamily: "'Nunito', sans-serif" }}>해파리 선택</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {JELLY_COLORS.map((j, i) => (
                    <button key={i} onClick={() => { setSelColor(i); setCustomSaved(false); }} style={{
                      padding: '8px', borderRadius: '16px', cursor: 'pointer',
                      transition: 'all 0.2s', position: 'relative',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                      background: selColor === i ? '#E0F7FF' : '#F8FAFC',
                      border: selColor === i ? '3px solid #0EA5E9' : '3px solid transparent',
                      transform: selColor === i ? 'scale(1.05)' : undefined,
                      boxShadow: selColor === i ? '0 4px 12px rgba(14,165,233,0.2)' : undefined
                    }}>
                      <img src={JELLY_IMAGES[i]} alt={j.name} style={{ width: 48, height: 'auto' }} />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: selColor === i ? C.ocean : C.muted, fontFamily: "'Nunito', sans-serif" }}>{j.name}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    localStorage.setItem('jellyColor', String(selColor));
                    setCustomSaved(true);
                  }}
                  style={{
                    width: '100%', marginTop: '16px', padding: '10px',
                    fontSize: '14px', fontWeight: 700, borderRadius: '16px',
                    border: 'none', cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'all 0.2s',
                    ...(customSaved
                      ? { background: '#E0F7FF', color: C.ocean }
                      : { background: GRAD, color: '#fff', boxShadow: '0 4px 12px rgba(14,165,233,0.25)' })
                  }}
                >
                  {customSaved ? <><Check size={14} />저장됨</> : <><Save size={14} />꾸미기 저장</>}
                </button>
              </div>
            </Card>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Tabs */}
            <div style={{
              display: 'flex', padding: '4px', borderRadius: '16px', gap: '4px',
              background: 'rgba(255,255,255,0.7)', border: `1px solid ${C.border}`
            }}>
              {[{ key: 'stat', label: '통계' }, { key: 'photo', label: '📸 사진첩' }].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{
                  flex: 1, padding: '8px', fontSize: '14px', fontWeight: 700,
                  borderRadius: '12px', border: 'none', cursor: 'pointer',
                  transition: 'all 0.2s', fontFamily: "'Nunito', sans-serif",
                  ...(tab === t.key
                    ? { background: GRAD, color: '#fff', boxShadow: '0 2px 8px rgba(14,165,233,0.25)' }
                    : { background: 'transparent', color: C.muted })
                }}>{t.label}</button>
              ))}
            </div>

            {tab === 'stat' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {stats.map((s, i) => (
                    <div key={i} style={{ borderRadius: '24px', padding: '16px', background: s.bg }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '8px', background: 'rgba(255,255,255,0.6)', color: s.color
                      }}>{s.icon}</div>
                      <p style={{ fontSize: '24px', fontWeight: 800, color: C.deep, fontFamily: "'Nunito', sans-serif" }}>{s.value}</p>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: C.muted, fontFamily: "'Nunito', sans-serif" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {tab === 'photo' && (
              <Card>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <p style={{ fontWeight: 800, color: C.deep, fontFamily: "'Nunito', sans-serif" }}>사진첩</p>
                    <PrimaryBtn small onClick={() => setPhotoBooth(true)}><Camera size={13} />새 사진</PrimaryBtn>
                  </div>
                  {photos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 0' }}>
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>🪼</div>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: C.subtle, fontFamily: "'Nunito', sans-serif" }}>아직 사진이 없어요</p>
                      <p style={{ fontSize: '12px', marginTop: '4px', color: C.subtle, fontFamily: "'Nunito', sans-serif" }}>친구 해파리랑 첫 사진을 찍어봐요!</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {photos.map(p => (
                        <div key={p.id} style={{
                          position: 'relative', borderRadius: '16px', overflow: 'hidden',
                          background: 'linear-gradient(180deg,#E0F7FF,#F0F8FF)', border: `2px solid ${C.border}`
                        }}>
                          <div style={{ position: 'absolute', top: 8, left: 8, fontSize: 18, opacity: 0.35 }}>{p.frame}</div>
                          <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 18, opacity: 0.35 }}>{p.frame}</div>
                          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 20, paddingTop: 24, paddingBottom: 12, paddingLeft: 12, paddingRight: 12 }}>
                            {[
                              { ci: p.meColorIdx, name: '나' },
                              { ci: FRIEND_CHARS[p.friendIdx].colorIndex, name: FRIEND_CHARS[p.friendIdx].name },
                            ].map((c, i) => (
                              <div key={i} style={{ textAlign: 'center' }}>
                                <Jelly colorIndex={c.ci} size={0.62} float />
                                <p style={{ fontSize: '9px', fontWeight: 700, marginTop: 2, color: C.ocean, fontFamily: "'Nunito', sans-serif" }}>{c.name}</p>
                              </div>
                            ))}
                          </div>
                          <div style={{ textAlign: 'center', padding: '6px', borderTop: `1px solid ${C.border}`, background: 'rgba(255,255,255,0.6)' }}>
                            <p style={{ fontSize: '10px', fontWeight: 600, color: C.muted, fontFamily: "'Nunito', sans-serif" }}>{p.date}</p>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => setPhotoBooth(true)} style={{
                        borderRadius: '16px', border: `2px dashed ${C.border}`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: '8px', minHeight: 160, background: 'transparent', cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}>
                        <Camera size={20} style={{ color: C.subtle }} />
                        <p style={{ fontSize: '12px', fontWeight: 700, color: C.subtle, fontFamily: "'Nunito', sans-serif" }}>새 사진 찍기</p>
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
