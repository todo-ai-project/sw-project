import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Check, Coins, Pencil, Save, ShoppingBag, Sparkles, Trophy, X } from 'lucide-react';
import Jelly, { JELLY_IMAGES } from '../Auth/components/Jelly';
import Card from '../Auth/components/Card';
import PrimaryBtn from '../Auth/components/PrimaryBtn';
import { C, GRAD, PAGE_BG } from '../Auth/components/tokens';
import { getMyCharacter, purchaseCharacterItem, getGoals, getTodos } from '../../services/api';
import { useCoins } from '../../context/CoinContext';

const JELLY_COLORS = [
  { name: '하늘', preview: '#BAE6FD' },
  { name: '핑크', preview: '#F9A8D4' },
  { name: '민트', preview: '#99F6E4' },
  { name: '선샤인', preview: '#FDE68A' },
  { name: '보라', preview: '#C4B5FD' },
  { name: '그레이', preview: '#D1D5DB' },
];

const SHOP_ITEMS = [
  { id: 'hat_partyhat', name: '파티 모자', type: 'hat', value: 'partyhat', price: 50, emoji: '🥳' },
  { id: 'hat_crown', name: '왕관', type: 'hat', value: 'crown', price: 150, emoji: '👑' },
  { id: 'accessory_scarf', name: '목도리', type: 'accessory', value: 'scarf', price: 80, emoji: '🧣' },
  { id: 'color_gold', name: '골드 오라', type: 'color', value: 'gold', price: 200, emoji: '✨' },
];

