import { useState, useEffect, useRef, useCallback } from "react";
import { API, timeAgo, FS, DARK, LIGHT, TM_DARK, TM_LIGHT, getTM, SRC_COLORS, FILTERS } from "./constants/theme.js";
import { useNotifs } from "./hooks/useNotifs.js";
import { useAuth } from "./hooks/useAuth.js";
import { Auth } from "./components/Auth.jsx";
import { SkeletonRow, BmSvg, DL, SB } from "./components/Shared.jsx";
import { Row } from "./components/Row.jsx";
import { Detail } from "./components/Detail.jsx";
import { NotifPanel } from "./components/NotifPanel.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { useBookmarks } from "./hooks/useBookmarks.js";
import { useSavedSearches } from "./hooks/useSavedSearches.js";
import { usePreferences } from "./hooks/usePreferences.js";
import { useFeed } from "./hooks/useFeed.js";








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
  const [filter,        setFilter]        = useState(()=>{ try{ return localStorage.getItem("pulse-filter")||"all"; }catch(e){ return "all"; } });
  const [srcFilter,     setSrcFilter]     = useState(null);
  const [sortBy,        setSortBy]        = useState(()=>{ try{ return localStorage.getItem("pulse-sort")||"latest"; }catch(e){ return "latest"; } });
  const [selectedIdx,   setSelectedIdx]   = useState(-1);
  const [query,         setQuery]         = useState("");
  const [detail,        setDetail]        = useState(null);
  const [showSidebar,   setShowSidebar]   = useState(false);
  const [showSrch,      setShowSrch]      = useState(false);
  const [status,        setStatus]        = useState("idle");
  const [errMsg,        setErrMsg]        = useState("");
  const [lastFetch,     setLastFetch]     = useState(null);
  const [readIds,       setReadIds]       = useState(()=>{ try{ return new Set(JSON.parse(localStorage.getItem("pulse-read")||"[]")); }catch(e){ return new Set(); } });
  const [toast,         setToast]         = useState(null);
  const [notifPerm,     setNotifPerm]     = useState(typeof Notification!=="undefined"?Notification.permission:"unsupported");
  const [showNotifPanel,setShowNotifPanel]= useState(false);
  const [alertLog,      setAlertLog]      = useState([]);
  const [showHelp,      setShowHelp]      = useState(false);
  const [isDark,        setIsDark]        = useState(()=>{ try{ const v=localStorage.getItem("pulse-dark"); return v===null?true:v==="true"; }catch(e){ return true; } });

  const C = isDark ? DARK : LIGHT;
  const { user, loading: authLoading, signUp, signIn, signOut } = useAuth();

  const handleAuth = async (mode, email, password) => {
    if(mode==="signup") return signUp(email, password);
    return signIn(email, password);
  };

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
  const showToast = useCallback((title,body,type="new",item=null)=>{
    if(toastTimer.current) clearTimeout(toastTimer.current);
    setToast({title,body,type,item});
    setAlertLog(p=>[{title,body,type,ts:Date.now(),item},...p].slice(0,20));
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

  const { bookmarks, loadBookmarks, toggleBookmark } = useBookmarks(user);
  const { savedSearches, loadSavedSearches, saveSearch, deleteSearch } = useSavedSearches(user);
  const { loadPreferences, savePreferences } = usePreferences(user);

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
          showToast(`${novel.length} new item${novel.length>1?"s":""}`,top.title,"new",top);
          pushNotif(`PULSE · ${novel.length} new`,top.title);
        }
        const trending=enriched.filter(i=>!prevIds.current.has(i.id)&&(i.heat||0)>=75);
        if(trending.length){
          const t=trending[0];
          showToast("Trending now",t.title,"hot",t);
          pushNotif("PULSE · Trending",t.title);
        }
        // Check saved searches against new items
        if(novel.length && savedSearches.length){
          savedSearches.forEach(ss=>{
            const q=ss.query.toLowerCase();
            const match=novel.find(i=>
              (i.title||"").toLowerCase().includes(q)||
              (i.sum||"").toLowerCase().includes(q)||
              (i.src||"").toLowerCase().includes(q)
            );
            if(match){
              showToast(`Alert: "${ss.query}"`,match.title,"new",match);
              pushNotif(`PULSE · Alert: "${ss.query}"`,match.title);
            }
          });
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

  useEffect(()=>{
    loadFeed(false);
    loadBookmarks();
    loadSavedSearches();
    loadPreferences().then(prefs=>{
      if(!prefs) return;
      if(prefs.dark_mode!==null) setIsDark(prefs.dark_mode);
      if(prefs.filter) setFilter(prefs.filter);
      if(prefs.sort_by) setSortBy(prefs.sort_by);
    });
  },[loadFeed,loadBookmarks,loadPreferences]);
  useEffect(()=>{const id=setInterval(()=>loadFeed(true),90_000);return()=>clearInterval(id);},[loadFeed]);
  useEffect(()=>{ document.title = pending.length>0?`Pulse (${pending.length})`:"Pulse"; },[pending]);
  useEffect(()=>{const id=setInterval(()=>setItems(p=>p.map(i=>({...i,timeLabel:timeAgo(i.time)}))),30_000);return()=>clearInterval(id);},[]);

  const loadPending=useCallback(()=>{
    setItems(p=>{const m=new Map(p.map(x=>[x.id,x]));pending.forEach(x=>m.set(x.id,x));const a=[...m.values()];a.sort((a,b)=>b.time-a.time);return a;});
    setPending([]);feedRef.current?.scrollTo({top:0,behavior:"smooth"});
  },[pending]);



  const sendDigest = useCallback(async()=>{
    if(!user?.email) return;
    try{
      const top = [...items].sort((a,b)=>(b.heat||0)-(a.heat||0)).slice(0,8);
      const res = await fetch(`${API}/send-digest`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ email:user.email, items:top })
      });
      const data = await res.json();
      if(data.ok) showToast("Digest sent!",`Top stories sent to ${user.email}`,"new",null);
      else showToast("Failed",data.error||"Could not send digest","err",null);
    }catch(e){ showToast("Failed",e.message,"err",null); }
  },[user, items, showToast]);

  const bookmarkList=Object.values(bookmarks).sort((a,b)=>(b.bookmarkedAt||0)-(a.bookmarkedAt||0));
  const visible=(filter==="bookmarks"?bookmarkList:items).filter(i=>{
    if(srcFilter&&i.src!==srcFilter) return false;
    if(query){const q=query.toLowerCase(); return i.title.toLowerCase().includes(q)||i.sum.toLowerCase().includes(q)||(i.authors||"").toLowerCase().includes(q)||(i.src||"").toLowerCase().includes(q)||(i.srcLabel||"").toLowerCase().includes(q)||(i.type||"").toLowerCase().includes(q);}
    if(filter!=="all"&&filter!=="bookmarks"&&i.type!==filter) return false;
    return true;
  });
  const sorted = sortBy==="latest" ? visible : sortBy==="trending" ? [...visible].sort((a,b)=>(b.heat||0)-(a.heat||0)) : [...visible].sort((a,b)=>(b.score||0)-(a.score||0));

  // ── Keyboard shortcuts ──
  useEffect(()=>{
    const handler = (e) => {
      if(e.target.tagName==="INPUT") return;
      if(e.key==="?" && !e.ctrlKey && !e.metaKey){ e.preventDefault(); setShowHelp(h=>!h); return; }
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
          setDetail(null); setShowSrch(false); setQuery(""); setShowNotifPanel(false); setShowHelp(false);
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


  if(authLoading) return <div style={{minHeight:"100vh",background:C.bg}}/>;
  if(!user) return <Auth onAuth={handleAuth} C={C} isDark={isDark}/>;

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
        ::-webkit-scrollbar-thumb{background:${isDark?"#1e1e38":"#cccccc"};border-radius:2px}
        .sk{background:${skGrad};background-size:400px 100%;animation:shimmer 1.6s ease infinite}
        .row:hover{background:${C.hover}!important}
        .bm-off{color:${C.faint};opacity:0.55}
        .bm-off:hover{color:${C.muted};opacity:1}
        .bm-on{color:${C.text};opacity:1}
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
                <button key={f} className="fbtn" onClick={()=>{setFilter(f);setSrcFilter(null);try{if(f!=="bookmarks")localStorage.setItem("pulse-filter",f);}catch(e){} if(f!=="bookmarks")savePreferences({filter:f});}}
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
            <div style={{position:"relative",flex:isMobile?1:undefined,maxWidth:isMobile?"100%":220,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:6,padding:"0 10px",height:34,
                background:C.bg,border:`1px solid ${C.faint}`,borderRadius:4}}>
                <input ref={srchRef} value={query} onChange={e=>setQuery(e.target.value)}
                  placeholder="search…" autoFocus
                  style={{background:"none",border:"none",outline:"none",color:C.text,
                    fontFamily:"inherit",fontSize:FS.sm,width:"100%",minWidth:0}}/>
                {query&&<span style={{fontSize:FS.xs,color:C.muted,flexShrink:0,whiteSpace:"nowrap"}}>{sorted.length}</span>}
                <button className="ibtn" onClick={()=>{setShowSrch(false);setQuery("");}}
                  style={{color:C.muted,fontSize:FS.md,padding:0,flexShrink:0}}>✕</button>
              </div>
              {/* Saved searches dropdown */}
              {!query && savedSearches.length>0 && (
                <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,zIndex:100,
                  background:C.surface,border:`1px solid ${C.border}`,borderRadius:4,
                  boxShadow:"0 8px 24px rgba(0,0,0,0.3)",overflow:"hidden"}}>
                  <div style={{padding:"6px 10px 4px",fontSize:"0.6rem",color:C.muted,letterSpacing:"0.1em"}}>SAVED SEARCHES</div>
                  {savedSearches.map(s=>(
                    <div key={s.id} onClick={()=>setQuery(s.query)}
                      style={{display:"flex",alignItems:"center",padding:"7px 10px",cursor:"pointer",gap:8}}
                      onMouseEnter={e=>e.currentTarget.style.background=C.hover}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <span style={{fontSize:FS.xs,color:C.sub,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>🔍 {s.query}</span>
                      <button onClick={e=>{e.stopPropagation();deleteSearch(s.id);}}
                        style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:"0.7rem",padding:"0 2px",flexShrink:0}}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              {/* Save current search button */}
              {query.trim() && !savedSearches.some(s=>s.query.toLowerCase()===query.toLowerCase()) && (
                <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,zIndex:100,
                  background:C.surface,border:`1px solid ${C.border}`,borderRadius:4,
                  boxShadow:"0 8px 24px rgba(0,0,0,0.3)"}}>
                  <div onClick={()=>saveSearch(query)}
                    style={{padding:"8px 10px",cursor:"pointer",fontSize:FS.xs,
                      color:C.accent,letterSpacing:"0.08em",display:"flex",alignItems:"center",gap:6}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.hover}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    + SAVE "{query}"
                  </div>
                </div>
              )}
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

        {/* Digest button */}
        <button className="topbtn" onClick={sendDigest} title={`Send digest to ${user?.email}`}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="12" height="9" rx="1.5"/>
            <polyline points="1,3 7,8.5 13,3"/>
          </svg>
        </button>
        {/* Sign out */}
        <button className="topbtn" onClick={signOut} title="Sign out">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5"/>
            <polyline points="9,4 13,7 9,10"/>
            <line x1="13" y1="7" x2="5" y2="7"/>
          </svg>
        </button>
        {/* Theme toggle */}
        <button className="topbtn" onClick={()=>setIsDark(d=>{ const next=!d; try{ localStorage.setItem("pulse-dark",next); }catch(e){} savePreferences({dark_mode:next}); return next; })} title={isDark?"Light mode":"Dark mode"}>
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
              <button key={f} className="fbtn" onClick={()=>{setFilter(f);setSrcFilter(null);try{if(f!=="bookmarks")localStorage.setItem("pulse-filter",f);}catch(e){} if(f!=="bookmarks")savePreferences({filter:f});}}
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
        {showHelp && (
        <div onClick={()=>setShowHelp(false)} style={{position:"fixed",inset:0,zIndex:300,
          background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:`1px solid ${C.border}`,
            borderRadius:6,padding:"24px 28px",minWidth:280,maxWidth:360}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
              <span style={{fontSize:FS.sm,letterSpacing:"0.1em",color:C.text,fontWeight:600}}>KEYBOARD SHORTCUTS</span>
              <button className="ibtn" onClick={()=>setShowHelp(false)} style={{color:C.muted}}>✕</button>
            </div>
            {[
              ["J / ↓","Next item"],
              ["K / ↑","Previous item"],
              ["Enter","Open selected"],
              ["Escape","Close panel"],
              ["B","Bookmark current"],
              ["/","Open search"],
              ["?","Toggle this help"],
            ].map(([key,desc])=>(
              <div key={key} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:FS.xs,color:C.muted}}>{desc}</span>
                <kbd style={{fontSize:FS.xs,color:C.text,background:C.hover,
                  border:`1px solid ${C.faint}`,borderRadius:3,padding:"2px 7px",
                  fontFamily:"inherit",letterSpacing:"0.06em"}}>{key}</kbd>
              </div>
            ))}
            <div style={{marginTop:14,fontSize:FS.xs,color:C.muted,textAlign:"center"}}>
              press <kbd style={{fontSize:FS.xs,color:C.text,background:C.hover,
                border:`1px solid ${C.faint}`,borderRadius:3,padding:"2px 6px",fontFamily:"inherit"}}>?</kbd> anytime to toggle
            </div>
          </div>
        </div>
      )}

      {toast && (
          <div style={{position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",
            zIndex:200,animation:"toastIn .2s ease",minWidth:280,maxWidth:"calc(100vw - 32px)",cursor:toast.item?"pointer":"default"}}
            onClick={()=>{if(toast.item){setDetail(toast.item);setToast(null);}}}>
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
                status={status} lastFetch={lastFetch} bmCount={bmCount} onItemClick={setDetail} srcFilter={srcFilter} setSrcFilter={setSrcFilter} onRepoClick={setDetail}/>
            </div>
          </>
        )}

        {/* ── Desktop sidebar ── */}
        {!isMobile && (
          <div style={{width:190,minWidth:190,borderRight:`1px solid ${C.border}`,
            background:C.surface,flexShrink:0,overflowY:"auto"}}>
            <Sidebar C={C} isDark={isDark} items={items} visible={visible}
              status={status} lastFetch={lastFetch} bmCount={bmCount} onItemClick={setDetail} srcFilter={srcFilter} setSrcFilter={setSrcFilter} onRepoClick={setDetail}/>
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
                  <button key={k} className="fbtn" onClick={()=>{setSortBy(k);try{localStorage.setItem("pulse-sort",k);}catch(e){} savePreferences({sort_by:k});}}
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
              isBookmarked={!!bookmarks[detail.id]} onBookmark={toggleBookmark} items={items} onItemClick={setDetail}/>
          </div>
        )}

        {/* ── Mobile fullscreen detail ── */}
        {mobileDetailOpen && (
          <div style={{position:"absolute",inset:0,background:C.bg,zIndex:30,
            overflowY:"auto",WebkitOverflowScrolling:"touch",animation:"slideRight .2s ease"}}>
            <Detail item={detail} onClose={()=>setDetail(null)} isMobile C={C} isDark={isDark}
              isBookmarked={!!bookmarks[detail.id]} onBookmark={toggleBookmark} items={items} onItemClick={setDetail}/>
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
              onClose={()=>setShowNotifPanel(false)} onItemClick={setDetail}/>
          </div>
        )}

        {/* ── Mobile fullscreen notification panel ── */}
        {mobileNotifOpen && (
          <div style={{position:"absolute",inset:0,background:C.bg,zIndex:30,
            overflowY:"auto",WebkitOverflowScrolling:"touch",animation:"slideRight .2s ease",
            display:"flex",flexDirection:"column"}}>
            <NotifPanel C={C} isDark={isDark} alertLog={alertLog} setAlertLog={setAlertLog}
              notifPerm={notifPerm} requestNotifPermission={requestNotifPermission}
              onClose={()=>setShowNotifPanel(false)} isMobile onItemClick={setDetail}/>
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



// ══════════════ DETAIL ══════════════
