function Jelly({ bellColor = "#BAE6FD", glowColor = "#38BDF8", accessory = "🎀", size = 1, float = false }) {
  const s = (n) => Math.round(n * size);

  return (
    <div style={{
      position: 'relative', display: 'inline-block', userSelect: 'none',
      width: s(72), height: s(90),
      animation: float ? 'jellyFloat 2.8s ease-in-out infinite' : undefined
    }}>
      {/* glow */}
      <div style={{
        position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
        width: s(72), height: s(40), top: s(8),
        background: `radial-gradient(ellipse,${glowColor}40 0%,transparent 70%)`,
        filter: `blur(${s(6)}px)`
      }} />
      {/* dome */}
      <div style={{
        position: 'absolute', width: s(64), height: s(48), left: s(4), top: s(8),
        backgroundColor: bellColor,
        borderRadius: '50% 50% 44% 44% / 62% 62% 38% 38%',
        boxShadow: `0 ${s(3)}px ${s(12)}px ${glowColor}44`
      }} />
      {/* shine */}
      <div style={{
        position: 'absolute', width: s(34), height: s(19), left: s(16), top: s(14),
        background: 'rgba(255,255,255,.46)', borderRadius: '50%', transform: 'rotate(-15deg)'
      }} />
      {/* eyes */}
      {[s(14), s(38)].map((lx, i) => (
        <div key={i}>
          <div style={{
            position: 'absolute', borderRadius: '50%',
            width: s(11), height: s(12), top: s(30), left: lx,
            backgroundColor: '#0C4A6E'
          }} />
          <div style={{
            position: 'absolute', borderRadius: '50%', backgroundColor: 'white',
            width: s(4), height: s(4), top: s(32), left: lx + s(2)
          }} />
        </div>
      ))}
      {/* blush */}
      <div style={{ position: 'absolute', borderRadius: '50%', width: s(11), height: s(5), top: s(42), left: s(8), background: 'rgba(251,113,133,.38)' }} />
      <div style={{ position: 'absolute', borderRadius: '50%', width: s(11), height: s(5), top: s(42), left: s(45), background: 'rgba(251,113,133,.38)' }} />
      {/* smile */}
      <div style={{
        position: 'absolute', width: s(16), height: s(7), top: s(46),
        left: `calc(50% - ${s(8)}px)`,
        borderBottom: `${Math.max(2, s(2.2))}px solid #0C4A6E`,
        borderRadius: '0 0 50% 50%'
      }} />
      {/* tentacles */}
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} style={{
          position: 'absolute', width: s(6), height: s(22),
          left: s(8) + (s(48) / 4) * i, top: s(52),
          backgroundColor: bellColor, borderRadius: s(3),
          opacity: 0.86, transformOrigin: 'top center',
          animation: `tentSway ${1.9 + i * 0.25}s ${i * 0.22}s ease-in-out infinite`,
          boxShadow: `0 0 ${s(5)}px ${glowColor}44`
        }} />
      ))}
      {/* accessory */}
      <div style={{
        position: 'absolute', top: s(-4), left: '50%',
        transform: 'translateX(-50%)', fontSize: s(17), lineHeight: 1
      }}>
        {accessory}
      </div>
    </div>
  );
}

export default Jelly;
