import { useState, useCallback, useRef, useEffect } from "react";
import { FS, FF, FILTERS, getTM } from "../constants/theme.js";
import { Row } from "./Row.jsx";
import { SkeletonRow } from "./Shared.jsx";
import { OnboardingBanner } from "./OnboardingBanner.jsx";

export function FeedPage({ C, isDark, items, loading, bookmarks, onItemClick, onBookmark,
  filter, setFilter, query, setQuery, srcFilter, setSrcFilter, sortBy, setSortBy,
  savePreferences, detail, readIds, user, isMobile, showOnboarding, dismissOnboarding, searchRef }) {

  const [displayCount, setDisplayCount] = useState(30);
  const [timeFilter, setTimeFilter] = useState("all");
  const loaderRef = useRef(null);
  const scrollRef = useRef(null);
  const displayedRef = useRef([]);
  const TML = getTM(isDark);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Reset selection when filter/sort changes
  useEffect(()=>setSelectedIndex(-1),[filter,query,srcFilter,sortBy,timeFilter]);

  // Keyboard navigation
  useEffect(()=>{
    const handler = (e) => {
      // Don't fire when typing in input
      if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA") return;
      if(e.key==="j"||e.key==="ArrowDown"){
        e.preventDefault();
        setSelectedIndex(i=>Math.min(i+1, displayedRef.current.length-1));
      } else if(e.key==="k"||e.key==="ArrowUp"){
        e.preventDefault();
        setSelectedIndex(i=>Math.max(i-1, 0));
      } else if(e.key==="o"||e.key==="Enter"){
        if(selectedIndex>=0 && displayedRef.current[selectedIndex]) onItemClick(displayedRef.current[selectedIndex]);
      } else if(e.key==="b"){
        if(selectedIndex>=0 && displayedRef.current[selectedIndex]) onBookmark(displayedRef.current[selectedIndex]);
      } else if(e.key==="Escape"){
        setSelectedIndex(-1);
      }
    };
    window.addEventListener("keydown", handler);
    return()=>window.removeEventListener("keydown", handler);
  },[selectedIndex, onItemClick, onBookmark]);

  // Auto-scroll selected item into view
  useEffect(()=>{
    if(selectedIndex<0||!scrollRef.current) return;
    const rows = scrollRef.current.querySelectorAll("[data-row]");
    if(rows[selectedIndex]) rows[selectedIndex].scrollIntoView({block:"nearest",behavior:"smooth"});
  },[selectedIndex]);

  // Filter + sort
  const now = Math.floor(Date.now()/1000);
  const TIME_WINDOWS = { today: 86400, week: 604800, all: Infinity };
  const visible = items.filter(item=>{
    const age = now - (item.time||0);
    if(timeFilter !== "all" && age > TIME_WINDOWS[timeFilter]) return false;
    if(filter==="bookmarks") return bookmarks[item.id];
    if(srcFilter && item.src!==srcFilter) return false;
    const normType = item.type==="product"?"tool":(item.src==="GitHub"?"repo":(item.src==="HN"||item.src==="Lobste.rs"?"discuss":item.type));
    if(filter!=="all" && normType!==filter) return false;
    if(!query) return true;
    const q=query.toLowerCase();
    return (item.title||"").toLowerCase().includes(q)||
           (item.src||"").toLowerCase().includes(q)||
           (item.srcLabel||"").toLowerCase().includes(q)||
           (item.sum||"").toLowerCase().includes(q);
  });

  const sorted = [...visible].sort((a,b)=>{
    if(sortBy==="heat") return (b.heat||0)-(a.heat||0);
    return b.time-a.time;
  });

  const displayed = sorted.slice(0,displayCount);
  displayedRef.current = displayed;

  // Reset on filter change
  useEffect(()=>setDisplayCount(30),[filter,query,srcFilter,sortBy,timeFilter]);

  // Infinite scroll
  useEffect(()=>{
    const obs = new IntersectionObserver(entries=>{
      if(entries[0].isIntersecting && displayCount<sorted.length)
        setDisplayCount(n=>n+30);
    },{threshold:0.1});
    if(loaderRef.current) obs.observe(loaderRef.current);
    return()=>obs.disconnect();
  },[displayCount,sorted.length]);

  const bmCount = Object.keys(bookmarks).length;

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:C.bg,overflow:"hidden",minWidth:0}}>

      {/* Topbar */}
      <div style={{
        display:"flex",flexDirection:"column",
        background:C.bg,flexShrink:0,
      }}>
        {/* Row 0 — header */}
        <div style={{padding:"0 16px", display:"flex", alignItems:"center", justifyContent:"space-between", minHeight: srcFilter ? 32 : 0}}>
          {srcFilter && (
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:FS.xs,color:C.sub,fontFamily:FF.sans}}>source: {srcFilter}</span>
              <button onClick={()=>setSrcFilter(null)}
                style={{background:"none",border:"none",color:C.muted,cursor:"pointer",
                  fontSize:"0.9rem",padding:"0 2px",lineHeight:1,
                  display:"flex",alignItems:"center"}}
                onMouseEnter={e=>e.currentTarget.style.color=C.text}
                onMouseLeave={e=>e.currentTarget.style.color=C.muted}
              >×</button>
            </div>
          )}
        </div>
        {/* Row 1 — filter pills */}
        <div style={{display:"flex",alignItems:"center",gap:4,padding:"0 12px",height:40,overflowX:"auto",scrollbarWidth:"none",borderTop:'none'}}>
          {FILTERS.filter(f=>f!=="bookmarks").map(f=>{
            const m=TML[f]; const on=filter===f;
            return (
              <button key={f} className="fbtn"
                onClick={()=>{setFilter(f);setSrcFilter(null);savePreferences({filter:f});}}
                style={{
                  padding:"4px 10px",borderRadius:3,flexShrink:0,
                  fontSize:FS.xs,letterSpacing:"0.06em",
                  fontFamily:FF.sans,
                  background:on?(f==="all"?C.faint:m?.a):"transparent",
                  color:on?(f==="all"?C.text:m?.t):C.muted,
                  border:"none",
                  transition:"color .1s",whiteSpace:"nowrap",
                  cursor:"pointer",
                }}
                onMouseEnter={e=>{ if(!on) e.currentTarget.style.color=C.text; }}
                onMouseLeave={e=>{ if(!on) e.currentTarget.style.color=C.muted; }}
              >
                {f.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Row 2 — search, sort, time */}
        <div style={{display:"flex",alignItems:"center",gap:6,padding:"0 12px",height:40,borderTop:'none'}}>
          {/* Search */}
          <div style={{position:"relative",flex:1,minWidth:0,display:"flex",alignItems:"center"}}>
            <input
              ref={searchRef}
              placeholder="Search..."
              value={query}
              onChange={e=>setQuery(e.target.value)}
              style={{
                background:C.bg,border:`1px solid ${C.border}`,
                color:C.text,fontSize:FS.xs,padding:"5px 10px",
                paddingRight: query ? 28 : 10,
                borderRadius:3,outline:"none",
                width:"100%",
                fontFamily:FF.sans,
              }}
            />
            {query && (
              <button onClick={()=>setQuery("")}
                style={{
                  position:"absolute",right:6,
                  background:"none",border:"none",
                  color:C.muted,cursor:"pointer",
                  fontSize:"0.9rem",lineHeight:1,padding:"0 2px",
                  display:"flex",alignItems:"center",justifyContent:"center",
                }}
                onMouseEnter={e=>e.currentTarget.style.color=C.text}
                onMouseLeave={e=>e.currentTarget.style.color=C.muted}
              >×</button>
            )}
          </div>

          {/* Sort */}
          <select value={sortBy} onChange={e=>{setSortBy(e.target.value);savePreferences({sort_by:e.target.value});}}
            style={{
              background:C.surface,border:`1px solid ${C.border}`,
              color:C.text,fontSize:FS.xs,padding:"3px 6px",
              borderRadius:3,cursor:"pointer",fontFamily:FF.sans,
              outline:"none",flexShrink:0,
            }}>
            <option value="heat">SIGNAL</option>
            <option value="time">NEW</option>
          </select>

          {/* Time filter */}
          <select value={timeFilter} onChange={e=>setTimeFilter(e.target.value)}
            style={{
              background:C.surface,border:`1px solid ${C.border}`,
              color:C.text,fontSize:FS.xs,padding:"3px 6px",
              borderRadius:3,cursor:"pointer",fontFamily:FF.sans,
              outline:"none",flexShrink:0,
            }}>
            <option value="all">ALL TIME</option>
            <option value="today">TODAY</option>
            <option value="week">THIS WEEK</option>
          </select>
        </div>
      </div>

      {/* Onboarding */}
      {showOnboarding && <OnboardingBanner C={C} isDark={isDark} onDismiss={dismissOnboarding}/>}

      {/* Feed */}
      <div ref={scrollRef} style={{flex:1,overflowY:"auto"}}>
{/* Items count */}
        <div style={{
          padding:"10px 20px",
          borderTop:'none',
          borderBottom:'none',
          fontSize:FS.xs,color:C.muted,
          fontFamily:FF.sans,letterSpacing:"0.04em",
          display:"flex",alignItems:"center",justifyContent:"space-between",
        }}>
          <span>{visible.length} ITEMS{srcFilter?` · ${srcFilter}`:""}</span>
          {query && <span>"{query}"</span>}
          {!isMobile && <span style={{color:C.faint,letterSpacing:"0.04em"}}>j/k · o · b</span>}
        </div>

        {loading && displayed.length===0 && (
          [1,2,3,4,5].map(n=><SkeletonRow key={n} C={C} isDark={isDark}/>)
        )}

        {displayed.map((item,i)=>(
          <div key={item.id} data-row={String(i)}>
          <Row item={item} i={i} C={C} isDark={isDark}
            onClick={()=>{ setSelectedIndex(i); onItemClick(item); }}
            isBookmarked={!!bookmarks[item.id]}
            onBookmark={onBookmark}
            selected={detail?.id===item.id || selectedIndex===i}
            isRead={readIds.has(item.id)}
          />
          </div>
        ))}

        {/* Infinite scroll loader */}
        {displayCount < sorted.length && (
          <div ref={loaderRef} style={{padding:"20px",textAlign:"center"}}>
            {[1,2,3].map(n=><SkeletonRow key={n} C={C} isDark={isDark}/>)}
          </div>
        )}

        {displayed.length===0 && !loading && (
          <div style={{padding:"60px 32px",textAlign:"center"}}>
            <div style={{fontSize:FS.sm,color:C.muted,fontFamily:FF.sans}}>No items found</div>
          </div>
        )}
      </div>
    </div>
  );
}
