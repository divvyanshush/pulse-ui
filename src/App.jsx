import { useState, useEffect, useRef, useCallback } from "react";

const API = "https://pulse-backend-production-cd92.up.railway.app";

const timeAgo = ts => {
  const s = Math.floor(Date.now()/1000 - ts);
  if(s<60)    return `${s}s`;
  if(s<3600)  return `${Math.floor(s/60)}m`;
  if(s<86400) return `${Math.floor(s/3600)}h`;
  return `${Math.floor(s/86400)}d`;
};

// Dark — neon accents
const TM_DARK = {
  model:    {label:"MODEL",    a:"rgba(0,255,136,.12)",  b:"rgba(0,255,136,.3)",  t:"#00ff88"},
  research: {label:"RESEARCH", a:"rgba(77,166,255,.12)", b:"rgba(77,166,255,.3)", t:"#4da6ff"},
  drama:    {label:"DRAMA",    a:"rgba(255,77,109,.12)", b:"rgba(255,77,109,.3)", t:"#ff4d6d"},
  funding:  {label:"FUNDING",  a:"rgba(255,215,0,.12)",  b:"rgba(255,215,0,.3)",  t:"#ffd700"},
  product:  {label:"PRODUCT",  a:"rgba(199,125,255,.12)",b:"rgba(199,125,255,.3)",t:"#c77dff"},
  policy:   {label:"POLICY",   a:"rgba(255,159,67,.12)", b:"rgba(255,159,67,.3)", t:"#ff9f43"},
};
// Light — darkened for contrast on pale bg
const TM_LIGHT = {
  model:    {label:"MODEL",    a:"rgba(0,130,65,.1)",    b:"rgba(0,130,65,.3)",   t:"#006e34"},
  research: {label:"RESEARCH", a:"rgba(20,90,190,.1)",   b:"rgba(20,90,190,.3)",  t:"#1450aa"},
  drama:    {label:"DRAMA",    a:"rgba(190,20,55,.1)",   b:"rgba(190,20,55,.3)",  t:"#be1437"},
  funding:  {label:"FUNDING",  a:"rgba(140,100,0,.1)",   b:"rgba(140,100,0,.3)",  t:"#7a5800"},
  product:  {label:"PRODUCT",  a:"rgba(110,40,190,.1)",  b:"rgba(110,40,190,.3)", t:"#5e20b8"},
  policy:   {label:"POLICY",   a:"rgba(185,85,0,.1)",    b:"rgba(185,85,0,.3)",   t:"#a04800"},
};
const TM = TM_DARK; // fallback reference
const getTM = (isDark) => isDark ? TM_DARK : TM_LIGHT;

const SRC_COLORS = {
  HN:"#ff6314", arXiv:"#e05555", "Dev.to":"#5b6df8",
  GitHub:"#9b72e8", "Lobste.rs":"#d44040", OpenAI:"#19c37d",
  Anthropic:"#d4845a", HuggingFace:"#ffb020", VentureBeat:"#3d8fe0",
  TechCrunch:"#2ab858", TheVerge:"#e84040", Wired:"#aaaaaa", MITReview:"#cc3333", SimonW:"#1a8cff", Interconnects:"#e06030", AINnews:"#cc2244", Microsoft:"#0078d4", GoogleResearch:"#4285f4", MetaAI:"#0668E1", TDS:"#1a8c6b", MarkTechPost:"#7b2ff7", TechTalks:"#2d6a9f", TheSequence:"#e05c00", AIWeekly:"#0a8a5c", LastWeekInAI:"#c0392b", ImportAI:"#8e44ad",
};

const FILTERS = ["all","model","research","drama","funding","product","policy","bookmarks"];

// ── Typography — rem-based ──
const FS = {
  xs:  "0.65rem",
  sm:  "0.75rem",
  base:"0.85rem",
  md:  "0.95rem",
  lg:  "1.05rem",
  xl:  "1.2rem",
};

// ── Theme palettes ──
const DARK = {
  text:    "#d8d8f0",
  sub:     "#8888aa",
  muted:   "#555570",
  faint:   "#333350",
  bg:      "#050507",
  surface: "#09090f",
  hover:   "#0d0d16",
  border:  "#111128",
  light:   false,
};
const LIGHT = {
  text:    "#1a1a2e",
  sub:     "#44445a",
  muted:   "#888899",
  faint:   "#ccccdd",
  bg:      "#f5f5f0",
  surface: "#ededea",
  hover:   "#e5e5e0",
  border:  "#d8d8d0",
  light:   true,
};

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

