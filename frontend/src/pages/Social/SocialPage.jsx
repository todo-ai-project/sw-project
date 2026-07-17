import { useState } from 'react';
import { Plus, Users, Heart, Check, MessageCircle, X } from 'lucide-react';
import Card from '../Auth/components/Card';
import PrimaryBtn from '../Auth/components/PrimaryBtn';
import GhostBtn from '../Auth/components/GhostBtn';
import { C, GRAD, PAGE_BG } from '../Auth/components/tokens';

const ROOM_EMOJIS = ['💼', '🏃', '💻', '🗣️', '📚', '🌅', '🎨', '🎵', '🍎', '✈️', '🎯', '🌱'];
const INITIAL_ROOMS = [
  { id: 1, name: '취업 준비생 모임', goal: '자소서 완성 + 면접 합격', members: 12, progress: 65, emoji: '💼', likes: 34, active: true },
  { id: 2, name: '다이어트 챌린지', goal: '3개월 -5kg 달성', members: 8, progress: 42, emoji: '🏃', likes: 21, active: true },
  { id: 3, name: '개발자 스터디', goal: '알고리즘 100문제 완주', members: 5, progress: 78, emoji: '💻', likes: 45, active: false },
  { id: 4, name: '영어 회화 마스터', goal: 'OPIc AL 등급 획득', members: 15, progress: 30, emoji: '🗣️', likes: 18, active: true },
  { id: 5, name: '독서 습관 만들기', goal: '올해 책 24권 읽기', members: 9, progress: 50, emoji: '📚', likes: 29, active: true },
  { id: 6, name: '새벽 기상 도전', goal: '오전 5시 기상 30일', members: 20, progress: 87, emoji: '🌅', likes: 52, active: false },
];

