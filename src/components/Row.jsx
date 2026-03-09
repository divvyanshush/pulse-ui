import { getTM, SRC_COLORS, FS } from "../constants/theme.js";
import { BmSvg } from "./Shared.jsx";

export function Row({item, i, onClick, isMobile, C, isDark, isBookmarked, onBookmark, selected, isRead}) {
  const TML=getTM(isDark);
  const m=TML[item.type]||TML.product;
  const srcColor=SRC_COLORS[item.src]||"#666";
  return(
    <div className="row" onClick={onClick} data-selected={selected}
      style={{borderBottom:`1px solid ${C.border}`,padding:isMobile?"16px":"14px 16px",background:selected?C.hover:undefined,
        animation:"rowIn .18s ease forwards",animationDelay:`${Math.min(i*.012,.28)}s`,opacity:0,filter:isRead?(isDark?"brightness(0.4)":"brightness(1.1) opacity(0.45)"):"none"}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:8}}>
        <span style={{fontSize:"0.62rem",fontWeight:600,letterSpacing:"0.1em",
          padding:"3px 7px",borderRadius:2,background:m.a,color:m.t,
          border:`1px solid ${m.b}`,flexShrink:0,marginTop:2,whiteSpace:"nowrap"}}>{m.label}</span>
        <span style={{fontSize:isMobile?FS.lg:FS.md,fontWeight:500,lineHeight:1.5,
          color:C.text,flex:1,wordBreak:"break-word"}}>{item.title}</span>
        <button className={isBookmarked?"bm bm-on":"bm bm-off"}
          onClick={e=>onBookmark(item,e)} title={isBookmarked?"Remove":"Save"}>
          <BmSvg filled={isBookmarked} size={13} color="currentColor"/>
        </button>
      </div>
      <div style={{fontSize:isMobile?FS.base:FS.sm,color:C.muted,lineHeight:1.7,marginBottom:10,
        display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
        {item.sum}
      </div>
      {item.type==="research"&&item.authors&&(
        <div style={{fontSize:FS.xs,color:C.muted,marginBottom:6,
          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
          by {item.authors}
        </div>
      )}
      <div style={{display:"flex",alignItems:"center",gap:10,fontSize:FS.xs,overflow:"hidden"}}>
        <span style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
          <div style={{width:5,height:5,borderRadius:"50%",background:srcColor,flexShrink:0}}/>
          <span style={{color:srcColor,fontWeight:500}}>{item.srcLabel||item.src}</span>
        </span>
        <span style={{color:C.muted,flexShrink:0}}>{item.timeLabel}</span>
        <span style={{color:C.muted,flexShrink:0}}>{Math.max(1,Math.round(((item.title||"")+" "+(item.sum||"")).split(" ").length/200))} min</span>
        {item.score>0&&<span style={{color:C.muted,flexShrink:0}}>↑{item.score}</span>}
        {item.comments>0&&<span style={{color:C.muted,flexShrink:0}}>{item.comments}c</span>}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"flex-end",gap:2,flexShrink:0}}>
          {[1,2,3,4].map(b=>(
            <div key={b} style={{width:2.5,borderRadius:1,height:3+b*3,
              background:b<=Math.ceil((item.heat||0)/25)?m.t:C.border}}/>
          ))}
        </div>
      </div>
    </div>
  );
}