export default function Pulse() {
  const [items,         setItems]         = useState([]);
  const [pending,       setPending]       = useState([]);
  const [filter,        setFilter]        = useState("all");
  const [srcFilter,     setSrcFilter]     = useState(null);
  const [sortBy,        setSortBy]        = useState("latest");
  const [selectedIdx,   setSelectedIdx]   = useState(-1);
  const [query,         setQuery]         = useState("");
  const [detail,        setDetail]        = useState(null);
  const [showSidebar,   setShowSidebar]   = useState(false);
  const [showSrch,      setShowSrch]      = useState(false);
  const [status,        setStatus]        = useState("idle");
  const [errMsg,        setErrMsg]        = useState("");
  const [lastFetch,     setLastFetch]     = useState(null);
  const [bookmarks,     setBookmarks]     = useState({});
  const [readIds,       setReadIds]       = useState(()=>{ try{ return new Set(JSON.parse(localStorage.getItem("pulse-read")||"[]")); }catch(e){ return new Set(); } });
  const [toast,         setToast]         = useState(null);
  const [notifPerm,     setNotifPerm]     = useState(typeof Notification!=="undefined"?Notification.permission:"unsupported");
  const [showNotifPanel,setShowNotifPanel]= useState(false);
  const [alertLog,      setAlertLog]      = useState([]);
  const [isDark,        setIsDark]        = useState(true);

  const C = isDark ? DARK : LIGHT;

  const feedRef    = useRef(null);
  const srchRef    = useRef(null);
  const prevIds    = useRef(new Set());
  const toastTimer = useRef(null);
  const width      = useWindowWidth();
  const isMobile   = width < 768;

  // Close all panels when switching
  const closeAll = useCallback(()=>{
    setDetail(null); setShowSidebar(false); setShowNotifPanel(false);
  },[]);

  // ── Chime ──
  const playChime = useCallback((type="new") => {
    try {
      const ctx = new (window.AudioContext||window.webkitAudioContext)();
      const freqs = type==="hot" ? [523,659] : [659,784];
      freqs.forEach((freq,i) => {
        const osc=ctx.createOscillator(), gain=ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type="sine"; osc.frequency.value=freq;
        const t=ctx.currentTime+i*0.12;
        gain.gain.setValueAtTime(0,t);
        gain.gain.linearRampToValueAtTime(0.08,t+0.01);
        gain.gain.exponentialRampToValueAtTime(0.001,t+0.32);
        osc.start(t); osc.stop(t+0.32);
      });
    } catch(e){}
  },[]);

  // ── Toast ──
  const showToast = useCallback((title,body,type="new")=>{
    if(toastTimer.current) clearTimeout(toastTimer.current);
    setToast({title,body,type});
    setAlertLog(p=>[{title,body,type,ts:Date.now()},...p].slice(0,20));
    playChime(type);
    toastTimer.current=setTimeout(()=>setToast(null),5000);
  },[playChime]);

  // ── Push notif ──
  const pushNotif = useCallback((title,body)=>{
    if(typeof Notification==="undefined"||Notification.permission!=="granted") return;
    try{ new Notification(title,{body,icon:"/favicon.ico"}); }catch(e){}
  },[]);

  // ── Request permission ──
  const requestNotifPermission = useCallback(async()=>{
    if(typeof Notification==="undefined") return;
    const perm=await Notification.requestPermission();
    setNotifPerm(perm);
  },[]);

  const loadBookmarks = useCallback(async()=>{
    try{
      const res=await fetch(`${API}/bookmarks`);
      const data=await res.json();
      const map={};
      (data.bookmarks||[]).forEach(b=>{map[b.id]=b;});
      setBookmarks(map);
    }catch(e){}
  },[]);

  const toggleBookmark = useCallback((item,e)=>{
    e?.stopPropagation(); e?.preventDefault();
    const saved=!!bookmarks[item.id];
    if(saved){
      setBookmarks(b=>{const n={...b};delete n[item.id];return n;});
      fetch(`${API}/bookmarks/${encodeURIComponent(item.id)}`,{method:"DELETE"}).catch(()=>{});
    }else{
      setBookmarks(b=>({...b,[item.id]:{...item,bookmarkedAt:Date.now()}}));
      fetch(`${API}/bookmarks`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({item})}).catch(()=>{});
    }
  },[bookmarks]);

  const loadFeed = useCallback(async(isRefresh=false)=>{
    setStatus("loading");
    try{
      const res=await fetch(`${API}/feed`);
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data=await res.json();
      const enriched=data.items.map(i=>({...i,timeLabel:timeAgo(i.time)}));
      if(isRefresh&&prevIds.current.size>0){
        const novel=enriched.filter(i=>!prevIds.current.has(i.id));
        if(novel.length){
          setPending(p=>[...novel,...p]);
          const top=novel.sort((a,b)=>(b.heat||0)-(a.heat||0))[0];
          showToast(`${novel.length} new item${novel.length>1?"s":""}`,top.title,"new");
          pushNotif(`PULSE · ${novel.length} new`,top.title);
        }
        const trending=enriched.filter(i=>!prevIds.current.has(i.id)&&(i.heat||0)>=75);
        if(trending.length){
          const t=trending[0];
          showToast("Trending now",t.title,"hot");
          pushNotif("PULSE · Trending",t.title);
        }
      }else{
        setItems(enriched);
      }
      prevIds.current=new Set(enriched.map(i=>i.id));
      setLastFetch(Date.now());
      setStatus("ok");
    }catch(e){
      setStatus("err"); setErrMsg(e.message);
    }
  },[showToast,pushNotif]);

  useEffect(()=>{loadFeed(false);loadBookmarks();},[loadFeed,loadBookmarks]);
  useEffect(()=>{const id=setInterval(()=>loadFeed(true),90_000);return()=>clearInterval(id);},[loadFeed]);
  useEffect(()=>{const id=setInterval(()=>setItems(p=>p.map(i=>({...i,timeLabel:timeAgo(i.time)}))),30_000);return()=>clearInterval(id);},[]);

  const loadPending=useCallback(()=>{
    setItems(p=>{const m=new Map(p.map(x=>[x.id,x]));pending.forEach(x=>m.set(x.id,x));const a=[...m.values()];a.sort((a,b)=>b.time-a.time);return a;});
    setPending([]);feedRef.current?.scrollTo({top:0,behavior:"smooth"});
  },[pending]);


  const bookmarkList=Object.values(bookmarks).sort((a,b)=>(b.bookmarkedAt||0)-(a.bookmarkedAt||0));
  const visible=(filter==="bookmarks"?bookmarkList:items).filter(i=>{if(srcFilter&&i.src!==srcFilter) return false;
    if(filter!=="all"&&filter!=="bookmarks"&&i.type!==filter) return false;
    if(query){const q=query.toLowerCase();return i.title.toLowerCase().includes(q)||i.sum.toLowerCase().includes(q);}
    return true;
  });
  const sorted = sortBy==="latest" ? visible : sortBy==="trending" ? [...visible].sort((a,b)=>(b.heat||0)-(a.heat||0)) : [...visible].sort((a,b)=>(b.score||0)-(a.score||0));

  // ── Keyboard shortcuts ──
  useEffect(()=>{
    const handler = (e) => {
      if(e.target.tagName==="INPUT") return;
      switch(e.key){
        case "j":
        case "ArrowDown":
          e.preventDefault();
          setSelectedIdx(i=>Math.min(i+1, sorted.length-1));
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          setSelectedIdx(i=>Math.max(i-1, 0));
          break;
        case "Enter":
          if(selectedIdx>=0 && sorted[selectedIdx]) setDetail(sorted[selectedIdx]);
          break;
        case "Escape":
          setDetail(null); setShowSrch(false); setQuery(""); setShowNotifPanel(false);
          break;
        case "b":
          if(detail) toggleBookmark(detail);
          break;
        case "/":
          e.preventDefault();
          setShowSrch(true); setTimeout(()=>srchRef.current?.focus(),50);
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return ()=>window.removeEventListener("keydown", handler);
  },[sorted, selectedIdx, detail, toggleBookmark]);

  useEffect(()=>{
    if(selectedIdx>=0){
      const el=feedRef.current?.querySelector(`[data-selected="true"]`);
      el?.scrollIntoView({block:"nearest",behavior:"smooth"});
    }
  },[selectedIdx]);


  // On mobile: article detail OR notif panel takes full screen
  const mobileDetailOpen  = isMobile && detail && !showNotifPanel;
  const mobileNotifOpen   = isMobile && showNotifPanel;
  const bmCount=Object.keys(bookmarks).length;

  // ── Dynamic CSS depending on theme ──
  const skGrad = isDark
    ? "linear-gradient(90deg,#0c0c18 25%,#14142a 50%,#0c0c18 75%)"
    : "linear-gradient(90deg,#e2e2dc 25%,#d5d5cf 50%,#e2e2dc 75%)";

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",width:"100vw",maxWidth:"100vw",
      background:C.bg,color:C.text,fontFamily:"'IBM Plex Mono',monospace",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&display=swap');
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.15}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideRight{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}
        @keyframes slideLeft{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulseGlow{0%,100%{box-shadow:0 0 0 0 rgba(0,255,136,.3)}50%{box-shadow:0 0 0 5px rgba(0,255,136,0)}}
        @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
        @keyframes toastIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes rowIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
        html,body{overflow:hidden;margin:0;padding:0;height:100%}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${isDark?"#1e1e38":"#cccccc"};border-radius:2px}
        .sk{background:${skGrad};background-size:400px 100%;animation:shimmer 1.6s ease infinite}
        .row{transition:background .1s;cursor:pointer}
        .row:hover{background:${C.hover}!important}
        .fbtn{border:none;cursor:pointer;font-family:'IBM Plex Mono',monospace;white-space:nowrap;outline:none;background:none;transition:all .12s}
        .fbtn:focus{outline:none}
        .ibtn{background:none;border:none;cursor:pointer;outline:none;transition:all .12s;font-family:'IBM Plex Mono',monospace}
        .ibtn:focus{outline:none}
        .bm{outline:none!important;border:none;cursor:pointer;background:none;padding:4px;line-height:0;flex-shrink:0;transition:opacity .12s}
        .bm:focus{outline:none!important;box-shadow:none!important}
        .bm-off{color:${C.faint};opacity:0.55}
        .bm-off:hover{color:${C.muted};opacity:1}
        .bm-on{color:${C.text};opacity:1}
        .bm:active{opacity:.2}
        .open-link{transition:background .1s,border-color .1s;text-decoration:none}
        .open-link:hover{background:${C.hover}!important;border-color:${C.faint}!important}
        .topbtn{background:none;border:1px solid ${C.border};border-radius:4px;cursor:pointer;
          color:${C.muted};padding:7px;line-height:0;min-height:36px;min-width:36px;
          display:flex;align-items:center;justify-content:center;
          font-family:'IBM Plex Mono',monospace;outline:none;flex-shrink:0;
          transition:border-color .12s,color .12s}
        .topbtn:hover{border-color:${C.faint};color:${C.sub}}
        .topbtn:focus{outline:none}
      `}</style>

      {/* ══════════════ TOPBAR ══════════════ */}
      <div style={{display:"flex",alignItems:"center",height:50,minHeight:50,padding:"0 12px",
        borderBottom:`1px solid ${C.border}`,background:C.surface,gap:8,flexShrink:0,width:"100%"}}>

        {/* Back / Hamburger */}
        {mobileDetailOpen || mobileNotifOpen ? (
          <button className="topbtn" onClick={()=>{setDetail(null);setShowNotifPanel(false);}}>
            <svg width="14" height="11" viewBox="0 0 14 11" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <path d="M13 5.5H1M6 1L1 5.5L6 10"/>
            </svg>
          </button>
        ) : isMobile ? (
          <button className="topbtn" onClick={()=>setShowSidebar(s=>!s)}>
            <svg width="15" height="11" viewBox="0 0 15 11" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <line x1="0" y1="1" x2="15" y2="1"/><line x1="0" y1="5.5" x2="15" y2="5.5"/><line x1="0" y1="10" x2="15" y2="10"/>
            </svg>
          </button>
        ) : null}

        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:C.accent,
            boxShadow:isDark?`0 0 8px ${C.accent}`:"none",animation:"blink 2s ease infinite",flexShrink:0}}/>
          <span style={{fontSize:FS.sm,fontWeight:600,letterSpacing:"0.22em",color:C.text}}>PULSE</span>
        </div>

        {/* Desktop filters */}
        {!isMobile && (
          <div style={{display:"flex",gap:2,marginLeft:10,overflowX:"auto",
            scrollbarWidth:"none",flexShrink:1,minWidth:0}}>
            {FILTERS.map(f=>{
              const TML=getTM(isDark);
              const m=TML[f];const on=filter===f;const isBm=f==="bookmarks";
              return(
                <button key={f} className="fbtn" onClick={()=>{setFilter(f);setSrcFilter(null);}}
                  style={{padding:"5px 10px",borderRadius:3,flexShrink:0,fontSize:FS.xs,letterSpacing:"0.08em",
                    background:on?(isBm||f==="all"?`rgba(${isDark?"216,216,240":"26,26,46"},.08)`:m?.a):"transparent",
                    color:on?(isBm||f==="all"?C.text:m?.t):C.muted,
                    border:on?(isBm||f==="all"?`1px solid ${C.faint}`:`1px solid ${m?.b}`):"1px solid transparent"}}>
                  {isBm?`SAVED${bmCount>0?" "+bmCount:""}`:f.toUpperCase()}
                </button>
              );
            })}
          </div>
        )}

        <div style={{flex:1,minWidth:8}}/>

        {/* Search */}
        {!mobileDetailOpen && !mobileNotifOpen && (
          showSrch ? (
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"0 10px",height:34,
              background:C.bg,border:`1px solid ${C.faint}`,borderRadius:4,
              flex:isMobile?1:undefined,maxWidth:isMobile?"100%":220,minWidth:0}}>
              <input ref={srchRef} value={query} onChange={e=>setQuery(e.target.value)}
                placeholder="titles, summaries, sources…" autoFocus
                style={{background:"none",border:"none",outline:"none",color:C.text,
                  fontFamily:"inherit",fontSize:FS.sm,width:"100%",minWidth:0}}/>
              {query&&<span style={{fontSize:FS.xs,color:C.muted,flexShrink:0,whiteSpace:"nowrap"}}>{sorted.length}</span>}
              <button className="ibtn" onClick={()=>{setShowSrch(false);setQuery("");}}
                style={{color:C.muted,fontSize:FS.md,padding:0,flexShrink:0}}>✕</button>
            </div>
          ) : (
            <button className="topbtn" onClick={()=>{setShowSrch(true);setTimeout(()=>srchRef.current?.focus(),50);}}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <circle cx="5.5" cy="5.5" r="4.5"/><line x1="9" y1="9" x2="12" y2="12"/>
              </svg>
            </button>
          )
        )}

        {/* Refresh */}
        {!mobileDetailOpen && !mobileNotifOpen && (
          <button className="topbtn" onClick={()=>loadFeed(false)}>
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.5 6A4.5 4.5 0 1 1 8.2 2.2"/><polyline points="10.5 1 10.5 4 7.5 4"/>
            </svg>
          </button>
        )}

        {/* Bell */}
        {!mobileDetailOpen && !mobileNotifOpen && (
          <button className="topbtn" onClick={()=>setShowNotifPanel(p=>!p)}
            style={{position:"relative",
              borderColor:showNotifPanel?C.faint:C.border,
              color:showNotifPanel?C.sub:C.muted}}>
            <svg width="13" height="14" viewBox="0 0 14 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 1a1 1 0 0 0-1 1v.5A5 5 0 0 0 2 7.5V11l-1 2h12l-1-2V7.5A5 5 0 0 0 8 2.5V2a1 1 0 0 0-1-1z"/>
              <path d="M5.5 13a1.5 1.5 0 0 0 3 0"/>
            </svg>
            {alertLog.length>0 && (
              <div style={{position:"absolute",top:5,right:5,width:6,height:6,borderRadius:"50%",
                background:C.accent,boxShadow:isDark?`0 0 6px ${C.accent}`:"none",border:`1.5px solid ${C.surface}`}}/>
            )}
          </button>
        )}

        {/* Theme toggle */}
        <button className="topbtn" onClick={()=>setIsDark(d=>!d)} title={isDark?"Light mode":"Dark mode"}>
          {isDark ? (
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="7" cy="7" r="3"/>
              <line x1="7" y1="0.5" x2="7" y2="2.5"/>
              <line x1="7" y1="11.5" x2="7" y2="13.5"/>
              <line x1="0.5" y1="7" x2="2.5" y2="7"/>
              <line x1="11.5" y1="7" x2="13.5" y2="7"/>
              <line x1="2.5" y1="2.5" x2="3.9" y2="3.9"/>
              <line x1="10.1" y1="10.1" x2="11.5" y2="11.5"/>
              <line x1="11.5" y1="2.5" x2="10.1" y2="3.9"/>
              <line x1="3.9" y1="10.1" x2="2.5" y2="11.5"/>
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M12.5 9.5A6 6 0 0 1 4.5 1.5a6 6 0 1 0 8 8z"/>
            </svg>
          )}
        </button>
      </div>

      {/* ══════════════ MOBILE FILTER BAR ══════════════ */}
      {isMobile && !mobileDetailOpen && !mobileNotifOpen && (
        <div style={{display:"flex",gap:6,padding:"8px 12px",borderBottom:`1px solid ${C.border}`,
          background:C.surface,overflowX:"auto",scrollbarWidth:"none",
          flexShrink:0,WebkitOverflowScrolling:"touch"}}>
          {FILTERS.map(f=>{
            const TML=getTM(isDark);
            const m=TML[f];const on=filter===f;const isBm=f==="bookmarks";
            return(
              <button key={f} className="fbtn" onClick={()=>{setFilter(f);setSrcFilter(null);}}
                style={{padding:"6px 13px",borderRadius:20,flexShrink:0,
                  fontSize:FS.xs,letterSpacing:"0.07em",fontWeight:on?500:400,
                  background:on?(isBm||f==="all"?"rgba(128,128,160,.12)":m?.a):"rgba(128,128,128,.06)",
                  color:on?(isBm||f==="all"?C.text:m?.t):C.muted,
                  border:on?(isBm||f==="all"?`1px solid ${C.faint}`:`1px solid ${m?.b}`):"1px solid transparent"}}>
                {isBm?`SAVED${bmCount>0?" "+bmCount:""}`:f.toUpperCase()}
              </button>
            );
          })}
        </div>
      )}

      {/* ══════════════ BODY ══════════════ */}
      <div style={{display:"flex",flex:1,overflow:"hidden",position:"relative",minHeight:0}}>

        {/* Toast */}
        {toast && (
          <div style={{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",
            zIndex:200,animation:"toastIn .2s ease",minWidth:280,maxWidth:"calc(100vw - 32px)",pointerEvents:"none"}}>
            <div style={{background:C.surface,
              border:`1px solid ${toast.type==="hot"?"rgba(255,77,109,.35)":"rgba(0,255,136,.25)"}`,
              borderRadius:6,padding:"11px 14px",display:"flex",alignItems:"flex-start",gap:10,
              boxShadow:"0 8px 32px rgba(0,0,0,.5)"}}>
              <div style={{width:6,height:6,borderRadius:"50%",flexShrink:0,marginTop:5,
                background:toast.type==="hot"?"#ff4d6d":C.accent,
                boxShadow:`0 0 7px ${toast.type==="hot"?"#ff4d6d":C.accent}`,
                animation:"blink 1.4s ease infinite"}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:FS.xs,color:toast.type==="hot"?"#ff4d6d":C.accent,
                  letterSpacing:"0.1em",marginBottom:3,fontWeight:600}}>
                  {toast.title.toUpperCase()}
                </div>
                <div style={{fontSize:FS.sm,color:C.sub,lineHeight:1.5,
                  overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
                  {toast.body}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Mobile sidebar overlay ── */}
        {isMobile && showSidebar && (
          <>
            <div onClick={()=>setShowSidebar(false)}
              style={{position:"absolute",inset:0,background:"rgba(0,0,0,.6)",zIndex:60}}/>
            <div style={{position:"absolute",top:0,left:0,bottom:0,width:260,
              background:C.surface,borderRight:`1px solid ${C.border}`,
              zIndex:70,overflowY:"auto",animation:"slideLeft .18s ease"}}>
              <Sidebar C={C} isDark={isDark} items={items} visible={visible}
                status={status} lastFetch={lastFetch} bmCount={bmCount} onItemClick={setDetail} srcFilter={srcFilter} setSrcFilter={setSrcFilter}/>
            </div>
          </>
        )}

        {/* ── Desktop sidebar ── */}
        {!isMobile && (
          <div style={{width:190,minWidth:190,borderRight:`1px solid ${C.border}`,
            background:C.surface,flexShrink:0,overflowY:"auto"}}>
            <Sidebar C={C} isDark={isDark} items={items} visible={visible}
              status={status} lastFetch={lastFetch} bmCount={bmCount} onItemClick={setDetail} srcFilter={srcFilter} setSrcFilter={setSrcFilter}/>
          </div>
        )}

        {/* ── FEED ── */}
        {!mobileDetailOpen && !mobileNotifOpen && (
          <div ref={feedRef} style={{flex:1,overflowY:"auto",overflowX:"hidden",minWidth:0,minHeight:0}}>
            {/* Feed header */}
            <div style={{position:"sticky",top:0,background:C.bg,borderBottom:`1px solid ${C.border}`,
              padding:"7px 16px",display:"flex",alignItems:"center",gap:8,zIndex:10}}>
              <span style={{fontSize:FS.xs,color:C.muted,letterSpacing:"0.1em",flex:1}}>
                {status==="loading"&&items.length===0?"CONNECTING":`${visible.length} ITEMS`}
                {filter!=="all"&&<span style={{color:filter==="bookmarks"?C.sub:getTM(isDark)[filter]?.t||C.sub}}>
                  {" / "}{filter.toUpperCase()}</span>}
              </span>
              <div style={{display:"flex",gap:2,flexShrink:0}}>
                {[["latest","NEW"],["trending","HOT"],["top","TOP"]].map(([k,label])=>(
                  <button key={k} className="fbtn" onClick={()=>setSortBy(k)}
                    style={{padding:"3px 8px",borderRadius:3,fontSize:FS.xs,letterSpacing:"0.08em",
                      color:sortBy===k?C.text:C.muted,
                      background:sortBy===k?`rgba(${isDark?"216,216,240":"26,26,46"},.08)`:"transparent",
                      border:sortBy===k?`1px solid ${C.faint}`:"1px solid transparent"}}>
                    {label}
                  </button>
                ))}
              </div>
              {pending.length>0&&(
                <button onClick={loadPending} className="fbtn"
                  style={{padding:"4px 10px",background:"rgba(0,255,136,.08)",
                    border:"1px solid rgba(0,255,136,.2)",borderRadius:3,
                    color:C.accent,fontSize:FS.xs,letterSpacing:"0.06em",
                    animation:"pulseGlow 2s ease infinite",flexShrink:0}}>
                  ↑ {pending.length} new
                </button>
              )}
            </div>

            {status==="loading"&&items.length===0&&Array.from({length:8}).map((_,i)=>(
              <SkeletonRow key={i} C={C} isDark={isDark}/>
            ))}

            {status==="err"&&(
              <div style={{padding:"52px 20px",textAlign:"center"}}>
                <div style={{fontSize:FS.sm,color:"#ff4d6d",marginBottom:8,letterSpacing:"0.08em"}}>BACKEND UNREACHABLE</div>
                <div style={{fontSize:FS.xs,color:C.muted,marginBottom:24,wordBreak:"break-all",lineHeight:1.7}}>{errMsg}</div>
                <button onClick={()=>loadFeed(false)} className="fbtn"
                  style={{padding:"10px 20px",background:"rgba(0,255,136,.06)",
                    border:"1px solid rgba(0,255,136,.2)",borderRadius:4,
                    color:C.accent,fontSize:FS.sm,letterSpacing:"0.08em"}}>↻ RETRY</button>
              </div>
            )}

            {filter==="bookmarks"&&visible.length===0&&(
              <div style={{padding:"72px 20px",textAlign:"center"}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:14,opacity:.25}}>
                  <BmSvg filled={false} size={28} color={C.muted}/>
                </div>
                <div style={{fontSize:FS.sm,color:C.muted,letterSpacing:"0.1em"}}>NO SAVED ITEMS</div>
              </div>
            )}

            {sorted.map((item,i)=>(
              <Row key={item.id} item={item} i={i} isMobile={isMobile} C={C} isDark={isDark} selected={i===selectedIdx}
                isBookmarked={!!bookmarks[item.id]} isRead={readIds.has(item.id)}
                onBookmark={toggleBookmark}
                onClick={()=>{
                setDetail(item);
                setReadIds(prev=>{
                  const next=new Set(prev);
                  next.add(item.id);
                  console.log("marked read:", item.id, "total read:", next.size);
                  try{ localStorage.setItem("pulse-read", JSON.stringify([...next].slice(-500))); }catch(e){}
                  return next;
                });
              }}/>
            ))}
            <div style={{height:isMobile?80:48}}/>
          </div>
        )}

        {/* ── Desktop detail panel ── */}
        {detail && !isMobile && (
          <div style={{width:380,minWidth:380,borderLeft:`1px solid ${C.border}`,
            background:C.surface,flexShrink:0,overflowY:"auto",animation:"slideRight .18s ease"}}>
            <Detail item={detail} onClose={()=>setDetail(null)} C={C} isDark={isDark}
              isBookmarked={!!bookmarks[detail.id]} onBookmark={toggleBookmark}/>
          </div>
        )}

        {/* ── Mobile fullscreen detail ── */}
        {mobileDetailOpen && (
          <div style={{position:"absolute",inset:0,background:C.bg,zIndex:30,
            overflowY:"auto",WebkitOverflowScrolling:"touch",animation:"slideRight .2s ease"}}>
            <Detail item={detail} onClose={()=>setDetail(null)} isMobile C={C} isDark={isDark}
              isBookmarked={!!bookmarks[detail.id]} onBookmark={toggleBookmark}/>
            {/* Extra scroll space for mobile safe area */}
            <div style={{height:48}}/>
          </div>
        )}

        {/* ── Desktop notification panel ── */}
        {showNotifPanel && !isMobile && (
          <div style={{width:320,minWidth:320,borderLeft:`1px solid ${C.border}`,
            background:C.surface,flexShrink:0,overflowY:"auto",animation:"slideRight .18s ease",
            display:"flex",flexDirection:"column"}}>
            <NotifPanel C={C} isDark={isDark} alertLog={alertLog} setAlertLog={setAlertLog}
              notifPerm={notifPerm} requestNotifPermission={requestNotifPermission}
              onClose={()=>setShowNotifPanel(false)}/>
          </div>
        )}

        {/* ── Mobile fullscreen notification panel ── */}
        {mobileNotifOpen && (
          <div style={{position:"absolute",inset:0,background:C.bg,zIndex:30,
            overflowY:"auto",WebkitOverflowScrolling:"touch",animation:"slideRight .2s ease",
            display:"flex",flexDirection:"column"}}>
            <NotifPanel C={C} isDark={isDark} alertLog={alertLog} setAlertLog={setAlertLog}
              notifPerm={notifPerm} requestNotifPermission={requestNotifPermission}
              onClose={()=>setShowNotifPanel(false)} isMobile/>
            <div style={{height:48}}/>
          </div>
        )}
      </div>

      {/* ══════════════ STATUS BAR — desktop only ══════════════ */}
      {!isMobile && (
        <div style={{height:24,borderTop:`1px solid ${C.border}`,background:C.surface,
          display:"flex",alignItems:"center",padding:"0 16px",gap:16,
          flexShrink:0,fontSize:FS.xs,color:C.muted,letterSpacing:"0.08em"}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:C.accent,
              animation:"blink 2.2s ease infinite",flexShrink:0}}/>
            <span>LIVE · 90s</span>
          </div>
          <span>HN · arXiv · RSS</span>
          {status==="err"&&<span style={{color:"#ff4d6d"}}>⚠ OFFLINE</span>}
          <span style={{marginLeft:"auto"}}>
            {items.length} items · {lastFetch?timeAgo(Math.floor(lastFetch/1000))+" ago":"—"}
          </span>
        </div>
      )}
    </div>
  );
}

// ══════════════ NOTIFICATION PANEL ══════════════
function NotifPanel({C, isDark, alertLog, setAlertLog, notifPerm, requestNotifPermission, onClose, isMobile}) {
  return (
    <>
      {/* Header */}
      <div style={{padding:"16px 18px 14px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
          <span style={{fontSize:FS.md,fontWeight:600,color:C.text,letterSpacing:"0.1em"}}>ALERTS</span>
          {!isMobile && (
            <button className="ibtn" onClick={onClose}
              style={{color:C.muted,fontSize:FS.lg,padding:2,lineHeight:1}}>✕</button>
          )}
        </div>
        <div style={{fontSize:FS.xs,color:C.muted,letterSpacing:"0.06em"}}>
          {notifPerm==="granted"?"Push on · ":notifPerm==="denied"?"Push blocked · ":"Push off · "}
          {alertLog.length} alert{alertLog.length!==1?"s":""}
        </div>
      </div>

      {/* Push status row */}
      {notifPerm!=="granted" && notifPerm!=="denied" && (
        <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`,
          display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div>
            <div style={{fontSize:FS.sm,color:C.sub,marginBottom:3}}>Browser push</div>
            <div style={{fontSize:FS.xs,color:C.muted}}>Alerts even when tab is in background</div>
          </div>
          <button className="fbtn" onClick={requestNotifPermission}
            style={{padding:"7px 14px",background:"rgba(0,255,136,.08)",
              border:"1px solid rgba(0,255,136,.25)",borderRadius:4,
              color:C.accent,fontSize:FS.xs,letterSpacing:"0.08em",flexShrink:0,marginLeft:12}}>
            ENABLE
          </button>
        </div>
      )}
      {notifPerm==="granted" && (
        <div style={{padding:"11px 18px",borderBottom:`1px solid ${C.border}`,
          display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:C.accent,
            boxShadow:isDark?`0 0 6px ${C.accent}`:"none",flexShrink:0}}/>
          <span style={{fontSize:FS.sm,color:C.accent}}>Push notifications active</span>
        </div>
      )}
      {notifPerm==="denied" && (
        <div style={{padding:"11px 18px",borderBottom:`1px solid ${C.border}`,
          display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#ff4d6d",flexShrink:0}}/>
          <span style={{fontSize:FS.xs,color:C.muted,lineHeight:1.5}}>Blocked — re-enable in browser site settings</span>
        </div>
      )}

      {/* Log */}
      <div style={{flex:1,overflowY:"auto",minHeight:0}}>
        {alertLog.length===0 ? (
          <div style={{padding:"52px 18px",textAlign:"center"}}>
            <div style={{fontSize:"1.6rem",marginBottom:12,opacity:.2}}>🔔</div>
            <div style={{fontSize:FS.sm,color:C.muted,letterSpacing:"0.08em"}}>NO ALERTS YET</div>
            <div style={{fontSize:FS.xs,color:C.muted,marginTop:6,opacity:.6,lineHeight:1.6}}>
              Alerts appear here when new or trending items arrive during the 90s refresh cycle
            </div>
          </div>
        ) : alertLog.map((a,i)=>(
          <div key={i} style={{padding:"13px 18px",borderBottom:`1px solid ${C.border}`,
            display:"flex",alignItems:"flex-start",gap:10}}>
            <div style={{width:6,height:6,borderRadius:"50%",flexShrink:0,marginTop:5,
              background:a.type==="hot"?"#ff4d6d":C.accent}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:FS.xs,color:a.type==="hot"?"#ff4d6d":C.accent,
                letterSpacing:"0.08em",marginBottom:3,fontWeight:600}}>
                {a.title.toUpperCase()}
              </div>
              <div style={{fontSize:FS.sm,color:C.sub,lineHeight:1.5,overflow:"hidden",
                display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical"}}>
                {a.body}
              </div>
            </div>
            <div style={{fontSize:FS.xs,color:C.muted,flexShrink:0,marginTop:2}}>
              {timeAgo(Math.floor(a.ts/1000))}
            </div>
          </div>
        ))}
      </div>

      {/* Clear */}
      {alertLog.length>0 && (
        <div style={{padding:"12px 18px",borderTop:`1px solid ${C.border}`,flexShrink:0}}>
          <button className="fbtn" onClick={()=>setAlertLog([])}
            style={{width:"100%",padding:"10px",background:"transparent",
              border:`1px solid ${C.border}`,borderRadius:4,
              color:C.muted,fontSize:FS.xs,letterSpacing:"0.08em"}}>
            CLEAR ALL
          </button>
        </div>
      )}
    </>
  );
}

// ══════════════ SIDEBAR ══════════════
function Sidebar({C, isDark, items, visible, status, lastFetch, bmCount, onItemClick, srcFilter, setSrcFilter}) {
  const TML=getTM(isDark);
  const topItems=[...items].sort((a,b)=>(b.heat||0)-(a.heat||0)).slice(0,3);
  const statusColor=status==="ok"?C.accent:status==="err"?"#c01e3c":C.warn;
  return (
    <>
      <SB label="Status" C={C}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
          <div style={{width:6,height:6,borderRadius:"50%",flexShrink:0,
            background:statusColor,
            boxShadow:isDark?`0 0 6px ${statusColor}`:"none"}}/>
          <span style={{fontSize:FS.xs,letterSpacing:"0.08em",fontWeight:500,color:statusColor}}>
            {status==="ok"?"CONNECTED":status==="err"?"OFFLINE":"CONNECTING"}
          </span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"auto 1fr",rowGap:6,columnGap:10,fontSize:FS.xs}}>
          <span style={{color:C.muted}}>Items</span>
          <span style={{color:C.sub,textAlign:"right"}}>{items.length}</span>
          <span style={{color:C.muted}}>Saved</span>
          <span style={{color:C.sub,textAlign:"right"}}>{bmCount}</span>
          <span style={{color:C.muted}}>Updated</span>
          <span style={{color:C.sub,textAlign:"right"}}>{lastFetch?timeAgo(Math.floor(lastFetch/1000))+" ago":"—"}</span>
        </div>
      </SB>

      {topItems.length>0 && (
        <SB label="Trending" C={C}>
          {topItems.map((item,i)=>{
            const m=TML[item.type]||TML.product;
            return(
              <div key={item.id} onClick={()=>onItemClick(item)} style={{marginBottom:i<2?12:0,paddingBottom:i<2?12:0,
                borderBottom:i<2?`1px solid ${C.border}`:"none",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}>
                  <span style={{fontSize:"0.6rem",padding:"2px 5px",borderRadius:2,
                    background:m.a,color:m.t,border:`1px solid ${m.b}`,
                    letterSpacing:"0.06em",whiteSpace:"nowrap"}}>{m.label}</span>
                  <span style={{fontSize:FS.xs,color:C.muted,marginLeft:"auto",flexShrink:0}}>{item.timeLabel}</span>
                </div>
                <div style={{fontSize:FS.xs,color:C.sub,lineHeight:1.6,
                  display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
                  {item.title}
                </div>
              </div>
            );
          })}
        </SB>
      )}

      <SB label="Sources" C={C}>
        {srcFilter&&(
          <button className="fbtn" onClick={()=>setSrcFilter(null)}
            style={{fontSize:FS.xs,color:C.accent,letterSpacing:"0.08em",padding:"0 0 8px 0"}}>
            ✕ CLEAR FILTER
          </button>
        )}
        {Object.entries(SRC_COLORS).map(([k,c])=>{
          const count=items.filter(i=>i.src===k).length;
          if(!count) return null;
          const active=srcFilter===k;
          return(
            <div key={k} onClick={()=>setSrcFilter(active?null:k)}
              style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 4px",
                borderRadius:3,cursor:"pointer",
                background:active?`rgba(${isDark?"255,255,255":"0,0,0"},.06)`:"transparent",
                border:active?`1px solid ${C.faint}`:"1px solid transparent"}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:c,flexShrink:0}}/>
                <span style={{fontSize:FS.xs,color:active?C.text:C.sub,fontWeight:active?500:400}}>{k}</span>
              </div>
              <span style={{fontSize:FS.xs,color:active?C.sub:C.muted}}>{count}</span>
            </div>
          );
        })}
      </SB>

      <SB label="Categories" C={C}>
        {Object.entries(TML).map(([k,m])=>{
          const c=visible.filter(i=>i.type===k).length;
          if(!c) return null;
          const pct=Math.round(c/Math.max(visible.length,1)*100);
          return(
            <div key={k} style={{marginBottom:9}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:FS.xs,marginBottom:4,letterSpacing:"0.06em"}}>
                <span style={{color:m.t}}>{m.label}</span>
                <span style={{color:C.muted}}>{c}</span>
              </div>
              <div style={{height:2,background:C.border,borderRadius:1}}>
                <div style={{height:"100%",width:`${pct}%`,background:m.t,borderRadius:1,opacity:.7}}/>
              </div>
            </div>
          );
        })}
      </SB>
    </>
  );
}

