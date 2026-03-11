import { FS, FF, getTM } from "../constants/theme.js";
import { BmSvg } from "./Shared.jsx";

function HamburgerBtn({ C, onMenu }) {
  return (
    <button onClick={onMenu} style={{
      background:"none",border:"none",padding:"4px 0",marginBottom:12,
      cursor:"pointer",color:C.muted,display:"flex",alignItems:"center",
    }}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M3 5h14M3 10h14M3 15h14"/>
      </svg>
    </button>
  );
}

export function SavedPage({ C, isDark, items, bookmarks, onItemClick, onBookmark, isMobile, onMenu }) {
  const TML = getTM(isDark);
  const saved = items.filter(i=>bookmarks[i.id]);

  if(!saved.length) return (
    <div style={{flex:1,background:C.bg,display:"flex",flexDirection:"column",minWidth:0}}>
      <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`}}>
        {isMobile && <HamburgerBtn C={C} onMenu={onMenu}/>}
        <div style={{fontSize:"0.62rem",fontFamily:FF.mono,color:C.muted,letterSpacing:"0.12em"}}>SAVED</div>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth="1.5" strokeLinecap="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
        </svg>
        <div style={{fontSize:FS.sm,color:C.muted,fontFamily:FF.sans}}>No saved articles yet</div>
      </div>
    </div>
  );

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",background:C.bg,overflow:"hidden",minWidth:0}}>
      <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        {isMobile && <HamburgerBtn C={C} onMenu={onMenu}/>}
        <div style={{fontSize:"0.62rem",fontFamily:FF.mono,color:C.muted,letterSpacing:"0.12em",marginBottom:4}}>SAVED</div>
        <div style={{fontSize:FS.md,fontWeight:700,color:C.text,fontFamily:FF.sans,letterSpacing:"-0.02em"}}>{saved.length} {saved.length===1?"article":"articles"}</div>
      </div>

      <div style={{flex:1,overflowY:"auto"}}>
        {saved.map((item,i)=>{
          const m=TML[item.type]||TML.product;
          return (
            <div key={item.id} onClick={()=>onItemClick(item)}
              style={{
                padding:"14px 20px",
                cursor:"pointer",display:"flex",gap:12,alignItems:"flex-start",
                transition:"background .1s",
                position:"relative",
              }}
              onMouseEnter={e=>e.currentTarget.style.background=C.hover}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            >
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:5}}>
                  <span style={{fontSize:"0.62rem",fontWeight:500,padding:"1px 6px",
                    borderRadius:3,background:m.a,color:m.t,
                    flexShrink:0,fontFamily:FF.mono}}>{m.label}</span>
                  <span style={{fontSize:FS.xs,color:C.muted,fontFamily:FF.mono}}>{item.srcLabel||item.src}</span>
                  <span style={{fontSize:FS.xs,color:C.faint,fontFamily:FF.mono}}>·</span>
                  <span style={{fontSize:FS.xs,color:C.muted,fontFamily:FF.mono}}>{item.timeLabel}</span>
                </div>
                <div style={{fontSize:FS.base,fontWeight:600,color:C.text,lineHeight:1.4,
                  letterSpacing:"-0.02em",fontFamily:FF.sans,marginBottom:5,
                }}>{item.title}</div>
                {item.sum&&(
                  <div style={{fontSize:FS.sm,color:C.muted,lineHeight:1.6,fontFamily:FF.sans,
                    display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",
                  }}>{item.sum}</div>
                )}
              </div>
              <button onClick={e=>onBookmark(item,e)}
                style={{background:"none",border:"none",padding:4,cursor:"pointer",
                  flexShrink:0,marginTop:2,color:C.accent}}>
                <BmSvg filled={true} size={13} color="currentColor"/>
              </button>
              <div style={{position:"absolute",bottom:0,left:20,right:20,height:1,background:C.border,opacity:0.4}}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}
