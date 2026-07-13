import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronDown, ChevronRight, Check, Plus, Trash2, Target, Pencil } from 'lucide-react';
import Jelly from '../Auth/components/Jelly';
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
const SUB_COLORS = ['#0EA5E9', '#06B6D4', '#10B981', '#F59E0B', '#6366F1', '#C026D3', '#0891B2', '#059669'];

function TodoList() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [goals, setGoals] = useState([]);
  const [open, setOpen] = useState(new Set());
  const [newText, setNewText] = useState({});
  const [adding, setAdding] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selColor, setSelColor] = useState(0);
  const [selAcc, setSelAcc] = useState(0);

  const API_URL = 'http://localhost:5001/api/todos';
  const GOALS_API_URL = 'http://localhost:5001/api/goals';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('idToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  const CURRENT_USER_ID = localStorage.getItem('userID') || 'test_user_1';

  const fetchTodos = useCallback(async () => {
    try {
      const response = await axios.get(API_URL, {
        params: { userID: CURRENT_USER_ID },
        headers: getAuthHeaders()
      });
      if (response.data.success) {
        setTodos(response.data.data.map(item => ({
          id: item.id,
          text: item.content || '내용 없음',
          targetDate: item.targetDate || '',
          done: item.isDone || false,
          goalID: item.goalID || '',
          goalName: item.goalName || '',
        })));
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  }, []);

  const fetchGoals = useCallback(async () => {
    try {
      const response = await axios.get(GOALS_API_URL, { headers: getAuthHeaders() });
      if (response.data.success) {
        setGoals(response.data.data);
        if (response.data.data.length > 0) {
          setOpen(new Set([response.data.data[0].id]));
        }
      }
    } catch (error) {
      console.error('목표 로드 실패:', error);
    }
  }, []);

  useEffect(() => { fetchTodos(); fetchGoals(); }, [fetchTodos, fetchGoals]);

  const toggleOpen = (id) => setOpen(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleToggle = async (todoId) => {
    const t = todos.find(x => x.id === todoId);
    try {
      await axios.patch(`${API_URL}/${todoId}`, { isDone: !t.done }, { headers: getAuthHeaders() });
      setTodos(p => p.map(x => x.id === todoId ? { ...x, done: !x.done } : x));
    } catch { console.error('상태 변경 실패'); }
  };

  const handleDelete = async (todoId) => {
    try {
      await axios.delete(`${API_URL}/${todoId}`, { headers: getAuthHeaders() });
      setTodos(p => p.filter(x => x.id !== todoId));
    } catch { alert('삭제 실패'); }
  };

  const handleAdd = async (goalID) => {
    const text = (newText[goalID] || '').trim();
    if (!text) return;
    const goalName = goals.find(g => g.id === goalID)?.goalName || '';
    try {
      const response = await axios.post(API_URL, {
        content: text, targetDate: '', goalID, goalName, userID: CURRENT_USER_ID
      }, { headers: getAuthHeaders() });
      if (response.data.success) {
        fetchTodos();
        setNewText(p => ({ ...p, [goalID]: '' }));
        setAdding(null);
      }
    } catch { alert('저장 실패'); }
  };

  const activeGoals = goals.filter(g => todos.some(t => t.goalID === g.id));
  const doneCount = todos.filter(t => t.done).length;
  const pct = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;
  const jelly = JELLY_COLORS[selColor];
  const userName = localStorage.getItem('userName') || '사용자';

  return (
    <div style={{ minHeight: '100vh', paddingTop: '56px', background: PAGE_BG }}>
      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '24px 16px 48px' }}>

        {/* Character + Goal Card */}
        <Card>
          <div style={{ padding: '20px' }}>
            {/* Character row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
              <div style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 96, height: 108, borderRadius: '50%',
                background: `radial-gradient(circle,${jelly.glow}22,transparent 70%)`
              }}>
                <Jelly bellColor={jelly.bell} glowColor={jelly.glow} accessory={ACCESSORIES[selAcc]} size={1.25} float />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 600, marginBottom: '2px', color: C.muted, fontFamily: "'Nunito', sans-serif" }}>
                      {userName}의 해파리 🪼
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: C.ocean, fontFamily: "'Nunito', sans-serif" }}>Lv. {Math.max(1, Math.floor(doneCount / 3))}</span>
                      <div style={{ width: 112, height: 8, borderRadius: 999, overflow: 'hidden', background: '#E0F7FF' }}>
                        <div style={{ height: '100%', borderRadius: 999, background: GRAD, width: `${Math.min(100, pct)}%` }} />
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setEditMode(v => !v)} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 14px', borderRadius: '12px', fontSize: '12px',
                    fontWeight: 700, border: '2px solid', cursor: 'pointer',
                    fontFamily: "'Nunito', sans-serif", transition: 'all 0.2s',
                    ...(editMode
                      ? { background: GRAD, color: '#fff', borderColor: 'transparent' }
                      : { background: '#F0FBFF', color: C.ocean, borderColor: C.border })
                  }}>
                    <Pencil size={11} />{editMode ? '완료' : '꾸미기'}
                  </button>
                </div>

                {editMode && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${C.border}` }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, marginBottom: '6px', color: C.muted, fontFamily: "'Nunito', sans-serif" }}>색깔</p>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      {JELLY_COLORS.map((j, i) => (
                        <button key={i} onClick={() => setSelColor(i)} style={{
                          width: 24, height: 24, borderRadius: '8px', cursor: 'pointer',
                          backgroundColor: j.bell,
                          border: selColor === i ? `3px solid ${j.glow}` : '3px solid transparent',
                          transform: selColor === i ? 'scale(1.2)' : undefined,
                          boxShadow: selColor === i ? `0 2px 8px ${j.glow}55` : undefined
                        }} />
                      ))}
                    </div>
                    <p style={{ fontSize: '10px', fontWeight: 700, marginBottom: '6px', color: C.muted, fontFamily: "'Nunito', sans-serif" }}>악세사리</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {ACCESSORIES.map((a, i) => (
                        <button key={i} onClick={() => setSelAcc(i)} style={{
                          width: 30, height: 30, borderRadius: '8px', fontSize: '14px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: 'all 0.2s',
                          background: selAcc === i ? '#E0F7FF' : '#F8FBFF',
                          border: selAcc === i ? '2px solid #0EA5E9' : `2px solid ${C.border}`,
                          transform: selAcc === i ? 'scale(1.12)' : undefined
                        }}>{a}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: `1px solid ${C.border}`, marginBottom: '16px' }} />

            {/* Goal + Progress */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px', color: C.muted, fontFamily: "'Nunito', sans-serif", display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Target size={11} /> 현재 목표
                </p>
                <h2 style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1.3, marginBottom: '8px', color: C.deep, fontFamily: "'Nunito', sans-serif" }}>
                  🎯 {activeGoals.length > 0 ? activeGoals[0].goalName : '목표를 설정해보세요'}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, height: 10, borderRadius: 999, overflow: 'hidden', background: '#E0F7FF' }}>
                    <div style={{ height: '100%', borderRadius: 999, background: GRAD, width: `${pct}%`, transition: 'width 0.5s' }} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 800, flexShrink: 0, color: C.ocean, fontFamily: "'Nunito', sans-serif" }}>
                    {doneCount}/{todos.length} · {pct}%
                  </span>
                </div>
              </div>
              <button onClick={() => navigate('/make')} style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', fontSize: '14px', fontWeight: 700,
                borderRadius: '16px', border: `2px solid ${C.border}`,
                background: '#F0FBFF', color: C.ocean, cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif"
              }}>
                <Plus size={13} />추가
              </button>
            </div>
          </div>
        </Card>

        {/* Sub-goals todo list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
          {activeGoals.length === 0 && (
            <Card>
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🪼</div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: C.subtle, fontFamily: "'Nunito', sans-serif" }}>
                  아직 목표가 없어요
                </p>
                <p style={{ fontSize: '12px', color: C.subtle, fontFamily: "'Nunito', sans-serif", marginTop: '4px' }}>
                  위의 추가 버튼으로 첫 목표를 설정해봐요!
                </p>
              </div>
            </Card>
          )}

          {activeGoals.map((goal, gi) => {
            const items = todos.filter(t => t.goalID === goal.id);
            const goalDone = items.filter(t => t.done).length;
            const isOpen = open.has(goal.id);
            const isAdd = adding === goal.id;
            const color = SUB_COLORS[gi % SUB_COLORS.length];

            return (
              <Card key={goal.id}>
                {/* Header */}
                <button onClick={() => toggleOpen(goal.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px', background: 'none', border: 'none',
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s'
                }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', flexShrink: 0, backgroundColor: color }} />
                  <span style={{ fontWeight: 700, flex: 1, fontSize: '14px', color: C.deep, fontFamily: "'Nunito', sans-serif" }}>
                    {goal.goalName || goal.id}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {Array.from({ length: Math.max(items.length, 1) }).map((_, i) => (
                        <div key={i} style={{
                          width: 6, height: 16, borderRadius: 999,
                          backgroundColor: i < goalDone ? color : '#E0F7FF'
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, width: 40, textAlign: 'right', color, fontFamily: "'Nunito', sans-serif" }}>
                      {goalDone}/{items.length}
                    </span>
                  </div>
                  {isOpen
                    ? <ChevronDown size={15} style={{ color: C.subtle, flexShrink: 0 }} />
                    : <ChevronRight size={15} style={{ color: C.subtle, flexShrink: 0 }} />}
                </button>

                {/* Todo items */}
                {isOpen && (
                  <div style={{ borderTop: `1px solid ${C.border}`, padding: '8px 12px' }}>
                    {items.length === 0 && !isAdd && (
                      <p style={{ fontSize: '12px', padding: '8px', textAlign: 'center', color: C.subtle, fontFamily: "'Nunito', sans-serif" }}>
                        아직 할 일이 없어요 · 아래 버튼으로 추가해보세요
                      </p>
                    )}

                    {items.map(todo => (
                      <div key={todo.id} style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '8px', borderRadius: '12px', transition: 'background 0.2s'
                      }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(224,247,255,0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <button onClick={() => handleToggle(todo.id)} style={{
                          width: 20, height: 20, borderRadius: '8px',
                          border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, cursor: 'pointer', transition: 'all 0.2s',
                          ...(todo.done
                            ? { background: color, borderColor: color }
                            : { background: 'transparent', borderColor: C.subtle })
                        }}>
                          {todo.done && <Check size={10} color="#fff" strokeWidth={3} />}
                        </button>
                        <span style={{
                          fontSize: '14px', flex: 1,
                          textDecoration: todo.done ? 'line-through' : 'none',
                          color: todo.done ? C.subtle : C.deep,
                          fontFamily: "'Nunito', sans-serif",
                          fontWeight: todo.done ? 400 : 600
                        }}>
                          {todo.text}
                        </span>
                        <button onClick={() => handleDelete(todo.id)} style={{
                          padding: '4px', borderRadius: '8px', border: 'none',
                          background: 'transparent', cursor: 'pointer',
                          color: '#FCA5A5', opacity: 0, transition: 'opacity 0.2s'
                        }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}

                    {isAdd ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '8px', border: `2px dashed ${color}66`, flexShrink: 0 }} />
                        <input
                          autoFocus
                          type="text"
                          value={newText[goal.id] || ''}
                          onChange={(e) => setNewText(p => ({ ...p, [goal.id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(goal.id); if (e.key === 'Escape') setAdding(null); }}
                          placeholder="할 일 입력 후 Enter"
                          style={{
                            flex: 1, fontSize: '14px', background: 'transparent',
                            outline: 'none', border: 'none',
                            color: C.deep, fontFamily: "'Nunito', sans-serif"
                          }}
                        />
                        <button onClick={() => handleAdd(goal.id)} style={{
                          fontSize: '12px', fontWeight: 700, padding: '6px 12px',
                          borderRadius: '12px', border: 'none', cursor: 'pointer',
                          color: '#fff', background: color, fontFamily: "'Nunito', sans-serif"
                        }}>추가</button>
                        <button onClick={() => setAdding(null)} style={{
                          fontSize: '12px', fontWeight: 700, background: 'none',
                          border: 'none', cursor: 'pointer', color: C.muted
                        }}>취소</button>
                      </div>
                    ) : (
                      <button onClick={() => setAdding(goal.id)} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        width: '100%', padding: '8px', fontSize: '12px',
                        fontWeight: 700, borderRadius: '12px', border: 'none',
                        background: 'transparent', cursor: 'pointer',
                        color, fontFamily: "'Nunito', sans-serif",
                        transition: 'background 0.2s'
                      }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(224,247,255,0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Plus size={13} />할 일 추가
                      </button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TodoList;
