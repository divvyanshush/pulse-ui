import { getTM, SRC_COLORS, FS } from "../constants/theme.js";
import { BmSvg } from "./Shared.jsx";

export function Row({item, i, onClick, isMobile, C, isDark, isBookmarked, onBookmark, selected, isRead}) {
  const TML=getTM(isDark);
  const m=TML[item.type]||TML.product;
  const srcColor=SRC_COLORS[item.src]||C.muted;
  const readMin=Math.max(1,Math.round(((item.title||"")+" "+(item.sum||"")).split(" ").length/200));

  return(
    <div className="row" onClick={onClick} data-selected={selected}
      onMouseEnter={e=>{ if(!selected) e.currentTarget.style.background=C.hover; }}
      onMouseLeave={e=>{ if(!selected) e.currentTarget.style.background="transparent"; }}
      style={{
        borderBottom:`1px solid ${C.border}`,
        padding:isMobile?"18px 16px":"16px 18px",
        background:selected?C.hover:"transparent",
        animation:"rowIn .18s ease forwards",
        animationDelay:`${Math.min(i*.012,.28)}s`,
        opacity:0,
        filter:isRead?(isDark?"brightness(0.35)":"brightness(1.1) opacity(0.4)"):"none",
        transition:"background .1s",cursor:"pointer",
      }}>

      {/* Top row: type badge + title + bookmark */}
      <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
        <span style={{
          fontSize:"0.58rem",fontWeight:600,letterSpacing:"0.12em",
          padding:"3px 6px",borderRadius:2,
          background:m.a,color:m.t,border:`1px solid ${m.b}`,
          flexShrink:0,marginTop:3,whiteSpace:"nowrap",
        }}>{m.label}</span>

        <span style={{
          fontSize:isMobile?FS.md:FS.base,
          fontWeight:600,lineHeight:1.45,
          color:C.text,flex:1,wordBreak:"break-word",
          letterSpacing:"-0.01em",
        }}>{item.title}</span>

        <button className={isBookmarked?"bm bm-on":"bm bm-off"}
          onClick={e=>onBookmark(item,e)} title={isBookmarked?"Remove":"Save"}
          style={{marginTop:2}}>
          <BmSvg filled={isBookmarked} size={13} color="currentColor"/>
        </button>
      </div>

      {/* Summary */}
      {item.sum&&(
        <div style={{
          fontSize:FS.sm,color:C.sub,lineHeight:1.65,
          marginBottom:10,paddingLeft:0,
          display:"-webkit-box",WebkitLineClamp:2,
          WebkitBoxOrient:"vertical",overflow:"hidden",
        }}>{item.sum}</div>
      )}

      {/* Authors (research only) */}
      {item.type==="research"&&item.authors&&(
        <div style={{
          fontSize:FS.xs,color:C.muted,marginBottom:8,
          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
          fontStyle:"italic",
        }}>
          {item.authors}
        </div>
      )}

      {/* Tags */}
      {item.tags&&item.tags.length>0&&(
        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
          {item.tags.map(tag=>(
            <span key={tag} style={{
              fontSize:"0.58rem",padding:"2px 7px",borderRadius:2,
              background:"transparent",
              color:C.muted,border:`1px solid ${C.border}`,
              letterSpacing:"0.08em",fontWeight:500,whiteSpace:"nowrap",
            }}>{tag}</span>
          ))}
        </div>
      )}

      {/* Meta row */}
      <div style={{display:"flex",alignItems:"center",gap:8,fontSize:FS.xs,overflow:"hidden"}}>
        <span style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
          <div style={{width:4,height:4,borderRadius:"50%",background:srcColor,flexShrink:0}}/>
          <span style={{color:C.muted,fontWeight:500}}>{item.srcLabel||item.src}</span>
        </span>
        <span style={{color:C.faint,flexShrink:0}}>·</span>
        <span style={{color:C.muted,flexShrink:0}}>{item.timeLabel}</span>
        <span style={{color:C.faint,flexShrink:0}}>·</span>
        <span style={{color:C.muted,flexShrink:0}}>{readMin}m read</span>
        {item.score>0&&<>
          <span style={{color:C.faint,flexShrink:0}}>·</span>
          <span style={{color:C.muted,flexShrink:0}}>↑{item.score}</span>
        </>}

        {/* Heat bars */}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"flex-end",gap:2,flexShrink:0}}>
          {[1,2,3,4].map(b=>(
            <div key={b} style={{
              width:2,borderRadius:1,height:3+b*2.5,
              background:b<=Math.ceil((item.heat||0)/25)?C.muted:C.faint,
              transition:"background .2s",
            }}/>
          ))}
        </div>
      </div>
    </div>
  );
}
