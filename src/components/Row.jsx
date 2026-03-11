import { getTM, SRC_COLORS, FS, FF } from "../constants/theme.js";
import { BmSvg } from "./Shared.jsx";

export function Row({item, i, onClick, C, isDark, isBookmarked, onBookmark, selected, isRead}) {
  const TML=getTM(isDark);
  const m=TML[item.type]||TML.product;
  const srcColor=SRC_COLORS[item.src]||C.muted;

  return(
    <div onClick={onClick}
      onMouseEnter={e=>{ if(!selected) e.currentTarget.style.background=C.hover; }}
      onMouseLeave={e=>{ if(!selected) e.currentTarget.style.background=selected?C.hover:"transparent"; }}
      style={{
        padding:"14px 20px",
        background:selected?C.hover:"transparent",
        animation:"rowIn .15s ease forwards",
        animationDelay:`${Math.min(i*.01,.2)}s`,
        opacity:0,
        filter:isRead?(isDark?"brightness(0.4)":"opacity(0.45)"):"none",
        transition:"background .12s",
        cursor:"pointer",
        position:"relative",
      }}>

      {/* Top: title + bookmark */}
      <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:5}}>
        <div style={{flex:1,minWidth:0}}>
          <span style={{
            fontSize:FS.base,
            fontWeight:600,
            lineHeight:1.4,
            color:C.text,
            letterSpacing:"-0.02em",
            fontFamily:FF.sans,
            wordBreak:"break-word",
          }}>{item.title}</span>
        </div>
        <button
          onClick={e=>onBookmark(item,e)}
          style={{
            background:"none",border:"none",padding:4,
            cursor:"pointer",flexShrink:0,marginTop:1,
            color:isBookmarked?C.accent:C.muted,
            opacity:isBookmarked?1:0.4,
            transition:"opacity .15s, color .15s",
          }}
          onMouseEnter={e=>e.currentTarget.style.opacity=1}
          onMouseLeave={e=>{ if(!isBookmarked) e.currentTarget.style.opacity=0.4; }}
        >
          <BmSvg filled={isBookmarked} size={13} color="currentColor"/>
        </button>
      </div>

      {/* Summary */}
      {item.sum && (
        <div style={{
          fontSize:FS.sm,
          color:C.muted,
          lineHeight:1.6,
          marginBottom:8,
          display:"-webkit-box",
          WebkitLineClamp:2,
          WebkitBoxOrient:"vertical",
          overflow:"hidden",
          fontFamily:FF.sans,
          fontWeight:400,
        }}>{item.sum}</div>
      )}

      {/* Authors for research */}
      {item.type==="research" && item.authors && (
        <div style={{
          fontSize:FS.xs,color:C.muted,marginBottom:6,
          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
          fontStyle:"italic",fontFamily:FF.sans,
        }}>{item.authors}</div>
      )}

      {/* Meta row */}
      <div style={{
        display:"flex",alignItems:"center",gap:6,
        fontFamily:FF.mono,
      }}>
        {/* Type badge — minimal */}
        <span style={{
          fontSize:"0.62rem",fontWeight:500,
          color:m.t,
          padding:"1px 6px",borderRadius:3,
          background:m.a,
          flexShrink:0,whiteSpace:"nowrap",
          letterSpacing:"0.06em",
        }}>{m.label}</span>

        <span style={{color:C.faint,fontSize:FS.xs}}>·</span>

        {/* Source dot + name */}
        <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
          <div style={{width:4,height:4,borderRadius:"50%",background:srcColor}}/>
          <span style={{fontSize:FS.xs,color:C.muted,fontWeight:500}}>{item.srcLabel||item.src}</span>
        </div>

        <span style={{color:C.faint,fontSize:FS.xs}}>·</span>
        <span style={{fontSize:FS.xs,color:C.muted,flexShrink:0}}>{item.timeLabel}</span>

        {item.score>0 && <>
          <span style={{color:C.faint,fontSize:FS.xs}}>·</span>
          <span style={{fontSize:FS.xs,color:C.muted}}>↑{item.score}</span>
        </>}
      </div>

      {/* Bottom divider — subtle, only visual separator */}
      <div style={{
        position:"absolute",bottom:0,left:20,right:20,
        height:"1px",background:C.border,opacity:0.5,
      }}/>
    </div>
  );
}