function SocialPage() {
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [liked, setLiked] = useState(new Set());
  const [joined, setJoined] = useState(new Set());
  const [filter, setFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newEmoji, setNewEmoji] = useState('🎯');

  const list = filter === 'active' ? rooms.filter(r => r.active) : rooms;

  const create = () => {
    if (!newName.trim() || !newGoal.trim()) return;
    const r = { id: Date.now(), name: newName.trim(), goal: newGoal.trim(), members: 1, progress: 0, emoji: newEmoji, likes: 0, active: true };
    setRooms(p => [r, ...p]);
    setJoined(p => new Set([...p, r.id]));
    setNewName(''); setNewGoal(''); setNewEmoji('🎯');
    setShowCreate(false);
  };

  const toggleJoin = (id) => {
    const wasJoined = joined.has(id);
    setJoined(p => {
      const n = new Set(p);
      wasJoined ? n.delete(id) : n.add(id);
      return n;
    });
    setRooms(r => r.map(x => x.id === id
      ? { ...x, members: wasJoined ? Math.max(0, x.members - 1) : x.members + 1 }
      : x
    ));
  };

  const inputStyle = {
    width: '100%', padding: '10px 16px', borderRadius: '16px', fontSize: '14px',
    outline: 'none', background: '#F0FBFF', border: `2px solid ${C.border}`,
    color: C.deep, fontFamily: "'Nunito', sans-serif", boxSizing: 'border-box'
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: '56px', background: PAGE_BG }}>
      {/* Create room modal */}
      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px',
          background: 'rgba(12,74,110,0.25)', backdropFilter: 'blur(6px)'
        }} onClick={() => setShowCreate(false)}>
          <div style={{
            width: '100%', maxWidth: 448, borderRadius: '24px', padding: '24px',
            background: '#fff', boxShadow: '0 24px 80px rgba(14,165,233,.18)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: C.deep, fontFamily: "'Nunito', sans-serif" }}>새 소셜 방 만들기 🌊</h3>
              <button onClick={() => setShowCreate(false)} style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', background: 'transparent', cursor: 'pointer', color: C.muted
              }}><X size={16} /></button>
            </div>

            <p style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: C.muted, fontFamily: "'Nunito', sans-serif" }}>이모지</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '16px' }}>
              {ROOM_EMOJIS.map(em => (
                <button key={em} onClick={() => setNewEmoji(em)} style={{
                  aspectRatio: '1', borderRadius: '12px', fontSize: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: newEmoji === em ? '#E0F7FF' : '#F8FAFC',
                  border: newEmoji === em ? '2px solid #0EA5E9' : '2px solid transparent',
                  transform: newEmoji === em ? 'scale(1.1)' : undefined
                }}>{em}</button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: C.deep, fontFamily: "'Nunito', sans-serif" }}>방 이름 *</label>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="예: 토익 900점 스터디" style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = C.ocean}
                  onBlur={e => e.currentTarget.style.borderColor = C.border} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: C.deep, fontFamily: "'Nunito', sans-serif" }}>목표 *</label>
                <input value={newGoal} onChange={e => setNewGoal(e.target.value)} placeholder="예: 3개월 안에 목표 달성" style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = C.ocean}
                  onBlur={e => e.currentTarget.style.borderColor = C.border} />
              </div>
            </div>
            <PrimaryBtn onClick={create} disabled={!newName.trim() || !newGoal.trim()}>
              <Plus size={16} />방 만들기
            </PrimaryBtn>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: C.deep, fontFamily: "'Nunito', sans-serif" }}>소셜 방 🌊</h1>
            <p style={{ fontSize: '14px', marginTop: '2px', color: C.muted, fontFamily: "'Nunito', sans-serif" }}>같이 헤엄치는 친구들을 만나봐요</p>
          </div>
          <PrimaryBtn small onClick={() => setShowCreate(true)}><Plus size={14} />방 만들기</PrimaryBtn>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <GhostBtn active={filter === 'all'} onClick={() => setFilter('all')}>전체</GhostBtn>
          <GhostBtn active={filter === 'active'} onClick={() => setFilter('active')}>활성 방 🪼</GhostBtn>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {list.map(room => {
            const isJoined = joined.has(room.id);
            const isLiked = liked.has(room.id);
            return (
              <Card key={room.id}>
                <div style={{ padding: '20px', transition: 'transform 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', background: '#E0F7FF' }}>
                      {room.emoji}
                    </div>
                    {room.active && (
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: '#CCFBF1', color: '#0D9488', fontFamily: "'Nunito', sans-serif" }}>활성</span>
                    )}
                  </div>
                  <h3 style={{ fontWeight: 800, marginBottom: '4px', fontSize: '16px', lineHeight: 1.3, color: C.deep, fontFamily: "'Nunito', sans-serif" }}>{room.name}</h3>
                  <p style={{ fontSize: '12px', marginBottom: '16px', lineHeight: 1.6, color: C.muted, fontFamily: "'Nunito', sans-serif" }}>{room.goal}</p>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ color: C.muted, fontFamily: "'Nunito', sans-serif" }}>진행률</span>
                      <span style={{ fontWeight: 700, color: C.ocean, fontFamily: "'Nunito', sans-serif" }}>{room.progress}%</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, overflow: 'hidden', background: '#E0F7FF' }}>
                      <div style={{ height: '100%', borderRadius: 999, background: GRAD, width: `${room.progress}%` }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', color: C.muted, fontFamily: "'Nunito', sans-serif" }}>
                      <Users size={12} />{room.members}명
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button onClick={() => setLiked(p => { const n = new Set(p); n.has(room.id) ? n.delete(room.id) : n.add(room.id); return n; })}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600,
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: isLiked ? '#F472B6' : '#BAE6FD', transition: 'color 0.2s'
                        }}>
                        <Heart size={13} fill={isLiked ? 'currentColor' : 'none'} />{room.likes + (isLiked ? 1 : 0)}
                      </button>
                      <button onClick={() => toggleJoin(room.id)} style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '12px', fontWeight: 700, padding: '6px 12px',
                        borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                        fontFamily: "'Nunito', sans-serif",
                        ...(isJoined
                          ? { background: '#E0F7FF', color: C.ocean, border: `1.5px solid ${C.border}` }
                          : { background: GRAD, color: '#fff', border: '1.5px solid transparent' })
                      }}>
                        {isJoined ? <><Check size={11} />참여중</> : <><MessageCircle size={11} />참여</>}
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
