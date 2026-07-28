import { Coins, X } from 'lucide-react';
import { C, GRAD } from '../pages/Auth/components/tokens';
import { useCoins } from '../context/CoinContext';

export default function RewardPopup() {
  const { rewardPopup, closeRewardPopup } = useCoins();
  if (!rewardPopup) return null;
  return <div onClick={closeRewardPopup} style={{position:'fixed',inset:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',padding:16,background:'rgba(12,74,110,.28)',backdropFilter:'blur(7px)'}}>
    <div onClick={e=>e.stopPropagation()} style={{width:'100%',maxWidth:340,padding:28,borderRadius:28,background:'#fff',boxShadow:'0 24px 80px rgba(14,165,233,.22)',textAlign:'center',position:'relative',animation:'fadeInUp .3s ease-out'}}>
      <button onClick={closeRewardPopup} style={{position:'absolute',right:16,top:16,border:0,background:'transparent',color:C.muted,cursor:'pointer'}}><X size={18}/></button>
      <div style={{width:72,height:72,borderRadius:'50%',margin:'0 auto 14px',display:'flex',alignItems:'center',justifyContent:'center',background:'#FFF7D6',color:'#B7791F',boxShadow:'0 8px 22px rgba(245,158,11,.18)'}}><Coins size={34}/></div>
      <p style={{fontSize:12,fontWeight:800,color:C.ocean,marginBottom:5}}>{rewardPopup.title || '미션 달성!'}</p>
      <h2 style={{fontSize:23,fontWeight:900,color:C.deep,margin:'0 0 8px'}}>코인 {rewardPopup.amount}개 획득!</h2>
      <p style={{fontSize:13,color:C.muted,marginBottom:20}}>{rewardPopup.message || '해파리와 함께 꾸준히 목표를 이어가요.'}</p>
      <button onClick={closeRewardPopup} style={{width:'100%',padding:12,border:0,borderRadius:16,background:GRAD,color:'#fff',fontWeight:800,cursor:'pointer'}}>확인</button>
    </div>
  </div>;
}
