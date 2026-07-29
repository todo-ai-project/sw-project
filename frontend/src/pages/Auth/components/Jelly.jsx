const JELLY_IMAGES = [
  '/jelly/jelly_blue.png',
  '/jelly/jelly_pink.png',
  '/jelly/jelly_green.png',
  '/jelly/jelly_yellow.png',
  '/jelly/jelly_puple.png',
  '/jelly/jelly_grey.png',
];

const HAT_IMAGES = {
  ribbon: '/assets/hats/acc1.png',
  bunny: '/assets/hats/acc2.png',
  crown: '/assets/hats/acc3.png',
  cat: '/assets/hats/acc4.png',
  halo: '/assets/hats/acc5.png',
  flower: '/assets/hats/acc6.png',
};

const EXPRESSION_IMAGES = {
  normal: '/assets/expressions/emo_defalt.png',
  smile: '/assets/expressions/emo1.png',
  wink: '/assets/expressions/emo2.png',
  heart: '/assets/expressions/emo3.png',
  sleepy: '/assets/expressions/emo4.png',
};

const EFFECT_IMAGES = {
  sparkles: '/assets/effects/eff1.png',
  bubbles: '/assets/effects/eff2.png',
  flowers: '/assets/effects/eff3.png',
  gold: '/assets/effects/eff4.png',
};

const OVERLAY_STYLE = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  objectFit: 'contain',
  pointerEvents: 'none',
};

function Jelly({
  colorIndex = 0,
  size = 1,
  float = false,
  hat = '',
  effect = '',
  expression = 'normal',
}) {
  const width = Math.round(112 * size);

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        width,
        animation: float ? 'jellyFloat 2.8s ease-in-out infinite' : undefined,
      }}
    >
      {effect && EFFECT_IMAGES[effect] && (
        <img
          src={EFFECT_IMAGES[effect]}
          alt=""
          draggable={false}
          style={{ ...OVERLAY_STYLE, zIndex: 0 }}
        />
      )}

      <img
        src={JELLY_IMAGES[colorIndex] || JELLY_IMAGES[0]}
        alt="해파리"
        draggable={false}
        style={{
          width: '100%',
          display: 'block',
          pointerEvents: 'none',
          position: 'relative',
          zIndex: 1,
        }}
      />

      {hat && HAT_IMAGES[hat] && (
        <img
          src={HAT_IMAGES[hat]}
          alt=""
          draggable={false}
          style={{ ...OVERLAY_STYLE, zIndex: 2 }}
        />
      )}

      {EXPRESSION_IMAGES[expression] && (
        <img
          src={EXPRESSION_IMAGES[expression]}
          alt=""
          draggable={false}
          style={{ ...OVERLAY_STYLE, zIndex: 2 }}
        />
      )}
    </div>
  );
}

export { JELLY_IMAGES, HAT_IMAGES, EXPRESSION_IMAGES, EFFECT_IMAGES };
export default Jelly;
