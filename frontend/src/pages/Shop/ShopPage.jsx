import { useEffect, useMemo, useState } from 'react';
import { Check, Coins } from 'lucide-react';
import Card from '../Auth/components/Card';
import Jelly, { HAT_IMAGES, EXPRESSION_IMAGES, EFFECT_IMAGES } from '../Auth/components/Jelly';
import { C, GRAD, PAGE_BG } from '../Auth/components/tokens';
import { useCoins } from '../../context/CoinContext';
import { purchaseCharacterItem } from '../../services/api';

const CATS = [
  ['hat', '모자'],
  ['effect', '효과'],
  ['expression', '표정'],
  ['background', '배경'],
];

const ITEM_THUMB = { hat: HAT_IMAGES, expression: EXPRESSION_IMAGES, effect: EFFECT_IMAGES };

const BG_IMAGES = {
  cave: '/assets/backgrounds/back1.png',
  coral: '/assets/backgrounds/back2.png',
  beach: '/assets/backgrounds/back3.png',
  ring: '/assets/backgrounds/back4.png',
  shell: '/assets/backgrounds/back5.png',
};

const ITEMS = [
  { id: 'none-hat', cat: 'hat', name: '기본', value: '', price: 0 },
  { id: 'hat_ribbon', cat: 'hat', name: '리본', value: 'ribbon', price: 50 },
  { id: 'hat_bunny', cat: 'hat', name: '토끼 머리띠', value: 'bunny', price: 70 },
  { id: 'hat_cat', cat: 'hat', name: '고양이 머리띠', value: 'cat', price: 90 },
  { id: 'hat_flower', cat: 'hat', name: '꽃 머리띠', value: 'flower', price: 100 },
  { id: 'hat_halo', cat: 'hat', name: '헤일로', value: 'halo', price: 120 },
  { id: 'hat_crown', cat: 'hat', name: '왕관', value: 'crown', price: 150 },

  { id: 'none-effect', cat: 'effect', name: '기본', value: '', price: 0 },
  { id: 'effect_bubbles', cat: 'effect', name: '물방울', value: 'bubbles', price: 35 },
  { id: 'effect_sparkles', cat: 'effect', name: '반짝임', value: 'sparkles', price: 60 },
  { id: 'effect_flowers', cat: 'effect', name: '꽃가루', value: 'flowers', price: 80 },
  { id: 'color_gold', cat: 'effect', name: '골드 오라', value: 'gold', price: 200 },

  { id: 'expression_normal', cat: 'expression', name: '기본 표정', value: 'normal', price: 0 },
  { id: 'expression_smile', cat: 'expression', name: '활짝 웃음', value: 'smile', price: 30 },
  { id: 'expression_wink', cat: 'expression', name: '윙크', value: 'wink', price: 20 },
  { id: 'expression_heart', cat: 'expression', name: '하트 눈', value: 'heart', price: 35 },
  { id: 'expression_sleepy', cat: 'expression', name: '졸린 표정', value: 'sleepy', price: 45 },

  { id: 'bg_cave', cat: 'background', name: '해저 동굴', value: 'cave', price: 40 },
  { id: 'bg_coral', cat: 'background', name: '산호초 바다', value: 'coral', price: 60 },
  { id: 'bg_beach', cat: 'background', name: '여름 해변', value: 'beach', price: 80 },
  { id: 'bg_ring', cat: 'background', name: '바다 튜브', value: 'ring', price: 100 },
  { id: 'bg_shell', cat: 'background', name: '조개 무대', value: 'shell', price: 120 },
];

const DEFAULT_OWNED = ['none-hat', 'none-effect', 'expression_normal', 'bg_none'];
const DEFAULT_OUTFIT = { hat: '', effect: '', expression: 'normal' };

function readLocal(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}

