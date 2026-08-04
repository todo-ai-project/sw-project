import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Users, Heart, LogOut, MessageCircle, X, LogIn } from 'lucide-react';
import Card from '../Auth/components/Card';
import PrimaryBtn from '../Auth/components/PrimaryBtn';
import GhostBtn from '../Auth/components/GhostBtn';
import { C, GRAD, PAGE_BG } from '../Auth/components/tokens';
import { createCrew, getCrews, getGoals, joinCrew, leaveCrew } from '../../services/api';
import { useCoins } from '../../context/CoinContext';
import { getAuth } from 'firebase/auth';

const ROOM_EMOJIS = ['💼', '🏃', '💻', '🗣️', '📚', '🌅', '🎨', '🎵', '🍎', '✈️', '🎯', '🌱'];

function SocialPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshCoins } = useCoins();
  const [rooms, setRooms] = useState([]);
  const [liked, setLiked] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('todoongsilLikedRooms')) || []); } catch { return new Set(); }
  });
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newEmoji, setNewEmoji] = useState('🎯');
  const [joinTarget, setJoinTarget] = useState(null);
  const [myGoals, setMyGoals] = useState([]);
  const [autoOpenHandled, setAutoOpenHandled] = useState(false);

  const myUid = getAuth().currentUser?.uid;

  const fetchRooms = async () => {
    try {
      const data = await getCrews();
      setRooms(data.map(room => ({
        id: String(room.id),
        name: room.name || '소셜 방',
        goal: room.description || '함께 목표를 달성하는 방',
        members: room.members ?? 0,
        emoji: room.emoji || '🌊',
        memberUids: room.memberUids || [],
      })));
    } catch (e) {
      console.error('방 목록 로드 실패:', e);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  // MakeTodo에서 "새 목표 만들러 가기"로 갔다가 돌아온 경우, 원래 참여하려던 방의 모달을 자동으로 다시 열어줌
  useEffect(() => {
    const targetRoomId = location.state?.openJoinRoomId;
    if (!targetRoomId || autoOpenHandled || rooms.length === 0) return;
    const room = rooms.find(r => String(r.id) === String(targetRoomId));
    if (room) {
      openJoinModal(room);
      setAutoOpenHandled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, location.state, autoOpenHandled]);

  const list = useMemo(() => filter === 'joined'
    ? rooms.filter(room => room.memberUids?.includes(myUid))
    : rooms, [filter, rooms, myUid]);

  const create = async () => {
    if (!newName.trim() || !newGoal.trim()) return;
    try {
      await createCrew({ name: newName.trim(), description: newGoal.trim(), emoji: newEmoji });
      await fetchRooms();
      setNewName(''); setNewGoal(''); setNewEmoji('🎯'); setShowCreate(false);
    } catch (error) {
      alert('방 생성에 실패했어요. 다시 시도해주세요.');
    }
  };

  const openJoinModal = async (room) => {
    try {
      const goals = await getGoals();
      setMyGoals(goals);
      setJoinTarget(room);
    } catch {
      alert('목표를 불러오지 못했어요.');
    }
  };

  const confirmJoin = async (goalId) => {
    const id = String(joinTarget.id);
    try {
      await joinCrew(id, goalId);
      setJoinTarget(null);
      await fetchRooms();
      refreshCoins();
    } catch (error) {
      alert('방 참여에 실패했어요. 다시 시도해주세요.');
    }
  };

  const goCreateGoal = () => {
    // 지금 참여하려던 방 id를 들고 목표 생성 페이지로 이동. 만들고 나면 이 페이지로 다시 돌아와서 모달이 자동으로 열림.
    navigate('/make', { state: { fromRoom: joinTarget.id } });
  };

  const enterRoom = (room) => navigate(`/social/${room.id}`, { state: { room } });

  const handleLeave = async (roomId) => {
    if (!confirm('정말 이 방을 탈퇴하시겠어요?')) return;
    try {
      await leaveCrew(roomId);
      await fetchRooms();
    } catch (error) {
      alert('탈퇴에 실패했어요. 다시 시도해주세요.');
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 16px', borderRadius: '16px', fontSize: '14px',
    outline: 'none', background: '#F0FBFF', border: `2px solid ${C.border}`,
    color: C.deep, fontFamily: "'Nunito', sans-serif", boxSizing: 'border-box'
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '56px', background: PAGE_BG }}>
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', background: 'rgba(12,74,110,.25)', backdropFilter: 'blur(6px)' }} onClick={() => setShowCreate(false)}>
          <div style={{ width: '100%', maxWidth: 448, borderRadius: '24px', padding: '24px', background: '#fff' }} onClick={event => event.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: C.deep }}>새 소셜 방 만들기</h3>
              <button onClick={() => setShowCreate(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: C.muted }}><X size={16} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '8px', marginBottom: '16px' }}>
              {ROOM_EMOJIS.map(emoji => <button key={emoji} onClick={() => setNewEmoji(emoji)} style={{ aspectRatio: '1', borderRadius: '12px', fontSize: '20px', cursor: 'pointer', background: newEmoji === emoji ? '#E0F7FF' : '#F8FAFC', border: newEmoji === emoji ? '2px solid #0EA5E9' : '2px solid transparent' }}>{emoji}</button>)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <input value={newName} onChange={event => setNewName(event.target.value)} placeholder="방 이름" style={inputStyle} />
              <input value={newGoal} onChange={event => setNewGoal(event.target.value)} placeholder="함께 달성할 목표" style={inputStyle} />
            </div>
            <PrimaryBtn onClick={create} disabled={!newName.trim() || !newGoal.trim()}><Plus size={16} />방 만들기</PrimaryBtn>
          </div>
        </div>
      )}

      {joinTarget && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px', background: 'rgba(12,74,110,.25)', backdropFilter: 'blur(6px)' }} onClick={() => setJoinTarget(null)}>
          <div style={{ width: '100%', maxWidth: 400, borderRadius: '24px', padding: '24px', background: '#fff' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: C.deep }}>같이할 목표를 선택하세요</h3>
                <p style={{ fontSize: '12px', color: C.muted, margin: '4px 0 0' }}>"{joinTarget.name}"</p>
              </div>
              <button onClick={() => setJoinTarget(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: C.muted, flexShrink: 0 }}><X size={16} /></button>
            </div>

            {myGoals.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {myGoals.map(g => (
                  <button key={g.id} onClick={() => confirmJoin(g.id)} style={{ padding: '10px 14px', borderRadius: '12px', border: `2px solid ${C.border}`, background: '#F0FBFF', textAlign: 'left', cursor: 'pointer', fontWeight: 700, color: C.deep }}>
                    {g.title || g.goalName}
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: C.muted, margin: '0 0 14px', textAlign: 'center', padding: '12px 0' }}>
                아직 만든 목표가 없어요.
              </p>
            )}

            <button onClick={goCreateGoal} style={{
              width: '100%', padding: '10px 14px', borderRadius: '12px', border: `2px dashed ${C.border}`,
              background: '#fff', textAlign: 'center', cursor: 'pointer', fontWeight: 700,
              color: C.ocean, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontSize: '13px'
            }}>
              <Plus size={14} /> 이 방에 맞는 새 목표 만들러 가기
            </button>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 16px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: C.deep, margin: 0 }}>소셜 방</h1>
            <p style={{ fontSize: '14px', color: C.muted, margin: '4px 0 0' }}>같이 헤엄치는 친구들과 투두를 나눠요</p>
          </div>
          <button onClick={() => setShowCreate(true)} style={{ padding: '10px 18px', border: 0, borderRadius: 14, background: GRAD, color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, whiteSpace: 'nowrap' }}><Plus size={14} />방 만들기</button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <GhostBtn active={filter === 'all'} onClick={() => setFilter('all')}>전체</GhostBtn>
          <GhostBtn active={filter === 'joined'} onClick={() => setFilter('joined')}>참여중인 방</GhostBtn>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '12px' }}>
          {list.map(room => {
            const roomId = String(room.id);
            const isJoined = room.memberUids?.includes(myUid);
            const isLiked = liked.has(roomId);
            return (
              <Card key={roomId}>
                <div style={{ padding: '14px 16px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{room.emoji}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <h3 style={{ fontWeight: 800, fontSize: 16, color: C.deep, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.name}</h3>
                        {isJoined && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: '#CCFBF1', color: '#0D9488', whiteSpace: 'nowrap', lineHeight: '16px' }}>참여중</span>}
                      </div>
                      <p style={{ fontSize: 13, color: C.muted, margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.goal}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, color: C.muted }}><Users size={14} />{room.members}명</span>
                      <button onClick={() => setLiked(prev => { const next = new Set(prev); next.has(roomId) ? next.delete(roomId) : next.add(roomId); localStorage.setItem('todoongsilLikedRooms', JSON.stringify([...next])); return next; })} style={{ display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', cursor: 'pointer', color: isLiked ? '#F472B6' : '#BAE6FD', fontSize: 13, padding: 0 }}><Heart size={14} fill={isLiked ? 'currentColor' : 'none'} /></button>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => isJoined ? enterRoom(room) : openJoinModal(room)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 10, cursor: 'pointer', ...(isJoined ? { background: '#E0F7FF', color: C.ocean, border: `1.5px solid ${C.border}` } : { background: GRAD, color: '#fff', border: '1.5px solid transparent' }) }}>
                        {isJoined ? <><LogIn size={13} />입장</> : <><MessageCircle size={13} />참여</>}
                      </button>
                      {isJoined && <button onClick={() => handleLeave(roomId)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 10, cursor: 'pointer', background: '#FEF2F2', color: '#EF4444', border: '1.5px solid #FCA5A5' }}>
                        <LogOut size={13} />탈퇴
                      </button>}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SocialPage;