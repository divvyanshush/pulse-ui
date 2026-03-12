import { useState, useCallback, useRef, useEffect } from "react";
import { FS, FF, FILTERS, getTM } from "../constants/theme.js";
import { Row } from "./Row.jsx";
import { SkeletonRow } from "./Shared.jsx";

export function FeedPage({ C, isDark, items, loading, bookmarks, onItemClick, onBookmark,
  filter, setFilter, query, setQuery, srcFilter, setSrcFilter, sortBy, setSortBy,
  savePreferences, detail, readIds, user, isMobile, onMenu }) {

  const [displayCount, setDisplayCount] = useState(30);
  const [timeFilter, setTimeFilter] = useState("all");
  const loaderRef = useRef(null);
  const TML = getTM(isDark);

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
           (item.sum||"").toLowerCase().includes(q);
  });

  const sorted = [...visible].sort((a,b)=>{
    if(sortBy==="heat") return (b.heat||0)-(a.heat||0);
    return b.time-a.time;
  });

  const displayed = sorted.slice(0,displayCount);

  // Reset on filter change
  useEffect(()=>setDisplayCount(30),[filter,query,srcFilter,sortBy]);

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
        display:"flex",alignItems:"center",gap:8,
        padding:"0 16px",height:50,
        borderBottom:`1px solid ${C.border}`,
        background:C.surface,flexShrink:0,
      }}>
{/* Filter pills */}
        <div style={{display:"flex",gap:4,overflowX:"auto",scrollbarWidth:"none",flex:1,minWidth:0}}>
          {FILTERS.filter(f=>f!=="bookmarks").map(f=>{
            const m=TML[f]; const on=filter===f;
            return (
              <button key={f} className="fbtn"
                onClick={()=>{setFilter(f);setSrcFilter(null);savePreferences({filter:f});}}
                style={{
                  padding:"4px 10px",borderRadius:3,flexShrink:0,
                  fontSize:"0.65rem",letterSpacing:"0.08em",
                  fontFamily:FF.mono,
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

        {/* Time filter */}
        <div style={{display:"flex",alignItems:"center",gap:2,marginLeft:"auto",flexShrink:0}}>
          {["today","week","all"].map(t=>{
            const on = timeFilter===t;
            return (
              <button key={t} onClick={()=>setTimeFilter(t)}
                style={{
                  padding:"4px 8px",background:"none",
                  border:`1px solid ${on?C.text:C.border}`,
                  color:on?C.text:C.muted,
                  fontSize:"0.62rem",fontFamily:FF.mono,
                  letterSpacing:"0.06em",cursor:"pointer",
                  borderRadius:2,transition:"all .1s",
                }}>
                {t}
              </button>
            );
          })}
        </div>

        {/* Sort */}
        <select value={sortBy} onChange={e=>{setSortBy(e.target.value);savePreferences({sort_by:e.target.value});}}
          style={{
            background:"transparent",border:`1px solid ${C.border}`,
            color:C.muted,fontSize:"0.62rem",padding:"3px 6px",
            borderRadius:3,cursor:"pointer",fontFamily:FF.mono,
            outline:"none",flexShrink:0,
          }}>
          <option value="heat">HOT</option>
          <option value="time">NEW</option>
        </select>

        {/* Search */}
        <div style={{position:"relative",flexShrink:0}}>
          <input
            placeholder="Search..."
            value={query}
            onChange={e=>setQuery(e.target.value)}
            style={{
              background:C.bg,border:`1px solid ${C.border}`,
              color:C.text,fontSize:"0.72rem",padding:"5px 10px",
              borderRadius:3,outline:"none",width:160,
              fontFamily:FF.sans,
            }}
          />
        </div>
      </div>

      {/* Feed */}
      <div style={{flex:1,overflowY:"auto"}}>
{/* Items count */}
        <div style={{
          padding:"10px 20px",
          borderBottom:`1px solid ${C.border}`,
          fontSize:"0.62rem",color:C.muted,
          fontFamily:FF.mono,letterSpacing:"0.08em",
          display:"flex",alignItems:"center",justifyContent:"space-between",
        }}>
          <span>{visible.length} ITEMS{srcFilter?` · ${srcFilter}`:""}</span>
          {query && <span>"{query}"</span>}
        </div>

        {loading && displayed.length===0 && (
          [1,2,3,4,5].map(n=><SkeletonRow key={n} C={C} isDark={isDark}/>)
        )}

        {displayed.map((item,i)=>(
          <Row key={item.id} item={item} i={i} C={C} isDark={isDark}
            onClick={()=>onItemClick(item)}
            isBookmarked={!!bookmarks[item.id]}
            onBookmark={onBookmark}
            selected={detail?.id===item.id}
            isRead={readIds.has(item.id)}
          />
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
