import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Check, Plus, Trash2, Target, Coins, AlarmClock, X } from 'lucide-react';
import Jelly from '../Auth/components/Jelly';
import Card from '../Auth/components/Card';
import { C, GRAD, PAGE_BG } from '../Auth/components/tokens';
import { createTodo, deleteTodo, deleteGoal, getGoals, getTodos, toggleGoal, toggleTodo } from '../../services/api';
import { useMissions } from '../../context/MissionContext';

const JELLY_PREVIEW_COLORS = ['#BAE6FD', '#F9A8D4', '#99F6E4', '#FDE68A', '#C4B5FD', '#D1D5DB'];
const SUB_COLORS = ['#0EA5E9', '#06B6D4', '#10B981', '#F59E0B', '#6366F1', '#C026D3', '#0891B2', '#059669'];
const CHEERS = [
  '오늘도 파이팅! 🔥',
  '지치는 날도 있을 수 있어요 🌙',
  '너무 걱정 말아요, 잘하고 있어요 💙',
  '한 걸음씩이면 충분해요 🐾',
  '작은 실천이 큰 변화를 만들어요 🌱',
  '포기하지 않는 게 제일 중요해요 💪',
  '오늘의 나를 응원해요 🪼',
  '쉬어가는 것도 실력이에요 ☁️',
  '어제보다 나은 오늘이면 돼요 🌈',
  '해파리처럼 둥실둥실~ 🫧',
];

const URGENT_WINDOW_PRESETS = [3, 7, 14, 21, 30];

// 모든 디데이 뱃지가 완전히 동일한 스타일을 쓰도록 하나의 함수로 통일 (목표 헤더 / 마감 임박 패널 / 투두 앞 전부 동일)
// fontFamily를 명시하지 않으면 <button> 안에 들어간 뱃지만 브라우저 기본 폰트를 상속받아 미묘하게 달라 보일 수 있어서 명시함
function ddayBadgeStyle(overdue) {
  return {
    fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '10px',
    fontFamily: "'Nunito', sans-serif", lineHeight: 1.4,
    background: overdue ? '#FEE2E2' : '#FEF3C7',
    color: overdue ? '#DC2626' : '#D97706',
    whiteSpace: 'nowrap', flexShrink: 0,
  };
}

// Firestore Timestamp(_seconds/seconds) 또는 ISO 문자열 모두 안전하게 Date로 변환
function parseFirestoreDate(value) {
  if (!value) return null;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const seconds = value._seconds ?? value.seconds;
  if (seconds != null) return new Date(seconds * 1000);
  return null;
}