export default function ShopPage() {
  const { coins, refreshCoins } = useCoins();

  const [colorIndex] = useState(Number(localStorage.getItem('jellyColor') || 0));
  const [cat, setCat] = useState('hat');
  const [owned, setOwned] = useState(() => readLocal('todoongsilOwnedItems', DEFAULT_OWNED));
  const [equipped, setEquipped] = useState(() => readLocal('todoongsilOutfit', DEFAULT_OUTFIT));
  const [preview, setPreview] = useState(equipped);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => { localStorage.setItem('todoongsilOwnedItems', JSON.stringify(owned)); }, [owned]);
  useEffect(() => { localStorage.setItem('todoongsilOutfit', JSON.stringify(equipped)); }, [equipped]);

  const list = useMemo(() => ITEMS.filter((item) => item.cat === cat), [cat]);
  const isBgTab = cat === 'background';

  const equip = (item) => {
    if (item.cat === 'background') return;
    const next = { ...equipped, [item.cat]: item.value };
    setEquipped(next);
    setPreview(next);
  };

  const buy = async (item) => {
    if (purchasing) return;
    if (coins < item.price) { alert('코인이 부족해요!'); return; }

    setPurchasing(true);
    try {
      const data = await purchaseCharacterItem(item.id);
      if (data?.alreadyOwned) {
        setOwned((cur) => cur.includes(item.id) ? cur : [...cur, item.id]);
      } else {
        setOwned((cur) => [...cur, item.id]);
      }
      await refreshCoins();
      if (item.cat !== 'background') equip(item);
    } catch {
      alert('구매에 실패했어요. 다시 시도해주세요.');
    } finally {
      setPurchasing(false);
    }
  };

  const action = (item) => {
    const has = owned.includes(item.id) || item.price === 0;
    if (has) { if (item.cat !== 'background') equip(item); return; }
    buy(item);
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: 56, background: PAGE_BG }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 16px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: C.deep, margin: 0 }}>해파리 상점</h1>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 5 }}>구매 전 내 해파리에 미리 적용해볼 수 있어요.</p>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 13px', borderRadius: 14, background: '#FFF7D6', color: '#B7791F', fontWeight: 900 }}>
            <Coins size={15} />{coins}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 18, alignItems: 'start' }}>
          <Card>
            <div style={{ padding: 24, textAlign: 'center' }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: C.muted }}>미리보기</p>
              <div style={{ height: 270, borderRadius: 22, margin: '12px 0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 50% 45%,#DDF5FF 0,#EEF9FF 50%,#fff 75%)', border: `2px solid ${C.border}`, overflow: 'hidden' }}>
                <Jelly colorIndex={colorIndex} size={2} float {...preview} />
              </div>
              <button onClick={() => setPreview(equipped)} style={{ border: 0, background: '#E0F7FF', color: C.ocean, borderRadius: 13, padding: '9px 16px', fontWeight: 800, cursor: 'pointer' }}>
                착용 상태로 되돌리기
              </button>
            </div>
          </Card>

          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {CATS.map(([key, label]) => (
                <button key={key} onClick={() => setCat(key)} style={{ flex: 1, padding: 10, borderRadius: 14, border: 0, cursor: 'pointer', fontWeight: 800, background: cat === key ? GRAD : '#fff', color: cat === key ? '#fff' : C.muted }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {list.map((item) => {
                const has = owned.includes(item.id) || item.price === 0;
                const isEquipped = !isBgTab && equipped[item.cat] === item.value;

                return (
                  <button key={item.id} onClick={() => { if (!isBgTab) setPreview((cur) => ({ ...cur, [item.cat]: item.value })); }} style={{ padding: 14, borderRadius: 20, cursor: 'pointer', background: isEquipped ? '#E0F7FF' : 'rgba(255,255,255,.88)', border: isEquipped ? '2px solid #0EA5E9' : `2px solid ${C.border}`, textAlign: 'center' }}>
                    <div style={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: isBgTab ? 12 : 0 }}>
                      {isBgTab ? (
                        item.value && BG_IMAGES[item.value] ? (
                          <img src={BG_IMAGES[item.value]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: 11, fontWeight: 800 }}>흰색</div>
                        )
                      ) : item.value && ITEM_THUMB[item.cat]?.[item.value] ? (
                        <img src={ITEM_THUMB[item.cat][item.value]} alt={item.name} style={{ height: 64, objectFit: 'contain' }} />
                      ) : (
                        <Jelly colorIndex={colorIndex} size={0.65} {...{ [item.cat]: item.value }} />
                      )}
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: C.deep, margin: '5px 0' }}>{item.name}</p>
                    <p style={{ fontSize: 11, color: has ? '#10B981' : '#B7791F', marginBottom: 8 }}>{has ? '보유' : `${item.price} 코인`}</p>
                    <span onClick={(e) => { e.stopPropagation(); action(item); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 8, borderRadius: 12, background: isEquipped ? '#D1FAE5' : has ? '#E0F7FF' : GRAD, color: isEquipped ? '#059669' : has ? C.ocean : '#fff', fontSize: 12, fontWeight: 900, opacity: purchasing ? 0.5 : 1 }}>
                      {isBgTab ? (has ? (<><Check size={12} />보유 중</>) : '구매하기') : isEquipped ? (<><Check size={12} />착용 중</>) : has ? '착용하기' : '구매하기'}
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
