import { useState, useEffect, useRef, useCallback } from "react";
import { API, timeAgo, FS, FF, DARK, LIGHT, getTM, SRC_COLORS, FILTERS } from "./constants/theme.js";
import { useAuth } from "./hooks/useAuth.js";
import { Auth } from "./components/Auth.jsx";
import { Detail } from "./components/Detail.jsx";
import { useBookmarks } from "./hooks/useBookmarks.js";
import { useSavedSearches } from "./hooks/useSavedSearches.js";
import { usePreferences } from "./hooks/usePreferences.js";
import { NavSidebar } from "./components/NavSidebar.jsx";
import { TodayPage } from "./components/TodayPage.jsx";
import { FeedPage } from "./components/FeedPage.jsx";
import { TrendingPage } from "./components/TrendingPage.jsx";
import { SavedPage } from "./components/SavedPage.jsx";
import { Briefing } from "./components/Briefing.jsx";

function Toast({toasts}){
  return(
    <div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",
      zIndex:9999,display:"flex",flexDirection:"column",gap:6,alignItems:"center",pointerEvents:"none"}}>
      {toasts.map(t=>(
        <div key={t.id} style={{
          background:t.type==="err"?"#ff4d6d":DARK.surface,
          color:"#fff",padding:"8px 16px",borderRadius:4,
          fontSize:"0.72rem",fontFamily:FF.mono,
          boxShadow:"0 4px 16px rgba(0,0,0,0.3)",
          animation:"fadeIn .2s ease",
        }}>{t.msg}</div>
      ))}
    </div>
  );
}

export default function App() {
  const [isDark, setIsDark]     = useState(true);
  const [page, setPage]         = useState("today");
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [status, setStatus]     = useState("loading");
  const [detail, setDetail]     = useState(null);
  const [filter, setFilter]     = useState("all");
  const [query, setQuery]       = useState("");
  const [srcFilter, setSrcFilter] = useState(null);
  const [sortBy, setSortBy]     = useState("heat");
  const [toasts, setToasts]     = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [readIds, setReadIds]   = useState(new Set());

  const C = isDark ? DARK : LIGHT;

  const { user, loading: authLoading, signUp, signIn, signOut } = useAuth();
  const { bookmarks, loadBookmarks, toggleBookmark } = useBookmarks(user);
  const { loadPreferences, savePreferences } = usePreferences(user);

  const showToast = useCallback((msg, type="info", duration=3000)=>{
    const id = Date.now();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),duration);
  },[]);

  const loadFeed = useCallback(async(silent=false)=>{
    try {
      if(!silent) setLoading(true);
      const res = await fetch(`${API}/feed`);
      const data = await res.json();
      const mapped = (data.items||[]).map(i=>({...i,timeLabel:timeAgo(i.time)}));
      setItems(mapped);
      setStatus("ok");
    } catch(e) {
      setStatus("err");
      if(items.length>0) showToast("Connection issue — showing cached feed","err");
    } finally {
      setLoading(false);
    }
  },[showToast,items.length]);

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
  },[loadFeed,loadBookmarks,loadPreferences,user]);

  useEffect(()=>{
    const id=setInterval(()=>loadFeed(true),90_000);
    return()=>clearInterval(id);
  },[loadFeed]);

  useEffect(()=>{
    const id=setInterval(()=>setItems(p=>p.map(i=>({...i,timeLabel:timeAgo(i.time)}))),30_000);
    return()=>clearInterval(id);
  },[]);

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
    setReadIds(r=>new Set([...r,item.id]));
  },[]);

  if(authLoading) return <div style={{minHeight:"100vh",background:C.bg}}/>;

  return (
    <div style={{
      display:"flex",height:"100vh",overflow:"hidden",
      background:C.bg,color:C.text,
      fontFamily:FF.sans,
    }}>
      {/* Nav Sidebar */}
      <NavSidebar
        C={C} isDark={isDark} page={page} setPage={setPage}
        user={user} setShowAuth={setShowAuth}
        bmCount={Object.keys(bookmarks).length}
        toggleDark={()=>{
          setIsDark(d=>{ savePreferences({dark_mode:!d}); return !d; });
        }}
      />

      {/* Main content */}
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>

        {/* Page content */}
        <div style={{flex:1,display:"flex",overflow:"hidden"}}>
          {page==="today" && (
            <TodayPage C={C} isDark={isDark} onItemClick={handleItemClick}/>
          )}
          {page==="feed" && (
            <FeedPage
              C={C} isDark={isDark} items={items} loading={loading}
              bookmarks={bookmarks} onItemClick={handleItemClick}
              onBookmark={handleBookmark} filter={filter} setFilter={setFilter}
              query={query} setQuery={setQuery} srcFilter={srcFilter}
              setSrcFilter={setSrcFilter} sortBy={sortBy} setSortBy={setSortBy}
              savePreferences={savePreferences} detail={detail} readIds={readIds}
              user={user}
            />
          )}
          {page==="trending" && (
            <TrendingPage C={C} isDark={isDark} items={items} onItemClick={handleItemClick}/>
          )}
          {page==="saved" && (
            <SavedPage
              C={C} isDark={isDark} items={items} bookmarks={bookmarks}
              onItemClick={handleItemClick} onBookmark={handleBookmark}
            />
          )}
        </div>

        {/* Detail panel */}
        {detail && (
          <div style={{
            width:400,flexShrink:0,
            borderLeft:`1px solid ${C.border}`,
            overflowY:"auto",background:C.surface,
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