// deadline("YYYY-MM-DD") 기준 D-day 라벨 계산 (Date 객체 또는 문자열 둘 다 허용)
function getDDayLabel(target) {
  const targetDate = target instanceof Date ? target : new Date(target);
  if (Number.isNaN(targetDate.getTime())) return null;
  targetDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((targetDate - today) / (1000 * 60 * 60 * 24));
  return { diff, label: diff === 0 ? 'D-Day' : diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}` };
}

// 목표 생성일~마감일을 (그 목표의 실제 투두 개수)만큼 등분해서 order번째 투두의 "예상 마감일" 계산 (추정치)
// totalCount를 고정값이 아닌 실제 개수로 받아서, 할 일을 추가/삭제해도 목표 마감일을 넘어가지 않게 함
function getEstimatedTodoDeadline(goal, order, totalCount) {
  if (!goal.deadline || !totalCount) return null;
  const start = parseFirestoreDate(goal.createdAt);
  const end = new Date(goal.deadline);
  if (!start || Number.isNaN(end.getTime())) return null;
  const totalMs = end.getTime() - start.getTime();
  if (totalMs <= 0) return null;
  const segmentMs = totalMs / totalCount;
  return new Date(start.getTime() + segmentMs * (order + 1));
}

function TodoList() {
  const navigate = useNavigate();
  const { completeMission } = useMissions();
  const [todos, setTodos] = useState([]);
  const [goals, setGoals] = useState([]);
  const [open, setOpen] = useState(new Set());
  const [newText, setNewText] = useState({});
  const [newDueDays, setNewDueDays] = useState({});
  const [adding, setAdding] = useState(null);
  const [urgentExpanded, setUrgentExpanded] = useState(false);
  const [urgentWindowDays, setUrgentWindowDays] = useState(() => {
    const saved = localStorage.getItem('todoongsilUrgentWindowDays');
    const parsed = Number(saved);
    return saved && parsed > 0 ? parsed : 14;
  });

  useEffect(() => {
    localStorage.setItem('todoongsilUrgentWindowDays', String(urgentWindowDays));
  }, [urgentWindowDays]);
  const [selColor] = useState(parseInt(localStorage.getItem('jellyColor') || '0', 10));
  const [outfit] = useState(() => {
    try { return JSON.parse(localStorage.getItem('todoongsilOutfit')) || { hat: '', effect: '', expression: 'normal' }; } catch { return { hat: '', effect: '', expression: 'normal' }; }
  });

  const fetchTodos = useCallback(async () => {
    try {
      const data = await getTodos();
      setTodos(data.map(item => ({
        id: item.id,
        text: item.title || item.content || '내용 없음',
        done: Boolean(item.completed ?? item.isDone),
        goalId: item.goalId || item.goalID || '',
        order: item.order ?? 0,
        dueDate: item.dueDate || null,
      })));
    } catch (error) {
      if (error.message !== 'AUTH_REQUIRED') console.error('할 일 로드 실패:', error);
    }
  }, []);

  const fetchGoals = useCallback(async () => {
    try {
      const data = await getGoals();
      const mapped = data.map(item => ({
        id: item.id,
        title: item.title || item.goalName || '이름 없는 목표',
        completed: Boolean(item.completed),
        deadline: item.deadline || null,
        createdAt: item.createdAt || null,
      }));
      setGoals(mapped);
    } catch (error) {
      if (error.message !== 'AUTH_REQUIRED') console.error('목표 로드 실패:', error);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
    fetchGoals();
  }, [fetchTodos, fetchGoals]);

  const toggleOpen = (id) => setOpen(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleToggle = async (todoId, goalId) => {
    try {
      const updated = await toggleTodo(todoId);
      const nowDone = Boolean(updated.completed);
      setTodos(prev => prev.map(item => item.id === todoId
        ? { ...item, done: nowDone }
        : item));
      if (nowDone && goalId) {
        completeMission('todo-done', { goalId });
      }
    } catch (error) {
      console.error('상태 변경 실패:', error);
      alert('할 일 상태를 변경하지 못했어요.');
    }
  };

  const handleGoalComplete = async (goalId) => {
    try {
      const updated = await toggleGoal(goalId);
      setGoals(prev => prev.map(goal => goal.id === goalId
        ? { ...goal, completed: Boolean(updated.completed) }
        : goal));
      if (updated.completed) {
        completeMission('goal-complete', { goalId });
      }
    } catch (error) {
      console.error('목표 완료 처리 실패:', error);
      alert('목표 완료 상태를 변경하지 못했어요.');
    }
  };

  const handleDelete = async (todoId) => {
    if (!confirm('이 할 일을 삭제할까요?')) return;
    try {
      await deleteTodo(todoId);
      setTodos(prev => prev.filter(item => item.id !== todoId));
    } catch {
      alert('삭제에 실패했어요.');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!confirm('이 대목표와 하위 할 일을 모두 삭제할까요?')) return;
    try {
      await deleteGoal(goalId);
      setGoals(prev => prev.filter(g => g.id !== goalId));
      setTodos(prev => prev.filter(t => t.goalId !== goalId));
    } catch {
      alert('목표 삭제에 실패했어요.');
    }
  };

  const handleAdd = async (goalId) => {
    const text = (newText[goalId] || '').trim();
    if (!text) return;
    const order = todos.filter(todo => todo.goalId === goalId).length;

    let dueDate = null;
    const days = Number(newDueDays[goalId]);
    if (days > 0) {
      const d = new Date();
      d.setDate(d.getDate() + days);
      dueDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    try {
      const created = await createTodo({ goalId, title: text, order, dueDate });
      setTodos(prev => [...prev, {
        id: created.id,
        text: created.title,
        done: Boolean(created.completed),
        goalId: created.goalId,
        order: created.order ?? order,
        dueDate: created.dueDate || null,
      }]);
      setNewText(prev => ({ ...prev, [goalId]: '' }));
      setNewDueDays(prev => ({ ...prev, [goalId]: '' }));
      setAdding(null);
    } catch {
      alert('저장에 실패했어요.');
    }
  };

  const goalIds = new Set(goals.map(g => g.id));
  const activeTodos = todos.filter(todo => goalIds.has(todo.goalId));
  const doneCount = activeTodos.filter(todo => todo.done).length;
  const pct = activeTodos.length ? Math.round((doneCount / activeTodos.length) * 100) : 0;
  const jellyPreview = JELLY_PREVIEW_COLORS[selColor] || JELLY_PREVIEW_COLORS[0];
  const userName = localStorage.getItem('userName') || '사용자';
  const [cheer] = useState(() => CHEERS[Math.floor(Math.random() * CHEERS.length)]);

  // 마감 임박 투두: 완료 안 됐고, 예상 마감일이 사용자가 설정한 기준(일) 이내로 남은 것 전부 (지난 것 포함), 가까운 순
  const urgentTodos = todos
    .filter(t => !t.done)
    .map(t => {
      const goal = goals.find(g => g.id === t.goalId);
      if (!goal || goal.completed) return null;
      const totalCount = todos.filter(o => o.goalId === t.goalId).length;
      const estDate = t.dueDate ? new Date(t.dueDate) : getEstimatedTodoDeadline(goal, t.order, totalCount);
      const dday = estDate ? getDDayLabel(estDate) : null;
      if (!dday) return null;
      return { ...t, goalTitle: goal.title, dday };
    })
    .filter(Boolean)
    .filter(t => t.dday.diff <= urgentWindowDays)
    .sort((a, b) => a.dday.diff - b.dday.diff);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '56px', background: PAGE_BG }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 16px 48px' }}>
        <Card>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: C.muted, fontFamily: "'Nunito', sans-serif", margin: '0 0 4px' }}>
                  {userName}의 해파리
                </p>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 120, height: 135, borderRadius: '50%',
                  background: `radial-gradient(circle,${jellyPreview}22,transparent 70%)`
                }}>
                  <Jelly colorIndex={selColor} size={1.6} float {...outfit} />
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '12px', fontWeight: 600, color: C.muted, display: 'flex', alignItems: 'center', gap: '4px', margin: '0 0 4px' }}>
                  <Target size={12} /> 전체 진행률
                </p>
                <h2 style={{ fontSize: '16px', fontWeight: 800, lineHeight: 1.3, margin: '4px 0 10px', color: C.deep }}>
                  {cheer}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, height: 10, borderRadius: 999, overflow: 'hidden', background: '#E0F7FF' }}>
                    <div style={{ height: '100%', borderRadius: 999, background: GRAD, width: `${pct}%`, transition: 'width .5s' }} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: C.ocean, whiteSpace: 'nowrap' }}>{doneCount}/{activeTodos.length} · {pct}%</span>
                  <button onClick={() => navigate('/make')} style={{
                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
                    fontSize: '13px', fontWeight: 700, borderRadius: '16px', border: `2px solid ${C.border}`,
                    background: '#F0FBFF', color: C.ocean, cursor: 'pointer', whiteSpace: 'nowrap'
                  }}>
                    <Plus size={13} />목표 추가
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {goals.some(g => !g.completed && g.deadline) && (
          <div style={{ marginTop: '20px' }}>
          <Card>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '4px' }}>
                <p style={{
                  fontSize: '13px', fontWeight: 800, color: C.deep, margin: 0,
                  display: 'flex', alignItems: 'center', gap: '5px'
                }}>
                  <AlarmClock size={14} color={C.subtle} /> 마감이 슬슬 다가와요
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {URGENT_WINDOW_PRESETS.map(d => (
                    <button key={d} onClick={() => setUrgentWindowDays(d)} style={{
                      padding: '5px 10px', fontSize: '11px', fontWeight: 800, borderRadius: '10px',
                      cursor: 'pointer', transition: 'all 0.2s',
                      ...(urgentWindowDays === d
                        ? { background: C.ocean, color: '#fff', border: '1.5px solid transparent' }
                        : { background: '#E0F7FF', color: C.ocean, border: `1.5px solid ${C.border}` })
                    }}>{d}일</button>
                  ))}
                </div>
              </div>
              <p style={{ fontSize: '11px', color: C.muted, margin: '0 0 12px', fontFamily: "'Nunito', sans-serif" }}>
                기한을 설정하면 마감 기한 별 투두만 모아 볼 수 있어요!
              </p>
              {urgentTodos.length > 0 ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(urgentExpanded ? urgentTodos : urgentTodos.slice(0, 3)).map(t => {
                      const overdue = t.dday.diff < 0;
                      return (
                        <div key={t.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 12px', borderRadius: '12px', background: '#F8FCFF'
                        }}>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ fontSize: '13px', fontWeight: 700, color: C.deep, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {t.text}
                            </p>
                            <p style={{ fontSize: '11px', color: C.muted, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {t.goalTitle}
                            </p>
                          </div>
                          <span style={{ ...ddayBadgeStyle(overdue), marginLeft: 8 }}>{t.dday.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  {urgentTodos.length > 3 && (
                    <button onClick={() => setUrgentExpanded(prev => !prev)} style={{
                      width: '100%', marginTop: '8px', padding: '8px', borderRadius: '10px', border: 'none',
                      background: 'transparent', color: C.ocean, fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                    }}>
                      {urgentExpanded ? <>접기 <ChevronDown size={13} style={{ transform: 'rotate(180deg)' }} /></> : <>{urgentTodos.length - 3}개 더보기 <ChevronDown size={13} /></>}
                    </button>
                  )}
                </>
              ) : (
                <p style={{ fontSize: '12px', color: C.muted, textAlign: 'center', padding: '8px 0', margin: 0 }}>
                  {urgentWindowDays}일 이내로 마감인 투두가 없어요
                </p>
              )}
            </div>
          </Card>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
          {goals.length === 0 && (
            <Card><div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🪼</div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: C.subtle }}>아직 목표가 없어요</p>
            </div></Card>
          )}

          {goals.map((goal, goalIndex) => {
            const items = todos.filter(todo => todo.goalId === goal.id).sort((a, b) => a.order - b.order);
            const goalDone = items.filter(todo => todo.done).length;
            const allDone = items.length > 0 && goalDone === items.length;
            const isOpen = open.has(goal.id);
            const isAdd = adding === goal.id;
            const color = SUB_COLORS[goalIndex % SUB_COLORS.length];
            const goalDday = goal.deadline ? getDDayLabel(goal.deadline) : null;
            const goalOverdue = goalDday && goalDday.diff < 0;

            return (
              <Card key={goal.id}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button onClick={() => toggleOpen(goal.id)} style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left'
                  }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: goal.completed ? '#10B981' : color }} />
                    <span style={{ fontWeight: 700, flex: 1, fontSize: '14px', color: C.deep }}>{goal.title}</span>
                    {goalDday && !goal.completed && (
                      <span style={ddayBadgeStyle(goalOverdue)}>{goalDday.label}</span>
                    )}
                    <span style={{ fontSize: '12px', fontWeight: 700, color }}>{goalDone}/{items.length}</span>
                    {isOpen ? <ChevronDown size={15} color={C.subtle} /> : <ChevronRight size={15} color={C.subtle} />}
                  </button>
                  <button onClick={() => handleDeleteGoal(goal.id)} style={{ border: 'none', background: 'transparent', color: '#FCA5A5', cursor: 'pointer', padding: '14px 12px' }}>
                    <Trash2 size={14} />
                  </button>
                </div>

                {isOpen && (
                  <div style={{ borderTop: `1px solid ${C.border}`, padding: '8px 12px' }}>
                    {items.map(todo => {
                      const estDate = todo.dueDate ? new Date(todo.dueDate) : getEstimatedTodoDeadline(goal, todo.order, items.length);
                      const estDday = estDate ? getDDayLabel(estDate) : null;
                      const estOverdue = estDday && estDday.diff < 0;

                      return (
                        <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '12px' }}>
                          <button onClick={() => handleToggle(todo.id, goal.id)} style={{
                            width: 20, height: 20, borderRadius: '8px', border: '2px solid',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            ...(todo.done ? { background: color, borderColor: color } : { background: 'transparent', borderColor: C.subtle })
                          }}>
                            {todo.done && <Check size={10} color="#fff" strokeWidth={3} />}
                          </button>
                          {estDday && !todo.done && (
                            <span style={ddayBadgeStyle(estOverdue)}>{estDday.label}</span>
                          )}
                          <span style={{
                            fontSize: '14px', flex: 1, textDecoration: todo.done ? 'line-through' : 'none',
                            color: todo.done ? C.subtle : C.deep, fontWeight: todo.done ? 400 : 600
                          }}>{todo.text}</span>
                          <button onClick={() => handleDelete(todo.id)} style={{ border: 'none', background: 'transparent', color: '#FCA5A5', cursor: 'pointer' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}

                    {isAdd ? (
                      <div style={{
                        display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px',
                        borderRadius: '14px', background: '#F8FCFF', border: `1.5px solid ${C.border}`
                      }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '7px',
                          height: '40px', padding: '0 12px', borderRadius: '10px', background: '#fff',
                          border: `1.5px solid ${C.border}`, width: 'fit-content', boxSizing: 'border-box'
                        }}>
                          <AlarmClock size={13} color={C.muted} />
                          <span style={{ fontSize: '12px', color: C.muted, fontWeight: 700, whiteSpace: 'nowrap' }}>마감일</span>
                          <input
                            type="number"
                            min="1"
                            placeholder="7"
                            value={newDueDays[goal.id] || ''}
                            onChange={(event) => setNewDueDays(prev => ({ ...prev, [goal.id]: event.target.value }))}
                            onKeyDown={(event) => { if (event.key === 'Enter') handleAdd(goal.id); }}
                            style={{
                              width: '32px', fontSize: '13px', fontWeight: 800, padding: '2px 0',
                              border: 'none', borderBottom: `1.5px solid ${C.ocean}`, background: 'transparent',
                              color: C.deep, outline: 'none', textAlign: 'center'
                            }}
                          />
                          <span style={{ fontSize: '12px', color: C.muted, fontWeight: 700, whiteSpace: 'nowrap' }}>일 후</span>
                          {newDueDays[goal.id] && (
                            <button onClick={() => setNewDueDays(prev => ({ ...prev, [goal.id]: '' }))} style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              width: '16px', height: '16px', borderRadius: '50%',
                              border: 'none', background: C.border, color: '#fff', cursor: 'pointer', padding: 0, flexShrink: 0
                            }}><X size={10} /></button>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input autoFocus value={newText[goal.id] || ''}
                            onChange={(event) => setNewText(prev => ({ ...prev, [goal.id]: event.target.value }))}
                            onKeyDown={(event) => { if (event.key === 'Enter') handleAdd(goal.id); }}
                            placeholder="할 일 입력 후 Enter"
                            style={{
                              flex: 1, fontSize: '14px', height: '40px', padding: '0 12px', borderRadius: '10px',
                              background: '#fff', border: `1.5px solid ${C.border}`, outline: 'none', color: C.deep,
                              boxSizing: 'border-box'
                            }} />
                          <button onClick={() => handleAdd(goal.id)} style={{ fontSize: '12px', fontWeight: 700, height: '40px', padding: '0 14px', borderRadius: '10px', border: 'none', color: '#fff', background: color, cursor: 'pointer', whiteSpace: 'nowrap', boxSizing: 'border-box' }}>추가</button>
                          <button onClick={() => setAdding(null)} style={{ fontSize: '12px', fontWeight: 700, height: '40px', padding: '0 10px', border: 'none', background: 'none', color: C.muted, cursor: 'pointer', whiteSpace: 'nowrap' }}>취소</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setAdding(goal.id)} style={{
                        display: 'flex', alignItems: 'center', gap: '6px', width: '100%', padding: '8px',
                        fontSize: '12px', fontWeight: 700, borderRadius: '12px', border: 'none',
                        background: 'transparent', cursor: 'pointer', color
                      }}><Plus size={13} />할 일 추가</button>
                    )}

                    {allDone && (
                      <button onClick={() => handleGoalComplete(goal.id)} style={{
                        width: '100%', marginTop: '8px', padding: '10px', borderRadius: '14px', border: 'none',
                        background: goal.completed ? '#D1FAE5' : GRAD, color: goal.completed ? '#059669' : '#fff',
                        fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px'
                      }}>
                        <Coins size={14} />{goal.completed ? '목표 완료됨' : '목표 완료하고 15코인 받기'}
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