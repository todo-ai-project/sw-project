const JELLY_IMAGES = [
  '/jelly/jelly_blue.png',
  '/jelly/jelly_pink.png',
  '/jelly/jelly_green.png',
  '/jelly/jelly_yellow.png',
  '/jelly/jelly_puple.png',
  '/jelly/jelly_grey.png',
];

function Jelly({ colorIndex = 0, size = 1, float = false }) {
  const src = JELLY_IMAGES[colorIndex] || JELLY_IMAGES[0];
  const w = Math.round(90 * size);

  return (
    <div style={{
      position: 'relative', display: 'inline-block',
      width: w,
      animation: float ? 'jellyFloat 2.8s ease-in-out infinite' : undefined,
    }}>
      <img src={src} alt="해파리" draggable={false} style={{
        width: '100%', height: 'auto', display: 'block',
        pointerEvents: 'none', userSelect: 'none',
      }} />
    </div>
  );
}

export { JELLY_IMAGES };
export default Jelly;