// ══════════════ ROW ══════════════
function Row({item, i, onClick, isMobile, C, isDark, isBookmarked, onBookmark, selected, isRead}) {
  const TML=getTM(isDark);
  const m=TML[item.type]||TML.product;
  const srcColor=SRC_COLORS[item.src]||"#666";
  return(
    <div className="row" onClick={onClick} data-selected={selected}
      style={{borderBottom:`1px solid ${C.border}`,padding:isMobile?"16px":"14px 16px",background:selected?C.hover:undefined,
        animation:"rowIn .18s ease forwards",animationDelay:`${Math.min(i*.012,.28)}s`,opacity:0,filter:isRead?"brightness(0.5)":"none"}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:8}}>
        <span style={{fontSize:"0.62rem",fontWeight:600,letterSpacing:"0.1em",
          padding:"3px 7px",borderRadius:2,background:m.a,color:m.t,
          border:`1px solid ${m.b}`,flexShrink:0,marginTop:2,whiteSpace:"nowrap"}}>{m.label}</span>
        <span style={{fontSize:isMobile?FS.lg:FS.md,fontWeight:500,lineHeight:1.5,
          color:C.text,flex:1,wordBreak:"break-word"}}>{item.title}</span>
        <button className={isBookmarked?"bm bm-on":"bm bm-off"}
          onClick={e=>onBookmark(item,e)} title={isBookmarked?"Remove":"Save"}>
          <BmSvg filled={isBookmarked} size={13} color="currentColor"/>
        </button>
      </div>
      <div style={{fontSize:isMobile?FS.base:FS.sm,color:C.muted,lineHeight:1.7,marginBottom:10,
        display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
        {item.sum}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,fontSize:FS.xs,overflow:"hidden"}}>
        <span style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:srcColor,flexShrink:0}}/>
          <span style={{color:srcColor,fontWeight:500}}>{item.srcLabel||item.src}</span>
        </span>
        <span style={{color:C.muted,flexShrink:0}}>{item.timeLabel}</span>
        <span style={{color:C.muted,flexShrink:0}}>{Math.max(1,Math.round(((item.title||"")+" "+(item.sum||"")).split(" ").length/200))} min</span>
        {item.score>0&&<span style={{color:C.muted,flexShrink:0}}>↑{item.score}</span>}
        {item.comments>0&&<span style={{color:C.muted,flexShrink:0}}>{item.comments}c</span>}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"flex-end",gap:2,flexShrink:0}}>
          {[1,2,3,4].map(b=>(
            <div key={b} style={{width:2.5,borderRadius:1,height:3+b*3,
              background:b<=Math.ceil((item.heat||0)/25)?m.t:C.border}}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════ DETAIL ══════════════
function Detail({item, onClose, isMobile, C, isDark, isBookmarked, onBookmark}) {
  const TML=getTM(isDark);
  const m=TML[item.type]||TML.product;
  const srcColor=SRC_COLORS[item.src]||"#666";
  const [aiSummary,setAiSummary]=useState(null);
  const [aiLoading,setAiLoading]=useState(false);
  const [aiError,  setAiError]  =useState(null);
  const loaded=useRef(false);

  useEffect(()=>{ if(!loaded.current){loaded.current=true;fetchSummary();} },[item.id]);

  const fetchSummary=async()=>{
    if(aiLoading) return;
    setAiLoading(true);setAiError(null);setAiSummary(null);
    try{
      const res=await fetch(`${API}/summarize`,{method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({title:item.title,sum:item.sum,src:item.src,type:item.type})});
      const data=await res.json();
      if(data.error) throw new Error(data.error);
      setAiSummary(data.summary);
    }catch(e){setAiError(e.message);}
    finally{setAiLoading(false);}
  };

  return(
    <div style={{width:"100%",minWidth:0}}>
      {/* Sticky header */}
      <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`,
        position:"sticky",top:0,background:C.surface,zIndex:5}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          {!isMobile?(
            <button className="ibtn" onClick={onClose}
              style={{color:C.muted,fontSize:FS.xs,padding:0,letterSpacing:"0.12em"}}
              onMouseEnter={e=>e.currentTarget.style.color=C.sub}
              onMouseLeave={e=>e.currentTarget.style.color=C.muted}>← BACK</button>
          ):<div/>}
          <button className="ibtn" onClick={e=>onBookmark(item,e)}
            style={{display:"flex",alignItems:"center",gap:5,
              color:isBookmarked?C.text:C.muted,fontSize:FS.xs,
              letterSpacing:"0.1em",padding:0,minHeight:36}}
            onMouseEnter={e=>e.currentTarget.style.color=isBookmarked?C.text:C.sub}
            onMouseLeave={e=>e.currentTarget.style.color=isBookmarked?C.text:C.muted}>
            <BmSvg filled={isBookmarked} size={11} color="currentColor"/>
            {isBookmarked?"SAVED":"SAVE"}
          </button>
        </div>
        <span style={{fontSize:"0.62rem",fontWeight:600,letterSpacing:"0.1em",
          padding:"3px 7px",borderRadius:2,background:m.a,color:m.t,border:`1px solid ${m.b}`}}>
          {m.label}
        </span>
        <div style={{fontSize:isMobile?FS.xl:FS.lg,fontWeight:600,lineHeight:1.55,
          margin:"12px 0 10px",color:C.text,wordBreak:"break-word"}}>{item.title}</div>
        <div style={{display:"flex",alignItems:"center",gap:12,fontSize:FS.xs,flexWrap:"wrap"}}>
          <span style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:srcColor,flexShrink:0}}/>
            <span style={{color:srcColor,fontWeight:500}}>{item.srcLabel||item.src}</span>
          </span>
          <span style={{color:C.muted}}>{item.timeLabel} ago</span>
          {item.score>0&&<span style={{color:C.muted}}>↑{item.score}</span>}
          {item.comments>0&&<span style={{color:C.muted}}>{item.comments} replies</span>}
        </div>
      </div>

      <div style={{padding:"0 16px 32px"}}>
        {/* AI Insight */}
        <DL C={C}>
          <span style={{display:"flex",alignItems:"center",gap:7}}>
            <span style={{color:C.accent,fontSize:FS.sm}}>✦</span>
            <span>AI INSIGHT</span>
            {!aiLoading&&(
              <button className="ibtn" onClick={fetchSummary}
                style={{color:C.muted,fontSize:FS.xs,padding:0,marginLeft:4,letterSpacing:"0.08em"}}
                onMouseEnter={e=>e.currentTarget.style.color=C.sub}
                onMouseLeave={e=>e.currentTarget.style.color=C.muted}>↻ REDO</button>
            )}
          </span>
        </DL>
        <div style={{background:`rgba(0,255,136,${isDark?".03":".06"})`,
          border:"1px solid rgba(0,255,136,.12)",borderRadius:4,padding:"14px 16px",minHeight:66}}>
          {aiLoading&&(
            <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <div style={{width:10,height:10,border:`1.5px solid ${C.border}`,
                borderTopColor:C.accent,borderRadius:"50%",
                animation:"spin .7s linear infinite",flexShrink:0,marginTop:2}}/>
              <div style={{flex:1}}>
                <div className="sk" style={{width:"82%",height:11,borderRadius:2,marginBottom:8}}/>
                <div className="sk" style={{width:"68%",height:11,borderRadius:2,marginBottom:8}}/>
                <div className="sk" style={{width:"52%",height:11,borderRadius:2}}/>
              </div>
            </div>
          )}
          {!aiLoading&&aiError&&<div style={{fontSize:FS.xs,color:"#ff4d6d"}}>{aiError}</div>}
          {!aiLoading&&aiSummary&&(
            <p style={{fontSize:isMobile?FS.base:FS.sm,lineHeight:1.85,
              color:isDark?"#96e8b8":"#1a6640",margin:0,wordBreak:"break-word"}}>{aiSummary}</p>
          )}
        </div>

        <DL C={C}>SUMMARY</DL>
        <p style={{fontSize:isMobile?FS.base:FS.sm,lineHeight:1.85,
          color:C.muted,wordBreak:"break-word",margin:0}}>{item.sum}</p>

        {item.authors&&(
          <><DL C={C}>AUTHORS</DL>
          <p style={{fontSize:FS.sm,color:C.muted,wordBreak:"break-word",margin:0,lineHeight:1.7}}>
            {item.authors}</p></>
        )}

        <DL C={C}>SIGNAL</DL>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
          <div style={{flex:1,height:3,background:C.border,borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${item.heat||0}%`,background:m.t,borderRadius:2,opacity:.75}}/>
          </div>
          <span style={{fontSize:FS.xs,color:C.muted,flexShrink:0}}>{item.heat||0}/100</span>
        </div>

        <div style={{marginTop:24,display:"flex",flexDirection:"column",gap:8}}>
          <a href={item.link} target="_blank" rel="noreferrer" className="open-link"
            style={{display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:isMobile?"14px 16px":"12px 16px",
              background:C.bg,border:`1px solid ${C.border}`,borderRadius:4,
              fontSize:isMobile?FS.base:FS.sm,color:C.sub,letterSpacing:"0.08em"}}>
            <span>READ ON {(item.srcLabel||item.src).toUpperCase()}</span>
            <span style={{fontSize:FS.lg}}>↗</span>
          </a>
          <button className="fbtn open-link" onClick={()=>{
              navigator.clipboard.writeText(item.link);
              const el=document.getElementById("copy-confirm");
              if(el){el.style.opacity=1;setTimeout(()=>el.style.opacity=0,1500);}
            }}
            style={{display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:isMobile?"14px 16px":"12px 16px",width:"100%",
              background:C.bg,border:`1px solid ${C.border}`,borderRadius:4,
              fontSize:isMobile?FS.base:FS.sm,color:C.sub,letterSpacing:"0.08em",cursor:"pointer"}}>
            <span>COPY LINK</span>
            <span id="copy-confirm" style={{fontSize:FS.xs,color:C.accent,opacity:0,transition:"opacity .3s"}}>COPIED ✓</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════ SKELETON ══════════════
function SkeletonRow({C}) {
  return(
    <div style={{padding:"18px 16px",borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
        <div className="sk" style={{width:56,height:18,borderRadius:3}}/>
        <div className="sk" style={{width:"58%",height:14,borderRadius:3}}/>
      </div>
      <div className="sk" style={{width:"90%",height:12,borderRadius:3,marginBottom:7}}/>
      <div className="sk" style={{width:"68%",height:12,borderRadius:3,marginBottom:14}}/>
      <div style={{display:"flex",gap:12}}>
        <div className="sk" style={{width:40,height:11,borderRadius:3}}/>
        <div className="sk" style={{width:28,height:11,borderRadius:3}}/>
      </div>
    </div>
  );
}

// ══════════════ SHARED ══════════════
function BmSvg({filled, size=13}) {
  return(
    <svg width={size} height={size*15/13} viewBox="0 0 13 15"
      fill={filled?"currentColor":"none"} stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{display:"block",flexShrink:0,transition:"fill .1s,stroke .1s"}}>
      <path d="M1 1h11v13l-5.5-3.5L1 14V1z"/>
    </svg>
  );
}

function DL({children, C}) {
  return(
    <div style={{fontSize:FS.xs,letterSpacing:"0.12em",color:C.muted,textTransform:"uppercase",
      margin:"20px 0 10px",paddingTop:16,borderTop:`1px solid ${C.border}`,
      display:"flex",alignItems:"center",gap:6}}>
      {children}
    </div>
  );
}

function SB({label, children, C}) {
  return(
    <div style={{padding:"14px",borderBottom:`1px solid ${C.border}`}}>
      <div style={{fontSize:FS.xs,letterSpacing:"0.14em",color:C.muted,
        textTransform:"uppercase",marginBottom:12,fontWeight:500}}>{label}</div>
      {children}
    </div>
  );
}
