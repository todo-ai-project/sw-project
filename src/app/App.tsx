import { useState } from "react"
import type { ReactNode } from "react"
import {
  Target, Users, User, ChevronDown, ChevronRight,
  Check, Plus, Heart, CheckCircle2, Pencil,
  LogIn, UserPlus, Camera, Trash2, Sparkles, X,
  MessageCircle, Star, Flame, Trophy
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = "login" | "signup" | "goal-setting" | "goal-manage" | "social" | "profile"
type AIState = "idle" | "analyzing" | "done"

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  deep:   "#0C4A6E",
  navy:   "#0F5282",
  ocean:  "#0EA5E9",
  teal:   "#06B6D4",
  muted:  "#64B5D6",
  subtle: "#A8D5EC",
  bg:     "#EFF8FF",
  card:   "rgba(255,255,255,0.88)",
  border: "rgba(186,230,253,0.7)",
}
const GRAD = "linear-gradient(135deg,#0EA5E9,#06B6D4)"
const PAGE_BG = "linear-gradient(160deg,#E8F7FF 0%,#F0F4FF 55%,#F5EEFF 100%)"

const JELLY_COLORS = [
  { bell:"#BAE6FD", glow:"#38BDF8", name:"스카이" },
  { bell:"#F9A8D4", glow:"#F472B6", name:"핑크" },
  { bell:"#C4B5FD", glow:"#A78BFA", name:"라벤더" },
  { bell:"#99F6E4", glow:"#2DD4BF", name:"민트" },
  { bell:"#FDE68A", glow:"#FBBF24", name:"선샤인" },
  { bell:"#FCA5A5", glow:"#F87171", name:"코럴" },
  { bell:"#D9F99D", glow:"#A3E635", name:"라임" },
  { bell:"#E0E7FF", glow:"#818CF8", name:"퍼플" },
]
const ACCESSORIES = ["🎀","👑","🌸","⭐","🐚","🪸","🌊","✨"]
const ROOM_EMOJIS  = ["💼","🏃","💻","🗣️","📚","🌅","🎨","🎵","🍎","✈️","🎯","🌱"]

const FRIEND_CHARS = [
  { name:"김채민", bellColor:"#F9A8D4", glowColor:"#F472B6" },
  { name:"박민서", bellColor:"#C4B5FD", glowColor:"#A78BFA" },
  { name:"오하민", bellColor:"#99F6E4", glowColor:"#2DD4BF" },
  { name:"이준호", bellColor:"#FDE68A", glowColor:"#FBBF24" },
]
const FRAMES = ["🪼","🌊","🐚","✨","🌸","🐠"]

interface SubGoal { id:number; title:string; color:string }
const SUB_GOALS: SubGoal[] = [
  { id:0, title:"어휘력 향상",    color:"#0EA5E9" },
  { id:1, title:"리스닝 강화",    color:"#06B6D4" },
  { id:2, title:"독해 속도 개선", color:"#10B981" },
  { id:3, title:"문법 완성",      color:"#F59E0B" },
  { id:4, title:"시간 관리",      color:"#6366F1" },
  { id:5, title:"모의고사 반복",  color:"#C026D3" },
  { id:6, title:"오답노트 정리",  color:"#0891B2" },
  { id:7, title:"컨디션 관리",    color:"#059669" },
]

interface TodoItem { id:number; text:string; done:boolean; subGoalId:number }
const INITIAL_TODOS: TodoItem[] = [
  { id:1,  text:"단어 30개 암기",  done:true,  subGoalId:0 },
  { id:2,  text:"어원 분석 공부",  done:false, subGoalId:0 },
  { id:3,  text:"동의어 정리하기", done:false, subGoalId:0 },
  { id:4,  text:"쉐도잉 10분",     done:true,  subGoalId:1 },
  { id:5,  text:"받아쓰기 훈련",   done:false, subGoalId:1 },
  { id:6,  text:"속독 훈련 15분",  done:false, subGoalId:2 },
  { id:7,  text:"품사 총정리",     done:true,  subGoalId:3 },
  { id:8,  text:"시제 집중 공부",  done:false, subGoalId:3 },
  { id:9,  text:"수면 7시간 확보", done:true,  subGoalId:7 },
  { id:10, text:"집중력 운동",     done:false, subGoalId:7 },
]

interface SocialRoom { id:number; name:string; goal:string; members:number; progress:number; emoji:string; likes:number; active:boolean }
const INITIAL_ROOMS: SocialRoom[] = [
  { id:1, name:"취업 준비생 모임", goal:"자소서 완성 + 면접 합격", members:12, progress:65, emoji:"💼", likes:34, active:true  },
  { id:2, name:"다이어트 챌린지",  goal:"3개월 -5kg 달성",        members:8,  progress:42, emoji:"🏃", likes:21, active:true  },
  { id:3, name:"개발자 스터디",    goal:"알고리즘 100문제 완주",   members:5,  progress:78, emoji:"💻", likes:45, active:false },
  { id:4, name:"영어 회화 마스터", goal:"OPIc AL 등급 획득",       members:15, progress:30, emoji:"🗣️", likes:18, active:true  },
  { id:5, name:"독서 습관 만들기", goal:"올해 책 24권 읽기",        members:9,  progress:50, emoji:"📚", likes:29, active:true  },
  { id:6, name:"새벽 기상 도전",   goal:"오전 5시 기상 30일",       members:20, progress:87, emoji:"🌅", likes:52, active:false },
]

// ─── Keyframes ────────────────────────────────────────────────────────────────
const KF = `
  @keyframes jellyFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes tentSway   { 0%,100%{transform:rotate(-7deg)} 50%{transform:rotate(7deg)} }
  @keyframes bubbleRise { 0%{transform:translateY(0);opacity:.55} 100%{transform:translateY(-60px);opacity:0} }
  @keyframes fadeInUp   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes flash      { 0%,100%{opacity:0} 30%{opacity:.85} }
`

// ─── Atoms ────────────────────────────────────────────────────────────────────
function Bubbles({ n = 5 }: { n?: number }) {
  const B = [
    { s:9,  l:"8%",  d:"0s",   t:"4s"   },
    { s:6,  l:"78%", d:"1.1s", t:"3.6s" },
    { s:11, l:"50%", d:".5s",  t:"5s"   },
    { s:7,  l:"26%", d:"1.9s", t:"4.3s" },
    { s:9,  l:"64%", d:".2s",  t:"3.9s" },
  ].slice(0, n)
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {B.map((b,i)=>(
        <div key={i} className="absolute bottom-3 rounded-full"
          style={{ width:b.s, height:b.s, left:b.l,
            background:"radial-gradient(circle at 35% 35%,rgba(255,255,255,.8),rgba(125,211,252,.15))",
            border:"1px solid rgba(125,211,252,.3)",
            animation:`bubbleRise ${b.t} ${b.d} ease-in infinite` }}/>
      ))}
    </div>
  )
}

