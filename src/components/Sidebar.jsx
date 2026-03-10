import { getTM, SRC_COLORS, FS, timeAgo } from "../constants/theme.js";
import { TrendingRepos } from "./TrendingRepos.jsx";

function Section({ label, C, children, action }) {
  return (
    <div style={{padding:"16px 14px",borderBottom:`1px solid ${C.border}`}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <span style={{fontSize:"0.58rem",fontWeight:600,letterSpacing:"0.14em",color:C.muted}}>
          {label}
        </span>
        {action}
      </div>
      {children}
    </div>
  );
}

export function Sidebar({C, isDark, items, visible, status, lastFetch, bmCount, onItemClick, srcFilter, setSrcFilter, onRepoClick}) {
  const TML=getTM(isDark);
  const topItems=[...items].sort((a,b)=>(b.heat||0)-(a.heat||0)).slice(0,3);
  const statusOk = status==="ok";
  const statusColor = statusOk ? C.accent : status==="err" ? "#ff4d6d" : C.muted;

  return (
    <div style={{fontFamily:"IBM Plex Mono,monospace"}}>

      {/* Status */}
      <div style={{padding:"14px",borderBottom:`1px solid ${C.border}`,
        display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:statusColor,flexShrink:0}}/>
          <span style={{fontSize:"0.58rem",letterSpacing:"0.12em",color:statusColor,fontWeight:600}}>
            {statusOk?"LIVE":status==="err"?"OFFLINE":"CONNECTING"}
          </span>
        </div>
        <span style={{fontSize:"0.58rem",color:C.muted}}>
          {lastFetch?timeAgo(Math.floor(lastFetch/1000))+" ago":"—"}
        </span>
      </div>

      {/* Stats row */}
      <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,
        display:"flex",gap:0}}>
        {[["ITEMS",items.length],["SAVED",bmCount],["VISIBLE",visible.length]].map(([l,v],i)=>(
          <div key={l} style={{flex:1,textAlign:"center",
            borderRight:i<2?`1px solid ${C.border}`:"none",padding:"4px 0"}}>
            <div style={{fontSize:"0.9rem",fontWeight:600,color:C.text,lineHeight:1}}>{v}</div>
            <div style={{fontSize:"0.52rem",color:C.muted,letterSpacing:"0.1em",marginTop:3}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Trending */}
      {topItems.length>0&&(
        <Section label="HOT RIGHT NOW" C={C}>
          {topItems.map((item,i)=>{
            const m=TML[item.type]||TML.product;
            return(
              <div key={item.id} onClick={()=>onItemClick(item)}
                style={{marginBottom:i<2?10:0,paddingBottom:i<2?10:0,
                  borderBottom:i<2?`1px solid ${C.border}`:"none",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                  <span style={{fontSize:"0.52rem",padding:"2px 5px",borderRadius:2,
                    background:m.a,color:m.t,border:`1px solid ${m.b}`,
                    letterSpacing:"0.08em",whiteSpace:"nowrap",fontWeight:600}}>{m.label}</span>
                  <span style={{fontSize:"0.58rem",color:C.muted,marginLeft:"auto",flexShrink:0}}>
                    {item.timeLabel}
                  </span>
                </div>
                <div style={{fontSize:FS.xs,color:C.sub,lineHeight:1.55,
                  display:"-webkit-box",WebkitLineClamp:2,
                  WebkitBoxOrient:"vertical",overflow:"hidden"}}>
                  {item.title}
                </div>
              </div>
            );
          })}
        </Section>
      )}

      {/* Sources */}
      <Section label="SOURCES" C={C}
        action={srcFilter&&(
          <button onClick={()=>setSrcFilter(null)}
            style={{fontSize:"0.55rem",color:C.accent,background:"none",border:"none",
              cursor:"pointer",letterSpacing:"0.08em",fontFamily:"IBM Plex Mono,monospace",
              padding:0}}>
            CLEAR
          </button>
        )}>
        <div style={{display:"flex",flexDirection:"column",gap:1}}>
          {Object.entries(SRC_COLORS).map(([k,c])=>{
            const count=items.filter(i=>i.src===k).length;
            if(!count) return null;
            const active=srcFilter===k;
            return(
              <div key={k} onClick={()=>setSrcFilter(active?null:k)}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                  padding:"5px 6px",borderRadius:3,cursor:"pointer",
                  background:active?C.hover:"transparent",
                  transition:"background .1s"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:4,height:4,borderRadius:"50%",background:c,flexShrink:0}}/>
                  <span style={{fontSize:FS.xs,color:active?C.text:C.sub,
                    fontWeight:active?500:400}}>{k}</span>
                </div>
                <span style={{fontSize:"0.58rem",color:C.muted}}>{count}</span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Trending Repos */}
      <Section label="TRENDING REPOS" C={C}>
        <TrendingRepos C={C} isDark={isDark} onRepoClick={onRepoClick} embedded/>
      </Section>

    </div>
  );
}
