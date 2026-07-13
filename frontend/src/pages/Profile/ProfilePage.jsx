import { useState } from 'react';
import { Trophy, Flame, Check, Star, Camera, X } from 'lucide-react';
import Jelly from '../Auth/components/Jelly';
import Bubbles from '../Auth/components/Bubbles';
import Card from '../Auth/components/Card';
import PrimaryBtn from '../Auth/components/PrimaryBtn';
import { C, GRAD, PAGE_BG } from '../Auth/components/tokens';

const JELLY_COLORS = [
  { bell: '#BAE6FD', glow: '#38BDF8', name: '스카이' },
  { bell: '#F9A8D4', glow: '#F472B6', name: '핑크' },
  { bell: '#C4B5FD', glow: '#A78BFA', name: '라벤더' },
  { bell: '#99F6E4', glow: '#2DD4BF', name: '민트' },
  { bell: '#FDE68A', glow: '#FBBF24', name: '선샤인' },
  { bell: '#FCA5A5', glow: '#F87171', name: '코럴' },
  { bell: '#D9F99D', glow: '#A3E635', name: '라임' },
  { bell: '#E0E7FF', glow: '#818CF8', name: '퍼플' },
];
const ACCESSORIES = ['🎀', '👑', '🌸', '⭐', '🐚', '🪸', '🌊', '✨'];

const FRIEND_CHARS = [
  { name: '김채민', bellColor: '#F9A8D4', glowColor: '#F472B6' },
  { name: '박민서', bellColor: '#C4B5FD', glowColor: '#A78BFA' },
  { name: '오하민', bellColor: '#99F6E4', glowColor: '#2DD4BF' },
  { name: '이준호', bellColor: '#FDE68A', glowColor: '#FBBF24' },
];
const FRAMES = ['🪼', '🌊', '🐚', '✨', '🌸', '🐠'];

