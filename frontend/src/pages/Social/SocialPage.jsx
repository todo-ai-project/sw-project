import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Heart, Check, MessageCircle, X, LogIn } from 'lucide-react';
import Card from '../Auth/components/Card';
import PrimaryBtn from '../Auth/components/PrimaryBtn';
import GhostBtn from '../Auth/components/GhostBtn';
import { C, GRAD, PAGE_BG } from '../Auth/components/tokens';
import { createCrew, getCrews, joinCrew } from '../../services/api';
import { useCoins } from '../../context/CoinContext';

const ROOM_EMOJIS = ['💼', '🏃', '💻', '🗣️', '📚', '🌅', '🎨', '🎵', '🍎', '✈️', '🎯', '🌱'];
const STORAGE_KEY = 'todoongsilSocialRooms';
const JOINED_KEY = 'todoongsilJoinedRooms';
const INITIAL_ROOMS = [
  { id: '1', name: '취업 준비생 모임', goal: '자소서 완성 + 면접 합격', members: 12, progress: 65, emoji: '💼', likes: 34 },
  { id: '2', name: '다이어트 챌린지', goal: '3개월 -5kg 달성', members: 8, progress: 42, emoji: '🏃', likes: 21 },
  { id: '3', name: '개발자 스터디', goal: '알고리즘 100문제 완주', members: 5, progress: 78, emoji: '💻', likes: 45 },
  { id: '4', name: '영어 회화 마스터', goal: 'OPIc AL 등급 획득', members: 15, progress: 30, emoji: '🗣️', likes: 18 },
];

function readRooms() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || INITIAL_ROOMS;
  } catch {
    return INITIAL_ROOMS;
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
  const { grantCoins } = useCoins();
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
      setRooms(prev => {
        const known = new Set(prev.map(room => String(room.id)));
        const additions = data.filter(room => !known.has(String(room.id))).map(room => ({
          id: String(room.id),
          name: room.name,
          goal: room.description || '함께 목표를 달성하는 방',
          members: 1,
          progress: 0,
          emoji: '🌊',
          likes: 0,
        }));
        return [...prev, ...additions];
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
    grantCoins(10, `todoongsil:crew-join:${localStorage.getItem('userID') || 'guest'}:${id}`);
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
    const reward = grantCoins(10, `todoongsil:crew-join:${localStorage.getItem('userID') || 'guest'}:${id}`);
    alert(reward.ok ? '방 참여 보상 10코인을 받았어요! 🪙' : '방에 참여했어요!');
  };

  const enterRoom = (room) => navigate(`/social/${room.id}`, { state: { room } });

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
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: C.deep }}>새 소셜 방 만들기 🌊</h3>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: C.deep }}>소셜 방 🌊</h1>
            <p style={{ fontSize: '14px', color: C.muted }}>같이 헤엄치는 친구들과 투두를 나눠요</p>
          </div>
          <PrimaryBtn onClick={() => setShowCreate(true)}><Plus size={14} />방 만들기</PrimaryBtn>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <GhostBtn active={filter === 'all'} onClick={() => setFilter('all')}>전체</GhostBtn>
          <GhostBtn active={filter === 'joined'} onClick={() => setFilter('joined')}>참여중인 방 🪼</GhostBtn>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
          {list.map(room => {
            const roomId = String(room.id);
            const isJoined = joined.has(roomId);
            const isLiked = liked.has(roomId);
            return (
              <Card key={roomId}>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', background: '#E0F7FF' }}>{room.emoji}</div>
                    {isJoined && <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: '#CCFBF1', color: '#0D9488' }}>참여중</span>}
                  </div>
                  <h3 style={{ fontWeight: 800, marginBottom: '4px', fontSize: '16px', color: C.deep }}>{room.name}</h3>
                  <p style={{ fontSize: '12px', marginBottom: '16px', color: C.muted }}>{room.goal}</p>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}><span style={{ color: C.muted }}>진행률</span><span style={{ fontWeight: 700, color: C.ocean }}>{room.progress}%</span></div>
                    <div style={{ height: 8, borderRadius: 999, overflow: 'hidden', background: '#E0F7FF' }}><div style={{ height: '100%', background: GRAD, width: `${room.progress}%` }} /></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: C.muted }}><Users size={12} />{room.members}명</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setLiked(prev => { const next = new Set(prev); next.has(roomId) ? next.delete(roomId) : next.add(roomId); return next; })} style={{ display: 'flex', alignItems: 'center', gap: '4px', border: 'none', background: 'none', cursor: 'pointer', color: isLiked ? '#F472B6' : '#BAE6FD' }}><Heart size={13} fill={isLiked ? 'currentColor' : 'none'} />{room.likes + (isLiked ? 1 : 0)}</button>
                      <button onClick={() => isJoined ? enterRoom(room) : handleJoin(room)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, padding: '6px 12px', borderRadius: '12px', cursor: 'pointer', ...(isJoined ? { background: '#E0F7FF', color: C.ocean, border: `1.5px solid ${C.border}` } : { background: GRAD, color: '#fff', border: '1.5px solid transparent' }) }}>
                        {isJoined ? <><LogIn size={11} />입장</> : <><MessageCircle size={11} />참여</>}
                      </button>
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
