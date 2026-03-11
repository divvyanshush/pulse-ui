import { getTM, SRC_COLORS, FS, FF } from "../constants/theme.js";
import { BmSvg } from "./Shared.jsx";

export function Row({item, i, onClick, C, isDark, isBookmarked, onBookmark, selected, isRead}) {
  const m = (getTM(isDark))[item.type] || (getTM(isDark)).product;
  const srcColor = SRC_COLORS[item.src] || C.muted;

  return (
    <div onClick={onClick}
      onMouseEnter={e=>e.currentTarget.style.background=C.hover}
      onMouseLeave={e=>e.currentTarget.style.background=selected?C.hover:"transparent"}
      style={{
        padding:"22px 28px",
        background:selected?C.hover:"transparent",
        animation:"rowIn .15s ease forwards",
        animationDelay:`${Math.min(i*.01,.15)}s`,
        opacity:0,
        filter:isRead?(isDark?"brightness(0.3)":"opacity(0.35)"):"none",
        transition:"background .1s",
        cursor:"pointer",
        borderBottom:`1px solid ${C.border}`,
      }}>

      {/* Category · Source · Time */}
      <div style={{
        display:"flex", alignItems:"center", gap:8,
        marginBottom:10, fontFamily:FF.mono,
        fontSize:"0.65rem",
      }}>
        <span style={{
          color:m.t, padding:"2px 8px",
          borderRadius:3, background:m.a,
          fontWeight:600, letterSpacing:"0.06em",
          flexShrink:0,
        }}>{m.label}</span>

        <span style={{color:C.muted, flexShrink:0}}>{item.srcLabel||item.src}</span>
        <span style={{color:C.faint}}>·</span>
        <span style={{color:C.faint, flexShrink:0}}>{item.timeLabel}</span>

        {item.score>0&&<>
          <span style={{color:C.faint}}>·</span>
          <span style={{color:C.faint}}>↑{item.score}</span>
        </>}

        <button onClick={e=>onBookmark(item,e)}
          style={{
            marginLeft:"auto", background:"none", border:"none",
            padding:"2px 0", cursor:"pointer", flexShrink:0,
            color:isBookmarked?C.accent:C.muted,
            opacity:isBookmarked?1:0.35,
            transition:"opacity .15s, color .15s",
            lineHeight:0,
          }}
          onMouseEnter={e=>e.currentTarget.style.opacity=1}
          onMouseLeave={e=>{ if(!isBookmarked) e.currentTarget.style.opacity=0.35; }}
        >
          <BmSvg filled={isBookmarked} size={13} color="currentColor"/>
        </button>
      </div>

      {/* Title — dominant */}
      <div style={{
        fontSize:"1.05rem",
        fontWeight:650,
        color:C.text,
        lineHeight:1.4,
        letterSpacing:"-0.025em",
        fontFamily:FF.sans,
        marginBottom:item.sum?8:0,
        wordBreak:"break-word",
      }}>{item.title}</div>

      {/* Description — readable, 2 lines */}
      {item.sum && (
        <div style={{
          fontSize:FS.sm,
          color:C.muted,
          lineHeight:1.65,
          fontFamily:FF.sans,
          display:"-webkit-box",
          WebkitLineClamp:2,
          WebkitBoxOrient:"vertical",
          overflow:"hidden",
          fontWeight:400,
        }}>{item.sum}</div>
      )}

      {/* Authors for papers */}
      {item.type==="research" && item.authors && (
        <div style={{
          fontSize:"0.7rem", color:C.muted, marginTop:6,
          overflow:"hidden", textOverflow:"ellipsis",
          whiteSpace:"nowrap", fontFamily:FF.sans, fontStyle:"italic",
        }}>{item.authors}</div>
      )}
    </div>
  );
}
