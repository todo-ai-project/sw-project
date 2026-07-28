// src/pages/Auth/components/Jelly.jsx
import {
  EFFECT_IMAGE_BY_VALUE,
  FACE_IMAGE_BY_VALUE,
  HAT_IMAGE_BY_VALUE,
} from '../../../constants/characterAssets';

const JELLY_IMAGES = [
  '/jelly/jelly_blue.png',
  '/jelly/jelly_pink.png',
  '/jelly/jelly_green.png',
  '/jelly/jelly_yellow.png',
  '/jelly/jelly_puple.png',
  '/jelly/jelly_grey.png',
];

// 기존 localStorage 값이 남아 있어도 바로 보이도록 별칭을 유지합니다.
const HAT_ALIAS = {
  partyhat: 'acc1',
  crown: 'acc2',
  ribbon: 'acc3',
  beret: 'acc4',
};

const EFFECT_ALIAS = {
  bubbles: 'eff1',
  sparkles: 'eff2',
  flowers: 'eff3',
  gold: 'eff4',
};

const FACE_ALIAS = {
  normal: '',
  smile: 'emo2',
  heart: 'emo3',
  sleepy: 'emo4',
  wink: 'emo5',
};

const resolveValue = (value, alias) => alias[value] ?? value ?? '';

function Jelly({
  colorIndex = 0,
  size = 1,
  float = false,
  hat = '',
  effect = '',
  expression = '',
  style,
  className,
  // PNG 위치가 조금 다를 경우 페이지에서 미세 조정할 수 있습니다.
  hatStyle,
  effectStyle,
  expressionStyle,
}) {
  const jellySrc = JELLY_IMAGES[colorIndex] || JELLY_IMAGES[0];
  const width = Math.round(90 * size);

  const hatValue = resolveValue(hat, HAT_ALIAS);
  const effectValue = resolveValue(effect, EFFECT_ALIAS);
  const expressionValue = resolveValue(expression, FACE_ALIAS);

  const hatSrc = HAT_IMAGE_BY_VALUE[hatValue];
  const effectSrc = EFFECT_IMAGE_BY_VALUE[effectValue];
  const expressionSrc = FACE_IMAGE_BY_VALUE[expressionValue];

  const imageCommon = {
    position: 'absolute',
    display: 'block',
    height: 'auto',
    pointerEvents: 'none',
    userSelect: 'none',
  };

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'inline-block',
        width,
        isolation: 'isolate',
        overflow: 'visible',
        animation: float
          ? 'jellyFloat 2.8s ease-in-out infinite'
          : undefined,
        ...style,
      }}
    >
      {/* 효과 PNG: 해파리 가운데 뒤쪽 */}
      {effectSrc && (
        <img
          src={effectSrc}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            ...imageCommon,
            zIndex: 0,
            width: '175%',
            maxWidth: 'none',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            ...effectStyle,
          }}
        />
      )}

      {/* 기본 해파리 */}
      <img
        src={jellySrc}
        alt="해파리"
        draggable={false}
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: 'auto',
          display: 'block',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />

      {/* 얼굴 PNG: 해파리 얼굴 가운데 */}
      {expressionSrc && (
        <img
          src={expressionSrc}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            ...imageCommon,
            zIndex: 2,
            width: '47%',
            maxWidth: 'none',
            left: '50%',
            top: '29%',
            transform: 'translate(-50%, -50%)',
            ...expressionStyle,
          }}
        />
      )}

      {/* 모자 PNG: 해파리 머리 위쪽 */}
      {hatSrc && (
        <img
          src={hatSrc}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            ...imageCommon,
            zIndex: 3,
            width: '78%',
            maxWidth: 'none',
            left: '50%',
            top: '-7%',
            transform: 'translate(-50%, -50%)',
            ...hatStyle,
          }}
        />
      )}
    </div>
  );
}

export { JELLY_IMAGES };
export default Jelly;