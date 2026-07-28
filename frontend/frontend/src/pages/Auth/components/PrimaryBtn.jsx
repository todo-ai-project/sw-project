import { GRAD } from './tokens';

function PrimaryBtn({ children, onClick, type = 'button', disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: '8px', fontWeight: 700, borderRadius: '16px',
        color: 'white', transition: 'all 0.2s',
        width: '100%', padding: '14px 24px', fontSize: '16px',
        background: GRAD, boxShadow: '0 4px 16px rgba(14,165,233,.28)',
        fontFamily: "'Nunito', sans-serif",
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1
      }}
    >
      {children}
    </button>
  );
}

export default PrimaryBtn;
