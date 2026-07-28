import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { useCoins } from './CoinContext';
import { claimMission as claimMissionApi } from '../services/api';

const MissionContext = createContext(null);

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function readClaimed() {
  try {
    const raw = JSON.parse(localStorage.getItem('todoongsilDailyClaimed') || '{}');
    if (raw._date !== todayKey()) return {};
    return raw;
  } catch { return {}; }
}

function saveClaimed(obj) {
  localStorage.setItem('todoongsilDailyClaimed', JSON.stringify({ ...obj, _date: todayKey() }));
}

export const MISSION_DEFS = [
  { id: 'attendance', title: '출석 체크', desc: '00시 이후 접속하면 자동 완료', reward: 2, path: '/goals', emoji: '🪼' },
  { id: 'enter-room', title: '소셜 방 입장', desc: '참여 중인 소셜 방에 입장하기 (하루 1회)', reward: 5, path: '/social', emoji: '🌊' },
  { id: 'team-complete', title: '팀 투두 완료', desc: '팀원들이 오늘 할 일을 모두 완료', reward: 3, path: '/social', emoji: '🤝' },
  { id: 'room-photo', title: '친구와 사진 찍기', desc: '소셜 방에서 친구와 사진 촬영 (친구당 하루 1회)', reward: 3, path: '/social', emoji: '📸' },
  { id: 'todo-done', title: '할 일 달성', desc: '목표당 하루 1개 할 일 완료 시 지급', reward: 1, path: '/goals', emoji: '✅' },
  { id: 'goal-complete', title: '대목표 100% 달성', desc: '대목표의 모든 할 일을 완료', reward: 15, path: '/goals', emoji: '🎯' },
];

export function MissionProvider({ children }) {
  const location = useLocation();
  const { refreshCoins, addCoinsLocally, showRewardPopup } = useCoins();
  const [claimedToday, setClaimedToday] = useState(() => {
    const saved = readClaimed();
    const set = new Set();
    Object.keys(saved).filter(k => k !== '_date').forEach(k => { if (saved[k]) set.add(k); });
    return set;
  });

  const grantCoins = useCallback(async (def) => {
    try {
      await claimMissionApi(def.id);
      await refreshCoins();
    } catch {
      addCoinsLocally(def.reward);
    }
  }, [refreshCoins, addCoinsLocally]);

  const completeMission = useCallback(async (id, meta) => {
    const auth = getAuth();
    if (!auth.currentUser) return { ok: false, reason: 'not-login' };

    const def = MISSION_DEFS.find(m => m.id === id);
    if (!def) return { ok: false, reason: 'unknown' };

    if (id === 'room-photo') {
      const friendName = meta?.friendName || 'unknown';
      const photoKey = `room-photo:${friendName}`;
      const saved = readClaimed();
      if (saved[photoKey]) return { ok: false, reason: 'already-claimed' };
      saved[photoKey] = true;
      saveClaimed(saved);
      setClaimedToday(prev => new Set([...prev, id]));
      await grantCoins(def);
      showRewardPopup(def.reward, { title: '사진 촬영!', message: `${friendName}와(과) 사진을 찍고 ${def.reward}코인을 획득했어요!` });
      return { ok: true, coins: def.reward };
    }

    if (id === 'todo-done') {
      const goalId = meta?.goalId || 'default';
      const todoKey = `todo-done:${goalId}`;
      const saved = readClaimed();
      if (saved[todoKey]) return { ok: false, reason: 'already-claimed' };
      saved[todoKey] = true;
      saveClaimed(saved);
      setClaimedToday(prev => new Set([...prev, id]));
      await grantCoins(def);
      showRewardPopup(def.reward, { title: '할 일 완료!', message: `오늘의 할 일을 달성하고 ${def.reward}코인을 획득했어요!` });
      return { ok: true, coins: def.reward };
    }

    if (id === 'goal-complete') {
      const goalId = meta?.goalId || 'default';
      const goalKey = `goal-complete:${goalId}`;
      const saved = readClaimed();
      if (saved[goalKey]) return { ok: false, reason: 'already-claimed' };
      saved[goalKey] = true;
      saveClaimed(saved);
      setClaimedToday(prev => new Set([...prev, id]));
      await grantCoins(def);
      showRewardPopup(def.reward, { title: '대목표 달성!', message: `목표를 100% 달성하고 ${def.reward}코인을 획득했어요!` });
      return { ok: true, coins: def.reward };
    }

    if (claimedToday.has(id)) return { ok: false, reason: 'already-claimed' };

    const saved = readClaimed();
    saved[id] = true;
    saveClaimed(saved);
    setClaimedToday(prev => new Set([...prev, id]));

    await grantCoins(def);

    const today = new Date();
    const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일`;

    if (id === 'attendance') {
      showRewardPopup(def.reward, { title: '출석 완료!', message: `${dateStr} 출석 완료! ${def.reward}코인을 획득했어요!` });
    } else if (id === 'enter-room') {
      showRewardPopup(def.reward, { title: '소셜 방 입장!', message: `소셜 방에 입장하고 ${def.reward}코인을 획득했어요!` });
    } else if (id === 'team-complete') {
      showRewardPopup(def.reward, { title: '팀 완료 보너스!', message: `팀원 모두 오늘의 투두를 완료! ${def.reward}코인 획득!` });
    } else {
      showRewardPopup(def.reward, { title: '미션 달성!', message: `${def.reward}코인을 획득했어요!` });
    }

    return { ok: true, coins: def.reward };
  }, [claimedToday, grantCoins, showRewardPopup]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        setClaimedToday(new Set());
        return;
      }
      const saved = readClaimed();
      const set = new Set();
      Object.keys(saved).filter(k => k !== '_date').forEach(k => { if (saved[k]) set.add(k); });
      setClaimedToday(set);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const auth = getAuth();
    if (auth.currentUser && !['/login', '/signup'].includes(location.pathname)) {
      completeMission('attendance');
    }
  }, [location.pathname]);

  const missions = useMemo(() => {
    return MISSION_DEFS.map(m => ({
      ...m,
      completed: claimedToday.has(m.id),
    }));
  }, [claimedToday]);

  const value = useMemo(() => ({ missions, completeMission }), [missions, completeMission]);

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
}

export const useMissions = () => {
  const context = useContext(MissionContext);
  if (!context) throw new Error('MissionProvider가 필요합니다.');
  return context;
};
