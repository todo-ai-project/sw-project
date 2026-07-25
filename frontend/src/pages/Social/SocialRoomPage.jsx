import { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Check, Cloud, Rainbow, Users, X, Target, Coins, Flower2, Shell } from 'lucide-react';
import Card from '../Auth/components/Card';
import Jelly from '../Auth/components/Jelly';
import PrimaryBtn from '../Auth/components/PrimaryBtn';
import { C, GRAD, PAGE_BG } from '../Auth/components/tokens';
import { useMissions } from '../../context/MissionContext';
import { getGoals, getTodos, getCrewTodos, getCrewMembers, leaveCrew } from '../../services/api';

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
      console.error('목표 로드 실패:', err);
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
        .map(t => ({ id: t.id, text: t.title || t.content || '', done: Boolean(t.completed ?? t.isDone) }));
      setMyTodos(filtered);
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
    const friendName = friends[friend]?.name || '친구';
    completeMission('room-photo', { friendName });
    setPhotoOpen(false);
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
        <div onClick={() => setPhotoOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(12,74,110,.3)', backdropFilter: 'blur(7px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 430, padding: 24, borderRadius: 26, background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, color: C.deep, display: 'flex', alignItems: 'center', gap: 6 }}>친구와 사진 찍기 <Camera size={16} /></h3>
              <button onClick={() => setPhotoOpen(false)} style={{ border: 0, background: 'none', color: C.muted }}><X size={18} /></button>
            </div>
            <div style={{ height: 230, borderRadius: 22, marginTop: 16, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 8, paddingBottom: 22, background: 'linear-gradient(180deg,#CFF4FF 0%,#EAF7FF 55%,#DDF7E8 56%,#BFE8D0 100%)', border: `2px solid ${C.border}` }}>
              <Cloud size={28} style={{ position: 'absolute', top: 18, left: 24, color: '#fff', opacity: 0.7 }} />
              <Rainbow size={24} style={{ position: 'absolute', top: 24, right: 28, color: '#F9A8D4', opacity: 0.6 }} />
              <Flower2 size={22} style={{ position: 'absolute', bottom: 10, left: 16, color: '#F9A8D4', opacity: 0.5 }} />
              <Shell size={22} style={{ position: 'absolute', bottom: 10, right: 20, color: '#BAE6FD', opacity: 0.5 }} />
              <Jelly colorIndex={myColorIndex} size={1.25} float />
              <Jelly colorIndex={friends[friend]?.colorIndex || 0} size={1.25} float />
            </div>
            <div style={{ display: 'flex', gap: 8, margin: '14px 0 18px' }}>
              {friends.map((m, i) => (
                <button key={m.name} onClick={() => setFriend(i)} style={{
                  flex: 1, padding: 8, borderRadius: 12, border: 0, fontWeight: 800,
                  background: friend === i ? GRAD : '#E0F7FF',
                  color: friend === i ? '#fff' : C.ocean
                }}>{m.name}</button>
              ))}
            </div>
            <PrimaryBtn onClick={take}><Camera size={15} />찰칵!</PrimaryBtn>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '28px 16px 48px' }}>
        <button onClick={() => navigate('/social')} style={{ border: 0, background: 'none', color: C.ocean, fontWeight: 800, display: 'flex', gap: 6 }}>
          <ArrowLeft size={16} />소셜 방 목록
        </button>

        <Card>
          <div style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', minWidth: 0, flex: 1 }}>
              <div style={{ width: 54, height: 54, borderRadius: 18, background: '#E0F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{room.emoji || '🌊'}</div>
              <div style={{ minWidth: 0 }}>
                <h1 style={{ fontSize: 22, margin: 0, color: C.deep, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.name}</h1>
                <p style={{ fontSize: 13, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedGoal ? <><Target size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />{selectedGoal.title}</> : (room.goal || room.description)}</p>
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
                  <h2 style={{ fontSize: 16, color: C.deep, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    나의 오늘 할 일
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
                      <p style={{ fontSize: 12, color: C.muted, margin: '6px 0' }}>아직 할 일이 없어요</p>
                    )}
                  </div>
                </div>
              )}

              <h2 style={{ fontSize: 16, color: C.deep, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Target size={15} /> 친구들의 오늘 투두
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
              <h2 style={{ fontSize: 18, color: C.deep, display: 'flex', gap: 6 }}><Users size={17} />멤버</h2>
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
