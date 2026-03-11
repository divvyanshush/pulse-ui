import { getTM, SRC_COLORS, FS, FF } from "../constants/theme.js";
import { BmSvg } from "./Shared.jsx";

export function Row({item, i, onClick, C, isDark, isBookmarked, onBookmark, selected, isRead}) {
  const m = (getTM(isDark))[item.type] || (getTM(isDark)).product;
  const srcColor = SRC_COLORS[item.src] || C.muted;

  return (
    <div onClick={onClick}
      onMouseEnter={e=>{ if(!selected) e.currentTarget.style.background=C.hover; }}
      onMouseLeave={e=>{ e.currentTarget.style.background=selected?C.hover:"transparent"; }}
      style={{
        padding:"13px 20px",
        background:selected?C.hover:"transparent",
        animation:"rowIn .15s ease forwards",
        animationDelay:`${Math.min(i*.01,.2)}s`,
        opacity:0,
        filter:isRead?(isDark?"brightness(0.4)":"opacity(0.4)"):"none",
        transition:"background .1s",
        cursor:"pointer",
        position:"relative",
      }}>

      {/* Title + bookmark */}
      <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:4}}>
        <span style={{
          flex:1, fontSize:FS.base, fontWeight:600,
          lineHeight:1.4, color:C.text,
          letterSpacing:"-0.02em", fontFamily:FF.sans,
          wordBreak:"break-word",
        }}>{item.title}</span>
        <button onClick={e=>onBookmark(item,e)}
          style={{
            background:"none",border:"none",padding:"2px 4px",
            cursor:"pointer",flexShrink:0,marginTop:1,
            color:isBookmarked?C.accent:C.muted,
            opacity:isBookmarked?1:0.35,
            transition:"opacity .15s,color .15s",
          }}
          onMouseEnter={e=>e.currentTarget.style.opacity=1}
          onMouseLeave={e=>{ if(!isBookmarked) e.currentTarget.style.opacity=0.35; }}
        >
          <BmSvg filled={isBookmarked} size={13} color="currentColor"/>
        </button>
      </div>

      {/* Summary */}
      {item.sum && (
        <div style={{
          fontSize:FS.sm, color:C.muted, lineHeight:1.6,
          marginBottom:7, fontFamily:FF.sans,
          display:"-webkit-box", WebkitLineClamp:2,
          WebkitBoxOrient:"vertical", overflow:"hidden",
        }}>{item.sum}</div>
      )}

      {/* Authors */}
      {item.type==="research" && item.authors && (
        <div style={{
          fontSize:FS.xs, color:C.muted, marginBottom:6,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
          fontStyle:"italic", fontFamily:FF.sans,
        }}>{item.authors}</div>
      )}

      {/* Meta */}
      <div style={{display:"flex",alignItems:"center",gap:5,fontFamily:FF.mono}}>
        <span style={{
          fontSize:"0.62rem", fontWeight:500, letterSpacing:"0.05em",
          padding:"1px 6px", borderRadius:3,
          background:m.a, color:m.t, flexShrink:0,
        }}>{m.label}</span>
        <span style={{color:C.faint,fontSize:FS.xs}}>·</span>
        <div style={{display:"flex",alignItems:"center",gap:3,flexShrink:0}}>
          <div style={{width:4,height:4,borderRadius:"50%",background:srcColor}}/>
          <span style={{fontSize:FS.xs,color:C.muted}}>{item.srcLabel||item.src}</span>
        </div>
        <span style={{color:C.faint,fontSize:FS.xs}}>·</span>
        <span style={{fontSize:FS.xs,color:C.muted,flexShrink:0}}>{item.timeLabel}</span>
        {item.score>0&&<>
          <span style={{color:C.faint,fontSize:FS.xs}}>·</span>
          <span style={{fontSize:FS.xs,color:C.muted}}>↑{item.score}</span>
        </>}
      </div>

      {/* Subtle divider */}
      <div style={{
        position:"absolute", bottom:0, left:20, right:20,
        height:1, background:C.border, opacity:0.35,
      }}/>
    </div>
  );
}
