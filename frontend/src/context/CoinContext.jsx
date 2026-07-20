import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getMyCoins } from '../services/api';
const CoinContext=createContext(null); const BALANCE_KEY='todoongsilCoinBalance';
const read=()=>{const n=Number(localStorage.getItem(BALANCE_KEY));return Number.isFinite(n)&&n>=0?n:0};
export function CoinProvider({children}){const[coins,setCoins]=useState(read);const[loading,setLoading]=useState(false);const[rewardPopup,setRewardPopup]=useState(null);
 const setBalance=useCallback(n=>{const v=Math.max(0,Number(n)||0);localStorage.setItem(BALANCE_KEY,String(v));setCoins(v);return v},[]);
 const refreshCoins=useCallback(async()=>{if(!localStorage.getItem('idToken'))return read();setLoading(true);try{const d=await getMyCoins();return setBalance(Math.max(read(),Number(d?.coins||0)))}catch(e){console.warn('코인 동기화 실패:',e.message);return read()}finally{setLoading(false)}},[setBalance]);
 useEffect(()=>{refreshCoins()},[refreshCoins]);
 const grantCoins=useCallback((amount,rewardKey,meta={})=>{const a=Math.max(0,Number(amount)||0);if(!a)return{ok:false,coins:read()};if(rewardKey&&localStorage.getItem(rewardKey))return{ok:false,reason:'already-claimed',coins:read()};if(rewardKey)localStorage.setItem(rewardKey,new Date().toISOString());const next=setBalance(read()+a);setRewardPopup({amount:a,title:meta.title||'미션 달성!',message:meta.message});return{ok:true,amount:a,coins:next}},[setBalance]);
 const spendCoins=useCallback(a=>{const v=Math.max(0,Number(a)||0),c=read();if(c<v)return{ok:false,reason:'not-enough',coins:c};return{ok:true,coins:setBalance(c-v)}},[setBalance]);
 const value=useMemo(()=>({coins,loading,setBalance,refreshCoins,grantCoins,spendCoins,rewardPopup,closeRewardPopup:()=>setRewardPopup(null)}),[coins,loading,setBalance,refreshCoins,grantCoins,spendCoins,rewardPopup]);return <CoinContext.Provider value={value}>{children}</CoinContext.Provider>}
export const useCoins=()=>{const c=useContext(CoinContext);if(!c)throw new Error('CoinProvider가 필요합니다.');return c};
