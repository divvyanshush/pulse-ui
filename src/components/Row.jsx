import { getTM, SRC_COLORS, FS, FF } from "../constants/theme.js";
import { BmSvg } from "./Shared.jsx";

export function Row({item, i, onClick, isMobile, C, isDark, isBookmarked, onBookmark, selected, isRead}) {
  const TML=getTM(isDark);
  const m=TML[item.type]||TML.product;
  const srcColor=SRC_COLORS[item.src]||C.muted;

  return(
    <div className="row" onClick={onClick} data-selected={selected}
      onMouseEnter={e=>{ if(!selected) e.currentTarget.style.background=C.hover; }}
      onMouseLeave={e=>{ if(!selected) e.currentTarget.style.background="transparent"; }}
      style={{
        borderBottom:`1px solid ${C.border}`,
        padding:"16px 20px",
        background:selected?C.hover:"transparent",
        animation:"rowIn .18s ease forwards",
        animationDelay:`${Math.min(i*.012,.28)}s`,
        opacity:0,
        filter:isRead?(isDark?"brightness(0.35)":"brightness(1.1) opacity(0.4)"):"none",
        transition:"background .12s",cursor:"pointer",
      }}>

      {/* Title row */}
      <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:7}}>
        <span style={{
          fontSize:isMobile?FS.md:FS.base,
          fontWeight:600,lineHeight:1.45,
          color:C.text,flex:1,wordBreak:"break-word",
          letterSpacing:"-0.02em",
          fontFamily:FF.sans,
        }}>{item.title}</span>

        <button className={isBookmarked?"bm bm-on":"bm bm-off"}
          onClick={e=>onBookmark(item,e)} title={isBookmarked?"Remove":"Save"}
          style={{marginTop:3,flexShrink:0}}>
          <BmSvg filled={isBookmarked} size={13} color="currentColor"/>
        </button>
      </div>

      {/* Summary */}
      {item.sum&&(
        <div style={{
          fontSize:FS.sm,color:C.sub,lineHeight:1.7,
          marginBottom:11,
          display:"-webkit-box",WebkitLineClamp:2,
          WebkitBoxOrient:"vertical",overflow:"hidden",
          fontFamily:FF.sans,
          fontWeight:400,
        }}>{item.sum}</div>
      )}

      {/* Authors (research only) */}
      {item.type==="research"&&item.authors&&(
        <div style={{
          fontSize:FS.xs,color:C.muted,marginBottom:9,
          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
          fontStyle:"italic",fontFamily:FF.sans,
        }}>
          {item.authors}
        </div>
      )}

      {/* Meta row */}
      <div style={{
        display:"flex",alignItems:"center",gap:8,
        fontFamily:FF.mono,
      }}>
        {/* Type badge */}
        <span style={{
          fontSize:"0.62rem",fontWeight:600,letterSpacing:"0.1em",
          padding:"2px 6px",borderRadius:2,
          background:m.a,color:m.t,border:`1px solid ${m.b}`,
          flexShrink:0,whiteSpace:"nowrap",
        }}>{m.label}</span>

        <span style={{color:C.faint,flexShrink:0}}>·</span>

        {/* Source */}
        <span style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
          <div style={{width:4,height:4,borderRadius:"50%",background:srcColor,flexShrink:0}}/>
          <span style={{color:C.muted,fontSize:FS.xs,fontWeight:500}}>{item.srcLabel||item.src}</span>
        </span>

        <span style={{color:C.faint,flexShrink:0}}>·</span>

        {/* Time */}
        <span style={{color:C.muted,fontSize:FS.xs,flexShrink:0}}>{item.timeLabel}</span>

        {/* Score for HN/Lobsters */}
        {item.score>0&&<>
          <span style={{color:C.faint,flexShrink:0}}>·</span>
          <span style={{color:C.muted,fontSize:FS.xs,flexShrink:0}}>↑{item.score}</span>
        </>}

        {/* Tags — only show first 2, only on desktop */}
        {!isMobile&&item.tags&&item.tags.length>0&&(
          <div style={{display:"flex",gap:4,marginLeft:4,overflow:"hidden"}}>
            {item.tags.slice(0,2).map(tag=>(
              <span key={tag} style={{
                fontSize:"0.60rem",padding:"1px 6px",borderRadius:2,
                background:"transparent",
                color:C.muted,border:"none",
                letterSpacing:"0.06em",fontWeight:500,whiteSpace:"nowrap",
              }}>{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
