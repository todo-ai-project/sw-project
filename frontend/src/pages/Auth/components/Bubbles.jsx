function Bubbles({ n = 5 }) {
  const B = [
    { s: 9, l: '8%', d: '0s', t: '4s' },
    { s: 6, l: '78%', d: '1.1s', t: '3.6s' },
    { s: 11, l: '50%', d: '.5s', t: '5s' },
    { s: 7, l: '26%', d: '1.9s', t: '4.3s' },
    { s: 9, l: '64%', d: '.2s', t: '3.9s' },
  ].slice(0, n);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {B.map((b, i) => (
        <div key={i} style={{
          position: 'absolute', bottom: '12px', borderRadius: '50%',
          width: b.s, height: b.s, left: b.l,
          background: 'radial-gradient(circle at 35% 35%,rgba(255,255,255,.8),rgba(125,211,252,.15))',
          border: '1px solid rgba(125,211,252,.3)',
          animation: `bubbleRise ${b.t} ${b.d} ease-in infinite`
        }} />
      ))}
    </div>
  );
}

export default Bubbles;
