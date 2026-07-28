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
    return raw._date === todayKey() ? raw : {};
  } catch { return {}; }
}

function saveClaimed(obj) {
  localStorage.setItem('todoongsilDailyClaimed', JSON.stringify({ ...obj, _date: todayKey() }));
}

function claimedKeys(saved) {
  return new Set(Object.keys(saved).filter(k => k !== '_date' && saved[k]));
}

const REWARD_MESSAGES = {
  'attendance': (r) => ({ title: '출석 완료!', message: `${new Date().getMonth() + 1}월 ${new Date().getDate()}일 출석 완료! ${r}코인을 획득했어요!` }),
  'enter-room': (r) => ({ title: '소셜 방 입장!', message: `소셜 방에 입장하고 ${r}코인을 획득했어요!` }),
  'team-complete': (r) => ({ title: '팀 완료 보너스!', message: `팀원 모두 오늘의 투두를 완료! ${r}코인 획득!` }),
  'room-photo': (r, meta) => ({ title: '사진 촬영!', message: `${meta?.friendName || '친구'}와(과) 사진을 찍고 ${r}코인을 획득했어요!` }),
  'todo-done': (r) => ({ title: '할 일 완료!', message: `오늘의 할 일을 달성하고 ${r}코인을 획득했어요!` }),
  'goal-complete': (r) => ({ title: '대목표 달성!', message: `목표를 100% 달성하고 ${r}코인을 획득했어요!` }),
};

export const MISSION_DEFS = [
  { id: 'attendance', title: '출석 체크', desc: '00시 이후 접속하면 자동 완료', reward: 2, path: '/goals', iconType: 'attendance' },
  { id: 'enter-room', title: '소셜 방 입장', desc: '참여 중인 소셜 방에 입장하기 (하루 1회)', reward: 5, path: '/social', iconType: 'enter-room' },
  { id: 'team-complete', title: '팀 투두 완료', desc: '팀원들이 오늘 할 일을 모두 완료', reward: 3, path: '/social', iconType: 'team-complete' },
  { id: 'room-photo', title: '친구와 사진 찍기', desc: '소셜 방에서 친구와 사진 촬영 (친구당 하루 1회)', reward: 3, path: '/social', iconType: 'room-photo' },
  { id: 'todo-done', title: '할 일 달성', desc: '목표당 하루 1개 할 일 완료 시 지급', reward: 1, path: '/goals', iconType: 'todo-done' },
  { id: 'goal-complete', title: '대목표 100% 달성', desc: '대목표의 모든 할 일을 완료', reward: 15, path: '/goals', iconType: 'goal-complete' },
];

function getClaimKey(id, meta) {
  if (id === 'room-photo') return `room-photo:${meta?.friendName || 'unknown'}`;
  if (id === 'todo-done') return `todo-done:${meta?.goalId || 'default'}`;
  if (id === 'goal-complete') return `goal-complete:${meta?.goalId || 'default'}`;
  return id;
}

export function MissionProvider({ children }) {
  const location = useLocation();
  const { refreshCoins, addCoinsLocally, showRewardPopup } = useCoins();
  const [claimedToday, setClaimedToday] = useState(() => claimedKeys(readClaimed()));

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

    const key = getClaimKey(id, meta);
    const saved = readClaimed();
    if (saved[key]) return { ok: false, reason: 'already-claimed' };

    saved[key] = true;
    saveClaimed(saved);
    setClaimedToday(prev => new Set([...prev, id]));

    await grantCoins(def);

    const msgFn = REWARD_MESSAGES[id] || ((r) => ({ title: '미션 달성!', message: `${r}코인을 획득했어요!` }));
    showRewardPopup(def.reward, msgFn(def.reward, meta));

    return { ok: true, coins: def.reward };
  }, [grantCoins, showRewardPopup]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setClaimedToday(user ? claimedKeys(readClaimed()) : new Set());
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
    return MISSION_DEFS.map(m => ({ ...m, completed: claimedToday.has(m.id) }));
  }, [claimedToday]);

  const value = useMemo(() => ({ missions, completeMission }), [missions, completeMission]);

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
}

export const useMissions = () => {
  const context = useContext(MissionContext);
  if (!context) throw new Error('MissionProvider가 필요합니다.');
  return context;
};
