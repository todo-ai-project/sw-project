import { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Check, Users, X, Target, Coins } from 'lucide-react';
import Card from '../Auth/components/Card';
import Jelly from '../Auth/components/Jelly';
import PrimaryBtn from '../Auth/components/PrimaryBtn';
import { C, GRAD, PAGE_BG } from '../Auth/components/tokens';
import { useMissions } from '../../context/MissionContext';
import { getGoals, getTodos, getCrewTodos, getCrewMembers, leaveCrew } from '../../services/api';

const ALL_BACKGROUNDS = [
  { id: 'bg_none', name: '기본', value: '', src: null },
  { id: 'bg_cave', name: '해저 동굴', value: 'cave', src: '/assets/backgrounds/back1.png' },
  { id: 'bg_coral', name: '산호초 바다', value: 'coral', src: '/assets/backgrounds/back2.png' },
  { id: 'bg_beach', name: '여름 해변', value: 'beach', src: '/assets/backgrounds/back3.png' },
  { id: 'bg_ring', name: '바다 튜브', value: 'ring', src: '/assets/backgrounds/back4.png' },
  { id: 'bg_shell', name: '조개 무대', value: 'shell', src: '/assets/backgrounds/back5.png' },
];

// "오늘 할 일" 대신, 완료하지 않은 항목 중 순서상 가장 가까운 N개를 "다음 목표"로 보여줌
const UPCOMING_COUNT = 3;

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}

