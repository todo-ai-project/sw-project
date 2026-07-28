import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Check, Plus, Trash2, Target, Pencil, Coins } from 'lucide-react';
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

function TodoList() {
  const navigate = useNavigate();
  const { completeMission } = useMissions();
  const [todos, setTodos] = useState([]);
  const [goals, setGoals] = useState([]);
  const [open, setOpen] = useState(new Set());
  const [newText, setNewText] = useState({});
  const [adding, setAdding] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selColor, setSelColor] = useState(parseInt(localStorage.getItem('jellyColor') || '0', 10));

  const fetchTodos = useCallback(async () => {
    try {
      const data = await getTodos();
      setTodos(data.map(item => ({
        id: item.id,
        text: item.title || item.content || '내용 없음',
        done: Boolean(item.completed ?? item.isDone),
        goalId: item.goalId || item.goalID || '',
        order: item.order ?? 0,
      })));
    } catch (error) {
      console.error('할 일 로드 실패:', error);
    }
  }, []);

  const fetchGoals = useCallback(async () => {
    try {
      const data = await getGoals();
      const mapped = data.map(item => ({
        id: item.id,
        title: item.title || item.goalName || '이름 없는 목표',
        completed: Boolean(item.completed),
      }));
      setGoals(mapped);
    } catch (error) {
      console.error('목표 로드 실패:', error);
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
    try {
      const created = await createTodo({ goalId, title: text, order });
      setTodos(prev => [...prev, {
        id: created.id,
        text: created.title,
        done: Boolean(created.completed),
        goalId: created.goalId,
        order: created.order ?? order,
      }]);
      setNewText(prev => ({ ...prev, [goalId]: '' }));
      setAdding(null);
    } catch {
      alert('저장에 실패했어요.');
    }
  };

  const doneCount = todos.filter(todo => todo.done).length;
  const pct = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;
  const jellyPreview = JELLY_PREVIEW_COLORS[selColor] || JELLY_PREVIEW_COLORS[0];
  const userName = localStorage.getItem('userName') || '사용자';
  const [cheer] = useState(() => CHEERS[Math.floor(Math.random() * CHEERS.length)]);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '56px', background: PAGE_BG }}>
      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '24px 16px 48px' }}>
        <Card>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
              <div style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 96, height: 108, borderRadius: '50%',
                background: `radial-gradient(circle,${jellyPreview}22,transparent 70%)`
              }}>
                <Jelly colorIndex={selColor} size={1.25} float />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: C.muted, fontFamily: "'Nunito', sans-serif", margin: 0 }}>
                    {userName}의 해파리 🪼
                  </p>
                  <button onClick={() => setEditMode(value => !value)} style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
                    borderRadius: '12px', fontSize: '12px', fontWeight: 700, border: '2px solid',
                    cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                    ...(editMode
                      ? { background: GRAD, color: '#fff', borderColor: 'transparent' }
                      : { background: '#F0FBFF', color: C.ocean, borderColor: C.border })
                  }}>
                    <Pencil size={11} />{editMode ? '완료' : '꾸미기'}
                  </button>
                </div>
                {editMode && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${C.border}` }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, marginBottom: '6px', color: C.muted }}>해파리 선택</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {JELLY_PREVIEW_COLORS.map((_, index) => (
                        <button key={index} onClick={() => {
                          setSelColor(index);
                          localStorage.setItem('jellyColor', String(index));
                        }} style={{
                          width: 36, height: 36, borderRadius: '10px', cursor: 'pointer', padding: '2px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: selColor === index ? '#E0F7FF' : '#F8FBFF',
                          border: selColor === index ? '2px solid #0EA5E9' : `2px solid ${C.border}`,
                          transform: selColor === index ? 'scale(1.15)' : undefined,
                        }}>
                          <img src={`/jelly/jelly_${['blue','pink','green','yellow','puple','grey'][index]}.png`} alt="" style={{ width: 28 }} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${C.border}`, marginBottom: '16px' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '11px', fontWeight: 600, marginBottom: '4px', color: C.muted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Target size={11} /> 전체 진행률
                </p>
                <h2 style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1.3, marginBottom: '8px', color: C.deep }}>
                  {cheer}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, height: 10, borderRadius: 999, overflow: 'hidden', background: '#E0F7FF' }}>
                    <div style={{ height: '100%', borderRadius: 999, background: GRAD, width: `${pct}%`, transition: 'width .5s' }} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: C.ocean }}>{doneCount}/{todos.length} · {pct}%</span>
                </div>
              </div>
              <button onClick={() => navigate('/make')} style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
                fontSize: '14px', fontWeight: 700, borderRadius: '16px', border: `2px solid ${C.border}`,
                background: '#F0FBFF', color: C.ocean, cursor: 'pointer'
              }}>
                <Plus size={13} />추가
              </button>
            </div>
          </div>
        </Card>

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

            return (
              <Card key={goal.id}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button onClick={() => toggleOpen(goal.id)} style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left'
                  }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: goal.completed ? '#10B981' : color }} />
                    <span style={{ fontWeight: 700, flex: 1, fontSize: '14px', color: C.deep }}>{goal.title}</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color }}>{goalDone}/{items.length}</span>
                    {isOpen ? <ChevronDown size={15} color={C.subtle} /> : <ChevronRight size={15} color={C.subtle} />}
                  </button>
                  <button onClick={() => handleDeleteGoal(goal.id)} style={{ border: 'none', background: 'transparent', color: '#FCA5A5', cursor: 'pointer', padding: '14px 12px' }}>
                    <Trash2 size={14} />
                  </button>
                </div>

                {isOpen && (
                  <div style={{ borderTop: `1px solid ${C.border}`, padding: '8px 12px' }}>
                    {items.map(todo => (
                      <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '12px' }}>
                        <button onClick={() => handleToggle(todo.id, goal.id)} style={{
                          width: 20, height: 20, borderRadius: '8px', border: '2px solid',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          ...(todo.done ? { background: color, borderColor: color } : { background: 'transparent', borderColor: C.subtle })
                        }}>
                          {todo.done && <Check size={10} color="#fff" strokeWidth={3} />}
                        </button>
                        <span style={{
                          fontSize: '14px', flex: 1, textDecoration: todo.done ? 'line-through' : 'none',
                          color: todo.done ? C.subtle : C.deep, fontWeight: todo.done ? 400 : 600
                        }}>{todo.text}</span>
                        <button onClick={() => handleDelete(todo.id)} style={{ border: 'none', background: 'transparent', color: '#FCA5A5', cursor: 'pointer' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}

                    {isAdd ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
                        <input autoFocus value={newText[goal.id] || ''}
                          onChange={(event) => setNewText(prev => ({ ...prev, [goal.id]: event.target.value }))}
                          onKeyDown={(event) => { if (event.key === 'Enter') handleAdd(goal.id); }}
                          placeholder="할 일 입력 후 Enter"
                          style={{ flex: 1, fontSize: '14px', background: 'transparent', outline: 'none', border: 'none', color: C.deep }} />
                        <button onClick={() => handleAdd(goal.id)} style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '12px', border: 'none', color: '#fff', background: color, cursor: 'pointer' }}>추가</button>
                        <button onClick={() => setAdding(null)} style={{ border: 'none', background: 'none', color: C.muted, cursor: 'pointer' }}>취소</button>
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
