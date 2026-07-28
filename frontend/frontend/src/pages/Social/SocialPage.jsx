import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Heart, Check, LogOut, MessageCircle, X, LogIn, Waves } from 'lucide-react';
import Card from '../Auth/components/Card';
import PrimaryBtn from '../Auth/components/PrimaryBtn';
import GhostBtn from '../Auth/components/GhostBtn';
import { C, GRAD, PAGE_BG } from '../Auth/components/tokens';
import { createCrew, getCrews, joinCrew, leaveCrew } from '../../services/api';
import { useCoins } from '../../context/CoinContext';

const ROOM_EMOJIS = ['💼', '🏃', '💻', '🗣️', '📚', '🌅', '🎨', '🎵', '🍎', '✈️', '🎯', '🌱'];
const STORAGE_KEY = 'todoongsilSocialRooms';
const JOINED_KEY = 'todoongsilJoinedRooms';
function readRooms() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const joined = readJoined();
    return saved.filter(r => joined.has(String(r.id)) && r.members > 0);
  } catch {
    return [];
  }
}

function readJoined() {
  try {
    return new Set(JSON.parse(localStorage.getItem(JOINED_KEY)) || []);
  } catch {
    return new Set();
  }
}

function SocialPage() {
  const navigate = useNavigate();
  const { refreshCoins } = useCoins();
  const [rooms, setRooms] = useState(readRooms);
  const [liked, setLiked] = useState(new Set());
  const [joined, setJoined] = useState(readJoined);
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newEmoji, setNewEmoji] = useState('🎯');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem(JOINED_KEY, JSON.stringify([...joined]));
  }, [joined]);

  useEffect(() => {
    getCrews().then(data => {
      if (!data.length) return;
      const currentJoined = readJoined();
      setRooms(prev => {
        const known = new Set(prev.map(room => String(room.id)));
        const additions = data
          .filter(room => !known.has(String(room.id)) && currentJoined.has(String(room.id)))
          .map(room => ({
            id: String(room.id),
            name: room.name,
            goal: room.description || '함께 목표를 달성하는 방',
            members: 1,
            progress: 0,
            emoji: '🌊',
            likes: 0,
          }));
        return [...prev, ...additions].filter(r => r.members > 0);
      });
    }).catch(() => {});
  }, []);

  const list = useMemo(() => filter === 'joined'
    ? rooms.filter(room => joined.has(String(room.id)))
    : rooms, [filter, rooms, joined]);

  const create = async () => {
    if (!newName.trim() || !newGoal.trim()) return;
    let id = String(Date.now());
    try {
      const created = await createCrew({ name: newName.trim(), description: newGoal.trim() });
      id = String(created.id || id);
    } catch (error) {
      console.warn('방 생성 서버 연동 실패, 로컬 방으로 생성합니다.', error.message);
    }
    const room = { id, name: newName.trim(), goal: newGoal.trim(), members: 1, progress: 0, emoji: newEmoji, likes: 0 };
    setRooms(prev => [room, ...prev]);
    setJoined(prev => new Set([...prev, id]));
    refreshCoins();
    setNewName(''); setNewGoal(''); setNewEmoji('🎯'); setShowCreate(false);
  };

  const handleJoin = async (room) => {
    const id = String(room.id);
    if (joined.has(id)) {
      navigate(`/social/${id}`, { state: { room } });
      return;
    }
    try {
      await joinCrew(id);
    } catch (error) {
      console.warn('방 가입 서버 연동 실패, 로컬 참여로 처리합니다.', error.message);
    }
    setJoined(prev => new Set([...prev, id]));
    setRooms(prev => prev.map(item => String(item.id) === id ? { ...item, members: item.members + 1 } : item));
    refreshCoins();
    alert('방에 참여했어요!');
  };

  const enterRoom = (room) => navigate(`/social/${room.id}`, { state: { room } });

  const handleLeave = async (roomId) => {
    if (!confirm('정말 이 방을 탈퇴하시겠어요?')) return;
    try { await leaveCrew(roomId); } catch (error) {
      console.warn('탈퇴 서버 연동 실패, 로컬로 처리합니다.', error.message);
    }
    setJoined(prev => { const next = new Set(prev); next.delete(roomId); return next; });
    setRooms(prev => {
      const updated = prev.map(r => String(r.id) === roomId ? { ...r, members: Math.max(0, r.members - 1) } : r);
      return updated.filter(r => r.members > 0);
    });
    try {
      const savedGoals = JSON.parse(localStorage.getItem('todoongsilRoomGoal') || '{}');
      delete savedGoals[roomId];
      localStorage.setItem('todoongsilRoomGoal', JSON.stringify(savedGoals));
    } catch {}
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
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: C.deep }}>새 소셜 방 만들기</h3>
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

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 16px' }}>
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
            const isJoined = joined.has(roomId);
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
                      <button onClick={() => setLiked(prev => { const next = new Set(prev); next.has(roomId) ? next.delete(roomId) : next.add(roomId); return next; })} style={{ display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', cursor: 'pointer', color: isLiked ? '#F472B6' : '#BAE6FD', fontSize: 13, padding: 0 }}><Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />{room.likes + (isLiked ? 1 : 0)}</button>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => isJoined ? enterRoom(room) : handleJoin(room)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 10, cursor: 'pointer', ...(isJoined ? { background: '#E0F7FF', color: C.ocean, border: `1.5px solid ${C.border}` } : { background: GRAD, color: '#fff', border: '1.5px solid transparent' }) }}>
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
