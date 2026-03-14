import { useState, useEffect, useCallback } from "react";
import { API, timeAgo, FF, DARK, LIGHT } from "./constants/theme.js";
import { useAuth } from "./hooks/useAuth.js";
import { Auth } from "./components/Auth.jsx";
import { Detail } from "./components/Detail.jsx";
import { useBookmarks } from "./hooks/useBookmarks.js";
import { usePreferences } from "./hooks/usePreferences.js";
import { TopBar } from "./components/TopBar.jsx";

import { FeedPage } from "./components/FeedPage.jsx";
import { TrendingPage } from "./components/TrendingPage.jsx";
import { SavedPage } from "./components/SavedPage.jsx";
import { BriefPage } from "./components/BriefPage.jsx";

function Toast({toasts}){
  return(
    <div style={{position:"fixed",bottom:16,left:"50%",transform:"translateX(-50%)",
      zIndex:9999,display:"flex",flexDirection:"column",gap:4,alignItems:"center",pointerEvents:"none"}}>
      {toasts.map(t=>(
        <div key={t.id} style={{
          background:t.type==="err"?"#7f1d1d":"#1a1a1a",
          color:t.type==="err"?"#fca5a5":"#e8e8e8",
          padding:"6px 14px",borderRadius:2,
          fontSize:"0.7rem",fontFamily:FF.mono,
          border:`1px solid ${t.type==="err"?"#991b1b":"#2e2e2e"}`,
          letterSpacing:"0.04em",
        }}>{t.msg}</div>
      ))}
    </div>
  );
}

function getStored(k,d){ try{ const v=localStorage.getItem(k); return v===null?d:v; }catch(e){ return d; } }
function getSession(k,d){ try{ const v=sessionStorage.getItem(k); return v===null?d:v; }catch(e){ return d; } }