function ProfilePage() {
  const [selColor, setSelColor] = useState(0);
  const [selAcc, setSelAcc] = useState(0);
  const [tab, setTab] = useState('stat');
  const [photoBooth, setPhotoBooth] = useState(false);
  const [selFriend, setSelFriend] = useState(0);
  const [selFrame, setSelFrame] = useState(0);
  const [flash, setFlash] = useState(false);
  const [photos, setPhotos] = useState([
    { id: 1, meColorIdx: 0, meAcc: '🎀', friendIdx: 0, frame: '🪼', date: '2026.06.28' },
    { id: 2, meColorIdx: 2, meAcc: '⭐', friendIdx: 2, frame: '🌊', date: '2026.07.01' },
  ]);

  const jelly = JELLY_COLORS[selColor];
  const userName = localStorage.getItem('userName') || '사용자';
  const userEmail = localStorage.getItem('userEmail') || '';

  const takePhoto = () => {
    setFlash(true);
    setTimeout(() => {
      setPhotos(p => [{
        id: Date.now(), meColorIdx: selColor, meAcc: ACCESSORIES[selAcc],
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
    { label: '획득한 배지', value: '5개', icon: <Star size={18} />, color: '#8B5CF6', bg: '#EDE9FE' },
  ];

  const badges = [
    { emoji: '🌱', name: '첫 목표', desc: '첫 번째 목표 설정', locked: false },
    { emoji: '🔥', name: '7일 연속', desc: '7일 연속 달성', locked: false },
    { emoji: '🎯', name: '완벽한 하루', desc: '할 일 100% 완료', locked: false },
    { emoji: '🪼', name: '소셜 스타', desc: '첫 소셜 방 참여', locked: false },
    { emoji: '⚡', name: '스피드 러너', desc: '달성 속도 상위 10%', locked: false },
    { emoji: '🔒', name: '???', desc: '아직 잠긴 배지', locked: true },
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
                { jc: JELLY_COLORS[selColor], acc: ACCESSORIES[selAcc], name: '나' },
                { jc: { bell: FRIEND_CHARS[selFriend].bellColor, glow: FRIEND_CHARS[selFriend].glowColor }, acc: '🌸', name: FRIEND_CHARS[selFriend].name },
              ].map((c, i) => (
                <div key={i} style={{ textAlign: 'center', zIndex: 10, paddingBottom: 12 }}>
                  <Jelly bellColor={c.jc.bell} glowColor={c.jc.glow} accessory={c.acc} size={0.82} float />
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
              <div style={{ padding: '24px', textAlign: 'center', background: `linear-gradient(180deg,${jelly.glow}12,rgba(255,255,255,0.9) 55%)`, borderRadius: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <Jelly bellColor={jelly.bell} glowColor={jelly.glow} accessory={ACCESSORIES[selAcc]} size={1.3} float />
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '2px', color: C.deep, fontFamily: "'Nunito', sans-serif" }}>{userName}</h2>
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
                <p style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: C.muted, fontFamily: "'Nunito', sans-serif" }}>색깔</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
                  {JELLY_COLORS.map((j, i) => (
                    <button key={i} onClick={() => setSelColor(i)} style={{
                      aspectRatio: '1', borderRadius: '16px', cursor: 'pointer',
                      backgroundColor: j.bell, transition: 'all 0.2s', position: 'relative',
                      border: selColor === i ? `3px solid ${j.glow}` : '3px solid transparent',
                      transform: selColor === i ? 'scale(1.15)' : undefined,
                      boxShadow: selColor === i ? `0 4px 12px ${j.glow}55` : undefined
                    }}>
                      {selColor === i && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={10} color="#fff" strokeWidth={3} /></div>}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: C.muted, fontFamily: "'Nunito', sans-serif" }}>악세사리</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {ACCESSORIES.map((a, i) => (
                    <button key={i} onClick={() => setSelAcc(i)} style={{
                      aspectRatio: '1', borderRadius: '12px', fontSize: '20px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.2s',
                      background: selAcc === i ? '#E0F7FF' : '#F8FAFC',
                      border: selAcc === i ? '2px solid #0EA5E9' : `2px solid ${C.border}`,
                      transform: selAcc === i ? 'scale(1.12)' : undefined
                    }}>{a}</button>
                  ))}
                </div>
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
              {[{ key: 'stat', label: '통계 & 배지' }, { key: 'photo', label: '📸 사진첩' }].map(t => (
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
                <Card>
                  <div style={{ padding: '20px' }}>
                    <p style={{ fontWeight: 800, marginBottom: '16px', color: C.deep, fontFamily: "'Nunito', sans-serif" }}>획득한 배지</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      {badges.map((b, i) => (
                        <div key={i} style={{
                          borderRadius: '16px', padding: '12px', textAlign: 'center',
                          opacity: b.locked ? 0.4 : 1,
                          background: b.locked ? '#F8FAFC' : '#EFF8FF',
                          border: b.locked ? `2px dashed ${C.border}` : `2px solid ${C.border}`
                        }}>
                          <div style={{ fontSize: '24px', marginBottom: '6px' }}>{b.emoji}</div>
                          <p style={{ fontSize: '12px', fontWeight: 800, marginBottom: '2px', color: C.deep, fontFamily: "'Nunito', sans-serif" }}>{b.name}</p>
                          <p style={{ fontSize: '10px', lineHeight: 1.3, color: C.muted, fontFamily: "'Nunito', sans-serif" }}>{b.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
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
                              { jc: JELLY_COLORS[p.meColorIdx], acc: p.meAcc, name: '나' },
                              { jc: { bell: FRIEND_CHARS[p.friendIdx].bellColor, glow: FRIEND_CHARS[p.friendIdx].glowColor }, acc: '🌸', name: FRIEND_CHARS[p.friendIdx].name },
                            ].map((c, i) => (
                              <div key={i} style={{ textAlign: 'center' }}>
                                <Jelly bellColor={c.jc.bell} glowColor={c.jc.glow} accessory={c.acc} size={0.62} float />
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
