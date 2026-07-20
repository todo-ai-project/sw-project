import { useEffect, useMemo, useState } from 'react';
import { Check, Coins } from 'lucide-react';
import Card from '../Auth/components/Card';
import Jelly from '../Auth/components/Jelly';
import { C, GRAD, PAGE_BG } from '../Auth/components/tokens';
import { useCoins } from '../../context/CoinContext';
import { purchaseCharacterItem } from '../../services/api';

const CATS = [
  ['hat', '모자'],
  ['effect', '효과'],
  ['expression', '표정'],
];

const ITEMS = [
  { id: 'none-hat', cat: 'hat', name: '기본', value: '', price: 0 },
  {
    id: 'hat_partyhat',
    cat: 'hat',
    name: '파티 모자',
    value: 'partyhat',
    price: 50,
    backend: true,
  },
  {
    id: 'hat_crown',
    cat: 'hat',
    name: '왕관',
    value: 'crown',
    price: 150,
    backend: true,
  },
  { id: 'hat_ribbon', cat: 'hat', name: '리본', value: 'ribbon', price: 70 },
  { id: 'hat_beret', cat: 'hat', name: '베레모', value: 'beret', price: 90 },

  { id: 'none-effect', cat: 'effect', name: '기본', value: '', price: 0 },
  {
    id: 'effect_bubbles',
    cat: 'effect',
    name: '물방울',
    value: 'bubbles',
    price: 35,
  },
  {
    id: 'effect_sparkles',
    cat: 'effect',
    name: '반짝임',
    value: 'sparkles',
    price: 60,
  },
  {
    id: 'effect_flowers',
    cat: 'effect',
    name: '꽃가루',
    value: 'flowers',
    price: 80,
  },
  {
    id: 'color_gold',
    cat: 'effect',
    name: '골드 오라',
    value: 'gold',
    price: 200,
    backend: true,
  },

  {
    id: 'expression_normal',
    cat: 'expression',
    name: '기본 표정',
    value: 'normal',
    price: 0,
  },
  {
    id: 'expression_smile',
    cat: 'expression',
    name: '활짝 웃음',
    value: 'smile',
    price: 20,
  },
  {
    id: 'expression_heart',
    cat: 'expression',
    name: '하트 눈',
    value: 'heart',
    price: 45,
  },
  {
    id: 'expression_sleepy',
    cat: 'expression',
    name: '졸린 표정',
    value: 'sleepy',
    price: 30,
  },
  {
    id: 'expression_wink',
    cat: 'expression',
    name: '윙크',
    value: 'wink',
    price: 40,
  },
];

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
};

