import { C, GRAD } from './tokens';

function GhostBtn({ children, onClick, active }) {
  return (
    <button onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: '6px', padding: '8px 16px', fontSize: '14px', fontWeight: 700,
        borderRadius: '16px', border: '2px solid', cursor: 'pointer',
        transition: 'all 0.2s', fontFamily: "'Nunito', sans-serif",
        ...(active
          ? { background: GRAD, color: '#fff', borderColor: 'transparent' }
          : { background: '#fff', color: C.ocean, borderColor: C.border })
      }}>
      {children}
    </button>
  );
}

export default GhostBtn;
