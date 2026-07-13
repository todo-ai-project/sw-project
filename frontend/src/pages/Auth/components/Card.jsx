import { C } from './tokens';

function Card({ children }) {
  return (
    <div style={{
      borderRadius: '24px',
      border: `1px solid ${C.border}`,
      background: C.card,
      boxShadow: '0 2px 16px rgba(14,165,233,.07)',
      backdropFilter: 'blur(8px)',
      padding: '24px'
    }}>
      {children}
    </div>
  );
}

export default Card;
