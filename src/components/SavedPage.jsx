import { FS, FF, getTM, SRC_COLORS } from "../constants/theme.js";
import { BmSvg } from "./Shared.jsx";

export function SavedPage({ C, isDark, items, bookmarks, onItemClick, onBookmark , isMobile, onMenu }) {
  const TML = getTM(isDark);
  const saved = items.filter(i=>bookmarks[i.id]);

  if(!saved.length) return (
    <div style={{flex:1,background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth="1.5" strokeLinecap="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
      </svg>
      <div style={{fontSize:FS.sm,color:C.muted,fontFamily:FF.sans}}>No saved articles yet</div>
      <div style={{fontSize:FS.xs,color:C.muted,fontFamily:FF.sans}}>Bookmark articles to save them here</div>
    </div>
  );

  return (
    <div style={{flex:1,overflowY:"auto",background:C.bg,minWidth:0}}>
      <div style={{padding:"20px 20px 16px",borderBottom:`1px solid ${C.border}`}}>
        {isMobile && (
          <button onClick={onMenu} style={{
            background:"none",border:"none",padding:0,marginBottom:14,
            cursor:"pointer",color:C.muted,display:"flex",alignItems:"center",gap:8,
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 5h14M3 10h14M3 15h14"/>
            </svg>
          </button>
        )}

        
        <div style={{fontSize:"0.62rem",fontFamily:FF.mono,color:C.muted,letterSpacing:"0.12em",marginBottom:6}}>SAVED</div>
        <div style={{fontSize:"1.4rem",fontWeight:700,color:C.text,fontFamily:FF.sans,letterSpacing:"-0.03em"}}>Your articles</div>
        <div style={{fontSize:FS.xs,color:C.muted,marginTop:6,fontFamily:FF.sans}}>{saved.length} saved {saved.length===1?"article":"articles"}</div>
      </div>

      {saved.map((item,i)=>{
        const m=TML[item.type]||TML.product;
        return (
          <div key={item.id} onClick={()=>onItemClick(item)}
            style={{
              padding:"16px 20px",
              borderBottom:`1px solid ${C.border}`,
              cursor:"pointer",display:"flex",gap:12,alignItems:"flex-start",
              transition:"background .1s",
            }}
            onMouseEnter={e=>e.currentTarget.style.background=C.hover}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}
          >
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:"0.58rem",fontWeight:600,letterSpacing:"0.1em",
                  padding:"1px 5px",borderRadius:2,background:m.a,color:m.t,border:`1px solid ${m.b}`,
                  flexShrink:0,fontFamily:FF.mono}}>{m.label}</span>
                <span style={{fontSize:"0.62rem",color:C.muted,fontFamily:FF.mono}}>{item.srcLabel||item.src}</span>
                <span style={{fontSize:"0.62rem",color:C.muted,fontFamily:FF.mono}}>·</span>
                <span style={{fontSize:"0.62rem",color:C.muted,fontFamily:FF.mono}}>{item.timeLabel}</span>
              </div>
              <div style={{fontSize:FS.base,fontWeight:600,color:C.text,lineHeight:1.4,
                letterSpacing:"-0.02em",fontFamily:FF.sans,marginBottom:6,
              }}>{item.title}</div>
              {item.sum&&(
                <div style={{fontSize:FS.sm,color:C.sub,lineHeight:1.6,fontFamily:FF.sans,
                  display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",
                }}>{item.sum}</div>
              )}
            </div>
            <button className="bm bm-on" onClick={e=>onBookmark(item,e)} style={{marginTop:2,flexShrink:0}}>
              <BmSvg filled={true} size={13} color="currentColor"/>
            </button>
          </div>
        );
      })}
    </div>
  );
}