export default function SocialRoomPage() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { completeMission } = useMissions();

  const room = useMemo(() => location.state?.room || {
    id: roomId, name: '소셜 방', goal: '함께 목표를 달성해요', emoji: '🌊'
  }, [location.state, roomId]);

  const myColorIndex = Number(localStorage.getItem('jellyColor') || 0);
  const myOutfit = readJson('todoongsilOutfit', { hat: '', effect: '', expression: 'normal' });
  const myName = localStorage.getItem('userName') || '나';

  const [members, setMembers] = useState([]);
  const [myGoals, setMyGoals] = useState([]);
  const [goalsLoaded, setGoalsLoaded] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(() => {
    const saved = readJson('todoongsilRoomGoal', {});
    return saved[roomId] || '';
  });
  const [myTodos, setMyTodos] = useState([]);
  const [friendTodos, setFriendTodos] = useState([]);
  const [friend, setFriend] = useState(0);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(null);
  const [photoBgIdx, setPhotoBgIdx] = useState(0);
  const ownedItems = readJson('todoongsilOwnedItems', ['bg_none']);
  const ownedBgs = ALL_BACKGROUNDS.filter(bg => bg.id === 'bg_none' || ownedItems.includes(bg.id));
  const [teamBonusClaimed, setTeamBonusClaimed] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    return readJson('todoongsilTeamBonus', {})[`${roomId}:${today}`] || false;
  });

  const friends = useMemo(() => members.filter(m => m.name !== myName), [members, myName]);

  useEffect(() => { completeMission('enter-room'); }, [completeMission]);

  useEffect(() => {
    if (!roomId) return;
    getCrewMembers(roomId).then(data => {
      if (Array.isArray(data) && data.length > 0) {
        setMembers(data.map((m, i) => ({
          name: m.nickname || m.name || `멤버 ${i + 1}`,
          colorIndex: i % 6,
        })));
      }
    }).catch(() => {});
  }, [roomId]);

  const fetchGoals = useCallback(async () => {
    try {
      const data = await getGoals();
      setMyGoals(data.map(g => ({
        id: g.id,
        title: g.title || g.goalName || '이름 없는 목표',
        completed: Boolean(g.completed),
      })));
    } catch (err) {
      if (err.message !== 'AUTH_REQUIRED') console.error('목표 로드 실패:', err);
    } finally {
      setGoalsLoaded(true);
    }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  useEffect(() => {
    if (!selectedGoalId) { setMyTodos([]); return; }
    getTodos().then(data => {
      const filtered = (Array.isArray(data) ? data : [])
        .filter(t => (t.goalId || t.goalID) === selectedGoalId)
        .map(t => ({
          id: t.id,
          text: t.title || t.content || '',
          done: Boolean(t.completed ?? t.isDone),
          order: t.order ?? 0,
        }))
        .sort((a, b) => a.order - b.order);

      // 완료 안 한 것 중 순서상 가장 가까운 N개만 "다음 목표"로 노출
      const upcoming = filtered.filter(t => !t.done).slice(0, UPCOMING_COUNT);
      setMyTodos(upcoming);
    }).catch(() => {});
  }, [selectedGoalId]);

  useEffect(() => {
    if (!roomId) return;
    getCrewTodos(roomId).then(data => {
      if (Array.isArray(data) && data.length > 0) setFriendTodos(data);
    }).catch(() => {});
  }, [roomId]);

  const selectGoal = (goalId) => {
    setSelectedGoalId(goalId);
    const saved = readJson('todoongsilRoomGoal', {});
    saved[roomId] = goalId;
    localStorage.setItem('todoongsilRoomGoal', JSON.stringify(saved));
  };

  const selectedGoal = myGoals.find(g => g.id === selectedGoalId);

  const handleLeave = async () => {
    if (!confirm('정말 이 방을 탈퇴하시겠어요?')) return;
    try { await leaveCrew(roomId); } catch (err) {
      console.warn('탈퇴 서버 연동 실패, 로컬로 처리합니다.', err.message);
    }
    const joinedRaw = readJson('todoongsilJoinedRooms', []);
    localStorage.setItem('todoongsilJoinedRooms', JSON.stringify(joinedRaw.filter(id => id !== roomId)));
    const savedGoals = readJson('todoongsilRoomGoal', {});
    delete savedGoals[roomId];
    localStorage.setItem('todoongsilRoomGoal', JSON.stringify(savedGoals));
    navigate('/social');
  };

  const claimTeamBonus = () => {
    completeMission('team-complete');
    setTeamBonusClaimed(true);
  };

  const take = () => {
    const f = friends[friend];
    const friendName = f?.name || '친구';
    const bg = ownedBgs[photoBgIdx] || ownedBgs[0];
    const photo = {
      id: Date.now(),
      date: new Date().toISOString(),
      roomName: room.name,
      me: { name: myName, colorIndex: myColorIndex, outfit: myOutfit },
      friend: { name: friendName, colorIndex: f?.colorIndex || 0 },
      bg: bg.src || null,
    };
    const saved = readJson('todoongsilPhotos', []);
    saved.unshift(photo);
    localStorage.setItem('todoongsilPhotos', JSON.stringify(saved.slice(0, 50)));
    completeMission('room-photo', { friendName });
    setPhotoTaken(photo);
  };

  const showGoalPicker = goalsLoaded && !selectedGoalId;

  return (
    <div style={{ minHeight: '100vh', paddingTop: 56, background: PAGE_BG }}>
      {showGoalPicker && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(12,74,110,.3)', backdropFilter: 'blur(7px)' }}>
          <div style={{ width: '100%', maxWidth: 420, padding: 24, borderRadius: 24, background: '#fff' }}>
            <h3 style={{ margin: '0 0 6px', color: C.deep }}>이 방에서 공유할 목표를 선택하세요</h3>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>선택한 목표의 투두가 친구들에게 보여요</p>
            {myGoals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ color: C.muted, fontSize: 13, marginBottom: 12 }}>설정된 목표가 없어요</p>
                <PrimaryBtn onClick={() => navigate('/make')}><Target size={14} />목표 만들기</PrimaryBtn>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {myGoals.map(g => (
                  <button key={g.id} onClick={() => selectGoal(g.id)} style={{
                    width: '100%', padding: '12px 16px', borderRadius: 14, border: `2px solid ${C.border}`,
                    background: '#F8FCFF', cursor: 'pointer', textAlign: 'left', fontWeight: 700,
                    color: C.deep, fontSize: 14
                  }}>
                    <Target size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />{g.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {photoOpen && friends.length > 0 && (
        <div onClick={() => { setPhotoOpen(false); setPhotoTaken(null); }} style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(12,74,110,.3)', backdropFilter: 'blur(7px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 430, padding: 24, borderRadius: 26, background: '#fff' }}>
            {photoTaken ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: 14 }}>
                  <h3 style={{ margin: '0 0 6px', color: C.deep }}>오늘의 {photoTaken.friend.name}와(과)의 사진을 찍었어요!</h3>
                </div>
                <div style={{ height: 280, borderRadius: 22, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 0, paddingBottom: 22, border: `2px solid ${C.border}`, background: '#fff' }}>
                  {photoTaken.bg && <img src={photoTaken.bg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                  <div style={{ position: 'relative', marginRight: -16 }}><Jelly colorIndex={photoTaken.me.colorIndex} size={1.7} float {...(photoTaken.me.outfit || {})} /></div>
                  <div style={{ position: 'relative', marginLeft: -16 }}><Jelly colorIndex={photoTaken.friend.colorIndex} size={1.7} float /></div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <PrimaryBtn onClick={() => { setPhotoOpen(false); setPhotoTaken(null); navigate('/profile', { state: { tab: 'photo' } }); }}>내 사진첩에서 확인하기</PrimaryBtn>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3 style={{ margin: 0, color: C.deep, display: 'flex', alignItems: 'center', gap: 6 }}>친구와 사진 찍기 <Camera size={16} /></h3>
                  <button onClick={() => setPhotoOpen(false)} style={{ border: 0, background: 'none', color: C.muted }}><X size={18} /></button>
                </div>
                <div style={{ height: 280, borderRadius: 22, marginTop: 16, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 0, paddingBottom: 22, border: `2px solid ${C.border}`, background: '#fff' }}>
                  {ownedBgs[photoBgIdx]?.src && (
                    <img src={ownedBgs[photoBgIdx].src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  <div style={{ position: 'relative', marginRight: -16 }}><Jelly colorIndex={myColorIndex} size={1.7} float {...myOutfit} /></div>
                  <div style={{ position: 'relative', marginLeft: -16 }}><Jelly colorIndex={friends[friend]?.colorIndex || 0} size={1.7} float /></div>
                </div>
                <div style={{ display: 'flex', gap: 6, margin: '12px 0 8px', flexWrap: 'wrap' }}>
                  {ownedBgs.map((bg, i) => (
                    <button key={bg.id} onClick={() => setPhotoBgIdx(i)} style={{
                      width: 40, height: 40, borderRadius: 10, border: photoBgIdx === i ? '2px solid #0EA5E9' : '2px solid transparent',
                      padding: 0, cursor: 'pointer', overflow: 'hidden', background: bg.src ? '#E0F7FF' : '#fff'
                    }}>
                      {bg.src ? (
                        <img src={bg.src} alt={bg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: 9, color: C.muted, fontWeight: 800, border: `1px solid ${C.border}`, borderRadius: 10 }}>기본</span>
                      )}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, margin: '6px 0 18px' }}>
                  {friends.map((m, i) => (
                    <button key={m.name} onClick={() => setFriend(i)} style={{
                      flex: 1, padding: 8, borderRadius: 12, border: 0, fontWeight: 800,
                      background: friend === i ? GRAD : '#E0F7FF',
                      color: friend === i ? '#fff' : C.ocean
                    }}>{m.name}</button>
                  ))}
                </div>
                <PrimaryBtn onClick={take}><Camera size={15} />찰칵!</PrimaryBtn>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 16px 48px' }}>
        <button onClick={() => navigate('/social')} style={{ border: 0, background: 'none', color: C.ocean, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, marginBottom: '20px', cursor: 'pointer' }}>
          <ArrowLeft size={16} />소셜 방 목록
        </button>

        <Card>
          <div style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 0, flex: 1 }}>
              <div style={{ width: 54, height: 54, borderRadius: 18, background: '#E0F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{room.emoji || '🌊'}</div>
              <div style={{ minWidth: 0 }}>
                <h1 style={{ fontSize: 24, margin: 0, color: C.deep, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.name}</h1>
                <p style={{ fontSize: 13, color: C.muted, marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedGoal ? <><Target size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />{selectedGoal.title}</> : (room.goal || room.description)}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
              {selectedGoalId && (
                <button onClick={() => { setSelectedGoalId(''); const saved = readJson('todoongsilRoomGoal', {}); delete saved[roomId]; localStorage.setItem('todoongsilRoomGoal', JSON.stringify(saved)); }} style={{ padding: '8px 12px', border: `1.5px solid ${C.border}`, borderRadius: 12, background: '#F0FBFF', color: C.ocean, fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <Target size={12} /> 목표 변경
                </button>
              )}
              {friends.length > 0 && (
                <button onClick={() => setPhotoOpen(true)} style={{ padding: '8px 12px', border: 0, borderRadius: 12, background: GRAD, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', gap: 4, whiteSpace: 'nowrap' }}>
                  <Camera size={12} />사진 찍기
                </button>
              )}
              <button onClick={handleLeave} style={{ padding: '8px 12px', border: '1.5px solid #FCA5A5', borderRadius: 12, background: '#FEF2F2', color: '#EF4444', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                탈퇴하기
              </button>
            </div>
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 }}>
          <style>{`@media(max-width:640px){.room-grid{grid-template-columns:1fr!important}}`}</style>
          <Card>
            <div style={{ padding: 20 }}>
              {selectedGoal && (
                <div style={{ marginBottom: 16 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 800, color: C.deep, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    나의 다음 목표
                  </h2>
                  <div style={{ padding: 13, borderRadius: 16, background: '#EFF8FF', border: `1.5px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                      <Jelly colorIndex={myColorIndex} size={0.42} />
                      <b style={{ color: C.deep }}>{myName}</b>
                      <span style={{ fontSize: 11, color: C.muted, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}><Target size={11} />{selectedGoal.title}</span>
                    </div>
                    {myTodos.length > 0 ? myTodos.map(t => (
                      <div key={t.id} style={{ display: 'flex', gap: 8, fontSize: 13, color: t.done ? C.subtle : C.deep, margin: '6px 0' }}>
                        <span>{t.done ? <Check size={14} color="#10B981" /> : '○'}</span>
                        <span style={{ textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
                      </div>
                    )) : (
                      <p style={{ fontSize: 12, color: C.muted, margin: '6px 0' }}>모든 단계를 완료했어요! 🎉</p>
                    )}
                  </div>
                </div>
              )}

              <h2 style={{ fontSize: 14, fontWeight: 800, color: C.deep, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Target size={14} /> 친구들의 다음 목표
              </h2>
              {friends.length > 0 ? friends.map(m => (
                <div key={m.name} style={{ padding: 13, borderRadius: 16, background: '#F8FCFF', marginBottom: 9 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
                    <Jelly colorIndex={m.colorIndex} size={0.42} />
                    <b style={{ color: C.deep }}>{m.name}</b>
                  </div>
                  {friendTodos.length > 0
                    ? friendTodos.slice(0, 3).map((t, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: t.completed ? C.subtle : C.deep, margin: '6px 0' }}>
                          <span>{t.completed ? <Check size={14} color="#10B981" /> : '○'}</span>
                          <span style={{ textDecoration: t.completed ? 'line-through' : 'none' }}>{t.title || t.text}</span>
                        </div>
                      ))
                    : <p style={{ fontSize: 12, color: C.muted, margin: '4px 0' }}>아직 공유된 할 일이 없어요</p>
                  }
                </div>
              )) : (
                <p style={{ fontSize: 13, color: C.muted, textAlign: 'center', padding: '16px 0' }}>아직 참여한 친구가 없어요</p>
              )}
              {!teamBonusClaimed && friends.length > 0 && (
                <button onClick={claimTeamBonus} style={{
                  width: '100%', marginTop: 12, padding: 12, borderRadius: 14, border: 0,
                  background: GRAD, color: '#fff', fontWeight: 800, cursor: 'pointer',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6
                }}>
                  <Coins size={14} /> 팀 완료 보너스 +3코인 받기
                </button>
              )}
            </div>
          </Card>

          <Card>
            <div style={{ padding: 20 }}>
              <h2 style={{ fontSize: 16, color: C.deep, display: 'flex', gap: 6, fontWeight: 800 }}><Users size={15} />멤버</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 12 }}>
                <Jelly colorIndex={myColorIndex} size={0.42} />
                <span style={{ fontSize: 13, fontWeight: 700, color: C.deep }}>{myName} (나)</span>
              </div>
              {friends.map(m => (
                <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 12 }}>
                  <Jelly colorIndex={m.colorIndex} size={0.42} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.deep }}>{m.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}