function ProfilePage() {
  const navigate = useNavigate();
  const { coins, setBalance, refreshCoins } = useCoins();

  const [selColor, setSelColor] = useState(Number(localStorage.getItem('jellyColor') || 0));
  const [savedColor, setSavedColor] = useState(Number(localStorage.getItem('jellyColor') || 0));
  const [colorSaved, setColorSaved] = useState(false);
  const [tab, setTab] = useState('stat');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '사용자');
  const [photoOpen, setPhotoOpen] = useState(false);

  const [owned, setOwned] = useState([]);
  const [outfit, setOutfit] = useState({
    hat: '',
    accessory: '',
    color: '',
  });

  const userEmail = localStorage.getItem('userEmail') || '';
  const [completedGoals, setCompletedGoals] = useState(0);
  const [completedTodos, setCompletedTodos] = useState(0);
  const [totalTodos, setTotalTodos] = useState(0);

  useEffect(() => {
    async function loadCharacter() {
      try {
        const character = await getMyCharacter();
        if (!character) return;

        setOwned(character.ownedItems || []);
        setOutfit({
          hat: character.hat || '',
          accessory: character.accessory || '',
          color: character.color || '',
        });
      } catch (e) {
        console.error(e);
      }
    }

    async function loadStats() {
      try {
        const [goals, todos] = await Promise.all([getGoals(), getTodos()]);
        setCompletedGoals(goals.filter(g => g.completed).length);
        setTotalTodos(todos.length);
        setCompletedTodos(todos.filter(t => t.completed ?? t.isDone).length);
      } catch (e) {
        console.error(e);
      }
    }

    loadCharacter();
    loadStats();
  }, []);

  const stats = useMemo(() => [
    {
      label: '보유 코인',
      value: `${coins}개`,
      icon: <Coins size={18} />,
      color: '#B7791F',
      bg: '#FFF7D6',
    },
    {
      label: '달성한 목표',
      value: `${completedGoals}개`,
      icon: <Trophy size={18} />,
      color: '#F59E0B',
      bg: '#FEF3C7',
    },
    {
      label: '완료한 할 일',
      value: `${completedTodos}개`,
      icon: <Check size={18} />,
      color: '#10B981',
      bg: '#D1FAE5',
    },
  ], [coins, completedGoals, completedTodos, totalTodos]);

  const saveName = () => {
    const next = nameInput.trim();
    if (next) {
      setUserName(next);
      localStorage.setItem('userName', next);
    }
    setEditingName(false);
  };

  const equip = (item) => {
    setOutfit((prev) => ({
      ...prev,
      [item.type]: prev[item.type] === item.value ? '' : item.value,
    }));
  };

  const buy = async (item) => {
  if (owned.includes(item.id)) {
    equip(item);
    return;
  }

  if (coins < item.price) {
    alert('코인이 부족해요!');
    return;
  }

  try {
    const data = await purchaseCharacterItem(item.id);

    if (Number.isFinite(Number(data?.coins))) {
      setBalance(Number(data.coins));
    } else {
      await refreshCoins();
    }

    if (data?.character) {
      setOutfit({
        hat: data.character.hat || '',
        accessory: data.character.accessory || '',
        color: data.character.color || '',
      });
    }

    setOwned((prev) => [...prev, item.id]);

    alert(`${item.name} 구매 완료! 바로 착용했어요`);
  } catch (error) {
    console.error(error);
    alert(error.response?.data?.message || '구매에 실패했습니다.');
  }
};

  return (
    <div style={{ minHeight: '100vh', paddingTop: 56, background: PAGE_BG }}>
      {photoOpen && (
        <div onClick={() => setPhotoOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(12,74,110,.28)', backdropFilter: 'blur(6px)' }}>
          <div onClick={event => event.stopPropagation()} style={{ width: '100%', maxWidth: 390, background: '#fff', borderRadius: 24, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}><h3 style={{ margin: 0, color: C.deep }}>내 해파리 사진 <Camera size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /></h3><button onClick={() => setPhotoOpen(false)} style={{ border: 0, background: 'none', cursor: 'pointer', color: C.muted }}><X size={18} /></button></div>
            <div style={{ minHeight: 210, borderRadius: 18, background: 'linear-gradient(180deg,#E0F7FF,#F0F8FF)', border: `2px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Jelly colorIndex={selColor} size={1.55} float {...outfit} /></div>
            <div style={{ marginTop: 16 }}><PrimaryBtn onClick={() => { alert('사진첩에 저장했어요!'); setPhotoOpen(false); }}><Camera size={15} />찰칵!</PrimaryBtn></div>
          </div>
        </div>
      )}

      <style>{`@media(max-width:768px){.profile-grid{grid-template-columns:1fr!important}}`}</style>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 16px 48px' }}>
        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card><div style={{ padding: 24, textAlign: 'center', borderRadius: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Jelly colorIndex={selColor} size={1.45} float {...outfit} /></div>
              {editingName ? <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}><input autoFocus value={nameInput} onChange={event => setNameInput(event.target.value)} onKeyDown={event => event.key === 'Enter' && saveName()} style={{ width: 145, padding: 6, borderRadius: 10, border: `2px solid ${C.ocean}`, color: C.deep }} /><button onClick={saveName} style={{ border: 0, borderRadius: 10, background: GRAD, color: '#fff' }}><Save size={14} /></button></div> : <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}><h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.deep }}>{userName}</h2><button onClick={() => { setNameInput(userName); setEditingName(true); }} style={{ border: 0, background: '#E0F7FF', color: C.ocean, borderRadius: 999, width: 26, height: 26, cursor: 'pointer' }}><Pencil size={12} /></button></div>}
              <p style={{ color: C.muted, fontSize: 12, margin: '4px 0 15px' }}>{userEmail}</p>
              <button onClick={() => navigate('/shop')} style={{ width: '100%', marginBottom: 8, padding: 10, border: `2px solid ${C.border}`, borderRadius: 16, background: '#F0FBFF', color: C.ocean, fontWeight: 800, cursor: 'pointer' }}><ShoppingBag size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> 상점 가기</button><button onClick={() => setPhotoOpen(true)} style={{ width: '100%', padding: 10, border: 0, borderRadius: 16, background: GRAD, color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: 7 }}><Camera size={14} />사진 찍기</button>
            </div></Card>

            <Card><div style={{ padding: 16 }}><p style={{ fontWeight: 800, color: C.deep, marginBottom: 10 }}>해파리 색상</p><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>{JELLY_COLORS.map((color, index) => <button key={color.name} onClick={() => setSelColor(index)} style={{ padding: 8, borderRadius: 16, cursor: 'pointer', background: selColor === index ? '#E0F7FF' : '#F8FAFC', border: selColor === index ? '3px solid #0EA5E9' : '3px solid transparent' }}><img src={JELLY_IMAGES[index]} alt={color.name} style={{ width: 46 }} /><span style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.muted }}>{color.name}</span></button>)}</div>{selColor !== savedColor && <button onClick={() => { localStorage.setItem('jellyColor', String(selColor)); setSavedColor(selColor); setColorSaved(true); setTimeout(() => setColorSaved(false), 2000); }} style={{ width: '100%', marginTop: 10, padding: 10, border: 0, borderRadius: 14, background: GRAD, color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Save size={14} />색상 저장하기</button>}{colorSaved && <p style={{ textAlign: 'center', fontSize: 12, color: '#10B981', fontWeight: 700, marginTop: 6 }}>저장되었습니다!</p>}</div></Card>
          </div>

          <div>
            <div style={{ display: 'flex', padding: 4, borderRadius: 16, gap: 4, background: 'rgba(255,255,255,.7)', border: `1px solid ${C.border}`, marginBottom: 16 }}>
              {[['stat','통계'],['photo','사진첩']].map(([key,label]) => <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: 9, borderRadius: 12, border: 0, cursor: 'pointer', fontWeight: 800, background: tab === key ? GRAD : 'transparent', color: tab === key ? '#fff' : C.muted }}>{label}</button>)}
            </div>

            {tab === 'stat' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>{stats.map(stat => <div key={stat.label} style={{ borderRadius: 24, padding: '14px 12px', background: stat.bg, overflow: 'hidden' }}><div style={{ width: 32, height: 32, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.65)', color: stat.color }}>{stat.icon}</div><p style={{ fontSize: 18, fontWeight: 800, color: C.deep, marginTop: 8, whiteSpace: 'nowrap' }}>{stat.value}</p><p style={{ fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>{stat.label}</p></div>)}</div>}

            {tab === 'photo' && <Card><div style={{ padding: 28, textAlign: 'center' }}><Sparkles size={26} color={C.ocean} /><h2 style={{ color: C.deep, fontWeight: 800 }}>해파리 사진첩</h2><p style={{ color: C.muted, fontSize: 13, marginBottom: 16 }}>구매한 옷을 입고 내 사진을 남길 수 있어요.</p><PrimaryBtn onClick={() => setPhotoOpen(true)}><Camera size={15} />새 사진 찍기</PrimaryBtn></div></Card>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
