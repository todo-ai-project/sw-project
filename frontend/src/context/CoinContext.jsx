import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getMyCoins } from '../services/api';

const CoinContext = createContext(null);

const LOCAL_COINS_KEY = 'todoongsilCoins';

function readLocalCoins() {
  return Math.max(0, Number(localStorage.getItem(LOCAL_COINS_KEY) || 0));
}

export function CoinProvider({ children }) {
  const [coins, setCoins] = useState(() => readLocalCoins());
  const [loading, setLoading] = useState(false);
  const [rewardPopup, setRewardPopup] = useState(null);

  const refreshCoins = useCallback(async () => {
    const auth = getAuth();
    if (!auth.currentUser) {
      setCoins(0);
      return 0;
    }
    setLoading(true);
    try {
      const d = await getMyCoins();
      const v = Math.max(0, Number(d?.coins || 0));
      setCoins(v);
      localStorage.setItem(LOCAL_COINS_KEY, String(v));
      return v;
    } catch (e) {
      console.warn('코인 동기화 실패:', e.message);
      const local = readLocalCoins();
      setCoins(local);
      return local;
    } finally {
      setLoading(false);
    }
  }, []);

  const addCoinsLocally = useCallback((amount) => {
    setCoins(prev => {
      const next = prev + amount;
      localStorage.setItem(LOCAL_COINS_KEY, String(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const auth = getAuth();
    // 로그인 상태가 바뀔 때마다(계정 전환 포함) 서버에서 새로 읽어옴
    const unsubscribe = auth.onAuthStateChanged(() => {
      refreshCoins();
    });
    return unsubscribe;
  }, [refreshCoins]);

  // 보상 팝업을 띄우고 싶을 때, 서버 액션(투두 완료 등) 이후 이 함수를 호출해서
  // 서버에서 실제로 늘어난 코인을 다시 읽어온 뒤 팝업만 띄움
  const showRewardPopup = useCallback((amount, meta = {}) => {
    setRewardPopup({ amount, title: meta.title || '미션 달성!', message: meta.message });
  }, []);

  const value = useMemo(() => ({
    coins,
    loading,
    refreshCoins,
    addCoinsLocally,
    showRewardPopup,
    rewardPopup,
    closeRewardPopup: () => setRewardPopup(null),
  }), [coins, loading, refreshCoins, addCoinsLocally, showRewardPopup, rewardPopup]);

  return <CoinContext.Provider value={value}>{children}</CoinContext.Provider>;
}

export const useCoins = () => {
  const c = useContext(CoinContext);
  if (!c) throw new Error('CoinProvider가 필요합니다.');
  return c;
};