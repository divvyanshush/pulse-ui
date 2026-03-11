import { useState, useEffect, useCallback, useRef } from "react";
import { API, timeAgo, FS, FF, DARK, LIGHT } from "./constants/theme.js";
import { useAuth } from "./hooks/useAuth.js";
import { Auth } from "./components/Auth.jsx";
import { Detail } from "./components/Detail.jsx";
import { useBookmarks } from "./hooks/useBookmarks.js";
import { usePreferences } from "./hooks/usePreferences.js";
import { NavSidebar } from "./components/NavSidebar.jsx";
import { TodayPage } from "./components/TodayPage.jsx";
import { FeedPage } from "./components/FeedPage.jsx";
import { TrendingPage } from "./components/TrendingPage.jsx";
import { SavedPage } from "./components/SavedPage.jsx";

function Toast({toasts}){
  return(
    <div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",
      zIndex:9999,display:"flex",flexDirection:"column",gap:6,alignItems:"center",pointerEvents:"none"}}>
      {toasts.map(t=>(
        <div key={t.id} style={{
          background:t.type==="err"?"#ff4d6d":"#1a1a1a",
          color:"#fff",padding:"8px 16px",borderRadius:4,
          fontSize:"0.72rem",fontFamily:FF.mono,
          boxShadow:"0 4px 16px rgba(0,0,0,0.3)",
        }}>{t.msg}</div>
      ))}
    </div>
  );
}

// Persist page & readIds in sessionStorage (cleared on tab close, not refresh)
function getStoredPage(){ try{ return sessionStorage.getItem("pulse-page")||"today"; }catch(e){ return "today"; } }
function getStoredReadIds(){ try{ return new Set(JSON.parse(sessionStorage.getItem("pulse-read")||"[]")); }catch(e){ return new Set(); } }

export default function App() {
  const [isDark,    setIsDark]   = useState(()=>{ try{ const v=localStorage.getItem("pulse-dark"); return v===null?true:v==="true"; }catch(e){ return true; } });
  const [page,      setPageRaw]  = useState(getStoredPage);
  const [items,     setItems]    = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [detail,    setDetail]   = useState(null);
  const [filter,    setFilter]   = useState("all");
  const [query,     setQuery]    = useState("");
  const [srcFilter, setSrcFilter]= useState(null);
  const [sortBy,    setSortBy]   = useState("heat");
  const [toasts,    setToasts]   = useState([]);
  const [showAuth,  setShowAuth] = useState(false);
  const [readIds,   setReadIds]  = useState(getStoredReadIds);

  const C = isDark ? DARK : LIGHT;

  const { user, loading: authLoading, signUp, signIn, signOut } = useAuth();
  const { bookmarks, loadBookmarks, toggleBookmark } = useBookmarks(user);
  const { loadPreferences, savePreferences } = usePreferences(user);

  // Page setter — persists to sessionStorage + closes detail
  const setPage = useCallback((p)=>{
    setPageRaw(p);
    setDetail(null);
    try{ sessionStorage.setItem("pulse-page", p); }catch(e){}
  },[]);

  const showToast = useCallback((msg, type="info")=>{
    const id = Date.now();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3000);
  },[]);

  const loadFeed = useCallback(async(silent=false)=>{
    try {
      if(!silent) setLoading(true);
      const res = await fetch(`${API}/feed`);
      const data = await res.json();
      setItems((data.items||[]).map(i=>({...i,timeLabel:timeAgo(i.time)})));
    } catch(e) {
      if(!silent) showToast("Connection issue","err");
    } finally {
      setLoading(false);
    }
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

  useEffect(()=>{
    const id=setInterval(()=>loadFeed(true),90_000);
    return()=>clearInterval(id);
  },[loadFeed]);

  useEffect(()=>{
    const id=setInterval(()=>setItems(p=>p.map(i=>({...i,timeLabel:timeAgo(i.time)}))),30_000);
    return()=>clearInterval(id);
  },[]);

  const toggleDark = useCallback(()=>{
    setIsDark(d=>{
      const next=!d;
      try{ localStorage.setItem("pulse-dark", String(next)); }catch(e){}
      savePreferences({dark_mode:next});
      return next;
    });
  },[savePreferences]);

  const handleAuth = useCallback(async(mode,email,password)=>{
    const fn = mode==="up" ? signUp : signIn;
    const {error} = await fn(email,password);
    if(error) return error.message;
    return null;
  },[signUp,signIn]);

  const handleBookmark = useCallback((item,e)=>{
    e?.stopPropagation();
    if(!user){ setShowAuth(true); return; }
    toggleBookmark(item);
  },[toggleBookmark,user]);

  const handleItemClick = useCallback((item)=>{
    setDetail(item);
    setReadIds(r=>{
      const next=new Set([...r,item.id]);
      try{ sessionStorage.setItem("pulse-read", JSON.stringify([...next])); }catch(e){}
      return next;
    });
  },[]);

  const [winWidth, setWinWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(()=>{
    const handler = ()=>setWinWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return()=>window.removeEventListener("resize", handler);
  },[]);
  const isMobile = winWidth < 768;
  const isSmall  = winWidth < 1100;

  if(authLoading) return <div style={{minHeight:"100vh",background:C.bg}}/>;

  const commonProps = {
    C, isDark, items, loading, bookmarks,
    onItemClick:handleItemClick, onBookmark:handleBookmark,
    detail, readIds, user,
  };

  const feedProps = {
    ...commonProps,
    filter, setFilter, query, setQuery,
    srcFilter, setSrcFilter, sortBy, setSortBy,
    savePreferences,
  };

  return (
    <div style={{
      display:"flex", height:"100vh", overflow:"hidden",
      background:C.bg, color:C.text,
      fontFamily:FF.sans, WebkitFontSmoothing:"antialiased",
    }}>

      {/* Nav Sidebar — hidden on mobile when detail open */}
      {!(isMobile && detail) && (
        <NavSidebar
          C={C} isDark={isDark} page={page} setPage={setPage}
          user={user} setShowAuth={setShowAuth}
          bmCount={Object.keys(bookmarks).length}
          toggleDark={toggleDark} onSignOut={signOut}
        />
      )}

      {/* Main area */}
      <div style={{flex:1, display:"flex", overflow:"hidden", position:"relative"}}>

        {/* Page — hidden on mobile when detail is open */}
        {!(isMobile && detail) && (
          <div style={{flex:1, display:"flex", overflow:"hidden"}}>
            {page==="today"    && <TodayPage    {...commonProps}/>}
            {page==="feed"     && <FeedPage     {...feedProps}/>}
            {page==="trending" && <TrendingPage {...commonProps}/>}
            {page==="saved"    && <SavedPage    {...commonProps}/>}
          </div>
        )}

        {/* Detail panel */}
        {detail && (
          <div style={{
            // Mobile: full screen overlay
            // Desktop: fixed-width side panel
            position: isMobile?"absolute":"relative",
            inset: isMobile?0:"auto",
            zIndex: isMobile?100:"auto",
            width: isMobile?"100%":isSmall?320:380,
            minWidth: isMobile?"100%":isSmall?320:380,
            flexShrink:0,
            borderLeft: isMobile?"none":`1px solid ${C.border}`,
            overflowY:"auto",
            background:C.surface,
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
          background:"rgba(0,0,0,0.75)",backdropFilter:"blur(4px)",
          display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
          onClick={()=>setShowAuth(false)}>
          <div onClick={e=>e.stopPropagation()}
            style={{width:"100%",maxWidth:400,borderRadius:8,overflow:"hidden",
              boxShadow:"0 24px 64px rgba(0,0,0,0.5)"}}>
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