export default function ShopPage() {
  const { coins, spendCoins, setBalance, refreshCoins } = useCoins();

  const [colorIndex] = useState(
    Number(localStorage.getItem('jellyColor') || 0),
  );
  const [cat, setCat] = useState('hat');
  const [owned, setOwned] = useState(() =>
    read('todoongsilOwnedItems', [
      'none-hat',
      'none-effect',
      'expression_normal',
    ]),
  );
  const [equipped, setEquipped] = useState(() =>
    read('todoongsilOutfit', {
      hat: '',
      effect: '',
      expression: 'normal',
    }),
  );
  const [preview, setPreview] = useState(equipped);

  useEffect(() => {
    localStorage.setItem('todoongsilOwnedItems', JSON.stringify(owned));
  }, [owned]);

  useEffect(() => {
    localStorage.setItem('todoongsilOutfit', JSON.stringify(equipped));
  }, [equipped]);

  const list = useMemo(
    () => ITEMS.filter((item) => item.cat === cat),
    [cat],
  );

  const action = async (item) => {
    if (owned.includes(item.id) || item.price === 0) {
      const next = { ...equipped, [item.cat]: item.value };
      setEquipped(next);
      setPreview(next);
      return;
    }

    if (coins < item.price) {
      alert('코인이 부족해요!');
      return;
    }

    if (item.backend) {
      try {
        const data = await purchaseCharacterItem(item.id);

        if (Number.isFinite(Number(data?.coins))) {
          setBalance(Number(data.coins));
        } else {
          await refreshCoins();
        }
      } catch {
        const result = spendCoins(item.price);
        if (!result.ok) return;
      }
    } else {
      const result = spendCoins(item.price);
      if (!result.ok) return;
    }

    setOwned((current) => [...current, item.id]);

    const next = { ...equipped, [item.cat]: item.value };
    setEquipped(next);
    setPreview(next);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: 56,
        background: PAGE_BG,
      }}
    >
      <div
        style={{
          maxWidth: 920,
          margin: '0 auto',
          padding: '28px 16px 48px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 18,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 900,
                color: C.deep,
                margin: 0,
              }}
            >
              해파리 상점 🛍️
            </h1>
            <p
              style={{
                fontSize: 13,
                color: C.muted,
                marginTop: 5,
              }}
            >
              구매 전 내 해파리에 미리 적용해볼 수 있어요.
            </p>
          </div>

          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 13px',
              borderRadius: 14,
              background: '#FFF7D6',
              color: '#B7791F',
              fontWeight: 900,
            }}
          >
            <Coins size={15} />
            {coins}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 3fr',
            gap: 18,
          }}
        >
          <Card>
            <div style={{ padding: 24, textAlign: 'center' }}>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: C.muted,
                }}
              >
                미리보기
              </p>

              <div
                style={{
                  minHeight: 270,
                  borderRadius: 22,
                  margin: '12px 0 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    'radial-gradient(circle at 50% 45%,#DDF5FF 0,#EEF9FF 50%,#fff 75%)',
                  border: `2px solid ${C.border}`,
                }}
              >
                <Jelly
                  colorIndex={colorIndex}
                  size={2}
                  float
                  {...preview}
                />
              </div>

              <button
                onClick={() => setPreview(equipped)}
                style={{
                  border: 0,
                  background: '#E0F7FF',
                  color: C.ocean,
                  borderRadius: 13,
                  padding: '9px 16px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                착용 상태로 되돌리기
              </button>
            </div>
          </Card>

          <div>
            <div
              style={{
                display: 'flex',
                gap: 8,
                marginBottom: 14,
              }}
            >
              {CATS.map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setCat(key)}
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 14,
                    border: 0,
                    cursor: 'pointer',
                    fontWeight: 800,
                    background: cat === key ? GRAD : '#fff',
                    color: cat === key ? '#fff' : C.muted,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
              }}
            >
              {list.map((item) => {
                const has = owned.includes(item.id) || item.price === 0;
                const isEquipped = equipped[item.cat] === item.value;

                return (
                  <button
                    key={item.id}
                    onClick={() =>
                      setPreview((current) => ({
                        ...current,
                        [item.cat]: item.value,
                      }))
                    }
                    style={{
                      padding: 14,
                      borderRadius: 20,
                      cursor: 'pointer',
                      background: isEquipped
                        ? '#E0F7FF'
                        : 'rgba(255,255,255,.88)',
                      border: isEquipped
                        ? '2px solid #0EA5E9'
                        : `2px solid ${C.border}`,
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        height: 82,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Jelly
                        colorIndex={colorIndex}
                        size={0.72}
                        {...{ [item.cat]: item.value }}
                      />
                    </div>

                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: C.deep,
                        margin: '5px 0',
                      }}
                    >
                      {item.name}
                    </p>

                    <p
                      style={{
                        fontSize: 11,
                        color: has ? '#10B981' : '#B7791F',
                        marginBottom: 8,
                      }}
                    >
                      {has ? '보유' : `${item.price} 코인`}
                    </p>

                    <span
                      onClick={(event) => {
                        event.stopPropagation();
                        action(item);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                        padding: 8,
                        borderRadius: 12,
                        background: isEquipped
                          ? '#D1FAE5'
                          : has
                            ? '#E0F7FF'
                            : GRAD,
                        color: isEquipped
                          ? '#059669'
                          : has
                            ? C.ocean
                            : '#fff',
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {isEquipped ? (
                        <>
                          <Check size={12} />
                          착용 중
                        </>
                      ) : has ? (
                        '착용하기'
                      ) : (
                        '구매하기'
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}