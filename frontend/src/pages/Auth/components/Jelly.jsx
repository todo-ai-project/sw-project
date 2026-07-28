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
  partyhat: '/assets/hats/acc4.png',
  beret: '/assets/hats/acc2.png',
};

const EXPRESSION_IMAGES = {
  wink: '/assets/expressions/emo2.png',
  smile: '/assets/expressions/emo3.png',
  sleepy: '/assets/expressions/emo4.png',
  heart: '/assets/expressions/emo5.png',
};

const EFFECT_IMAGES = {
  gold: '/assets/effects/eff1.png',
  bubbles: '/assets/effects/eff2.png',
  flowers: '/assets/effects/eff3.png',
  sparkles: '/assets/effects/eff4.png',
};

function Jelly({
  colorIndex = 0,
  size = 1,
  float = false,
  hat = '',
  effect = '',
  expression = 'normal',
  accessory = '',
  color = '',
}) {
  const width = Math.round(90 * size);
  const activeEffect = effect || (color === 'gold' ? 'gold' : '');

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        width,
        animation: float ? 'jellyFloat 2.8s ease-in-out infinite' : undefined,
      }}
    >
      {activeEffect && EFFECT_IMAGES[activeEffect] && (
        <img
          src={EFFECT_IMAGES[activeEffect]}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            width: '160%',
            height: '160%',
            top: '-30%',
            left: '-30%',
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 0,
          }}
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
          style={{
            position: 'absolute',
            width: '60%',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      )}

      {expression !== 'normal' && EXPRESSION_IMAGES[expression] && (
        <img
          src={EXPRESSION_IMAGES[expression]}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            width: '50%',
            top: '28%',
            left: '50%',
            transform: 'translateX(-50%)',
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      )}
    </div>
  );
}

export { JELLY_IMAGES, HAT_IMAGES, EXPRESSION_IMAGES, EFFECT_IMAGES };
export default Jelly;