// Simplified, very-cute jellyfish
function Jelly({ bellColor="#BAE6FD", glowColor="#38BDF8", accessory="🎀", size=1, float=false }:{
  bellColor?:string; glowColor?:string; accessory?:string; size?:number; float?:boolean
}) {
  const s=(n:number)=>Math.round(n*size)
  return (
    <div className="relative select-none inline-block"
      style={{ width:s(72), height:s(90), animation:float?"jellyFloat 2.8s ease-in-out infinite":undefined }}>
      {/* glow */}
      <div className="absolute rounded-full pointer-events-none"
        style={{ width:s(72), height:s(40), top:s(8),
          background:`radial-gradient(ellipse,${glowColor}40 0%,transparent 70%)`,
          filter:`blur(${s(6)}px)` }}/>
      {/* dome */}
      <div style={{ position:"absolute", width:s(64), height:s(48), left:s(4), top:s(8),
        backgroundColor:bellColor,
        borderRadius:"50% 50% 44% 44% / 62% 62% 38% 38%",
        boxShadow:`0 ${s(3)}px ${s(12)}px ${glowColor}44` }}/>
      {/* shine */}
      <div style={{ position:"absolute", width:s(34), height:s(19), left:s(16), top:s(14),
        background:"rgba(255,255,255,.46)", borderRadius:"50%", transform:"rotate(-15deg)" }}/>
      {/* eyes */}
      {[s(14),s(38)].map((lx,i)=>(
        <div key={i}>
          <div className="absolute rounded-full" style={{ width:s(11),height:s(12),top:s(30),left:lx,backgroundColor:"#0C4A6E" }}/>
          <div className="absolute rounded-full bg-white" style={{ width:s(4),height:s(4),top:s(32),left:lx+s(2) }}/>
        </div>
      ))}
      {/* blush */}
      <div className="absolute rounded-full" style={{ width:s(11),height:s(5),top:s(42),left:s(8),  background:"rgba(251,113,133,.38)" }}/>
      <div className="absolute rounded-full" style={{ width:s(11),height:s(5),top:s(42),left:s(45), background:"rgba(251,113,133,.38)" }}/>
      {/* smile */}
      <div style={{ position:"absolute", width:s(16),height:s(7),top:s(46),left:`calc(50% - ${s(8)}px)`,
        borderBottom:`${Math.max(2,s(2.2))}px solid #0C4A6E`, borderRadius:"0 0 50% 50%" }}/>
      {/* tentacles */}
      {[0,1,2,3,4].map(i=>(
        <div key={i} style={{ position:"absolute", width:s(6),height:s(22),
          left:s(8)+(s(48)/4)*i, top:s(52), backgroundColor:bellColor, borderRadius:s(3),
          opacity:.86, transformOrigin:"top center",
          animation:`tentSway ${1.9+i*.25}s ${i*.22}s ease-in-out infinite`,
          boxShadow:`0 0 ${s(5)}px ${glowColor}44` }}/>
      ))}
      {/* accessory */}
      <div style={{ position:"absolute",top:s(-4),left:"50%",transform:"translateX(-50%)",fontSize:s(17),lineHeight:1 }}>
        {accessory}
      </div>
    </div>
  )
}

