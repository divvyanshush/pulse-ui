import { useState, useEffect, useRef, useCallback } from "react";

const API = "https://pulse-backend-production-cd92.up.railway.app";

const timeAgo = ts => {
  const s = Math.floor(Date.now()/1000 - ts);
  if(s<60)    return `${s}s ago`;
  if(s<3600)  return `${Math.floor(s/60)}m ago`;
  if(s<86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};

const TM = {
  model:    {label:"MODEL",    a:"rgba(0,255,136,.12)", b:"rgba(0,255,136,.28)", t:"#00ff88"},
  research: {label:"RESEARCH", a:"rgba(77,166,255,.12)",b:"rgba(77,166,255,.28)",t:"#4da6ff"},
  drama:    {label:"DRAMA",    a:"rgba(255,77,109,.12)",b:"rgba(255,77,109,.28)",t:"#ff4d6d"},
  funding:  {label:"FUNDING",  a:"rgba(255,215,0,.12)", b:"rgba(255,215,0,.28)", t:"#ffd700"},
  product:  {label:"PRODUCT",  a:"rgba(199,125,255,.12)",b:"rgba(199,125,255,.28)",t:"#c77dff"},
  policy:   {label:"POLICY",   a:"rgba(255,159,67,.12)",b:"rgba(255,159,67,.28)",t:"#ff9f43"},
};
const SC = {HN:"#ff6314", Reddit:"#ff4500", arXiv:"#b31b1b"};
const FILTERS = ["all","model","research","drama","funding","product","policy"];

function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

export default function Pulse() {
  const [items,       setItems]       = useState([]);
  const [pending,     setPending]     = useState([]);
  const [filter,      setFilter]      = useState("all");
  const [query,       setQuery]       = useState("");
  const [detail,      setDetail]      = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSrch,    setShowSrch]    = useState(false);
  const [status,      setStatus]      = useState("idle");
  const [errMsg,      setErrMsg]      = useState("");
  const [lastFetch,   setLastFetch]   = useState(null);
  const feedRef  = useRef(null);
  const srchRef  = useRef(null);
  const prevIds  = useRef(new Set());
  const width    = useWindowWidth();
  const isMobile = width < 768;

  const loadFeed = useCallback(async (isRefresh=false) => {
    setStatus("loading");
    try {
      const res  = await fetch(`${API}/feed`);
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const enriched = data.items.map(i=>({...i, timeLabel:timeAgo(i.time)}));
      if(isRefresh && prevIds.current.size > 0) {
        const novel = enriched.filter(i=>!prevIds.current.has(i.id));
        if(novel.length) setPending(p=>[...novel,...p]);
      } else {
        setItems(enriched);
      }
      prevIds.current = new Set(enriched.map(i=>i.id));
      setLastFetch(Date.now());
      setStatus("ok");
    } catch(e) {
      setStatus("err");
      setErrMsg(e.message);
    }
  }, []);

  useEffect(()=>{ loadFeed(false); },[loadFeed]);
  useEffect(()=>{ const id=setInterval(()=>loadFeed(true),90_000); return()=>clearInterval(id); },[loadFeed]);
  useEffect(()=>{ const id=setInterval(()=>setItems(p=>p.map(i=>({...i,timeLabel:timeAgo(i.time)}))),30_000); return()=>clearInterval(id); },[]);

  const loadPending = useCallback(()=>{
    setItems(p=>{ const m=new Map(p.map(x=>[x.id,x])); pending.forEach(x=>m.set(x.id,x)); const a=[...m.values()]; a.sort((a,b)=>b.time-a.time); return a; });
    setPending([]);
    feedRef.current?.scrollTo({top:0,behavior:"smooth"});
  },[pending]);

  const visible = items.filter(i=>{
    if(filter!=="all" && i.type!==filter) return false;
    if(query){ const q=query.toLowerCase(); return i.title.toLowerCase().includes(q)||i.sum.toLowerCase().includes(q); }
    return true;
  });

  // On mobile, if detail is open show detail screen, else show feed
  // On desktop, show both side by side
  const showDetailFullscreen = isMobile && detail;

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",width:"100%",maxWidth:"100vw",background:"#050507",color:"#e2e2f0",fontFamily:"'IBM Plex Mono',monospace",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&display=swap');
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(0,255,136,.4)}50%{box-shadow:0 0 0 6px rgba(0,255,136,0)}}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        body{overflow:hidden;margin:0}
      `}</style>

      {/* ── TOPBAR ── */}
      <div style={{display:"flex",alignItems:"center",height:52,padding:"0 12px",borderBottom:"1px solid #1e1e2e",background:"#0c0c10",gap:8,flexShrink:0,width:"100%"}}>

        {/* Back button — mobile detail view */}
        {showDetailFullscreen ? (
          <button onClick={()=>setDetail(null)} style={{background:"none",border:"none",color:"#5a5a7a",padding:"8px 4px",fontSize:16,cursor:"pointer",flexShrink:0}}>←</button>
        ) : (
          <>
            {isMobile && (
              <button onClick={()=>setShowSidebar(s=>!s)} style={{background:"none",border:"1px solid #1e1e2e",color:"#5a5a7a",padding:"7px 9px",borderRadius:4,fontSize:13,cursor:"pointer",flexShrink:0}}>☰</button>
            )}
          </>
        )}

        <div style={{display:"flex",alignItems:"center",gap:6,fontSize:13,fontWeight:600,letterSpacing:"0.18em",flexShrink:0}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:"#00ff88",boxShadow:"0 0 10px #00ff88",animation:"blink 1.8s ease infinite"}}/>
          PULSE
        </div>

        {/* Desktop filters in topbar */}
        {!isMobile && (
          <div style={{display:"flex",gap:3,flex:1,overflowX:"auto",scrollbarWidth:"none"}}>
            {FILTERS.map(f=>{ const m=TM[f]; const on=filter===f; return(
              <button key={f} onClick={()=>setFilter(f)} style={{padding:"3px 8px",borderRadius:3,flexShrink:0,cursor:"pointer",fontFamily:"inherit",fontSize:10,transition:"all .1s",
                border:on?`1px solid ${f==="all"?"#e2e2f0":m.b}`:"1px solid #1e1e2e",
                background:on?(f==="all"?"rgba(226,226,240,.07)":m.a):"transparent",
                color:on?(f==="all"?"#e2e2f0":m.t):"#5a5a7a"}}>{f.toUpperCase()}</button>
            );})}
          </div>
        )}

        <div style={{flex:1}}/>

        {/* Search */}
        {!showDetailFullscreen && (
          showSrch ? (
            <div style={{display:"flex",alignItems:"center",gap:6,padding:"0 10px",height:34,background:"#111118",border:"1px solid #2a2a3d",borderRadius:4,flex:isMobile?1:undefined,maxWidth:isMobile?"100%":200}}>
              <input ref={srchRef} value={query} onChange={e=>setQuery(e.target.value)} placeholder="search…" autoFocus
                style={{background:"none",border:"none",outline:"none",color:"#e2e2f0",fontFamily:"inherit",fontSize:12,width:"100%"}}/>
              <button onClick={()=>{setShowSrch(false);setQuery("");}} style={{background:"none",border:"none",color:"#5a5a7a",cursor:"pointer",fontSize:14,padding:0,flexShrink:0}}>✕</button>
            </div>
          ):(
            <button onClick={()=>{setShowSrch(true);setTimeout(()=>srchRef.current?.focus(),50);}}
              style={{background:"none",border:"1px solid #1e1e2e",color:"#5a5a7a",padding:"7px 10px",borderRadius:4,fontSize:13,cursor:"pointer",flexShrink:0}}>⌕</button>
          )
        )}
        {!showDetailFullscreen && (
          <button onClick={()=>loadFeed(false)} style={{background:"none",border:"1px solid #1e1e2e",color:"#5a5a7a",padding:"7px 10px",borderRadius:4,fontSize:14,cursor:"pointer",flexShrink:0}}>↻</button>
        )}
      </div>

      {/* ── MOBILE FILTER BAR (below topbar, not in topbar) ── */}
      {isMobile && !showDetailFullscreen && (
        <div style={{display:"flex",gap:6,padding:"8px 12px",borderBottom:"1px solid #1e1e2e",background:"#0c0c10",overflowX:"auto",scrollbarWidth:"none",flexShrink:0,WebkitOverflowScrolling:"touch"}}>
          {FILTERS.map(f=>{ const m=TM[f]; const on=filter===f; return(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:"5px 10px",borderRadius:20,flexShrink:0,cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:on?600:400,transition:"all .1s",whiteSpace:"nowrap",
              border:"none",
              background:on?(f==="all"?"rgba(226,226,240,.15)":m.a):"rgba(255,255,255,0.05)",
              color:on?(f==="all"?"#e2e2f0":m.t):"#5a5a7a"}}>{f.toUpperCase()}</button>
          );})}
        </div>
      )}

      {/* ── BODY ── */}
      <div style={{display:"flex",flex:1,overflow:"hidden",position:"relative",width:"100%"}}>

        {/* Sidebar overlay — mobile */}
        {isMobile && showSidebar && (
          <>
            <div onClick={()=>setShowSidebar(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.65)",zIndex:40}}/>
            <div style={{position:"absolute",top:0,left:0,bottom:0,width:260,background:"#0c0c10",borderRight:"1px solid #1e1e2e",zIndex:50,overflowY:"auto",animation:"slideIn .2s ease"}}>
              <SidebarContent items={items} visible={visible} status={status} lastFetch={lastFetch} isMobile={true}/>
            </div>
          </>
        )}

        {/* Sidebar — desktop always visible */}
        {!isMobile && (
          <div style={{width:180,borderRight:"1px solid #1e1e2e",background:"#0c0c10",flexShrink:0,overflowY:"auto"}}>
            <SidebarContent items={items} visible={visible} status={status} lastFetch={lastFetch} isMobile={false}/>
          </div>
        )}

        {/* ── FEED — hidden on mobile when detail is open ── */}
        {!showDetailFullscreen && (
          <div ref={feedRef}
            onScroll={e=>{const el=e.target;}}
            style={{flex:1,overflowY:"auto",overflowX:"hidden",minWidth:0,width:"100%"}}>

            {/* Feed sticky header */}
            <div style={{position:"sticky",top:0,background:"#050507",borderBottom:"1px solid #1e1e2e",padding:"8px 14px",display:"flex",alignItems:"center",gap:8,zIndex:10}}>
              <span style={{fontSize:9,color:"#5a5a7a",letterSpacing:"0.1em",flex:1}}>
                {status==="loading"&&items.length===0?"CONNECTING…":`${visible.length} ITEMS — ${filter.toUpperCase()}`}
              </span>
              {pending.length>0&&(
                <button onClick={loadPending} style={{padding:"5px 10px",background:"rgba(0,255,136,.1)",border:"1px solid rgba(0,255,136,.3)",borderRadius:3,color:"#00ff88",fontSize:9,cursor:"pointer",fontFamily:"inherit",animation:"pulse 2s ease infinite",flexShrink:0}}>
                  ▲ {pending.length} new
                </button>
              )}
            </div>

            {status==="loading"&&items.length===0&&(
              <div style={{padding:"60px 20px",display:"flex",flexDirection:"column",gap:14,alignItems:"center"}}>
                <div style={{width:24,height:24,border:"2px solid #1e1e2e",borderTopColor:"#00ff88",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
                <span style={{fontSize:11,color:"#5a5a7a"}}>Connecting to backend…</span>
              </div>
            )}

            {status==="err"&&(
              <div style={{padding:"40px 16px",textAlign:"center"}}>
                <div style={{fontSize:14,color:"#ff4d6d",marginBottom:10}}>⚠ Cannot reach backend</div>
                <div style={{fontSize:10,color:"#5a5a7a",lineHeight:1.8,marginBottom:20,wordBreak:"break-all"}}>Error: <span style={{color:"#ff4d6d"}}>{errMsg}</span></div>
                <button onClick={()=>loadFeed(false)} style={{padding:"12px 24px",background:"rgba(0,255,136,.1)",border:"1px solid rgba(0,255,136,.3)",borderRadius:4,color:"#00ff88",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>↻ Retry</button>
              </div>
            )}

            {visible.map((item,i)=>(
              <Row key={item.id} item={item} i={i} isMobile={isMobile}
                onClick={()=>setDetail(item)}/>
            ))}
            <div style={{height:60}}/>
          </div>
        )}

        {/* ── DETAIL — fullscreen on mobile, side panel on desktop ── */}
        {detail && !isMobile && (
          <div style={{width:300,borderLeft:"1px solid #1e1e2e",background:"#0c0c10",flexShrink:0,overflowY:"auto",overflowX:"hidden"}}>
            <Detail item={detail} onClose={()=>setDetail(null)}/>
          </div>
        )}

        {/* Mobile fullscreen detail */}
        {showDetailFullscreen && (
          <div style={{flex:1,overflowY:"auto",overflowX:"hidden",width:"100%",animation:"fadeUp .2s ease"}}>
            <Detail item={detail} onClose={()=>setDetail(null)} isMobile={true}/>
          </div>
        )}
      </div>

      {/* ── STATUS BAR — desktop only ── */}
      {!isMobile && (
        <div style={{height:24,borderTop:"1px solid #1e1e2e",background:"#0c0c10",display:"flex",alignItems:"center",padding:"0 12px",gap:12,flexShrink:0,fontSize:9,color:"#5a5a7a"}}>
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:"#00ff88",boxShadow:"0 0 5px #00ff88",animation:"blink 2s ease infinite"}}/>
            LIVE · polls 90s
          </div>
          <span>HN · Reddit · arXiv</span>
          {status==="err"&&<span style={{color:"#ff4d6d"}}>⚠ backend offline</span>}
          <span style={{marginLeft:"auto"}}>{items.length} items loaded</span>
        </div>
      )}
    </div>
  );
}

// ── Sidebar content (shared between mobile overlay + desktop) ──
function SidebarContent({items, visible, status, lastFetch, isMobile}) {
  return (
    <>
      <SS label="Backend">
        <div style={{fontSize:9,color:status==="ok"?"#00ff88":status==="err"?"#ff4d6d":"#ffd700",marginBottom:6,display:"flex",alignItems:"center",gap:5}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:"currentColor"}}/>
          {status==="ok"?"Connected":status==="err"?"Disconnected":status==="loading"?"Connecting…":"Idle"}
        </div>
        <div style={{fontSize:9,color:"#5a5a7a",lineHeight:1.8}}>
          Last: {lastFetch?timeAgo(Math.floor(lastFetch/1000)):"—"}<br/>
          Items: {items.length}
        </div>
      </SS>
      <SS label="Sources">
        {[{k:"HN",label:"Hacker News",c:"#ff6314"},{k:"Reddit",label:"Reddit",c:"#ff4500"},{k:"arXiv",label:"arXiv CS",c:"#b31b1b"}].map(({k,label,c})=>(
          <div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 0"}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:c,boxShadow:`0 0 4px ${c}`}}/>
              <span style={{fontSize:10,color:"#e2e2f0"}}>{label}</span>
            </div>
            <span style={{fontSize:9,color:"#5a5a7a",background:"#111118",padding:"1px 5px",borderRadius:2}}>{items.filter(i=>i.src===k).length}</span>
          </div>
        ))}
      </SS>
      <SS label="Category">
        {Object.entries(TM).map(([k,m])=>{ const c=visible.filter(i=>i.type===k).length; return c>0&&(
          <div key={k} style={{marginBottom:7}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:9,marginBottom:3}}>
              <span style={{color:m.t}}>{m.label}</span><span style={{color:"#5a5a7a"}}>{c}</span>
            </div>
            <div style={{height:2,background:"#1e1e2e",borderRadius:1}}>
              <div style={{height:"100%",width:`${Math.round(c/Math.max(visible.length,1)*100)}%`,background:m.t,borderRadius:1}}/>
            </div>
          </div>
        );})}
      </SS>
    </>
  );
}

function Row({item, i, onClick, isMobile}){
  const m = TM[item.type]||TM.product;
  return(
    <div data-id={item.id} onClick={onClick}
      style={{borderBottom:"1px solid #1e1e2e", borderLeft:`3px solid transparent`,
        padding:isMobile?"15px 14px":"11px 14px", cursor:"pointer",
        animation:`slideIn .2s ease forwards`, animationDelay:`${Math.min(i*.02,.25)}s`, opacity:0,
        transition:"background .1s", width:"100%", overflowX:"hidden"}}
      onMouseEnter={e=>e.currentTarget.style.background="#0c0c10"}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
      <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:6}}>
        <span style={{fontSize:8,fontWeight:600,letterSpacing:"0.08em",padding:"3px 6px",borderRadius:2,
          background:m.a,color:m.t,border:`1px solid ${m.b}`,flexShrink:0,marginTop:2,whiteSpace:"nowrap"}}>{m.label}</span>
        <span style={{fontSize:isMobile?13:12,fontWeight:500,lineHeight:1.45,color:"#e2e2f0",wordBreak:"break-word",overflowWrap:"break-word"}}>{item.title}</span>
      </div>
      <div style={{fontSize:isMobile?11:10,color:"#5a5a7a",lineHeight:1.6,marginBottom:8,
        display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",wordBreak:"break-word"}}>{item.sum}</div>
      <div style={{display:"flex",alignItems:"center",gap:8,fontSize:10,color:"#333350"}}>
        <span style={{color:SC[item.src]||"#888",flexShrink:0}}>{item.srcLabel||item.src}</span>
        <span style={{flexShrink:0}}>{item.timeLabel}</span>
        {item.score>0&&<span style={{flexShrink:0}}>▲{item.score}</span>}
        {item.comments>0&&<span style={{flexShrink:0}}>💬{item.comments}</span>}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"flex-end",gap:2,flexShrink:0}}>
          {[1,2,3,4].map(b=><div key={b} style={{width:3,borderRadius:1,height:3+b*3,background:b<=Math.ceil((item.heat||0)/25)?m.t:"#1e1e2e"}}/>)}
        </div>
      </div>
    </div>
  );
}

function Detail({item, onClose, isMobile}){
  const m = TM[item.type]||TM.product;
  return(
    <div style={{width:"100%",overflowX:"hidden"}}>
      <div style={{padding:"14px",borderBottom:"1px solid #1e1e2e",position:"sticky",top:0,background:"#0c0c10",zIndex:5}}>
        {!isMobile && (
          <button onClick={onClose} style={{background:"none",border:"none",color:"#5a5a7a",cursor:"pointer",fontFamily:"inherit",fontSize:10,padding:0,marginBottom:12}}>← close [Esc]</button>
        )}
        <span style={{fontSize:8,fontWeight:600,letterSpacing:"0.08em",padding:"3px 6px",borderRadius:2,background:m.a,color:m.t,border:`1px solid ${m.b}`}}>{m.label}</span>
        <div style={{fontSize:isMobile?15:13,fontWeight:600,lineHeight:1.45,margin:"10px 0 8px",color:"#e2e2f0",wordBreak:"break-word"}}>{item.title}</div>
        <div style={{fontSize:10,color:"#5a5a7a",display:"flex",gap:10,flexWrap:"wrap"}}>
          <span style={{color:SC[item.src]}}>{item.srcLabel||item.src}</span>
          <span>{item.timeLabel}</span>
          {item.score>0&&<span>▲{item.score}</span>}
          {item.comments>0&&<span>💬{item.comments}</span>}
        </div>
      </div>
      <div style={{padding:"16px"}}>
        <DL>Summary</DL>
        <p style={{fontSize:isMobile?13:11,lineHeight:1.8,color:"#c0c0d8",wordBreak:"break-word"}}>{item.sum}</p>
        {item.authors&&<><DL>Authors</DL><p style={{fontSize:11,color:"#5a5a7a",wordBreak:"break-word"}}>{item.authors}</p></>}
        <DL>Heat Score</DL>
        <div style={{height:4,background:"#1e1e2e",borderRadius:2,overflow:"hidden",marginBottom:6}}>
          <div style={{height:"100%",width:`${item.heat||0}%`,background:m.t,borderRadius:2}}/>
        </div>
        <div style={{fontSize:10,color:"#5a5a7a",marginBottom:20}}>{item.heat||0}/100</div>
        <DL>Read Full Article</DL>
        <a href={item.link} target="_blank" rel="noreferrer"
          style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:isMobile?"14px":"10px",background:"#111118",border:"1px solid #2a2a3d",borderRadius:6,fontSize:isMobile?13:11,color:"#e2e2f0",textDecoration:"none",width:"100%"}}>
          ↗ Open on {item.srcLabel||item.src}
        </a>
      </div>
    </div>
  );
}

function DL({children}){return <div style={{fontSize:8,letterSpacing:"0.14em",color:"#5a5a7a",textTransform:"uppercase",margin:"18px 0 8px",paddingTop:14,borderTop:"1px solid #1e1e2e"}}>{children}</div>;}
function SS({label,children}){return(
  <div style={{padding:"12px 14px",borderBottom:"1px solid #1e1e2e"}}>
    <div style={{fontSize:8,letterSpacing:"0.14em",color:"#5a5a7a",textTransform:"uppercase",marginBottom:9}}>{label}</div>
    {children}
  </div>
);}