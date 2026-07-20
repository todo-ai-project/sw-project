import { C } from './tokens';

function Field({ label, type, value, onChange, placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{
        display: 'block', fontSize: '14px', fontWeight: 700,
        color: C.deep, fontFamily: "'Nunito', sans-serif"
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: '16px',
          fontSize: '14px', outline: 'none', transition: 'all 0.2s',
          background: '#F0FBFF', border: `2px solid ${C.border}`,
          color: C.deep, fontFamily: "'Nunito', sans-serif",
          boxSizing: 'border-box'
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = C.ocean;
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,.1)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = C.border;
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

export default Field;
