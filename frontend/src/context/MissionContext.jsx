import { createContext,useCallback,useContext,useEffect,useMemo,useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useCoins } from './CoinContext';
const MissionContext=createContext(null);
const dateKey=()=>new Date().toISOString().slice(0,10);
export const MISSION_DEFS=[
{id:'attendance',title:'오늘 출석하기',desc:'투둥실에 접속하기',reward:5,path:'/goals',emoji:'🪼'},
{id:'create-goal',title:'오늘 목표 만들기',desc:'AI 해파리에게 목표를 부탁하기',reward:10,path:'/make',emoji:'🎯'},
{id:'complete-todo',title:'할 일 1개 완료하기',desc:'내 투두 하나를 체크하기',reward:5,path:'/goals',emoji:'✅'},
{id:'enter-room',title:'소셜 방 들어가기',desc:'참여 중인 방에 입장하기',reward:3,path:'/social',emoji:'🌊'},
{id:'shared-todo',title:'공동 투두 완료하기',desc:'친구들과 공동 투두 체크하기',reward:5,path:'/social',emoji:'🤝'},
{id:'room-photo',title:'친구와 사진 찍기',desc:'소셜 방에서 추억 남기기',reward:3,path:'/social',emoji:'📸'},];
const keyFor=id=>`todoongsil:mission:${localStorage.getItem('userID')||'guest'}:${dateKey()}:${id}`;
export function MissionProvider({children}){const location=useLocation();const{grantCoins}=useCoins();const[,rerender]=useState(0);
 const completeMission=useCallback(id=>{const m=MISSION_DEFS.find(x=>x.id===id);if(!m)return{ok:false};const r=grantCoins(m.reward,keyFor(id),{title:'미션 달성!',message:m.title});if(r.ok)rerender(v=>v+1);return r},[grantCoins]);
 useEffect(()=>{if(localStorage.getItem('idToken')&&!['/login','/signup'].includes(location.pathname))completeMission('attendance')},[location.pathname,completeMission]);
 const missions=MISSION_DEFS.map(m=>({...m,completed:!!localStorage.getItem(keyFor(m.id))}));
 const value=useMemo(()=>({missions,completeMission}),[missions,completeMission]);return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>}
export const useMissions=()=>{const c=useContext(MissionContext);if(!c)throw new Error('MissionProvider가 필요합니다.');return c};
