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
        padding:"18px 24px",
        background:selected?C.hover:"transparent",
        animation:"rowIn .15s ease forwards",
        animationDelay:`${Math.min(i*.01,.2)}s`,
        opacity:0,
        filter:isRead?(isDark?"brightness(0.35)":"opacity(0.4)"):"none",
        transition:"background .1s",
        cursor:"pointer",
        borderBottom:`1px solid ${C.border}`,
      }}>

      {/* Meta row — top */}
      <div style={{
        display:"flex", alignItems:"center", gap:6,
        marginBottom:8, fontFamily:FF.mono,
      }}>
        <span style={{
          fontSize:"0.62rem", fontWeight:500,
          color:m.t, padding:"2px 7px",
          borderRadius:3, background:m.a,
          letterSpacing:"0.06em", flexShrink:0,
        }}>{m.label}</span>

        <span style={{fontSize:"0.65rem",color:C.muted,flexShrink:0}}>
          {item.srcLabel||item.src}
        </span>

        <span style={{fontSize:"0.65rem",color:C.faint}}>·</span>
        <span style={{fontSize:"0.65rem",color:C.faint,flexShrink:0}}>{item.timeLabel}</span>

        {item.score>0&&<>
          <span style={{fontSize:"0.65rem",color:C.faint}}>·</span>
          <span style={{fontSize:"0.65rem",color:C.faint}}>↑{item.score}</span>
        </>}

        {/* Bookmark — right aligned */}
        <button onClick={e=>onBookmark(item,e)}
          style={{
            marginLeft:"auto",
            background:"none", border:"none", padding:"2px 4px",
            cursor:"pointer", flexShrink:0,
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

      {/* Title */}
      <div style={{
        fontSize:FS.base,
        fontWeight:600,
        color:C.text,
        lineHeight:1.45,
        letterSpacing:"-0.02em",
        fontFamily:FF.sans,
        marginBottom:item.sum?7:0,
        wordBreak:"break-word",
      }}>{item.title}</div>

      {/* Summary */}
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
        }}>{item.sum}</div>
      )}

      {/* Authors */}
      {item.type==="research" && item.authors && (
        <div style={{
          fontSize:FS.xs, color:C.muted, marginTop:5,
          overflow:"hidden", textOverflow:"ellipsis",
          whiteSpace:"nowrap", fontStyle:"italic",
          fontFamily:FF.sans,
        }}>{item.authors}</div>
      )}
    </div>
  );
}