export default function App() {
  const [isDark,    setIsDark]   = useState(()=>getStored("pulse-dark","true")==="true");
  const [page,      setPageRaw]  = useState(()=>getSession("pulse-page","brief"));
  const [items,     setItems]    = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [detail,    setDetail]   = useState(null);
  const [filter,    setFilter]   = useState("all");
  const [query,     setQuery]    = useState("");
  const [srcFilter, setSrcFilter]= useState(null);
  const [sortBy,    setSortBy]   = useState("heat");
  const [toasts,    setToasts]   = useState([]);
  const [showAuth,  setShowAuth] = useState(false);
  const [winW,      setWinW]     = useState(()=>typeof window!=="undefined"?window.innerWidth:1200);

  useEffect(()=>{
    const h=()=>setWinW(window.innerWidth);
    window.addEventListener("resize",h);
    return()=>window.removeEventListener("resize",h);
  },[]);
  const isMobile = winW < 640;

  const [readIds, setReadIds] = useState(()=>{
    try{ return new Set(JSON.parse(sessionStorage.getItem("pulse-read")||"[]")); }
    catch(e){ return new Set(); }
  });

  const C = isDark ? DARK : LIGHT;
  const { user, loading:authLoading, signUp, signIn, signOut } = useAuth();
  const { bookmarks, loadBookmarks, toggleBookmark } = useBookmarks(user);
  const { loadPreferences, savePreferences } = usePreferences(user);

  const setPage = useCallback((p)=>{
    setPageRaw(p);
    setDetail(null);
    try{ sessionStorage.setItem("pulse-page",p); }catch(e){}
  },[]);

  const showToast = useCallback((msg,type="info")=>{
    const id=Date.now();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3000);
  },[]);

  const loadFeed = useCallback(async(silent=false)=>{
    try{
      if(!silent) setLoading(true);
      const res=await fetch(`${API}/feed`);
      const data=await res.json();
      setItems((data.items||[]).map(i=>({...i,timeLabel:timeAgo(i.time)})));
    }catch(e){
      if(!silent) showToast("connection error","err");
    }finally{ setLoading(false); }
  },[showToast]);

  useEffect(()=>{
    loadFeed(false);
    if(user){
      loadBookmarks();
      loadPreferences().then(prefs=>{
        if(!prefs) return;
        if(prefs.dark_mode!==null) setIsDark(prefs.dark_mode);
        if(prefs.filter) setFilter(prefs.filter);
        if(prefs.sort_by) setSortBy(prefs.sort_by);
      });
    }
  },[user]);

  useEffect(()=>{ const id=setInterval(()=>loadFeed(true),90000); return()=>clearInterval(id); },[loadFeed]);
  useEffect(()=>{ const id=setInterval(()=>setItems(p=>p.map(i=>({...i,timeLabel:timeAgo(i.time)}))),30000); return()=>clearInterval(id); },[]);

  const toggleDark = useCallback(()=>{
    setIsDark(d=>{ const n=!d; try{localStorage.setItem("pulse-dark",String(n));}catch(e){} savePreferences({dark_mode:n}); return n; });
  },[savePreferences]);

  const handleAuth = useCallback(async(mode,email,password)=>{
    const {error}=await (mode==="signup"?signUp:signIn)(email,password);
    return error?error.message:null;
  },[signUp,signIn]);

  const handleBookmark = useCallback((item,e)=>{
    e?.stopPropagation();
    if(!user){ setShowAuth(true); return; }
    toggleBookmark(item);
  },[toggleBookmark,user]);

  const handleItemClick = useCallback((item)=>{
    setDetail(item);
    setReadIds(r=>{
      const n=new Set([...r,item.id]);
      try{sessionStorage.setItem("pulse-read",JSON.stringify([...n]));}catch(e){}
      return n;
    });
  },[]);

  if(authLoading) return <div style={{minHeight:"100vh",background:DARK.bg}}/>;

  const shared = {
    C, isDark, items, loading, bookmarks, readIds, user, detail,
    onItemClick:handleItemClick, onBookmark:handleBookmark, isMobile,
  };

  return (
    <div style={{
      display:"flex", flexDirection:"column",
      height:"100vh", width:"100vw", overflow:"hidden",
      background:C.bg, color:C.text,
      fontFamily:FF.mono,
      WebkitFontSmoothing:"antialiased",
    }}>

      {/* ── Top bar ── */}
      <TopBar
        C={C} isDark={isDark} page={page} setPage={setPage}
        user={user} setShowAuth={setShowAuth}
        bmCount={Object.keys(bookmarks).length}
        toggleDark={toggleDark} onSignOut={signOut}
        isMobile={isMobile}
      />

      {/* ── Content ── */}
      <div style={{flex:1, display:"flex", overflow:"hidden", minWidth:0}}>

        {/* Page */}
        <div style={{flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0}}>
          
          {page==="brief"    && <BriefPage  {...shared} />}
          {page==="feed"     && <FeedPage     {...shared} filter={filter} setFilter={setFilter} query={query} setQuery={setQuery} srcFilter={srcFilter} setSrcFilter={setSrcFilter} sortBy={sortBy} setSortBy={setSortBy} savePreferences={savePreferences}/>}
          {page==="trending" && <TrendingPage {...shared}/>}
          {page==="saved"    && <SavedPage    {...shared}/>}
        </div>

        {/* Detail panel */}
        {detail && (
          <div style={{
            width: isMobile?"100%":380,
            minWidth: isMobile?"100%":380,
            position: isMobile?"absolute":"relative",
            inset: isMobile?0:"auto",
            zIndex: isMobile?100:"auto",
            borderLeft: isMobile?"none":`1px solid ${C.border}`,
            overflowY:"auto", overflowX:"hidden",
            background:C.surface,
            height:"100%",
          }}>
            <Detail
              item={detail} C={C} isDark={isDark}
              isBookmarked={!!bookmarks[detail.id]}
              onBookmark={handleBookmark}
              items={items} onItemClick={handleItemClick}
              onClose={()=>setDetail(null)}
            />
          </div>
        )}
      </div>

      {/* Auth modal */}
      {showAuth && (
        <div style={{position:"fixed",inset:0,zIndex:1000,
          background:"rgba(0,0,0,0.85)",backdropFilter:"blur(4px)",
          display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
          onClick={()=>setShowAuth(false)}>
          <div onClick={e=>e.stopPropagation()}
            style={{width:"100%",maxWidth:380,borderRadius:0,overflow:"hidden",
              border:`1px solid ${C.border}`,
              boxShadow:"0 32px 64px rgba(0,0,0,0.6)"}}>
            <Auth onAuth={async(mode,email,password)=>{
              const err=await handleAuth(mode,email,password);
              if(!err) setShowAuth(false);
              return err;
            }} C={C} isDark={isDark}/>
          </div>
        </div>
      )}

      <Toast toasts={toasts}/>
    </div>
  );
}