// Primary CTA button
function PrimaryBtn({ children, onClick, type="button", disabled, small }:{
  children:ReactNode; onClick?:()=>void; type?:"button"|"submit"; disabled?:boolean; small?:boolean
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-bold rounded-2xl text-white transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${small ? "px-4 py-2 text-sm" : "w-full px-6 py-3.5 text-base"}`}
      style={{ background:GRAD, boxShadow:"0 4px 16px rgba(14,165,233,.28)", fontFamily:"'Nunito',sans-serif" }}>
      {children}
    </button>
  )
}

// Ghost / secondary button
function GhostBtn({ children, onClick, active }:{
  children:ReactNode; onClick?:()=>void; active?:boolean
}) {
  return (
    <button onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-bold rounded-2xl border-2 transition-all active:scale-95"
      style={active
        ? { background:GRAD, color:"#fff", borderColor:"transparent", fontFamily:"'Nunito',sans-serif" }
        : { background:"#fff", color:C.ocean, borderColor:C.border, fontFamily:"'Nunito',sans-serif" }}>
      {children}
    </button>
  )
}

// Form field
function Field({ label, type, value, onChange, placeholder }:{
  label:string; type:string; value:string; onChange:(v:string)=>void; placeholder:string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-bold" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-2xl text-sm focus:outline-none transition-all"
        style={{ background:"#F0FBFF", border:`2px solid ${C.border}`, color:C.deep, fontFamily:"'Nunito',sans-serif" }}
        onFocus={e=>{ e.currentTarget.style.borderColor=C.ocean; e.currentTarget.style.boxShadow="0 0 0 3px rgba(14,165,233,.1)" }}
        onBlur={e=> { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.boxShadow="none" }}/>
    </div>
  )
}

// Section card
function Card({ children, className="" }:{ children:ReactNode; className?:string }) {
  return (
    <div className={`rounded-3xl border ${className}`}
      style={{ background:C.card, borderColor:C.border, boxShadow:"0 2px 16px rgba(14,165,233,.07)", backdropFilter:"blur(8px)" }}>
      {children}
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ page, nav, loggedIn }:{ page:Page; nav:(p:Page)=>void; loggedIn:boolean }) {
  const tabs = [
    { key:"goal-manage", icon:<Target size={15}/>,  label:"목표" },
    { key:"social",      icon:<Users  size={15}/>,  label:"소셜 방" },
    { key:"profile",     icon:<User   size={15}/>,  label:"프로필" },
  ]
  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-14 flex items-center px-4"
      style={{ background:"rgba(255,255,255,.85)", backdropFilter:"blur(14px)", borderBottom:`1px solid ${C.border}` }}>
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
        <button onClick={()=>nav(loggedIn?"goal-manage":"login")} className="flex items-center gap-2">
          <span style={{ fontSize:20, display:"inline-block", animation:"jellyFloat 3s ease-in-out infinite" }}>🪼</span>
          <span className="text-base font-extrabold" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>투둥실</span>
        </button>

        {loggedIn && (
          <div className="flex items-center bg-sky-50/80 rounded-2xl p-1 gap-0.5">
            {tabs.map(t=>(
              <button key={t.key} onClick={()=>nav(t.key as Page)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all"
                style={page===t.key
                  ? { background:GRAD, color:"#fff", fontFamily:"'Nunito',sans-serif", boxShadow:"0 2px 8px rgba(14,165,233,.25)" }
                  : { color:C.muted, fontFamily:"'Nunito',sans-serif" }}>
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
function AuthWrap({ children }:{ children:ReactNode }) {
  return (
    <div className="min-h-screen pt-14 flex items-center justify-center px-4 relative" style={{ background:PAGE_BG }}>
      <Bubbles n={5}/>
      <div className="w-full max-w-[380px] relative z-10" style={{ animation:"fadeInUp .4s ease-out" }}>
        {children}
      </div>
    </div>
  )
}

function LoginPage({ nav, setLoggedIn }:{ nav:(p:Page)=>void; setLoggedIn:(v:boolean)=>void }) {
  const [email,setEmail]=useState("")
  const [pw,setPw]=useState("")
  return (
    <AuthWrap>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3"><Jelly bellColor="#BAE6FD" glowColor="#38BDF8" accessory="🎀" size={1.1} float/></div>
        <h1 className="text-2xl font-extrabold mb-1" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>다시 오셨군요! 🌊</h1>
        <p className="text-sm" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>오늘도 목표를 향해 둥실둥실~</p>
      </div>
      <Card className="p-6">
        <form onSubmit={e=>{e.preventDefault();setLoggedIn(true);nav("goal-manage")}} className="space-y-4">
          <Field label="이메일"   type="email"    value={email} onChange={setEmail} placeholder="example@email.com"/>
          <Field label="비밀번호" type="password" value={pw}    onChange={setPw}    placeholder="비밀번호 입력"/>
          <div className="pt-1"><PrimaryBtn type="submit"><LogIn size={16}/>로그인</PrimaryBtn></div>
        </form>
        <p className="mt-5 pt-4 border-t text-center text-sm" style={{ borderColor:C.border, color:C.muted, fontFamily:"'Nunito',sans-serif" }}>
          계정이 없으신가요?{" "}
          <button onClick={()=>nav("signup")} className="font-extrabold" style={{ color:C.ocean }}>회원가입</button>
        </p>
      </Card>
    </AuthWrap>
  )
}

function SignupPage({ nav, setLoggedIn }:{ nav:(p:Page)=>void; setLoggedIn:(v:boolean)=>void }) {
  const [name,setName]=useState("")
  const [email,setEmail]=useState("")
  const [pw,setPw]=useState("")
  return (
    <AuthWrap>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3"><Jelly bellColor="#C4B5FD" glowColor="#A78BFA" accessory="🌸" size={1.1} float/></div>
        <h1 className="text-2xl font-extrabold mb-1" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>함께 헤엄쳐봐요! 🪼</h1>
        <p className="text-sm" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>가입하고 첫 목표를 세워봐요</p>
      </div>
      <Card className="p-6">
        <form onSubmit={e=>{e.preventDefault();setLoggedIn(true);nav("goal-manage")}} className="space-y-4">
          <Field label="이름"     type="text"     value={name}  onChange={setName}  placeholder="이름 입력"/>
          <Field label="이메일"   type="email"    value={email} onChange={setEmail} placeholder="example@email.com"/>
          <Field label="비밀번호" type="password" value={pw}    onChange={setPw}    placeholder="8자 이상"/>
          <div className="pt-1"><PrimaryBtn type="submit"><UserPlus size={16}/>회원가입</PrimaryBtn></div>
        </form>
        <p className="mt-5 pt-4 border-t text-center text-sm" style={{ borderColor:C.border, color:C.muted, fontFamily:"'Nunito',sans-serif" }}>
          이미 계정이 있으신가요?{" "}
          <button onClick={()=>nav("login")} className="font-extrabold" style={{ color:C.ocean }}>로그인</button>
        </p>
      </Card>
    </AuthWrap>
  )
}

// ─── Goal Setting ─────────────────────────────────────────────────────────────
function GoalSettingPage({ nav }:{ nav:(p:Page)=>void }) {
  const [goal,setGoal]=useState("")
  const [ai,setAi]=useState<AIState>("idle")
  const [step,setStep]=useState(0)
  const STEPS=["목표 분석 중...","세부 목표 생성 중...","할 일 목록 구성 중...","마무리 중..."]
  const EXAMPLES=["토익 900점 달성","3개월 안에 5kg 감량","개발자로 취업하기","매일 책 30분 읽기"]

  const run=()=>{
    if(!goal.trim())return
    setAi("analyzing")
    STEPS.forEach((_,i)=>setTimeout(()=>setStep(i),i*900))
    setTimeout(()=>{setAi("done");setTimeout(()=>nav("goal-manage"),600)},4200)
  }

  return (
    <div className="min-h-screen pt-14 flex items-center justify-center px-4 relative" style={{ background:PAGE_BG }}>
      <Bubbles n={5}/>
      <div className="w-full max-w-md relative z-10" style={{ animation:"fadeInUp .4s ease-out" }}>
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3"><Jelly bellColor="#BAE6FD" glowColor="#38BDF8" accessory="✏️" size={1} float/></div>
          <h1 className="text-2xl font-extrabold mb-1" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>어떤 목표를 이루고 싶어요?</h1>
          <p className="text-sm" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>막연해도 괜찮아요 — AI 해파리가 도와줄게요 🪼</p>
        </div>

        {ai==="idle"&&(
          <Card className="p-6">
            <textarea value={goal} onChange={e=>setGoal(e.target.value)} rows={3}
              placeholder="예: 6개월 안에 토익 900점 달성하고 싶어요"
              className="w-full px-4 py-3 rounded-2xl text-sm resize-none focus:outline-none leading-relaxed mb-4"
              style={{ background:"#F0FBFF", border:`2px solid ${C.border}`, color:C.deep, fontFamily:"'Nunito',sans-serif" }}
              onFocus={e=>e.currentTarget.style.borderColor=C.ocean}
              onBlur={e=> e.currentTarget.style.borderColor=C.border}/>
            <div className="mb-5">
              <p className="text-xs font-bold mb-2" style={{ color:C.subtle, fontFamily:"'Nunito',sans-serif" }}>추천 예시</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map(ex=>(
                  <button key={ex} onClick={()=>setGoal(ex)}
                    className="px-3 py-1.5 text-xs font-bold rounded-full transition-all hover:scale-105"
                    style={{ background:"#E0F7FF", color:C.ocean, border:`1.5px solid ${C.border}`, fontFamily:"'Nunito',sans-serif" }}>
                    {ex}
                  </button>
                ))}
              </div>
            </div>
            <PrimaryBtn onClick={run} disabled={!goal.trim()}><Sparkles size={15}/>AI 해파리한테 부탁하기</PrimaryBtn>
          </Card>
        )}

        {ai==="analyzing"&&(
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-4"><Jelly bellColor="#BAE6FD" glowColor="#38BDF8" accessory="🤖" size={.9} float/></div>
            <p className="text-xs mb-1" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>분석 중</p>
            <p className="text-base font-bold mb-6" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>"{goal}"</p>
            <div className="space-y-3 text-left max-w-xs mx-auto">
              {STEPS.map((s,i)=>(
                <div key={i} className="flex items-center gap-3 text-sm"
                  style={{ color:i<=step?C.deep:C.border, fontFamily:"'Nunito',sans-serif" }}>
                  {i<step  ? <CheckCircle2 size={16} className="shrink-0 text-teal-400"/>
                   :i===step? <div className="w-4 h-4 rounded-full border-2 border-sky-400 border-t-transparent animate-spin shrink-0"/>
                   :          <div className="w-4 h-4 rounded-full border-2 shrink-0" style={{ borderColor:C.border }}/>}
                  <span className={i<=step?"font-semibold":""}>{s}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {ai==="done"&&(
          <Card className="p-12 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <p className="text-lg font-extrabold" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>완성됐어요!</p>
          </Card>
        )}
      </div>
    </div>
  )
}

// ─── Goal Manage ──────────────────────────────────────────────────────────────
function GoalManagePage({ nav, selColor, setSelColor, selAcc, setSelAcc }:{
  nav:(p:Page)=>void
  selColor:number; setSelColor:(n:number)=>void
  selAcc:number;   setSelAcc:(n:number)=>void
}) {
  const [todos,   setTodos]   = useState<TodoItem[]>(INITIAL_TODOS)
  const [open,    setOpen]    = useState<Set<number>>(new Set([0,1]))
  const [newText, setNewText] = useState<Record<number,string>>({})
  const [adding,  setAdding]  = useState<number|null>(null)
  const [edit,    setEdit]    = useState(false)

  const toggle=(id:number)=>setOpen(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n})
  const check =(id:number)=>setTodos(p=>p.map(t=>t.id===id?{...t,done:!t.done}:t))
  const del   =(id:number)=>setTodos(p=>p.filter(t=>t.id!==id))
  const add=(sgId:number)=>{
    const text=(newText[sgId]||"").trim(); if(!text)return
    setTodos(p=>[...p,{id:Date.now(),text,done:false,subGoalId:sgId}])
    setNewText(p=>({...p,[sgId]:""})); setAdding(null)
  }

  const done=todos.filter(t=>t.done).length
  const pct =todos.length?Math.round((done/todos.length)*100):0
  const jelly=JELLY_COLORS[selColor]

  return (
    <div className="min-h-screen pt-14" style={{ background:PAGE_BG }}>
      {/* ── Character + Goal card ── */}
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-0">
        <Card className="p-5 mb-4">
          {/* Row: jellyfish + info */}
          <div className="flex items-center gap-5 mb-4">
            <div className="shrink-0 flex items-center justify-center"
              style={{ width:96, height:108, background:`radial-gradient(circle,${jelly.glow}22,transparent 70%)`, borderRadius:"50%" }}>
              <Jelly bellColor={jelly.bell} glowColor={jelly.glow} accessory={ACCESSORIES[selAcc]} size={1.25} float/>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-[11px] font-semibold mb-0.5" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>이다온의 해파리 🪼</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold" style={{ color:C.ocean, fontFamily:"'Nunito',sans-serif" }}>Lv. 7</span>
                    <div className="w-28 h-2 rounded-full overflow-hidden" style={{ background:"#E0F7FF" }}>
                      <div className="h-full rounded-full" style={{ width:"80%", background:GRAD }}/>
                    </div>
                    <span className="text-[11px]" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>240/300</span>
                  </div>
                </div>
                <button onClick={()=>setEdit(v=>!v)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border-2 transition-all"
                  style={edit
                    ? { background:GRAD, color:"#fff", borderColor:"transparent", fontFamily:"'Nunito',sans-serif" }
                    : { background:"#F0FBFF", color:C.ocean, borderColor:C.border, fontFamily:"'Nunito',sans-serif" }}>
                  <Pencil size={11}/>{edit?"완료":"꾸미기"}
                </button>
              </div>

              {edit&&(
                <div className="mt-3 pt-3 border-t" style={{ borderColor:C.border }}>
                  <p className="text-[10px] font-bold mb-1.5" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>색깔</p>
                  <div className="flex gap-1.5 mb-3 flex-wrap">
                    {JELLY_COLORS.map((j,i)=>(
                      <button key={i} onClick={()=>setSelColor(i)} className="rounded-lg transition-all"
                        style={{ width:24, height:24, backgroundColor:j.bell,
                          border:selColor===i?`3px solid ${j.glow}`:"3px solid transparent",
                          transform:selColor===i?"scale(1.2)":undefined,
                          boxShadow:selColor===i?`0 2px 8px ${j.glow}55`:undefined }}/>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold mb-1.5" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>악세사리</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {ACCESSORIES.map((a,i)=>(
                      <button key={i} onClick={()=>setSelAcc(i)} className="rounded-lg text-sm flex items-center justify-center transition-all"
                        style={{ width:30, height:30, background:selAcc===i?"#E0F7FF":"#F8FBFF",
                          border:selAcc===i?"2px solid #0EA5E9":`2px solid ${C.border}`,
                          transform:selAcc===i?"scale(1.12)":undefined }}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t mb-4" style={{ borderColor:C.border }}/>

          {/* Goal + progress */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold mb-1 flex items-center gap-1" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>
                <Target size={11}/> 현재 목표
              </p>
              <h2 className="text-xl font-extrabold leading-snug mb-2" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>
                🎯 토익 900점 달성
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background:"#E0F7FF" }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width:`${pct}%`, background:GRAD }}/>
                </div>
                <span className="text-sm font-extrabold shrink-0" style={{ color:C.ocean, fontFamily:"'Nunito',sans-serif" }}>
                  {done}/{todos.length} · {pct}%
                </span>
              </div>
            </div>
            <button onClick={()=>nav("goal-setting")}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold rounded-2xl border-2 transition-all"
              style={{ background:"#F0FBFF", color:C.ocean, borderColor:C.border, fontFamily:"'Nunito',sans-serif" }}>
              <Plus size={13}/>변경
            </button>
          </div>
        </Card>

        {/* ── Sub-goals todo list ── */}
        <div className="space-y-2 pb-12">
          {SUB_GOALS.map(sg=>{
            const items=todos.filter(t=>t.subGoalId===sg.id)
            const doneCount=items.filter(t=>t.done).length
            const isOpen=open.has(sg.id)
            const isAdd=adding===sg.id
            return (
              <Card key={sg.id} className="overflow-hidden">
                {/* Header row */}
                <button onClick={()=>toggle(sg.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-sky-50/40 transition-colors text-left">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor:sg.color }}/>
                  <span className="font-bold flex-1 text-sm" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>{sg.title}</span>
                  {/* mini progress pills */}
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({length:Math.max(items.length,1)}).map((_,i)=>(
                        <div key={i} className="w-1.5 h-4 rounded-full" style={{ backgroundColor:i<doneCount?sg.color:"#E0F7FF" }}/>
                      ))}
                    </div>
                    <span className="text-xs font-bold w-10 text-right" style={{ color:sg.color, fontFamily:"'Nunito',sans-serif" }}>{doneCount}/{items.length}</span>
                  </div>
                  {isOpen
                    ? <ChevronDown size={15} style={{ color:C.subtle, flexShrink:0 }}/>
                    : <ChevronRight size={15} style={{ color:C.subtle, flexShrink:0 }}/>}
                </button>

                {/* Todo items */}
                {isOpen&&(
                  <div className="border-t px-3 pt-2 pb-2" style={{ borderColor:C.border }}>
                    {items.length===0&&!isAdd&&(
                      <p className="text-xs px-2 py-2 text-center" style={{ color:C.subtle, fontFamily:"'Nunito',sans-serif" }}>
                        아직 할 일이 없어요 · 아래 버튼으로 추가해보세요
                      </p>
                    )}
                    {items.map(todo=>(
                      <div key={todo.id} className="flex items-center gap-3 px-2 py-2 rounded-xl group hover:bg-sky-50/50 transition-colors">
                        <button onClick={()=>check(todo.id)}
                          className="w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all"
                          style={todo.done
                            ? { background:sg.color, borderColor:sg.color }
                            : { borderColor:C.subtle }}>
                          {todo.done&&<Check size={10} className="text-white" strokeWidth={3}/>}
                        </button>
                        <span className={`text-sm flex-1 ${todo.done?"line-through":""}`}
                          style={{ color:todo.done?C.subtle:C.deep, fontFamily:"'Nunito',sans-serif", fontWeight:todo.done?400:600 }}>
                          {todo.text}
                        </span>
                        <button onClick={()=>del(todo.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 transition-all text-red-300">
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    ))}

                    {isAdd?(
                      <div className="flex items-center gap-2 px-2 py-2">
                        <div className="w-5 h-5 rounded-lg border-2 border-dashed shrink-0" style={{ borderColor:sg.color+"66" }}/>
                        <input autoFocus type="text" value={newText[sg.id]||""}
                          onChange={e=>setNewText(p=>({...p,[sg.id]:e.target.value}))}
                          onKeyDown={e=>{if(e.key==="Enter")add(sg.id);if(e.key==="Escape")setAdding(null)}}
                          placeholder="할 일 입력 후 Enter"
                          className="flex-1 text-sm bg-transparent outline-none"
                          style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}/>
                        <button onClick={()=>add(sg.id)}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl text-white"
                          style={{ background:sg.color, fontFamily:"'Nunito',sans-serif" }}>추가</button>
                        <button onClick={()=>setAdding(null)} className="text-xs font-bold" style={{ color:C.muted }}>취소</button>
                      </div>
                    ):(
                      <button onClick={()=>setAdding(sg.id)}
                        className="flex items-center gap-1.5 w-full px-2 py-2 text-xs font-bold rounded-xl hover:bg-sky-50 transition-colors"
                        style={{ color:sg.color, fontFamily:"'Nunito',sans-serif" }}>
                        <Plus size={13}/>할 일 추가
                      </button>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Social ───────────────────────────────────────────────────────────────────
function SocialPage() {
  const [rooms,      setRooms]      = useState<SocialRoom[]>(INITIAL_ROOMS)
  const [liked,      setLiked]      = useState<Set<number>>(new Set())
  const [joined,     setJoined]     = useState<Set<number>>(new Set())
  const [filter,     setFilter]     = useState<"all"|"active">("all")
  const [showCreate, setShowCreate] = useState(false)

  const [newName,    setNewName]    = useState("")
  const [newGoal,    setNewGoal]    = useState("")
  const [newEmoji,   setNewEmoji]   = useState("🎯")
  const [newMax,     setNewMax]     = useState(10)
  const [newPrivate, setNewPrivate] = useState(false)

  const list = filter==="active"?rooms.filter(r=>r.active):rooms

  const create=()=>{
    if(!newName.trim()||!newGoal.trim())return
    const r:SocialRoom={ id:Date.now(), name:newName.trim(), goal:newGoal.trim(),
      members:1, progress:0, emoji:newEmoji, likes:0, active:true }
    setRooms(p=>[r,...p]); setJoined(p=>new Set([...p,r.id]))
    setNewName(""); setNewGoal(""); setNewEmoji("🎯"); setNewMax(10); setNewPrivate(false)
    setShowCreate(false)
  }

  const toggleJoin=(id:number)=>{
    setJoined(p=>{
      const n=new Set(p)
      if(n.has(id)){n.delete(id);setRooms(r=>r.map(x=>x.id===id?{...x,members:Math.max(0,x.members-1)}:x))}
      else         {n.add(id);   setRooms(r=>r.map(x=>x.id===id?{...x,members:x.members+1}:x))}
      return n
    })
  }

  return (
    <div className="min-h-screen pt-14" style={{ background:PAGE_BG }}>
      {/* Create room modal */}
      {showCreate&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background:"rgba(12,74,110,.25)", backdropFilter:"blur(6px)" }}
          onClick={()=>setShowCreate(false)}>
          <div className="w-full max-w-md rounded-3xl p-6" onClick={e=>e.stopPropagation()}
            style={{ background:"#fff", boxShadow:"0 24px 80px rgba(14,165,233,.18)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>새 소셜 방 만들기 🌊</h3>
              <button onClick={()=>setShowCreate(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-sky-50 transition-colors"
                style={{ color:C.muted }}><X size={16}/></button>
            </div>

            <p className="text-xs font-bold mb-2" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>이모지</p>
            <div className="grid grid-cols-6 gap-2 mb-4">
              {ROOM_EMOJIS.map(em=>(
                <button key={em} onClick={()=>setNewEmoji(em)}
                  className="aspect-square rounded-xl text-xl flex items-center justify-center transition-all"
                  style={{ background:newEmoji===em?"#E0F7FF":"#F8FAFC",
                    border:newEmoji===em?"2px solid #0EA5E9":"2px solid transparent",
                    transform:newEmoji===em?"scale(1.1)":undefined }}>
                  {em}
                </button>
              ))}
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>방 이름 *</label>
                <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="예: 토익 900점 스터디"
                  className="w-full px-4 py-2.5 rounded-2xl text-sm focus:outline-none"
                  style={{ background:"#F0FBFF", border:`2px solid ${C.border}`, color:C.deep, fontFamily:"'Nunito',sans-serif" }}
                  onFocus={e=>e.currentTarget.style.borderColor=C.ocean}
                  onBlur={e=> e.currentTarget.style.borderColor=C.border}/>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>목표 *</label>
                <input value={newGoal} onChange={e=>setNewGoal(e.target.value)} placeholder="예: 3개월 안에 목표 달성"
                  className="w-full px-4 py-2.5 rounded-2xl text-sm focus:outline-none"
                  style={{ background:"#F0FBFF", border:`2px solid ${C.border}`, color:C.deep, fontFamily:"'Nunito',sans-serif" }}
                  onFocus={e=>e.currentTarget.style.borderColor=C.ocean}
                  onBlur={e=> e.currentTarget.style.borderColor=C.border}/>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold mb-1.5" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>최대 인원</label>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>setNewMax(m=>Math.max(2,m-1))}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold hover:bg-sky-50 transition-colors"
                      style={{ color:C.ocean, border:`2px solid ${C.border}` }}>−</button>
                    <span className="w-8 text-center text-sm font-extrabold" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>{newMax}</span>
                    <button onClick={()=>setNewMax(m=>Math.min(50,m+1))}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold hover:bg-sky-50 transition-colors"
                      style={{ color:C.ocean, border:`2px solid ${C.border}` }}>+</button>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold mb-1.5" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>공개 여부</label>
                  <button onClick={()=>setNewPrivate(v=>!v)}
                    className="w-full py-2 rounded-2xl text-xs font-bold border-2 transition-all"
                    style={newPrivate
                      ? { background:"#FEF3C7", color:"#B45309", borderColor:"#FDE68A", fontFamily:"'Nunito',sans-serif" }
                      : { background:"#E0F7FF", color:C.ocean, borderColor:C.border, fontFamily:"'Nunito',sans-serif" }}>
                    {newPrivate?"🔒 비공개":"🌊 공개"}
                  </button>
                </div>
              </div>
            </div>
            <PrimaryBtn onClick={create} disabled={!newName.trim()||!newGoal.trim()}>
              <Plus size={16}/>방 만들기
            </PrimaryBtn>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-7">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>소셜 방 🌊</h1>
            <p className="text-sm mt-0.5" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>같이 헤엄치는 친구들을 만나봐요</p>
          </div>
          <PrimaryBtn small onClick={()=>setShowCreate(true)}><Plus size={14}/>방 만들기</PrimaryBtn>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5">
          {[{key:"all",label:"전체"},{key:"active",label:"활성 방 🪼"}].map(f=>(
            <GhostBtn key={f.key} active={filter===f.key} onClick={()=>setFilter(f.key as "all"|"active")}>
              {f.label}
            </GhostBtn>
          ))}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map(room=>{
            const isJoined=joined.has(room.id)
            const isLiked=liked.has(room.id)
            return (
              <Card key={room.id} className="p-5 hover:-translate-y-1 transition-all cursor-default">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background:"#E0F7FF" }}>
                    {room.emoji}
                  </div>
                  {room.active&&(
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background:"#CCFBF1", color:"#0D9488", fontFamily:"'Nunito',sans-serif" }}>
                      활성
                    </span>
                  )}
                </div>
                <h3 className="font-extrabold mb-1 text-base leading-tight" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>{room.name}</h3>
                <p className="text-xs mb-4 leading-relaxed" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>{room.goal}</p>

                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>진행률</span>
                    <span className="font-bold" style={{ color:C.ocean, fontFamily:"'Nunito',sans-serif" }}>{room.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background:"#E0F7FF" }}>
                    <div className="h-full rounded-full" style={{ width:`${room.progress}%`, background:GRAD }}/>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor:C.border }}>
                  <span className="text-xs font-semibold flex items-center gap-1" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>
                    <Users size={12}/>{room.members}명
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={()=>setLiked(p=>{const n=new Set(p);n.has(room.id)?n.delete(room.id):n.add(room.id);return n})}
                      className={`flex items-center gap-1 text-xs font-semibold transition-colors ${isLiked?"text-pink-400":"text-sky-200 hover:text-pink-300"}`}>
                      <Heart size={13} fill={isLiked?"currentColor":"none"}/>{room.likes+(isLiked?1:0)}
                    </button>
                    <button onClick={()=>toggleJoin(room.id)}
                      className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95"
                      style={isJoined
                        ? { background:"#E0F7FF", color:C.ocean, border:`1.5px solid ${C.border}`, fontFamily:"'Nunito',sans-serif" }
                        : { background:GRAD, color:"#fff", fontFamily:"'Nunito',sans-serif" }}>
                      {isJoined?<><Check size={11}/>참여중</>:<><MessageCircle size={11}/>참여</>}
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}

          {/* Add card */}
          <button onClick={()=>setShowCreate(true)}
            className="rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-3 min-h-[220px] transition-all hover:border-sky-300 hover:bg-sky-50/30 group"
            style={{ borderColor:"#BAE6FD" }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm group-hover:shadow-md transition-all"
              style={{ border:`2px solid ${C.border}` }}>
              <Plus size={20} style={{ color:C.ocean }}/>
            </div>
            <p className="text-sm font-bold" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>새 방 만들기</p>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Profile ──────────────────────────────────────────────────────────────────
interface Photo { id:number; meColorIdx:number; meAcc:string; friendIdx:number; frame:string; date:string }

function ProfilePage({ selColor, setSelColor, selAcc, setSelAcc }:{
  selColor:number; setSelColor:(n:number)=>void
  selAcc:number;   setSelAcc:(n:number)=>void
}) {
  const [tab,       setTab]       = useState<"stat"|"photo">("stat")
  const [photoBooth,setPhotoBooth]= useState(false)
  const [selFriend, setSelFriend] = useState(0)
  const [selFrame,  setSelFrame]  = useState(0)
  const [flash,     setFlash]     = useState(false)
  const [photos,setPhotos]=useState<Photo[]>([
    { id:1, meColorIdx:0, meAcc:"🎀", friendIdx:0, frame:"🪼", date:"2026.06.28" },
    { id:2, meColorIdx:2, meAcc:"⭐", friendIdx:2, frame:"🌊", date:"2026.07.01" },
  ])
  const jelly=JELLY_COLORS[selColor]

  const takePhoto=()=>{
    setFlash(true)
    setTimeout(()=>{
      setPhotos(p=>[{ id:Date.now(), meColorIdx:selColor, meAcc:ACCESSORIES[selAcc],
        friendIdx:selFriend, frame:FRAMES[selFrame],
        date:new Date().toLocaleDateString("ko-KR").replace(/\. /g,"."),
      },...p])
      setFlash(false); setPhotoBooth(false)
    },400)
  }

  const stats=[
    { label:"달성한 목표", value:"3개",  icon:<Trophy size={18}/>, color:"#F59E0B", bg:"#FEF3C7" },
    { label:"연속 달성일", value:"12일", icon:<Flame  size={18}/>, color:"#EF4444", bg:"#FFE4E6" },
    { label:"완료한 할 일",value:"47개", icon:<Check  size={18}/>, color:"#10B981", bg:"#D1FAE5" },
    { label:"획득한 배지", value:"5개",  icon:<Star   size={18}/>, color:"#8B5CF6", bg:"#EDE9FE" },
  ]
  const badges=[
    { emoji:"🌱", name:"첫 목표",     desc:"첫 번째 목표 설정", locked:false },
    { emoji:"🔥", name:"7일 연속",    desc:"7일 연속 달성",     locked:false },
    { emoji:"🎯", name:"완벽한 하루", desc:"할 일 100% 완료",   locked:false },
    { emoji:"🪼", name:"소셜 스타",   desc:"첫 소셜 방 참여",   locked:false },
    { emoji:"⚡", name:"스피드 러너", desc:"달성 속도 상위 10%",locked:false },
    { emoji:"🔒", name:"???",         desc:"아직 잠긴 배지",    locked:true  },
  ]

  return (
    <div className="min-h-screen pt-14" style={{ background:PAGE_BG }}>
      {flash&&<div className="fixed inset-0 z-50 bg-white pointer-events-none" style={{ animation:"flash .5s ease-out forwards" }}/>}

      {/* Photo booth modal */}
      {photoBooth&&(
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4"
          style={{ background:"rgba(12,74,110,.28)", backdropFilter:"blur(6px)" }}
          onClick={()=>setPhotoBooth(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-lg" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>📸 사진 찍기</h3>
              <button onClick={()=>setPhotoBooth(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-sky-50 transition-colors"
                style={{ color:C.muted }}><X size={16}/></button>
            </div>
            {/* Viewfinder */}
            <div className="rounded-2xl mb-4 min-h-[170px] flex items-end justify-center gap-10 relative overflow-hidden"
              style={{ background:"linear-gradient(180deg,#E0F7FF,#F0F8FF)", border:`2px solid ${C.border}` }}>
              <Bubbles n={4}/>
              <div className="absolute top-2 left-2.5 text-2xl opacity-40">{FRAMES[selFrame]}</div>
              <div className="absolute top-2 right-2.5 text-2xl opacity-40">{FRAMES[selFrame]}</div>
              {[
                { jc:JELLY_COLORS[selColor], acc:ACCESSORIES[selAcc], name:"나" },
                { jc:{ bell:FRIEND_CHARS[selFriend].bellColor, glow:FRIEND_CHARS[selFriend].glowColor }, acc:"🌸", name:FRIEND_CHARS[selFriend].name },
              ].map((c,i)=>(
                <div key={i} className="text-center z-10 pb-3">
                  <Jelly bellColor={c.jc.bell} glowColor={c.jc.glow} accessory={c.acc} size={.82} float/>
                  <p className="text-[10px] font-bold mt-1" style={{ color:C.ocean, fontFamily:"'Nunito',sans-serif" }}>{c.name}</p>
                </div>
              ))}
            </div>
            <p className="text-xs font-bold mb-2" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>함께 찍을 친구</p>
            <div className="flex gap-1.5 mb-4">
              {FRIEND_CHARS.map((f,i)=>(
                <button key={i} onClick={()=>setSelFriend(i)} className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                  style={selFriend===i ? { background:GRAD, color:"#fff", fontFamily:"'Nunito',sans-serif" }
                    : { background:"#E0F7FF", color:C.ocean, fontFamily:"'Nunito',sans-serif" }}>
                  {f.name}
                </button>
              ))}
            </div>
            <p className="text-xs font-bold mb-2" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>프레임</p>
            <div className="flex gap-2 mb-5">
              {FRAMES.map((fr,i)=>(
                <button key={i} onClick={()=>setSelFrame(i)}
                  className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                  style={{ background:selFrame===i?"#E0F7FF":"#F8FAFC",
                    border:selFrame===i?"2px solid #0EA5E9":"2px solid transparent",
                    transform:selFrame===i?"scale(1.12)":undefined }}>
                  {fr}
                </button>
              ))}
            </div>
            <PrimaryBtn onClick={takePhoto}><Camera size={15}/>찰칵!</PrimaryBtn>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-7">
        <div className="grid lg:grid-cols-5 gap-5">
          {/* ── Left: character ── */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 text-center" style={{ background:`linear-gradient(180deg,${jelly.glow}12,rgba(255,255,255,.9) 55%)` }}>
              <div className="flex justify-center mb-3">
                <Jelly bellColor={jelly.bell} glowColor={jelly.glow} accessory={ACCESSORIES[selAcc]} size={1.3} float/>
              </div>
              <h2 className="text-xl font-extrabold mb-0.5" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>이다온</h2>
              <p className="text-xs mb-4" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>컴퓨터공학과 2학년 · Lv. 7</p>
              <div className="mb-5">
                <div className="flex justify-between text-xs mb-1.5" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>
                  <span>경험치</span><span>240 / 300</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background:"#E0F7FF" }}>
                  <div className="h-full rounded-full" style={{ width:"80%", background:GRAD }}/>
                </div>
              </div>
              <button onClick={()=>setPhotoBooth(true)}
                className="w-full py-2.5 text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{ background:GRAD, fontFamily:"'Nunito',sans-serif" }}>
                <Camera size={14}/>사진 찍기
              </button>
            </Card>

            {/* Customization */}
            <Card className="p-4">
              <p className="text-sm font-extrabold mb-3" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>꾸미기</p>
              <p className="text-xs font-bold mb-2" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>색깔</p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {JELLY_COLORS.map((j,i)=>(
                  <button key={i} onClick={()=>setSelColor(i)} className="aspect-square rounded-2xl transition-all group relative"
                    style={{ backgroundColor:j.bell,
                      border:selColor===i?`3px solid ${j.glow}`:"3px solid transparent",
                      transform:selColor===i?"scale(1.15)":undefined,
                      boxShadow:selColor===i?`0 4px 12px ${j.glow}55`:undefined }}>
                    {selColor===i&&<div className="absolute inset-0 flex items-center justify-center"><Check size={10} className="text-white" strokeWidth={3}/></div>}
                  </button>
                ))}
              </div>
              <p className="text-xs font-bold mb-2" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>악세사리</p>
              <div className="grid grid-cols-4 gap-2">
                {ACCESSORIES.map((a,i)=>(
                  <button key={i} onClick={()=>setSelAcc(i)} className="aspect-square rounded-xl text-xl flex items-center justify-center transition-all"
                    style={{ background:selAcc===i?"#E0F7FF":"#F8FAFC",
                      border:selAcc===i?"2px solid #0EA5E9":`2px solid ${C.border}`,
                      transform:selAcc===i?"scale(1.12)":undefined }}>
                    {a}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* ── Right ── */}
          <div className="lg:col-span-3 space-y-4">
            {/* Tabs */}
            <div className="flex p-1 rounded-2xl gap-1" style={{ background:"rgba(255,255,255,.7)", border:`1px solid ${C.border}` }}>
              {[{key:"stat",label:"통계 & 배지"},{key:"photo",label:"📸 사진첩"}].map(t=>(
                <button key={t.key} onClick={()=>setTab(t.key as "stat"|"photo")}
                  className="flex-1 py-2 text-sm font-bold rounded-xl transition-all"
                  style={tab===t.key
                    ? { background:GRAD, color:"#fff", fontFamily:"'Nunito',sans-serif", boxShadow:"0 2px 8px rgba(14,165,233,.25)" }
                    : { color:C.muted, fontFamily:"'Nunito',sans-serif" }}>
                  {t.label}
                </button>
              ))}
            </div>

            {tab==="stat"&&(
              <>
                <div className="grid grid-cols-2 gap-3">
                  {stats.map((s,i)=>(
                    <div key={i} className="rounded-3xl p-4" style={{ background:s.bg }}>
                      <div className="w-9 h-9 rounded-2xl flex items-center justify-center mb-2" style={{ background:"rgba(255,255,255,.6)", color:s.color }}>
                        {s.icon}
                      </div>
                      <p className="text-2xl font-extrabold" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>{s.value}</p>
                      <p className="text-xs font-semibold" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
                <Card className="p-5">
                  <p className="font-extrabold mb-4" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>획득한 배지</p>
                  <div className="grid grid-cols-3 gap-3">
                    {badges.map((b,i)=>(
                      <div key={i} className={`rounded-2xl p-3 text-center ${b.locked?"opacity-40":""}`}
                        style={{ background:b.locked?"#F8FAFC":"#EFF8FF",
                          border:b.locked?`2px dashed ${C.border}`:`2px solid ${C.border}` }}>
                        <div className="text-2xl mb-1.5">{b.emoji}</div>
                        <p className="text-xs font-extrabold mb-0.5" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>{b.name}</p>
                        <p className="text-[10px] leading-tight" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>{b.desc}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {tab==="photo"&&(
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-extrabold" style={{ color:C.deep, fontFamily:"'Nunito',sans-serif" }}>사진첩</p>
                  <PrimaryBtn small onClick={()=>setPhotoBooth(true)}><Camera size={13}/>새 사진</PrimaryBtn>
                </div>
                {photos.length===0?(
                  <div className="text-center py-12">
                    <div className="text-5xl mb-3">🪼</div>
                    <p className="text-sm font-bold" style={{ color:C.subtle, fontFamily:"'Nunito',sans-serif" }}>아직 사진이 없어요</p>
                    <p className="text-xs mt-1" style={{ color:C.subtle, fontFamily:"'Nunito',sans-serif" }}>친구 해파리랑 첫 사진을 찍어봐요!</p>
                  </div>
                ):(
                  <div className="grid grid-cols-2 gap-3">
                    {photos.map(p=>(
                      <div key={p.id} className="relative group rounded-2xl overflow-hidden"
                        style={{ background:"linear-gradient(180deg,#E0F7FF,#F0F8FF)", border:`2px solid ${C.border}` }}>
                        <div className="absolute top-2 left-2 text-lg opacity-35">{p.frame}</div>
                        <div className="absolute top-2 right-2 text-lg opacity-35">{p.frame}</div>
                        <div className="flex items-end justify-center gap-5 pt-6 pb-3 px-3">
                          {[
                            { jc:JELLY_COLORS[p.meColorIdx], acc:p.meAcc, name:"나" },
                            { jc:{ bell:FRIEND_CHARS[p.friendIdx].bellColor, glow:FRIEND_CHARS[p.friendIdx].glowColor }, acc:"🌸", name:FRIEND_CHARS[p.friendIdx].name },
                          ].map((c,i)=>(
                            <div key={i} className="text-center">
                              <Jelly bellColor={c.jc.bell} glowColor={c.jc.glow} accessory={c.acc} size={.62} float/>
                              <p className="text-[9px] font-bold mt-0.5" style={{ color:C.ocean, fontFamily:"'Nunito',sans-serif" }}>{c.name}</p>
                            </div>
                          ))}
                        </div>
                        <div className="text-center py-1.5 border-t" style={{ borderColor:C.border, background:"rgba(255,255,255,.6)" }}>
                          <p className="text-[10px] font-semibold" style={{ color:C.muted, fontFamily:"'Nunito',sans-serif" }}>{p.date}</p>
                        </div>
                        <button onClick={()=>setPhotos(ps=>ps.filter(x=>x.id!==p.id))}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-400 text-white text-xs items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex">
                          ✕
                        </button>
                      </div>
                    ))}
                    <button onClick={()=>setPhotoBooth(true)}
                      className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 min-h-[160px] transition-colors hover:bg-sky-50/30"
                      style={{ borderColor:C.border }}>
                      <Camera size={20} style={{ color:C.subtle }}/>
                      <p className="text-xs font-bold" style={{ color:C.subtle, fontFamily:"'Nunito',sans-serif" }}>새 사진 찍기</p>
                    </button>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page,     setPage]     = useState<Page>("login")
  const [loggedIn, setLoggedIn] = useState(false)
  const [selColor, setSelColor] = useState(0)
  const [selAcc,   setSelAcc]   = useState(0)

  const nav=(p:Page)=>{
    if(["goal-manage","social","profile"].includes(p)&&!loggedIn){ setPage("login"); return }
    setPage(p)
  }

  return (
    <div style={{ fontFamily:"'Noto Sans KR', sans-serif" }}>
      <style>{KF}</style>
      <Navbar page={page} nav={nav} loggedIn={loggedIn}/>
      {page==="login"        && <LoginPage        nav={nav} setLoggedIn={setLoggedIn}/>}
      {page==="signup"       && <SignupPage        nav={nav} setLoggedIn={setLoggedIn}/>}
      {page==="goal-setting" && <GoalSettingPage   nav={nav}/>}
      {page==="goal-manage"  && <GoalManagePage    nav={nav} selColor={selColor} setSelColor={setSelColor} selAcc={selAcc} setSelAcc={setSelAcc}/>}
      {page==="social"       && <SocialPage/>}
      {page==="profile"      && <ProfilePage       selColor={selColor} setSelColor={setSelColor} selAcc={selAcc} setSelAcc={setSelAcc}/>}
    </div>
  )
}
