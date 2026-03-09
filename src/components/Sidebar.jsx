import { getTM, SRC_COLORS, FS, timeAgo } from "../constants/theme.js";
import { SB } from "./Shared.jsx";

export function Sidebar({C, isDark, items, visible, status, lastFetch, bmCount, onItemClick, srcFilter, setSrcFilter}) {
  const TML=getTM(isDark);
  const topItems=[...items].sort((a,b)=>(b.heat||0)-(a.heat||0)).slice(0,3);
  const statusColor=status==="ok"?C.accent:status==="err"?"#c01e3c":C.warn;
  return (
    <>
      <SB label="Status" C={C}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
          <div style={{width:6,height:6,borderRadius:"50%",flexShrink:0,
            background:statusColor,boxShadow:isDark?`0 0 6px ${statusColor}`:"none"}}/>
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
