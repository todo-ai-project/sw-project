import { useNavigate } from 'react-router-dom';
import { Check, Coins, Trophy } from 'lucide-react';
import Card from '../Auth/components/Card';
import { C, GRAD, PAGE_BG } from '../Auth/components/tokens';
import { useMissions } from '../../context/MissionContext';

export default function MissionsPage() {
  const navigate = useNavigate();
  const { missions } = useMissions();
  const done = missions.filter(m => m.completed).length;

  return (
    <div style={{ minHeight: '100vh', paddingTop: 56, background: PAGE_BG }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 16px 48px' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Trophy size={30} color="#F59E0B" />
          <h1 style={{ fontSize: 24, fontWeight: 900, color: C.deep, margin: '7px 0 3px' }}>코인 획득 미션</h1>
          <p style={{ fontSize: 13, color: C.muted }}>미션을 달성하고 코인을 모아 해파리를 꾸며요.</p>
        </div>

        <div style={{ padding: '12px 16px', borderRadius: 16, background: 'rgba(255,255,255,.75)', border: `1px solid ${C.border}`, marginBottom: 14, fontWeight: 800, color: C.ocean }}>
          오늘 완료 {done} / {missions.length}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {missions.map(m => (
            <Card key={m.id}>
              <div style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 15 }}>
                <div style={{ width: 54, height: 54, borderRadius: 18, background: '#E0F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                  {m.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3, flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: 16, fontWeight: 900, color: C.deep, margin: 0 }}>{m.title}</h2>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 800, color: '#B7791F', whiteSpace: 'nowrap' }}>
                      <Coins size={12} />+{m.reward}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: C.muted }}>{m.desc}</p>
                </div>
                <button
                  disabled={m.completed}
                  onClick={() => navigate(m.path)}
                  style={{
                    padding: '10px 15px', borderRadius: 14, border: 0, flexShrink: 0,
                    cursor: m.completed ? 'default' : 'pointer', fontWeight: 900,
                    background: m.completed ? '#D1FAE5' : GRAD,
                    color: m.completed ? '#059669' : '#fff',
                    display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap'
                  }}>
                  {m.completed ? <><Check size={14} />완료</> : '도전하기'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
